import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail, sendLoginOTPEmail, sendOTPEmail } from '../utils/emailService.js';

// In-memory store for registration OTPs (temp data before account creation)
// Structure: { email: { name, email, password, hashedOTP, otpExpires, otpAttempts } }
const registrationStore = new Map();

// In-memory store for Google Sign-In OTPs (temp data before account creation/linking)
// Structure: { email: { googleId, name, email, picture, hashedOTP, otpExpires, otpAttempts } }
const googleStore = new Map();

// Clean up expired stores every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, data] of registrationStore.entries()) {
    if (data.otpExpires < now) {
      registrationStore.delete(email);
    }
  }
  for (const [email, data] of googleStore.entries()) {
    if (data.otpExpires < now) {
      googleStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: String(name || '').trim(),
      email: normalizedEmail,
      password,
      authProvider: 'email',
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  // Delegate to sendLoginOTP to ensure direct login cannot bypass OTP verification
  return sendLoginOTP(req, res);
};

// Generate a secure 6-digit OTP and return it (plain) + hash
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = hashToken(otp);
  return { otp, hashedOTP };
};

export const sendLoginOTP = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.authProvider !== 'email') {
      return res.status(400).json({ message: 'Please sign in with Google.' });
    }

    // Generate OTP
    const { otp, hashedOTP } = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP in database
    user.loginOTP = hashedOTP;
    user.loginOTPExpires = expiry;
    user.loginOTPAttempts = 0;
    await user.save();

    // Send OTP via email
    const result = await sendLoginOTPEmail(normalizedEmail, otp, user.name);

    if (!result.success && !result.otp) {
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    // In development, return the OTP so the user can see it without email
    const response = { message: 'Verification code sent to your email.' };
    if (!result.success && result.otp) {
      response.devOTP = result.otp;
      response.message = 'Email service not configured. Check server console for OTP.';
    }
    if (process.env.NODE_ENV === 'development') {
      response.devOTP = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error('[SendLoginOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

export const resendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.authProvider !== 'email') {
      return res.status(400).json({ message: 'Please sign in with Google.' });
    }

    // Check if there's a pending OTP session (must be non-expired)
    if (!user.loginOTPExpires || user.loginOTPExpires < new Date()) {
      return res.status(400).json({
        message: 'Your verification session has expired. Please sign in again to request a new code.',
      });
    }

    // Generate a new OTP
    const { otp, hashedOTP } = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    user.loginOTP = hashedOTP;
    user.loginOTPExpires = expiry;
    user.loginOTPAttempts = 0;
    await user.save();

    // Send OTP via email
    const result = await sendLoginOTPEmail(normalizedEmail, otp, user.name);

    if (!result.success && !result.otp) {
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    const response = { message: 'New verification code sent to your email.' };
    if (!result.success && result.otp) {
      response.devOTP = result.otp;
      response.message = 'Email service not configured. Check server console for OTP.';
    }
    if (process.env.NODE_ENV === 'development') {
      response.devOTP = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error('[ResendLoginOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification code.' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid verification code format.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Check if OTP exists
    if (!user.loginOTP || !user.loginOTPExpires) {
      return res.status(400).json({ message: 'No verification code requested. Please request a new one.' });
    }

    // Check if OTP has expired
    if (user.loginOTPExpires < new Date()) {
      user.loginOTP = null;
      user.loginOTPExpires = null;
      user.loginOTPAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempts
    if (user.loginOTPAttempts >= 3) {
      user.loginOTP = null;
      user.loginOTPExpires = null;
      user.loginOTPAttempts = 0;
      await user.save();
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new verification code.' });
    }

    // Verify OTP
    const hashedOTP = hashToken(otp);
    if (hashedOTP !== user.loginOTP) {
      user.loginOTPAttempts = (user.loginOTPAttempts || 0) + 1;
      const remaining = 3 - user.loginOTPAttempts;

      if (remaining <= 0) {
        user.loginOTP = null;
        user.loginOTPExpires = null;
        user.loginOTPAttempts = 0;
      }

      await user.save();
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. Please request a new verification code.',
      });
    }

    // OTP verified — clear OTP fields and issue JWT
    user.loginOTP = null;
    user.loginOTPExpires = null;
    user.loginOTPAttempts = 0;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[VerifyLoginOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Google OAuth verified successfully');
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Google account must have a valid email address' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Generate OTP
    const { otp, hashedOTP } = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store Google data in memory
    googleStore.set(normalizedEmail, {
      googleId,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      picture,
      hashedOTP,
      otpExpires: expiry,
      otpAttempts: 0,
    });

    // Send OTP via email
    const result = await sendOTPEmail(normalizedEmail, otp, name, 'login');

    if (!result.success && !result.otp) {
      googleStore.delete(normalizedEmail);
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    const response = { message: 'Verification code sent to your email.', email: normalizedEmail };
    if (!result.success && result.otp) {
      response.devOTP = result.otp;
      response.message = 'Email service not configured. Check server console for OTP.';
    }
    if (process.env.NODE_ENV === 'development') {
      response.devOTP = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error('Google login error details:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    });
    return res
      .status(401)
      .json({ message: 'Google authentication failed: ' + error.message });
  }
};

// ========== Google OTP Verification ==========

export const verifyGoogleOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification code.' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid verification code format.' });
    }

    // Get Google data from memory
    const googleData = googleStore.get(normalizedEmail);

    if (!googleData) {
      return res.status(400).json({ message: 'No Google sign-in session found. Please sign in with Google again.' });
    }

    // Check if OTP has expired
    if (googleData.otpExpires < new Date()) {
      googleStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'Verification code has expired. Please sign in with Google again.' });
    }

    // Check attempts
    if (googleData.otpAttempts >= 3) {
      googleStore.delete(normalizedEmail);
      return res.status(429).json({ message: 'Too many failed attempts. Please sign in with Google again.' });
    }

    // Verify OTP
    const hashedOTP = hashToken(otp);
    if (hashedOTP !== googleData.hashedOTP) {
      googleData.otpAttempts = (googleData.otpAttempts || 0) + 1;
      const remaining = 3 - googleData.otpAttempts;

      if (remaining <= 0) {
        googleStore.delete(normalizedEmail);
      }

      return res.status(400).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. Please sign in with Google again.',
      });
    }

    // OTP verified — create or link the user account
    const { googleId, name, picture } = googleData;
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Link existing account with Google
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.avatar = user.avatar || picture;
        await user.save();
      }
    } else {
      // Create new user with Google data
      user = await User.create({
        name,
        email: normalizedEmail,
        googleId,
        avatar: picture,
        authProvider: 'google',
      });
    }

    // Clean up Google store
    googleStore.delete(normalizedEmail);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[VerifyGoogleOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email address.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiry;

    await user.save();

    console.log('[ForgotPassword] Reset token generated for:', normalizedEmail);
    console.log('[ForgotPassword] Raw token preview:', rawToken.substring(0, 16) + '...');
    console.log('[ForgotPassword] Hashed token:', hashedToken);
    console.log('[ForgotPassword] Expiry:', expiry);

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${encodeURIComponent(rawToken)}`;

    const result = await sendPasswordResetEmail(normalizedEmail, resetUrl, user.name);

    if (!result.success) {
      console.log('[ForgotPassword] Email not sent (SMTP not configured or error). Reset URL logged above.');

      // In development mode, return the reset URL so the user can still test
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          message: 'Development mode: Reset link below (no email sent — configure SMTP for production).',
          devResetUrl: resetUrl,
        });
      }

      // In production, give a generic message — never leak the reset URL
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    return res.json({
      message: 'Password reset link sent to your registered email address.',
    });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return res.status(500).json({
      message: 'An error occurred. Please try again later.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('[ResetPassword] === RESET PASSWORD ATTEMPT ===');
    console.log('[ResetPassword] Token from params (first 32 chars):', token ? token.substring(0, 32) + '...' : 'MISSING');
    console.log('[ResetPassword] Token length:', token ? token.length : 0);
    console.log('[ResetPassword] Password provided:', !!password);

    if (!token) {
      console.log('[ResetPassword] FAILED: Token is missing from request params');
      return res.status(400).json({
        message: 'Reset token is required.',
      });
    }

    if (!password || password.length < 6) {
      console.log('[ResetPassword] FAILED: Password too short or missing');
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
    }

    const hashedToken = hashToken(token);
    const now = new Date();

    console.log('[ResetPassword] Hashed token used for query:', hashedToken);
    console.log('[ResetPassword] Current server time:', now.toISOString());

    // First check: find user by hashed token (ignoring expiry) to determine exact failure reason
    const userByToken = await User.findOne({ resetPasswordToken: hashedToken });

    if (!userByToken) {
      console.log('[ResetPassword] FAILED: No user found with matching hashed token');

      // Check if there's a user with ANY reset token (for debugging)
      const anyUserWithToken = await User.findOne({
        resetPasswordToken: { $ne: null, $exists: true },
      }).select('email resetPasswordToken resetPasswordExpires');

      if (anyUserWithToken) {
        console.log('[ResetPassword] Debug - A user with a reset token exists:', {
          email: anyUserWithToken.email,
          storedTokenHash: anyUserWithToken.resetPasswordToken,
          tokenExpires: anyUserWithToken.resetPasswordExpires,
          now: now.toISOString(),
          isExpired: anyUserWithToken.resetPasswordExpires
            ? anyUserWithToken.resetPasswordExpires < now
            : 'N/A',
        });
        console.log('[ResetPassword] Token hash mismatch!');
        console.log('[ResetPassword]   Expected hash:', hashedToken);
        console.log('[ResetPassword]   Stored hash:  ', anyUserWithToken.resetPasswordToken);
        console.log('[ResetPassword]   Hashes match:', hashedToken === anyUserWithToken.resetPasswordToken);
      } else {
        console.log('[ResetPassword] Debug - No users with any reset token found in DB');
      }

      return res.status(400).json({
        message: 'Invalid or expired reset token.',
      });
    }

    // Second check: verify token has NOT expired
    if (
      userByToken.resetPasswordExpires &&
      userByToken.resetPasswordExpires < now
    ) {
      console.log('[ResetPassword] FAILED: Token has expired');
      console.log('[ResetPassword]   Token expiry was:', userByToken.resetPasswordExpires.toISOString());
      console.log('[ResetPassword]   Current time:', now.toISOString());
      return res.status(400).json({
        message: 'This reset link has expired. Please request a new password reset.',
      });
    }

    console.log('[ResetPassword] SUCCESS: Token validated, updating password for:', userByToken.email);

    userByToken.password = password;
    userByToken.resetPasswordToken = null;
    userByToken.resetPasswordExpires = null;

    await userByToken.save();

    console.log('[ResetPassword] Password updated successfully for:', userByToken.email);

    return res.json({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[ResetPassword] UNEXPECTED ERROR:', error);
    return res.status(500).json({
      message: 'An error occurred. Please try again later.',
    });
  }
};

// ========== Registration OTP Flow ==========

export const sendRegisterOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !name || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Generate OTP
    const { otp, hashedOTP } = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store registration data in memory
    registrationStore.set(normalizedEmail, {
      name: String(name || '').trim(),
      email: normalizedEmail,
      password,
      hashedOTP,
      otpExpires: expiry,
      otpAttempts: 0,
    });

    // Send OTP via email (purpose: 'register' so the email says "Verify Your Email")
    const result = await sendOTPEmail(normalizedEmail, otp, name, 'register');

    if (!result.success && !result.otp) {
      registrationStore.delete(normalizedEmail);
      return res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

    const response = { message: 'Verification code sent to your email.' };
    if (!result.success && result.otp) {
      response.devOTP = result.otp;
      response.message = 'Email service not configured. Check server console for OTP.';
    }
    if (process.env.NODE_ENV === 'development') {
      response.devOTP = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error('[SendRegisterOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification code.' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid verification code format.' });
    }

    // Get registration data from memory
    const regData = registrationStore.get(normalizedEmail);

    if (!regData) {
      return res.status(400).json({ message: 'No registration found. Please start the signup process again.' });
    }

    // Check if OTP has expired
    if (regData.otpExpires < new Date()) {
      registrationStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'Verification code has expired. Please sign up again.' });
    }

    // Check attempts
    if (regData.otpAttempts >= 3) {
      registrationStore.delete(normalizedEmail);
      return res.status(429).json({ message: 'Too many failed attempts. Please sign up again.' });
    }

    // Verify OTP
    const hashedOTP = hashToken(otp);
    if (hashedOTP !== regData.hashedOTP) {
      regData.otpAttempts = (regData.otpAttempts || 0) + 1;
      const remaining = 3 - regData.otpAttempts;

      if (remaining <= 0) {
        registrationStore.delete(normalizedEmail);
      }

      return res.status(400).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. Please sign up again.',
      });
    }

    // OTP verified — create the user account
    const user = await User.create({
      name: regData.name,
      email: normalizedEmail,
      password: regData.password,
      authProvider: 'email',
    });

    // Clean up registration data
    registrationStore.delete(normalizedEmail);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[VerifyRegisterOTP] Error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};