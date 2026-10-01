import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  Sparkles,
  CalendarCheck,
  Calendar,
  MessageSquare,
  Award,
  Rocket,
  Globe2,
  User,
  Settings,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Skills', path: '/explore', icon: Compass },
    { name: 'Find Students', path: '/students', icon: Users },
    { name: 'Skill Matcher', path: '/skill-match', icon: Sparkles, badge: 'AI' },
    { name: 'Swap Sessions', path: '/sessions', icon: CalendarCheck },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Collaborate', path: '/projects', icon: Rocket },
    { name: 'Community', path: '/community', icon: Globe2 },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Calculate XP progress towards next level
  const currentXP = user?.xp || 0;
  const levelXP = 1000;
  const progressPercent = Math.min(100, Math.round(((currentXP % levelXP) / levelXP) * 100));

  return (
    <aside className="w-64 flex-shrink-0 bg-dark-900/70 border-r border-white/[0.08] min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        {/* User Card Mini */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-charcoal-card border border-white/[0.07] shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar_url}
                name={user.name}
                size="md"
                isVerified={user.is_verified}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.university}</div>
              </div>
            </div>

            {/* Level & XP Progress */}
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-violet-400">Level {user.level}</span>
                <span className="text-[11px] text-slate-400 font-mono">{user.xp} XP</span>
              </div>
              <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Barter Credits Pill */}
            <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Time Credits</span>
              </div>
              <span className="font-bold">{user.time_credits} hrs</span>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-white border border-violet-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-violet-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Tagline in Sidebar */}
      <div className="p-3 rounded-xl bg-dark-950/60 border border-white/[0.05] text-[11px] text-slate-400 text-center">
        <span className="text-violet-400 font-semibold">LEARN ↔ TEACH</span>
        <br />
        Connect, Build & Grow
      </div>
    </aside>
  );
};

export default Sidebar;
