import { storage } from './storage';
import { hashPassword, verifyPassword, validatePasswordStrength } from './utils/password';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry, verifyRefreshToken, type TokenPayload } from './utils/jwt';
import { generateVerificationToken, generatePasswordResetToken } from './utils/tokens';
import { sendVerificationEmail, sendPasswordResetEmail, sendTwoFactorEmail, sendNewDeviceAlert } from './utils/email';
import { generateTwoFactorSecret, verifyTwoFactorToken, generateEmailOTP } from './utils/twoFactor';
import { parseUserAgent, getClientIp } from './utils/deviceParser';
import type { InsertUser, LoginData, User } from '@shared/schema';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  twoFactorMethod?: 'app' | 'email';
}

export class AuthService {
  async register(userData: InsertUser, req: any): Promise<{ message: string; userId: string }> {
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordCheck = validatePasswordStrength(userData.password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message || 'Invalid password');
    }

    const hashedPassword = await hashPassword(userData.password);
    const emailVerificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userToCreate: any = {
      ...userData,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpiry: verificationExpiry,
      emailVerified: false,
    };

    const user = await storage.createUser(userToCreate);

    try {
      await sendVerificationEmail(user.email, emailVerificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
      throw new Error('Verification token has expired');
    }

    await storage.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    });

    return { message: 'Email verified successfully' };
  }

  async login(loginData: LoginData, req: any): Promise<AuthResult> {
    const user = await storage.getUserByEmail(loginData.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const minutesLeft = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
    }

    const isValidPassword = await verifyPassword(loginData.password, user.password);

    if (!isValidPassword) {
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const updates: Partial<User> = { loginAttempts };

      if (loginAttempts >= 5) {
        updates.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await storage.updateUser(user.id, updates);

      await this.logLoginAttempt(user.id, req, false, 'Invalid password');

      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    if (user.twoFactorEnabled && !loginData.twoFactorCode) {
      return {
        user: this.sanitizeUser(user),
        accessToken: '',
        requiresTwoFactor: true,
        twoFactorMethod: user.twoFactorSecret ? 'app' : 'email',
      };
    }

    if (user.twoFactorEnabled && loginData.twoFactorCode) {
      const isValid = verifyTwoFactorToken(user.twoFactorSecret!, loginData.twoFactorCode);
      if (!isValid) {
        await this.logLoginAttempt(user.id, req, false, 'Invalid 2FA code');
        throw new Error('Invalid two-factor code');
      }
    }

    const deviceInfo = parseUserAgent(req.headers['user-agent'] || '');
    const ipAddress = getClientIp(req);

    const isNewDevice = !user.lastLoginDevice || user.lastLoginDevice !== deviceInfo.userAgent;
    if (isNewDevice && user.emailVerified) {
      try {
        await sendNewDeviceAlert(user.email, deviceInfo.device, ipAddress);
      } catch (error) {
        console.error('Failed to send new device alert:', error);
      }
    }

    await storage.updateUser(user.id, {
      loginAttempts: 0,
      accountLockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      lastLoginDevice: deviceInfo.userAgent,
    });

    await this.logLoginAttempt(user.id, req, true, undefined, user.twoFactorEnabled);

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    let refreshToken: string | undefined;

    if (loginData.rememberMe) {
      refreshToken = generateRefreshToken(tokenPayload);
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        ipAddress,
        userAgent: deviceInfo.userAgent,
      });
    }

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshTokenString);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const tokenRecord = await storage.getRefreshToken(refreshTokenString);
    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token expired');
    }

    const user = await storage.getUser(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await storage.deleteRefreshToken(refreshTokenString);
    await storage.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
      ipAddress: tokenRecord.ipAddress,
      userAgent: tokenRecord.userAgent,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken?: string, req?: any): Promise<{ message: string }> {
    // Record logout history
    try {
      await storage.createLogoutHistory({
        userId,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get?.('user-agent'),
        device: req?.get?.('user-agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
      });
    } catch (error) {
      console.error('Failed to record logout history:', error);
    }

    if (refreshToken) {
      await storage.deleteRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAllSessions(userId: string, req?: any): Promise<{ message: string }> {
    // Record logout history
    try {
      await storage.createLogoutHistory({
        userId,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get?.('user-agent'),
        device: req?.get?.('user-agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
      });
    } catch (error) {
      console.error('Failed to record logout history:', error);
    }

    await storage.deleteUserRefreshTokens(userId);
    return { message: 'Logged out from all sessions' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = generatePasswordResetToken();
    const resetExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await storage.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await storage.getUserByPasswordResetToken(token);

    if (!user) {
      throw new Error('Invalid reset token');
    }

    if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
      throw new Error('Reset token has expired');
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message || 'Invalid password');
    }

    const hashedPassword = await hashPassword(newPassword);

    await storage.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      loginAttempts: 0,
      accountLockedUntil: null,
    });

    await storage.deleteUserRefreshTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { secret, qrCode } = await generateTwoFactorSecret(user.email);

    await storage.updateUser(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: false,
    });

    return { secret, qrCode };
  }

  async enableTwoFactor(userId: string, token: string): Promise<{ message: string }> {
    const user = await storage.getUser(userId);
    if (!user || !user.twoFactorSecret) {
      throw new Error('Two-factor setup not initiated');
    }

    const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    await storage.updateUser(userId, {
      twoFactorEnabled: true,
    });

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disableTwoFactor(userId: string, password: string): Promise<{ message: string }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    await storage.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async getUserSessions(userId: string): Promise<any[]> {
    const history = await storage.getUserLoginHistory(userId, 10);
    return history;
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private async logLoginAttempt(userId: string, req: any, success: boolean, failureReason?: string, twoFactorUsed: boolean = false): Promise<void> {
    const deviceInfo = parseUserAgent(req.headers['user-agent'] || '');
    const ipAddress = getClientIp(req);

    await storage.createLoginHistory({
      userId,
      ipAddress,
      userAgent: deviceInfo.userAgent,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      success,
      failureReason,
      twoFactorUsed,
    });
  }
}

export const authService = new AuthService();
