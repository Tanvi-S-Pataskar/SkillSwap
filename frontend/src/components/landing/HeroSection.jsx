import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, BookOpen, GraduationCap, ShieldCheck, Zap } from 'lucide-react';
import Button from '../ui/Button';
import SkillExchangeVisual from './SkillExchangeVisual';

const HeroSection = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Peer-to-Peer Student Learning Revolution</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Learn From Students.{' '}
              <span className="text-gradient-purple">Teach What You Know.</span>{' '}
              <span className="text-gradient-accent">Grow Together.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              SkillSwap connects students who want to learn with students who are ready to teach. Swap skills 1-on-1, build verified portfolios, earn credits, and level up together without spending a dime.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-glow-md"
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Find a Skill
                </Button>
              </Link>
              <Link to="/onboarding" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<Sparkles className="w-4 h-4 text-violet-400" />}
                >
                  Share Your Skill
                </Button>
              </Link>
            </div>

            {/* University Trust Badges */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified .edu student peers</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Time-bank barter model</span>
              </div>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400">Zero subscription fees</span>
            </div>
          </div>

          {/* Right Column: Visual Skill Exchange Graphics */}
          <div className="lg:col-span-6 flex justify-center">
            <SkillExchangeVisual />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
