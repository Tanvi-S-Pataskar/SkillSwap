import React, { useState } from 'react';
import { Link as RouterLink, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  Compass,
  Users,
  HelpCircle,
  MessageSquare,
  Bell,
  Coins,
  ChevronDown,
  Layers,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  LogOut,
  User as UserIcon,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const location = useRouterLocation();
  const { user, switchUser, switchableUsers, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Skills', path: '/explore' },
    { name: 'Students', path: '/students' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Community', path: '/community' },
    { name: 'Projects', path: '/projects' },
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-dark-950/80 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <RouterLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-0.5 shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Skill<span className="text-violet-400">Swap</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-md">
                  P2P
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
                Student Skill Exchange
              </span>
            </div>
          </RouterLink>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <RouterLink
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-white bg-white/[0.08] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
              </RouterLink>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Time Credits Barter Pill */}
                <RouterLink
                  to="/sessions"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                  title="Your Skill Barter Time Credits (1 credit = 1 hr session)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.time_credits} hrs</span>
                </RouterLink>

                {/* Notifications Link */}
                <RouterLink
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
                </RouterLink>

                {/* Messages Link */}
                <RouterLink
                  to="/messages"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="w-4 h-4" />
                </RouterLink>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/[0.08]"
                  >
                    <Avatar
                      src={user.avatar_url}
                      name={user.name}
                      size="sm"
                      isOnline={true}
                    />
                    <div className="text-left hidden xl:block">
                      <div className="text-xs font-semibold text-white leading-none">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-violet-400 mt-0.5">
                        Lvl {user.level} · {user.xp} XP
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-dark-900 border border-white/[0.1] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <div className="text-sm font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {user.university}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <RouterLink
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Layers className="w-4 h-4 text-violet-400" />
                          Student Dashboard
                        </RouterLink>
                        <RouterLink
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
                        >
                          <UserIcon className="w-4 h-4 text-violet-400" />
                          View My Profile
                        </RouterLink>
                        <RouterLink
                          to="/sessions"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Calendar className="w-4 h-4 text-violet-400" />
                          My Swap Sessions
                        </RouterLink>
                        <RouterLink
                          to="/certificates"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Award className="w-4 h-4 text-violet-400" />
                          Certificates & Proof
                        </RouterLink>
                        <RouterLink
                          to="/skill-match"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
                        >
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Smart Skill Matcher
                        </RouterLink>
                      </div>

                      {/* Demo Persona Switcher */}
                      <div className="border-t border-white/[0.06] pt-2 px-3 pb-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                          Switch Student Persona:
                        </div>
                        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                          {switchableUsers.slice(0, 4).map((p) => (
                            <button
                              key={p.id}
                              onClick={() => switchUser(p.id)}
                              className={`flex items-center justify-between w-full text-left p-1.5 rounded-lg text-xs transition-colors ${
                                p.id === user.id
                                  ? 'bg-violet-600/30 text-white font-medium border border-violet-500/40'
                                  : 'text-slate-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar src={p.avatar_url} name={p.name} size="xs" />
                                <span className="truncate">{p.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{p.university.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] pt-1">
                        <RouterLink
                          to="/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        >
                          Settings
                        </RouterLink>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <RouterLink
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2"
                >
                  Login
                </RouterLink>
                <RouterLink to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </RouterLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-dark-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <RouterLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-white bg-violet-600/20 border border-violet-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
              </RouterLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            <RouterLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.04] flex items-center justify-between"
            >
              <span>Dashboard</span>
              <span className="text-xs text-violet-400">{user?.xp || 0} XP</span>
            </RouterLink>
            <RouterLink
              to="/sessions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.04] flex items-center justify-between"
            >
              <span>My Sessions</span>
              <span className="text-xs text-amber-300">{user?.time_credits || 0} Credits</span>
            </RouterLink>
            <RouterLink
              to="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.04]"
            >
              Messages
            </RouterLink>
            {user ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user.name})
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <RouterLink to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Login
                  </Button>
                </RouterLink>
                <RouterLink to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </RouterLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
