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
    user.resetPasswordExpire = expiry;

    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${encodeURIComponent(rawToken)}`;

    await sendPasswordResetEmail(normalizedEmail, resetUrl, user.name);

    return res.json({
      message: 'Password reset link sent to your registered email address.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      message: 'An error occurred. Please try again later.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Reset token is required.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
    }

    const hashedToken = hashToken(token);
    const now = new Date();

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      $or: [
        { resetPasswordExpires: { $gt: now } },
        { resetPasswordExpire: { $gt: now } },
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token.',
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.json({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      message: 'An error occurred. Please try again later.',
    });
  }
};