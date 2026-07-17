import express from 'express';
import { loginUser, getMe, forgotPassword, resetPassword, googleLogin, sendLoginOTP, verifyLoginOTP, resendLoginOTP, registerUser, verifyGoogleOTP, resendGoogleOTP } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Direct registration (no OTP)
router.post('/register', registerUser);

// Login OTP flow
router.post('/login', loginUser);
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/resend-login-otp', resendLoginOTP);

// Google OAuth OTP flow
router.post('/google', googleLogin);
router.post('/verify-google-otp', verifyGoogleOTP);
router.post('/resend-google-otp', resendGoogleOTP);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// User info (protected)
router.get('/me', protect, getMe);

export default router;
