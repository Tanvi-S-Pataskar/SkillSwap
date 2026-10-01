import React from 'react';
import { ArrowLeftRight, Sparkles, CheckCircle2, Video, Code, Palette, Clock, Award, Star } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const SkillExchangeVisual = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto">
      {/* Decorative Glow Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-purple-600/30 rounded-3xl blur-2xl opacity-75 -z-10 animate-pulse-slow" />

      {/* Main Barter Card Frame */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.12] shadow-2xl relative">
        {/* Top Active Session Indicator Pill */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Live Skill Swap In Session
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium">
            <Clock className="w-3 h-3 text-violet-400" />
            <span>45 min barter</span>
          </div>
        </div>

        {/* 2-Student Barter Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 relative">
          {/* Student 1: Maya */}
          <div className="p-4 rounded-2xl bg-charcoal-card/90 border border-violet-500/30 relative shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                name="Maya Lin"
                size="md"
                isVerified={true}
              />
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Maya Lin</h4>
                <p className="text-xs text-slate-400">UC Berkeley · CS '26</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-semibold text-amber-300">4.95 (28)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/20">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 flex items-center justify-between mb-1">
                  <span>Teaching Now:</span>
                  <Code className="w-3 h-3 text-violet-400" />
                </div>
                <div className="text-xs font-semibold text-white">
                  Python Algorithms & Trees
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                  Wants to Learn:
                </div>
                <div className="text-xs text-slate-300">
                  Figma Auto-Layout & UI Systems
                </div>
              </div>
            </div>
          </div>

          {/* Central Exchange Badge / Icon (Overlay between cards on mobile, in between on sm) */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-2 border-dark-900 shadow-glow-md items-center justify-center text-white">
            <ArrowLeftRight className="w-5 h-5 animate-pulse" />
          </div>

          {/* Student 2: Liam */}
          <div className="p-4 rounded-2xl bg-charcoal-card/90 border border-indigo-500/30 relative shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
                name="Liam Vance"
                size="md"
                isVerified={true}
              />
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Liam Vance</h4>
                <p className="text-xs text-slate-400">Stanford · HCI '25</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-semibold text-amber-300">4.98 (42)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center justify-between mb-1">
                  <span>Teaching Now:</span>
                  <Palette className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="text-xs font-semibold text-white">
                  Figma Design Tokens & Variants
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                  Wants to Learn:
                </div>
                <div className="text-xs text-slate-300">
                  Python LeetCode Data Structures
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Barter Transaction Status */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="text-white font-medium">1:1 Zero-Cost Barter</span>
              <p className="text-[11px] text-slate-400">Both students earn +150 XP & verified review</p>
            </div>
          </div>
          <span className="text-xs font-bold text-violet-400 font-mono">1.0 Credit ↔ 1.0 Credit</span>
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeVisual;
