import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

export async function generateTwoFactorSecret(email: string): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `Ar-Rahnu System (${email})`,
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    qrCode,
  };
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}

export function generateEmailOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
