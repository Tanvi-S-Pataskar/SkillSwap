import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeftRight, CheckCircle2, Zap, ArrowRight, Star, GraduationCap } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const SkillMatchPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const computeMatches = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students');
        const studentsList = Array.isArray(res.data) ? res.data : [];
        const otherStudents = studentsList.filter((s) => s.id !== (user?.id || 1));

        // Mock smart matching algorithm:
        // Match percentage based on complementary skills
        const myTeaches = (user?.teaching_skills || ['Python & Data Structures', 'React & Next.js']);
        const myLearns = (user?.learning_skills || ['Figma & UI/UX Design', 'Conversational Japanese']);

        const calculated = otherStudents.map((st) => {
          const sTeaches = Array.isArray(st.teaching_skills) ? st.teaching_skills : [];
          const sLearns = Array.isArray(st.learning_skills) ? st.learning_skills : [];
          const directCanTeachMe = sTeaches.filter((sk) =>
            myLearns.some((ml) => ml.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(ml.toLowerCase()))
          );
          const directWantsFromMe = sLearns.filter((sk) =>
            myTeaches.some((mt) => mt.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(mt.toLowerCase()))
          );

          let score = 70;
          if (directCanTeachMe.length > 0) score += 15;
          if (directWantsFromMe.length > 0) score += 14;

          return {
            ...st,
            matchScore: Math.min(99, score),
            givesYou: directCanTeachMe.length > 0 ? directCanTeachMe : [st.teaching_skills[0]],
            wantsFromYou: directWantsFromMe.length > 0 ? directWantsFromMe : [myTeaches[0]],
            isPerfectBarter: directCanTeachMe.length > 0 && directWantsFromMe.length > 0,
          };
        });

        calculated.sort((a, b) => b.matchScore - a.matchScore);
        setMatches(calculated);
      } catch (err) {
        console.error('Failed to compute matches', err);
      } finally {
        setLoading(false);
      }
    };
    computeMatches();
  }, [user]);

  const handleQuickRequest = (studentName) => {
    showToast(`Direct Skill Swap invite sent to ${studentName}!`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
          Automated Complementary Barter
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Smart <span className="text-gradient-purple">Skill Matcher</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Our algorithm pairs what you teach with what other students want to learn, creating instant zero-cost 1:1 learning loops.
        </p>
      </div>

      {/* Match Cards */}
      <div className="space-y-5">
        {matches.map((m) => (
          <div
            key={m.id}
            className={`p-6 sm:p-7 rounded-3xl bg-charcoal-card border transition-all ${
              m.isPerfectBarter
                ? 'border-violet-500/50 shadow-glow-sm bg-gradient-to-r from-violet-950/20 to-charcoal-card'
                : 'border-white/[0.08]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Student Overview */}
              <div className="flex items-center gap-4">
                <Avatar src={m.avatar_url} name={m.name} size="xl" isVerified={m.is_verified} isOnline={true} />
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/student/${m.id}`}
                      className="text-lg font-bold text-white hover:text-violet-300 transition-colors"
                    >
                      {m.name}
                    </Link>
                    {m.isPerfectBarter && (
                      <Badge variant="verified" size="sm" icon={<Zap className="w-3 h-3 text-emerald-400" />}>
                        Perfect 1:1 Match
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {m.university} · {m.major}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{m.rating}</span>
                    <span className="text-slate-500 font-mono">({m.sessions_completed} sessions)</span>
                  </div>
                </div>
              </div>

              {/* Match Exchange Details Box */}
              <div className="flex-1 max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                    They Will Teach You:
                  </span>
                  <div className="text-xs font-bold text-white leading-tight">
                    {m.givesYou.join(', ')}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block mb-1">
                    You Will Teach Them:
                  </span>
                  <div className="text-xs font-bold text-white leading-tight">
                    {m.wantsFromYou.join(', ')}
                  </div>
                </div>
              </div>

              {/* Match Score & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-violet-400 font-mono">
                    {m.matchScore}%
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Swap Compatibility
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/student/${m.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                    >
                      Instant Swap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillMatchPage;
