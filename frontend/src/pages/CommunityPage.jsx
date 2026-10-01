import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Users, Star, Sparkles, Flame, Shield, ArrowRight } from 'lucide-react';
import api from '../api/client';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const CommunityPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const [lbRes, bRes] = await Promise.all([
          api.get('/community/leaderboard'),
          api.get('/community/badges'),
        ]);
        setLeaderboard(Array.isArray(lbRes.data) ? lbRes.data : []);
        setBadges(Array.isArray(bRes.data) ? bRes.data : []);
      } catch (err) {
        console.error('Failed to load community data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
          University Hall of Fame
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Student <span className="text-gradient-purple">Community & Leaderboard</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Recognizing the most dedicated peer teachers, prolific learners, and open-source project collaborators across universities.
        </p>
      </div>

      {/* 2-Column: Leaderboard & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top 10 Student Leaderboard */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Campus XP Leaderboard</span>
            </h2>
            <span className="text-xs text-slate-400">All-time verified rank</span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((student, rank) => {
              const rankMedals = ['text-amber-400', 'text-slate-300', 'text-amber-600'];
              return (
                <div
                  key={student.id}
                  className="p-4 rounded-2xl bg-charcoal-card border border-white/[0.07] hover:border-violet-500/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-6 text-center font-black text-sm font-mono ${
                        rank < 3 ? rankMedals[rank] : 'text-slate-500'
                      }`}
                    >
                      #{rank + 1}
                    </span>

                    <Avatar src={student.avatar_url} name={student.name} size="md" isOnline={true} />

                    <div>
                      <Link
                        to={`/student/${student.id}`}
                        className="text-sm font-bold text-white hover:text-violet-300 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <div className="text-xs text-slate-400">
                        {student.university} · {student.major}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-violet-400 font-mono">
                      {student.xp} XP
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Level {student.level} · {student.sessions_completed} sessions
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Badges Catalog & Mission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-violet-400" />
              <span>Achievement Badges Catalog</span>
            </h2>

            <div className="space-y-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-violet-500/20 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{b.name}</span>
                      <span className="text-[10px] font-mono text-violet-400 font-bold">
                        +{b.xp_value} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Code of Conduct */}
          <div className="bg-gradient-to-br from-charcoal-card to-dark-950 border border-white/[0.08] rounded-3xl p-6 text-xs text-slate-300 space-y-2">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Campus Code of Mutual Aid</span>
            </div>
            <p className="leading-relaxed">
              SkillSwap is built on student integrity. Be punctual for scheduled barter sessions, come prepared, provide constructive peer feedback, and champion academic curiosity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
