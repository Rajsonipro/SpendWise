import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(401).json({ message: error.message });
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

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Google account must have a valid email address' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.avatar = user.avatar || picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId,
        avatar: picture,
        authProvider: 'google',
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res
      .status(401)
      .json({ message: 'Google authentication failed: ' + error.message });
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

    await sendPasswordResetEmail(normalizedEmail, resetUrl, user.name);

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