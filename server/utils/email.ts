import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@arrahnu.com';
const FROM_NAME = process.env.FROM_NAME || 'Ar-Rahnu System';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASSWORD ? {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  } : undefined,
});

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email - Ar-Rahnu System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Ar-Rahnu System</h2>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #7f8c8d; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${verificationUrl}
        </p>
        <p style="color: #7f8c8d; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
  };

  if (SMTP_USER && SMTP_PASSWORD) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('Email verification link (SMTP not configured):', verificationUrl);
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset - Ar-Rahnu System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #7f8c8d; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
        <p style="color: #7f8c8d; font-size: 14px;">
          This link will expire in 10 minutes.
        </p>
        <p style="color: #7f8c8d; font-size: 12px;">
          If you didn't request this password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  if (SMTP_USER && SMTP_PASSWORD) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('Password reset link (SMTP not configured):', resetUrl);
  }
}

export async function sendTwoFactorEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Your Login Code - Ar-Rahnu System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Login Code</h2>
        <p>Use the code below to complete your login:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f7f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50;">${otp}</span>
          </div>
        </div>
        <p style="color: #7f8c8d; font-size: 14px;">
          This code will expire in 10 minutes.
        </p>
        <p style="color: #7f8c8d; font-size: 12px;">
          If you didn't try to login, please secure your account immediately.
        </p>
      </div>
    `,
  };

  if (SMTP_USER && SMTP_PASSWORD) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('2FA code (SMTP not configured):', otp);
  }
}

export async function sendNewDeviceAlert(email: string, device: string, ipAddress: string): Promise<void> {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: 'New Device Login Alert - Ar-Rahnu System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Device Login Detected</h2>
        <p>A new login to your account was detected from:</p>
        <div style="background-color: #f7f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Device:</strong> ${device}</p>
          <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #7f8c8d; font-size: 14px;">
          If this was you, you can safely ignore this email.
        </p>
        <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">
          If this wasn't you, please change your password immediately and contact support.
        </p>
      </div>
    `,
  };

  if (SMTP_USER && SMTP_PASSWORD) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log('New device alert (SMTP not configured):', { device, ipAddress });
  }
}
