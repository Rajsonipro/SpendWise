import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  Shield,
} from 'lucide-react';  import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const BLOCKED_DOMAINS = new Set([
  'test.com',
  'fake.com',
  'example.com',
  'email.com',
  'tempmail.com',
  'mailinator.com',
  'yopmail.com',
  'trashmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'dispostable.com',
  'getnada.com',
  'moakt.com',
  'sharklasers.com',
  'spam4.me',
]);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { sendLoginOTP, googleLogin } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = useCallback((value) => {
    const cleanedEmail = String(value || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) return false;

    if (cleanedEmail.includes('..')) return false;

    const parts = cleanedEmail.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domainPart] = parts;

    if (localPart.length < 2) return false;
    if (domainPart.length < 4) return false;
    if (!domainPart.includes('.')) return false;

    if (BLOCKED_DOMAINS.has(domainPart)) return false;

    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;

    const domainSections = domainPart.split('.');
    if (domainSections.some((section) => section.length < 2)) return false;

    return true;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a real and valid email address.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await sendLoginOTP(trimmedEmail, password);
      navigate('/verify-otp', { state: { email: trimmedEmail } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);

    try {
      const data = await googleLogin(credentialResponse.credential);
      // backend returns the email extracted from Google credential + sends OTP
      navigate('/verify-otp', { state: { email: data.email, mode: 'google' } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Google sign-in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled. Please try again or use email.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Premium animated background */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 25%, #2d1b69 50%, #1a1040 75%, #0f0c29 100%)',
        }}
      >
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -15 - i * 5, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex p-5 rounded-2xl bg-white/10 backdrop-blur-xl mb-8 shadow-2xl border border-white/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Shield size={44} className="text-white drop-shadow-lg" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
              Secure Access
            </h2>
            <p className="text-white/75 text-lg leading-relaxed drop-shadow">
              Sign in securely to manage your expenses, track budgets, and get AI-powered financial insights.
            </p>

            <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
              {[
                'AI-powered expense tracking',
                'Real-time analytics & insights',
                'Smart budget management',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="p-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                    <Sparkles size={12} />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 text-center z-10">
          <p className="text-white/30 text-sm font-medium tracking-wider">
            SPENDWISE — AI FINANCE TRACKER
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--app-bg)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">
              SpendWise
            </h1>
            <p className="text-[var(--app-text-secondary)] mt-1 font-medium">
              Sign in to your account
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-[var(--app-text)] tracking-tight">
              Sign in
            </h1>
            <p className="text-[var(--app-text-secondary)] mt-1 font-medium">
              to continue to SpendWise
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-6 p-4 rounded-xl text-sm font-medium"
                style={{
                  background: 'var(--color-danger-soft)',
                  color: 'var(--color-danger)',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6 w-full">
            <div className="relative w-full">
              {googleLoading && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
                  style={{ background: 'var(--app-card)' }}
                >
                  <Loader2
                    size={20}
                    className="animate-spin text-[var(--app-accent)]"
                  />
                </div>
              )}

              <div className="google-btn-wrapper w-full overflow-hidden rounded-xl">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  logo_alignment="left"
                />
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--app-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--app-bg)] text-[var(--app-muted)] font-medium">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--app-text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-muted)] pointer-events-none"
                />
                <input
                  type="email"
                  required
                  className="input-field !pl-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--app-text-secondary)]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-muted)] pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field !pl-10 !pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--app-border)] text-center">
            <p className="text-xs text-[var(--app-muted)]">
              By continuing, you agree to SpendWise&apos;s{' '}
              <span className="font-medium text-[var(--app-text-secondary)]">
                Terms
              </span>{' '}
              and{' '}
              <span className="font-medium text-[var(--app-text-secondary)]">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;