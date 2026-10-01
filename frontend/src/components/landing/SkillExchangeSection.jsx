import React, { useState } from 'react';
import { ArrowLeftRight, Check, Coins, Repeat, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import Button from '../ui/Button';

const SkillExchangeSection = () => {
  const [activeTab, setActiveTab] = useState('direct'); // direct vs timebank

  return (
    <section className="py-20 bg-dark-900/60 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Democratizing Higher Learning
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The <span className="text-gradient-purple">Skill Exchange</span> Engine
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Traditional tutoring costs $50-$100/hr. On SkillSwap, your currency is what you already know.
          </p>
        </div>

        {/* Feature Comparison / Mechanics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Two Barter Modes Explanation */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-charcoal-card border border-violet-500/30 shadow-glow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Direct 1:1 Skill Barter</h3>
                  <span className="text-xs text-violet-400 font-medium">Synchronous or alternating swap</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                You teach Liam Python algorithms, and in return, Liam teaches you Figma design systems. Zero credits required — just mutual agreement between two motivated students.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Immediate mutual learning</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Double XP reward</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] shadow-md hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Time-Bank Credit Network</h3>
                  <span className="text-xs text-amber-300 font-medium">Asynchronous flexible barter</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Can't find a direct trade? Teach student A for 1 hour to bank 1 Time Credit. Then spend that credit to learn advanced Rust from student B whenever you want!
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Unlimited flexibility</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Credits never expire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Exchange Model Diagram */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-charcoal-card to-dark-950 border border-white/[0.1] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>SkillSwap Currency Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              How value flows between student mentors and learners
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                    1h
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">Teach a Peer</div>
                    <div className="text-xs text-slate-400">Share your domain expertise</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">+1 Credit</div>
                  <div className="text-[11px] text-violet-400 font-mono">+150 XP</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                    1h
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">Learn a New Skill</div>
                    <div className="text-xs text-slate-400">1-on-1 private student session</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400">-1 Credit</div>
                  <div className="text-[11px] text-violet-400 font-mono">+100 XP</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                    ★
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">Post-Session Review</div>
                    <div className="text-xs text-slate-400">Mutual verified feedback</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-violet-300">+50 XP</div>
                  <div className="text-[11px] text-slate-400">Profile Proof</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white">New members get 5 Free Welcome Credits</span>
              <span className="text-emerald-400 font-bold">100% Free Forever</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillExchangeSection;
