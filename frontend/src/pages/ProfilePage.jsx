import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Award, Plus, Star, CheckCircle2, ShieldCheck, Coins, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-5">
            <Avatar
              src={user?.avatar_url}
              name={user?.name}
              size="2xl"
              isVerified={user?.is_verified}
              isOnline={true}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user?.name}
                </h1>
                <Badge variant="verified" size="sm" isVerified={true}>
                  Verified Student
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-300">
                {user?.university} · {user?.major}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Class of {user?.graduation_year || 2026} · Level {user?.level || 3} Scholar
              </p>

              <div className="flex items-center gap-3 mt-3">
                <Rating value={user?.rating || 5.0} reviewCount={user?.review_count || 0} size="sm" />
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {user?.sessions_completed || 0} sessions
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {user?.time_credits || 10} Credits
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/profile/edit">
              <Button variant="secondary" size="md" leftIcon={<Edit3 className="w-4 h-4" />}>
                Edit Profile
              </Button>
            </Link>
            <Link to="/certificates">
              <Button variant="primary" size="md" leftIcon={<Award className="w-4 h-4" />}>
                Certificates
              </Button>
            </Link>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Bio
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
            {user?.bio || 'Senior building AI apps. Love teaching Python and fullstack React. Looking to exchange for Figma design and Conversational Japanese!'}
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills I Teach */}
        <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Skills I Teach</span>
            </h2>
            <Link to="/profile/edit" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
              Manage Skills
            </Link>
          </div>

          <div className="space-y-3">
            {(user?.skills || [])
              .filter((s) => s.skill_type === 'teach')
              .map((sk) => (
                <div
                  key={sk.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-emerald-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{sk.name}</div>
                    <div className="text-xs text-slate-400">{sk.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm">
                      {sk.proficiency}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sk.endorsements_count} endorsements
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>Skills I Want to Learn</span>
            </h2>
            <Link to="/profile/edit" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
              Add Goal
            </Link>
          </div>

          <div className="space-y-3">
            {(user?.skills || [])
              .filter((s) => s.skill_type === 'learn')
              .map((sk) => (
                <div
                  key={sk.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-violet-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{sk.name}</div>
                    <div className="text-xs text-slate-400">{sk.category}</div>
                  </div>
                  <Badge variant="purple" size="sm">
                    {sk.proficiency}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
