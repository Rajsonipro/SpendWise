import nodemailer from 'nodemailer';

const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_NAME,
    SMTP_FROM_EMAIL,
  } = process.env;

  // Return null if SMTP is not configured so the controller can fall back gracefully
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const getResetEmailHTML = (resetUrl, userName) => {
  const appName = 'SpendWise';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header p {
      margin: 6px 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
    }
    .body-content {
      padding: 32px 28px;
    }
    .body-content h2 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #1e293b;
      font-weight: 600;
    }
    .body-content p {
      margin: 0 0 20px;
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .btn-wrapper {
      text-align: center;
      margin: 24px 0;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 24px 0;
    }
    .note {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .note a {
      color: #6366f1;
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 20px 28px;
    }
    .footer p {
      margin: 0;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>🔐 ${appName}</h1>
        <p>Password Reset Request</p>
      </div>
      <div class="body-content">
        <h2>Hi${userName ? ` ${userName}` : ' there'},</h2>
        <p>
          We received a request to reset the password for your <strong>${appName}</strong> account.
          Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
        </p>
        <div class="btn-wrapper">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p style="text-align:center; font-size:13px; color:#64748b;">
          Or copy and paste this link into your browser:<br/>
          <span style="color:#6366f1; word-break:break-all; font-size:12px;">${resetUrl}</span>
        </p>
        <div class="divider"></div>
        <p class="note">
          If you did not request a password reset, you can safely ignore this email. Only someone with access to your email inbox can reset your account.
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${year} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const getResetEmailText = (resetUrl, userName) => {
  const appName = 'SpendWise';
  return `🔐 ${appName} — Password Reset Request

Hi${userName ? ` ${userName}` : ' there'},

We received a request to reset the password for your ${appName} account.

To reset your password, click the link below (expires in 1 hour):
${resetUrl}

If you did not request a password reset, please ignore this email.

© ${new Date().getFullYear()} ${appName}. All rights reserved.`;
};

const getLoginOTPEmailHTML = (otp, expiryMinutes) => {
  const appName = 'SpendWise';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Login Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header p {
      margin: 6px 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
    }
    .body-content {
      padding: 32px 28px;
      text-align: center;
    }
    .body-content h2 {
      margin: 0 0 12px;
      font-size: 18px;
      color: #1e293b;
      font-weight: 600;
    }
    .body-content p {
      margin: 0 0 20px;
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
    }
    .otp-box {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      border-radius: 12px;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #ffffff;
      margin: 20px 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 24px 0;
    }
    .note {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      text-align: left;
    }
    .note strong {
      color: #ef4444;
    }
    .footer {
      text-align: center;
      padding: 20px 28px;
    }
    .footer p {
      margin: 0;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>🔐 ${appName}</h1>
        <p>Login Verification Code</p>
      </div>
      <div class="body-content">
        <h2>Your Verification Code</h2>
        <p>
          Use the code below to complete your login to <strong>${appName}</strong>.
          This code will expire in <strong>${expiryMinutes} minutes</strong>.
        </p>
        <div class="otp-box">${otp}</div>
        <p style="font-size:13px; color:#64748b;">
          If you did not attempt to log in, please ignore this email.
        </p>
        <div class="divider"></div>
        <p class="note">
          <strong>⚠️ Security Warning:</strong> Never share this code with anyone.
          ${appName} will never ask for your verification code for any reason.
          If you didn't request this login, please secure your account immediately.
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${year} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const getLoginOTPEmailText = (otp, expiryMinutes) => {
  const appName = 'SpendWise';
  return `🔐 ${appName} — Login Verification Code

Your verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not attempt to log in, please ignore this email.

⚠️ Security Warning: Never share this code with anyone. ${appName} will never ask for your verification code.

© ${new Date().getFullYear()} ${appName}. All rights reserved.`;
};

/**
 * Send a login OTP email.
 * Returns { success: boolean, message: string }.
 */
export const sendLoginOTPEmail = async (email, otp, userName) => {
  const transporter = createTransporter();
  const expiryMinutes = 5;

  if (!transporter) {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  LOGIN OTP (SMTP not configured)');
    console.log('───────────────────────────────────────────────');
    console.log(`  Email: ${email}`);
    console.log(`  OTP: ${otp}`);
    console.log(`  Expires in: ${expiryMinutes} minutes`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    return { success: false, message: 'SMTP not configured. OTP logged to server console.', otp };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'SpendWise'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your SpendWise Login Verification Code',
      text: getLoginOTPEmailText(otp, expiryMinutes),
      html: getLoginOTPEmailHTML(otp, expiryMinutes),
    });

    return { success: true, message: 'OTP sent successfully.' };
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};

/**
 * Send a password reset email.
 * Returns { success: boolean, message: string }.
 */
export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  const transporter = createTransporter();

  if (!transporter) {
    // SMTP not configured — log the reset link for development
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  PASSWORD RESET (SMTP not configured)');
    console.log('───────────────────────────────────────────────');
    console.log(`  Email: ${email}`);
    console.log(`  Reset URL: ${resetUrl}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    return { success: false, message: 'SMTP not configured. Reset link logged to server console.' };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'SpendWise'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Reset Your SpendWise Password',
      text: getResetEmailText(resetUrl, userName),
      html: getResetEmailHTML(resetUrl, userName),
    });

    return { success: true, message: 'Password reset email sent successfully.' };
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};
