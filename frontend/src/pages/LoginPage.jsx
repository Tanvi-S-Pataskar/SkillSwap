import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

const LoginPage = () => {
  const [email, setEmail] = useState('maya.lin@berkeley.edu');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const { login, forgotPassword, switchUser, switchableUsers } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email or username.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await login(email, password, rememberMe);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Login successful! Redirecting to your dashboard...');
      showToast(`Welcome back, ${res.user?.name || 'Student'}!`, 'success');
      setTimeout(() => {
        // If user hasn't onboarded, navigate to /onboarding
        if (res.user && res.user.is_onboarded === false) {
          navigate('/onboarding');
        } else {
          navigate(redirectPath);
        }
      }, 700);
    } else {
      setErrorMessage(res.error || 'Invalid email or password. Please try again.');
      showToast(res.error || 'Failed to sign in', 'error');
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(async () => {
      // Simulate Google OAuth single sign-on with default student
      const res = await login('maya.lin@berkeley.edu', 'demo123', true);
      setIsLoading(false);
      if (res.success) {
        showToast('Successfully authenticated via Google Workspace (.edu)', 'success');
        navigate('/dashboard');
      }
    }, 900);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered student email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    const res = await forgotPassword(forgotEmail.trim());
    setForgotLoading(false);
    if (res.success) {
      setForgotSuccess(res.message);
    } else {
      setForgotError(res.error || 'Could not process password reset request.');
    }
  };

  const handleQuickPersona = async (p) => {
    setIsLoading(true);
    const res = await switchUser(p);
    setIsLoading(false);
    if (res.success) {
      showToast(`Logged in as ${p.name} (${p.university})`, 'success');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 border border-white/[0.1] shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 mx-auto mb-3 shadow-glow-sm">
              <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to your SkillSwap student peer account
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Email or Username"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="you@university.edu or username"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-dark-950 border-white/20 text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 focus:ring-1"
                />
                <span>Remember me (30 days)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email.includes('@') ? email : '');
                  setForgotError('');
                  setForgotSuccess('');
                  setIsForgotModalOpen(true);
                }}
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3 font-semibold shadow-glow-sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>

            {/* Continue with Google */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <span className="relative px-3 bg-dark-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-charcoal-card hover:bg-charcoal-hover border border-white/[0.1] hover:border-violet-500/40 text-slate-200 text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* 1-Click Quick Demo Personas */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3 text-center">
              Demo Fast Persona Switcher:
            </div>
            <div className="space-y-2">
              {switchableUsers.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickPersona(p)}
                  type="button"
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-charcoal-card hover:bg-charcoal-hover border border-white/[0.06] hover:border-violet-500/40 text-left transition-all text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={p.avatar_url} name={p.name} size="xs" />
                    <div>
                      <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.university} · {p.major}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md group-hover:bg-violet-500/20 transition-colors">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Student Password"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl text-xs text-violet-300">
            <KeyRound className="w-5 h-5 flex-shrink-0 text-violet-400" />
            <span>
              Enter your registered student email. We will send you a secure verification link to
              reset your credentials.
            </span>
          </div>

          {forgotSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {forgotError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{forgotError}</span>
            </div>
          )}

          {!forgotSuccess ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <Input
                label="Student Email Address"
                type="email"
                placeholder="you@university.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={forgotLoading}
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
