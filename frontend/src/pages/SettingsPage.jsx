import React, { useState } from 'react';
import { Settings, ShieldCheck, Bell, Moon, User, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const SettingsPage = () => {
  const { user, switchUser, switchableUsers, logout } = useAuth();
  const { showToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoConfirmSwaps, setAutoConfirmSwaps] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account <span className="text-gradient-purple">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your student preferences, notification channels, and active profile
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Summary Card */}
        <div className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatar_url} name={user?.name} size="lg" isVerified={user?.is_verified} />
            <div>
              <div className="text-base font-bold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                {user?.university} · Verified
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-violet-400 font-bold bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20">
            {user?.time_credits} Credits Available
          </span>
        </div>

        {/* Switch Student Persona (Demo Feature) */}
        <div className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Switch Student Persona (Live Demo)
            </h3>
            <p className="text-xs text-slate-400">
              Instantly toggle between different student accounts to test bidirectional peer bartering and messaging:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {switchableUsers.map((p) => {
              const isCurrent = p.id === user?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    switchUser(p.id);
                    showToast(`Active persona switched to ${p.name}!`, 'info');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-violet-600/20 border-violet-500/50 shadow-glow-sm'
                      : 'bg-dark-950/60 border-white/[0.06] hover:border-violet-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar_url} name={p.name} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.university}</div>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 hover:text-white">
                      Switch
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences Toggle */}
        <div className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white">Barter & Session Preferences</h3>

          <div className="space-y-4 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-semibold text-white">Email Session Notifications</div>
                <div className="text-[11px] text-slate-400">Receive reminders 1 hour before scheduled swap calls</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Accept Direct Barter Requests</div>
                <div className="text-[11px] text-slate-400">Automatically confirm sessions from 4.8+ rated students</div>
              </div>
              <input
                type="checkbox"
                checked={autoConfirmSwaps}
                onChange={(e) => setAutoConfirmSwaps(e.target.checked)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Log Out */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              logout();
              showToast('Logged out of student session', 'info');
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
