import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, GraduationCap, ArrowRight, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: 'Stanford University',
    major: 'Computer Science',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register(formData);
    setIsLoading(false);
    if (res.success) {
      showToast('Account created! Welcome bonus: +5 Time Credits awarded!', 'success');
      navigate('/onboarding');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 border border-white/[0.1] shadow-2xl">
          {/* Welcome Credits Pill */}
          <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Sign up now & get 5 Free Time-Bank Barter Credits!</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Join SkillSwap</h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect with fellow students, exchange skills, and build your portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Alex Rivera"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="University / College"
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              placeholder="e.g. UC Berkeley, MIT, Stanford"
              leftIcon={<GraduationCap className="w-4 h-4" />}
              required
            />

            <Input
              label="Major / Field of Study"
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="e.g. Computer Science, Design"
              required
            />

            <Input
              label="Student Email (.edu preferred)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@stanford.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Student Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
