import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Coins,
  Video,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Star,
  Users,
  Target,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import EmptyState from '../components/ui/EmptyState';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [sessRes, goalsRes, stuRes] = await Promise.all([
          api.get(`/sessions?user_id=${user?.id || 1}`),
          api.get(`/community/goals?user_id=${user?.id || 1}`),
          api.get('/students/featured?limit=3'),
        ]);
        setSessions(sessRes.data);
        setGoals(goalsRes.data);
        setRecommendedStudents(stuRes.data.filter((s) => s.id !== user?.id));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const handleUpdateProgress = async (goalId, currentPct) => {
    const nextPct = Math.min(100, currentPct + 25);
    try {
      await api.put(`/community/goals/${goalId}/progress?progress=${nextPct}&user_id=${user?.id || 1}`);
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, progress_pct: nextPct, status: nextPct === 100 ? 'completed' : g.status } : g))
      );
      if (nextPct === 100) {
        showToast('Learning Goal Completed! +200 XP awarded!', 'success');
      } else {
        showToast(`Goal progress updated to ${nextPct}%!`, 'info');
      }
    } catch (err) {
      showToast('Failed to update goal', 'error');
    }
  };

  const upcomingSessions = sessions.filter((s) => s.status === 'confirmed');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-charcoal-card border border-violet-500/20 shadow-glow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatar_url}
              name={user?.name}
              size="xl"
              isVerified={user?.is_verified}
              isOnline={true}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <Badge variant="verified" size="sm" isVerified={true}>
                  Verified Student
                </Badge>
              </div>
              <p className="text-sm text-slate-300">
                {user?.university} · {user?.major}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-violet-300">
                <span className="font-semibold bg-violet-500/20 px-2 py-0.5 rounded-md border border-violet-500/30">
                  Level {user?.level} Scholar
                </span>
                <span>•</span>
                <span className="font-mono">{user?.xp} Total XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/explore">
              <Button variant="primary" size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                Find a Skill
              </Button>
            </Link>
            <Link to="/sessions">
              <Button variant="secondary" size="md">
                View Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-charcoal-card border border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Time Credits
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {user?.time_credits || 10} <span className="text-sm font-sans text-slate-400">hrs</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Ready for 1:1 learning barters</p>
        </div>

        <div className="bg-charcoal-card border border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sessions Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {user?.sessions_completed || 34}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified mentorship hours</p>
        </div>

        <div className="bg-charcoal-card border border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Peer Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono flex items-center gap-2">
            {Number(user?.rating || 4.95).toFixed(2)}
          </div>
          <p className="text-[11px] text-amber-300 mt-1">Based on {user?.review_count || 28} student reviews</p>
        </div>

        <div className="bg-charcoal-card border border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Student XP
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {user?.xp || 3420}
          </div>
          <p className="text-[11px] text-violet-300 mt-1">Next rank at {((Math.floor((user?.xp || 3420) / 1000) + 1) * 1000)} XP</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Sessions & Learning Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Sessions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              <span>Upcoming Swap Sessions</span>
            </h2>
            <Link to="/sessions" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
              View all ({sessions.length})
            </Link>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-charcoal-card border border-violet-500/30 shadow-glow-sm hover:border-violet-500/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={s.is_teacher ? s.learner_avatar : s.teacher_avatar}
                        name={s.is_teacher ? s.learner_name : s.teacher_name}
                        size="md"
                        isOnline={true}
                      />
                      <div>
                        <div className="text-sm font-bold text-white leading-snug">
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          With {s.is_teacher ? s.learner_name : s.teacher_name} · {s.skill_name}
                        </div>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      {s.scheduled_at}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      {s.duration_minutes} min duration
                    </span>
                    <a
                      href={s.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video Room</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming sessions scheduled"
              description="Browse peers teaching skills you want to learn and book your first 1-on-1 swap!"
              actionLabel="Explore Skills"
              onAction={() => window.location.assign('/explore')}
            />
          )}

          {/* Quick Match Recommendations */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Recommended Peer Matches</span>
              </h3>
              <Link to="/skill-match" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
                Launch Smart Matcher →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-charcoal-card border border-white/[0.07] hover:border-violet-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <Avatar src={st.avatar_url} name={st.name} size="md" isVerified={st.is_verified} />
                    <div>
                      <Link to={`/student/${st.id}`} className="text-sm font-bold text-white hover:text-violet-300">
                        {st.name}
                      </Link>
                      <div className="text-[11px] text-slate-400">{st.university}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 mb-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Teaches:</span>
                    <div className="flex flex-wrap gap-1">
                      {st.teaching_skills.slice(0, 2).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[10px] rounded border border-emerald-500/20 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to={`/student/${st.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      View Profile & Swap
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Learning Goals & Badges Showcase */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Goals */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                <span>Active Learning Goals</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">{goals.length} active</span>
            </div>

            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-white/[0.06] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white leading-snug">
                      {goal.title}
                    </span>
                    <span className="text-[11px] font-bold text-violet-400 font-mono">
                      {goal.progress_pct}%
                    </span>
                  </div>

                  <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress_pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Target: {goal.target_date}
                    </span>
                    {goal.progress_pct < 100 && (
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.progress_pct)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        +25% Progress
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Earned Badges</span>
              </h2>
              <span className="text-xs text-amber-300 font-semibold font-mono">
                {user?.badges?.length || 3} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(user?.badges || [
                { name: 'Master Mentor', icon: 'GraduationCap' },
                { name: 'Quick Learner', icon: 'Zap' },
                { name: '5-Star Guru', icon: 'Star' },
              ]).map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-dark-950/60 border border-violet-500/20 text-center flex flex-col items-center justify-center hover:border-violet-500/40 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center mb-1.5">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-[11px] font-bold text-white truncate max-w-full">
                    {b.name}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Verified</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
