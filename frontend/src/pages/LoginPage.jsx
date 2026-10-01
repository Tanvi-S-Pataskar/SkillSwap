import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

const LoginPage = () => {
  const [email, setEmail] = useState('maya.lin@berkeley.edu');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchUser, switchableUsers } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      showToast('Welcome back to SkillSwap!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Failed to sign in', 'error');
    }
  };

  const handleQuickPersona = async (p) => {
    await switchUser(p.id);
    showToast(`Logged in as ${p.name} (${p.university})`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 border border-white/[0.1] shadow-2xl">
          {/* Logo / Header */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Email (.edu)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* 1-Click Quick Demo Personas */}
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3 text-center">
              1-Click Demo Personas:
            </div>
            <div className="space-y-2">
              {switchableUsers.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickPersona(p)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-charcoal-card hover:bg-charcoal-hover border border-white/[0.06] hover:border-violet-500/40 text-left transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={p.avatar_url} name={p.name} size="xs" />
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.university} · {p.major}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                    Switch
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
