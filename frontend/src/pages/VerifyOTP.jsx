import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ArrowRight,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RESEND_COOLDOWN = 30; // seconds

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyLoginOTP, verifyGoogleOTP, resendLoginOTP, resendGoogleOTP } = useAuth();

  const email = location.state?.email;
  const mode = location.state?.mode || 'login';
  const userName = location.state?.name;
  const devOTP = location.state?.devOTP;
  const isGoogle = mode === 'google';

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    let interval;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = useCallback((index, value) => {
    if (error) setError('');
    if (success) setSuccess('');

    // Allow only digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp, error, success]);

  const handleKeyDown = useCallback((index, e) => {
    // Move back on backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Move right on arrow keys
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const digits = pasted.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      if (isGoogle) {
        await verifyGoogleOTP(email, otpString);
        setSuccess('Google sign-in successful! Redirecting...');
      } else {
        await verifyLoginOTP(email, otpString);
        setSuccess('Login successful! Redirecting...');
      }
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid verification code. Please try again.';
      setError(message);
      // Reset OTP input on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');
    setSuccess('');
    setOtp(['', '', '', '', '', '']);

    try {
      let data;
      if (isGoogle) {
        data = await resendGoogleOTP(email);
      } else {
        data = await resendLoginOTP(email);
      }
      setSuccess('New verification code sent to your email.');
      setCountdown(RESEND_COOLDOWN);
      setTimerActive(true);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(message);
      // If session expired, redirect to login
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('no google')) {
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  if (!email) return null;

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white" />
          <div className="absolute top-2/3 left-1/2 w-40 h-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex p-5 rounded-2xl bg-white/15 backdrop-blur-sm mb-8 shadow-lg">
              <CheckCircle size={44} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              {isGoogle ? 'Verify Google Sign-In' : 'Verify Your Identity'}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              {isGoogle
                  ? "We've sent a verification code to your Google email. Enter it below to complete sign-in."
                  : "We've sent a secure verification code to your registered email. Enter it below to continue."}
            </p>

            <div className="mt-10 space-y-4 text-left max-w-xs mx-auto">
              {[
                'End-to-end encrypted verification',
                'Code expires in 5 minutes',
                'Enhanced account security',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="p-1 rounded-full bg-white/20">
                    <Sparkles size={12} />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 text-center">
          <p className="text-white/40 text-sm font-medium">
            SpendWise — AI Finance Tracker
          </p>
        </div>
      </div>

      {/* Right side - OTP form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--app-bg)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
              <CheckCircle size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">
              {isGoogle ? 'Google Sign-In' : 'Verify Code'}
            </h1>
            <p className="text-[var(--app-text-secondary)] mt-1 font-medium">
              Enter the code sent to your email
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-[var(--app-text)] tracking-tight">
              {isGoogle ? 'Verify Google Sign-In' : 'Verification'}
            </h1>
            <p className="text-[var(--app-text-secondary)] mt-1 font-medium">
              <>Enter the 6-digit code sent to{' '}</>
              <span className="text-[var(--app-text)] font-semibold">{email}</span>
            </p>
          </div>

          {/* Development mode OTP banner — shown when email service is not configured */}
          {devOTP && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="mb-6 p-4 rounded-xl text-sm border"
              style={{
                background: 'var(--color-warning-soft)',
                borderColor: 'var(--color-warning)',
                color: 'var(--color-warning)',
              }}
            >
              <p className="font-semibold mb-1">⚡ Development Mode</p>
              <p className="text-[var(--app-text-secondary)]">Email service is not configured. Use this code to verify:</p>
              <p className="text-2xl font-bold tracking-widest mt-3 text-center" style={{ color: 'var(--app-accent)' }}>
                {devOTP}
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3"
                style={{
                  background: 'var(--color-danger-soft)',
                  color: 'var(--color-danger)',
                }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3"
                style={{
                  background: 'var(--color-success-soft)',
                  color: 'var(--color-success)',
                }}
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--app-text-secondary)] mb-3 text-center lg:text-left">
                Verification Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    animate={
                      digit
                        ? { scale: [1, 1.05, 1], borderColor: 'var(--app-accent)' }
                        : {}
                    }
                    transition={{ duration: 0.2 }}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200"
                    style={{
                      background: digit ? 'var(--app-accent-soft)' : 'var(--input-bg)',
                      borderColor: digit
                        ? 'var(--app-accent)'
                        : error
                          ? 'var(--color-danger)'
                          : 'var(--input-border)',
                      color: 'var(--app-text)',
                      caretColor: 'var(--app-accent)',
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>
            </div>

            {/* Email display for mobile */}
            <p className="text-xs text-center lg:hidden text-[var(--app-muted)]">
              Code sent to{' '}
              <span className="text-[var(--app-text-secondary)] font-medium">{email}</span>
            </p>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || !isOtpComplete}
              className="btn-primary w-full !py-3 shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isGoogle ? 'Complete Sign-In' : 'Verify & Sign In'} <ArrowRight size={16} />
                </span>
              )}
            </button>

            {/* Resend section */}
            <div className="text-center pt-2">
              <p className="text-sm text-[var(--app-text-secondary)]">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="font-semibold text-[var(--app-muted)]">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-semibold text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <RotateCcw size={14} />
                        Resend Code
                      </span>
                    )}
                  </button>
                )}
              </p>
            </div>
          </form>

          {/* Back button */}
          <div className="mt-8 pt-6 border-t border-[var(--app-border)] text-center">
            <button
              type="button"
              onClick={handleGoBack}
              className="text-sm font-medium text-[var(--app-muted)] hover:text-[var(--app-text-secondary)] transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTP;
