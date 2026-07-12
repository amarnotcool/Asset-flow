import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { User, Eye, EyeOff, CheckCircle, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
  const [view, setView] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (view === 'forgot-otp') {
      otpInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [view]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const switchView = (newView) => {
    setView(newView);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setShowPassword(false);
    setShowNewPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // ─── LOGIN ───
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await authApi.login(email, password);
      if (data && data.token) {
        login(data.user, data.token);
        navigate('/');
        return;
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  // ─── REGISTER ───
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      setLoading(false);
      return;
    }

    try {
      await authApi.register({ name: name.trim(), email, password });
      setSuccessMessage('Account created successfully! You can now sign in.');
      setPassword('');
      setView('login');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  // ─── FORGOT: STEP 1 — Send OTP ───
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await authApi.forgotPassword(email);
      setSuccessMessage(`A 6-digit OTP has been sent to ${email}`);
      setResendCooldown(60);
      setView('forgot-otp');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  // ─── FORGOT: STEP 2 — Verify OTP ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await authApi.verifyOtp(email, otp);
      setSuccessMessage('OTP verified! Set your new password below.');
      setView('forgot-reset');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired OTP.');
    }
    setLoading(false);
  };

  // ─── FORGOT: STEP 3 — Reset Password ───
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword(email, newPassword);
      setSuccessMessage('Password reset successfully! Sign in with your new password.');
      switchView('login');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Password reset failed.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    try {
      await authApi.forgotPassword(email);
      setSuccessMessage('A new OTP has been sent to your email.');
      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'register': return 'sign up';
      case 'forgot-email': return 'forgot password';
      case 'forgot-otp': return 'verify OTP';
      case 'forgot-reset': return 'new password';
      default: return 'login';
    }
  };

  const isForgotView = view.startsWith('forgot');

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg-primary p-4 relative">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="card w-full max-w-[400px] border border-border-color rounded-2xl p-8 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-6">AssetFlow – {getTitle()}</h1>
          <div className="w-16 h-16 rounded-full border border-border-color mx-auto flex items-center justify-center bg-bg-primary">
            {view === 'forgot-otp' ? (
              <ShieldCheck size={28} className="text-text-secondary" />
            ) : view === 'forgot-email' ? (
              <Mail size={28} className="text-text-secondary" />
            ) : (
              <User size={28} className="text-text-secondary" />
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 mb-4 rounded-lg border border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold text-xs flex items-center gap-2">
            <CheckCircle size={14} className="shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">
            {errorMessage}
          </div>
        )}

        {/* ========== LOGIN VIEW ========== */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="label">Email</label>
              <input
                ref={emailInputRef}
                type="email"
                className="input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-0 cursor-pointer p-0"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => switchView('forgot-email')}
                  className="text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors bg-transparent border-0 cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="mt-2">
              <p className="text-xs font-semibold text-text-secondary mb-1">New here?</p>
              <div className="border border-border-color rounded-lg p-3 bg-bg-primary mb-3">
                <p className="text-xs text-text-primary leading-relaxed m-0">
                  Sign up creates an employee account.<br/>Admin roles assigned later.
                </p>
              </div>
              <button type="button" className="btn btn-outline w-full" onClick={() => switchView('register')}>
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* ========== REGISTER VIEW ========== */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label">Email</label>
              <input ref={emailInputRef} type="email" className="input" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input w-full pr-10" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-0 cursor-pointer p-0" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div className="mt-2">
              <p className="text-xs font-semibold text-text-secondary mb-2">Already have an account?</p>
              <button type="button" className="btn btn-outline w-full" onClick={() => switchView('login')}>Sign In instead</button>
            </div>
          </form>
        )}

        {/* ========== FORGOT: STEP 1 — Enter Email ========== */}
        {view === 'forgot-email' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
            <button type="button" onClick={() => switchView('login')} className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors bg-transparent border-0 cursor-pointer p-0 self-start">
              <ArrowLeft size={14} /> Back to login
            </button>
            <p className="text-xs text-text-secondary leading-relaxed -mt-2">
              Enter your registered email address. We'll send a 6-digit OTP to verify your identity.
            </p>
            <div className="flex flex-col gap-1">
              <label className="label">Email</label>
              <input ref={emailInputRef} type="email" className="input" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ========== FORGOT: STEP 2 — Enter OTP ========== */}
        {view === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <button type="button" onClick={() => switchView('forgot-email')} className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-primary transition-colors bg-transparent border-0 cursor-pointer p-0 self-start">
              <ArrowLeft size={14} /> Change email
            </button>

            <p className="text-xs text-text-secondary leading-relaxed -mt-2">
              We sent a 6-digit code to <strong className="text-text-primary">{email}</strong>. Enter it below.
            </p>

            <div className="flex flex-col gap-1">
              <label className="label">OTP Code</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input text-center text-2xl tracking-[0.5em] font-bold"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full py-2.5 mt-2">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <p className="text-xs text-text-secondary mb-1">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-xs font-semibold text-accent-primary hover:underline bg-transparent border-0 cursor-pointer p-0 disabled:text-text-secondary disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ========== FORGOT: STEP 3 — New Password ========== */}
        {view === 'forgot-reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <p className="text-xs text-text-secondary leading-relaxed">
              OTP verified for <strong className="text-text-primary">{email}</strong>. Choose your new password.
            </p>

            <div className="flex flex-col gap-1">
              <label className="label">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} className="input w-full pr-10" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-0 cursor-pointer p-0" tabIndex={-1}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label">Confirm New Password</label>
              <input type={showNewPassword ? 'text' : 'password'} className="input w-full" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-alert-danger mt-1 font-medium">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || (confirmPassword && newPassword !== confirmPassword)} className="btn btn-primary w-full py-2.5 mt-2">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
