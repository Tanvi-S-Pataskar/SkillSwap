import React from 'react';
import {
  MessageSquare,
  PiggyBank,
  Award,
  Users2,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Card from '../ui/Card';

const WhySkillSwapSection = () => {
  const benefits = [
    {
      title: 'Interactive 1-on-1 Real-time Feedback',
      description:
        'Unlike watching pre-recorded YouTube or Coursera videos where you get stuck for hours, a peer screenshares with you and debugs issues on the spot.',
      icon: MessageSquare,
      color: 'text-violet-400',
    },
    {
      title: 'Zero Financial Barrier for Students',
      description:
        'Commercial bootcamps and tutoring charge extortionate rates. SkillSwap runs on knowledge barter — accessible to every student regardless of budget.',
      icon: PiggyBank,
      color: 'text-emerald-400',
    },
    {
      title: 'Verifiable Proof of Mentorship',
      description:
        'Every session leaves a public record of peer reviews, endorsements, and skill certificates that you can link on your resume and LinkedIn.',
      icon: Award,
      color: 'text-amber-400',
    },
    {
      title: 'Find Hackathon & Project Partners',
      description:
        'Form multidisciplinary teams. Designers meet frontend engineers, who meet data scientists. Build real projects together.',
      icon: Users2,
      color: 'text-indigo-400',
    },
    {
      title: 'Gamified Skill Progression',
      description:
        'Earn XP, level up your student rank, unlock prestigious badges, and climb the university leaderboard while expanding your skills.',
      icon: Trophy,
      color: 'text-purple-400',
    },
    {
      title: 'Safe Campus Environment',
      description:
        'All student profiles require university domain verification. Strict community guidelines and accountability ensure a respectful study culture.',
      icon: Flame,
      color: 'text-rose-400',
    },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
            The Student Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why <span className="text-gradient-purple">SkillSwap</span> Beats Traditional Learning
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Built by students, for students. Here is how peer-to-peer exchange transforms your education.
          </p>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-charcoal-card border border-white/[0.08] hover:border-violet-500/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-glow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Side-by-Side Comparison Box */}
        <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-8">
            SkillSwap vs Old Alternatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="p-5 rounded-2xl bg-dark-950/60 border border-rose-500/20 space-y-3">
              <div className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Traditional Paid Tutoring & MOOCs</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">•</span>
                  <span>Expensive ($40 - $120 / hour)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">•</span>
                  <span>Passive video watching with zero interaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">•</span>
                  <span>No reciprocal skill growth or teaching practice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">•</span>
                  <span>Isolated learning without campus networking</span>
                </li>
              </ul>
            </div>

            {/* The SkillSwap Way */}
            <div className="p-5 rounded-2xl bg-violet-950/30 border border-violet-500/30 space-y-3 shadow-glow-sm">
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>The SkillSwap Model</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>100% free peer barter with time-bank credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Live 1-on-1 pair programming and design critiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Reinforce your own knowledge by teaching peers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Earn verifiable certificates and portfolio credibility</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySkillSwapSection;
