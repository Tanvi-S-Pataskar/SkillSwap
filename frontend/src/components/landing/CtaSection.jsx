import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';

const CtaSection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Radial Glow & Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/40 via-dark-950 to-dark-950 pointer-events-none -z-10" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-80 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-14 border border-violet-500/30 shadow-2xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Join 5,000+ University Students</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Your skills are worth sharing.{' '}
            <span className="text-gradient-purple">Your next skill is waiting for you.</span>
          </h2>

          <p className="text-slate-300 mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Create your profile in 60 seconds, list what you know, and get 5 free time credits to start learning immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-glow-md"
                leftIcon={<BookOpen className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Learning
              </Button>
            </Link>

            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                leftIcon={<GraduationCap className="w-4 h-4 text-violet-400" />}
              >
                Start Teaching
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            No credit card required · Free forever for students · Verified university network
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
