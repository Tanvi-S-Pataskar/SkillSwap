import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowRight,
  Coins,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
];

const ACADEMIC_YEARS = [
  'Freshman (1st Year)',
  'Sophomore (2nd Year)',
  'Junior (3rd Year)',
  'Senior (4th Year)',
  'Graduate / Master’s',
  'PhD / Postgrad',
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    college: '',
    course: '',
    academic_year: 'Junior (3rd Year)',
    avatar_url: AVATAR_PRESETS[0],
    agree_terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // { available: bool, message: string }
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, checkUsername } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Real-time username debounce check
  useEffect(() => {
    const rawUsername = formData.username.trim().toLowerCase();
    if (!rawUsername || rawUsername.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      const res = await checkUsername(rawUsername);
      setUsernameChecking(false);
      setUsernameStatus(res);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username]);

  // Compute password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-indigo-400' };
      case 4:
      default:
        return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    const u = formData.username.trim();
    if (!u) {
      newErrors.username = 'Username is required.';
    } else if (u.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(u)) {
      newErrors.username = 'Only letters, numbers, underscores and dashes allowed.';
    } else if (usernameStatus && !usernameStatus.available) {
      newErrors.username = 'This username is already taken.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College or University name is required.';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Major or Course of study is required.';
    }

    if (!formData.agree_terms) {
      newErrors.agree_terms = 'You must agree to SkillSwap’s Terms and Community Guidelines.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const payload = {
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirm_password,
      college: formData.college.trim(),
      course: formData.course.trim(),
      academic_year: formData.academic_year,
      avatar_url: formData.avatar_url,
      agree_terms: formData.agree_terms,
    };

    const res = await register(payload);
    setIsLoading(false);

    if (res.success) {
      showToast('Account created! Welcome bonus: +5 Barter Time Credits!', 'success');
      navigate('/onboarding');
    } else {
      showToast(res.error || 'Registration failed', 'error');
      setErrors((prev) => ({ ...prev, api: res.error }));
    }
  };

  const generateRandomDicebear = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData((prev) => ({
      ...prev,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    }));
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-xl">
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/[0.1] shadow-2xl backdrop-blur-xl">
          {/* Welcome Credits Pill */}
          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Sign up now & get 5 Free Time-Bank Barter Credits!</span>
          </div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 mx-auto mb-3 shadow-glow-sm">
              <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Student Account</h1>
            <p className="text-xs text-slate-400 mt-1">
              Join the student skill-exchange network. Learn, teach, and build credibility.
            </p>
          </div>

          {errors.api && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.api}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Select Profile Picture
              </label>
              <div className="flex items-center gap-4 p-3 bg-dark-950/70 border border-white/[0.08] rounded-2xl">
                <div className="relative">
                  <Avatar
                    src={formData.avatar_url}
                    name={formData.name || 'User'}
                    size="lg"
                    className="border-2 border-violet-500 shadow-glow-sm"
                  />
                  <button
                    type="button"
                    onClick={generateRandomDicebear}
                    title="Generate unique avatar"
                    className="absolute -bottom-1 -right-1 p-1 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow transition-transform hover:scale-110"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="text-[11px] text-slate-400 mb-1.5">Choose an avatar preset:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, avatar_url: preset })}
                        className={`relative rounded-full transition-all ${
                          formData.avatar_url === preset
                            ? 'ring-2 ring-violet-500 scale-105'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset}
                          alt="avatar option"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column: Full Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Maya Lin"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name}
                required
              />

              <div>
                <Input
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''),
                    })
                  }
                  placeholder="maya_lin"
                  leftIcon={<span className="text-xs font-bold text-slate-400">@</span>}
                  rightIcon={
                    usernameChecking ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                    ) : usernameStatus?.available ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : null
                  }
                  error={errors.username}
                  helperText={
                    usernameStatus
                      ? usernameStatus.available
                        ? 'Username is available!'
                        : usernameStatus.message || 'Username taken'
                      : 'Unique student handle'
                  }
                  required
                />
              </div>
            </div>

            {/* Email */}
            <Input
              label="Student Email (.edu or University Email)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maya.lin@berkeley.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
              required
            />

            {/* 2-Column: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  error={errors.password}
                  required
                />
                {/* Password strength meter */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Strength:</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all ${
                            step <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-white/[0.08]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) =>
                  setFormData({ ...formData, confirm_password: e.target.value })
                }
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )
                }
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirm_password}
                required
              />
            </div>

            {/* College & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="College / University"
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. UC Berkeley, Stanford, MIT"
                leftIcon={<GraduationCap className="w-4 h-4" />}
                error={errors.college}
                required
              />

              <Input
                label="Course / Major"
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="e.g. Computer Science, HCI"
                leftIcon={<BookOpen className="w-4 h-4" />}
                error={errors.course}
                required
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 appearance-none cursor-pointer"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-dark-900 text-slate-100">
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Checkbox: Terms & Community Guidelines */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.agree_terms}
                  onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded bg-dark-950 border-white/20 text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 focus:ring-1"
                />
                <span className="text-xs text-slate-300">
                  I agree to SkillSwap's{' '}
                  <span className="text-violet-400 font-semibold hover:underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-violet-400 font-semibold hover:underline">
                    Community Guidelines
                  </span>
                  .
                </span>
              </label>
              {errors.agree_terms && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.agree_terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4 font-semibold shadow-glow-sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register & Continue to Onboarding
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
