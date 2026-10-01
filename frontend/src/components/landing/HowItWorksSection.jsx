import React from 'react';
import { UserCheck, Sparkles, Calendar, Award, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      title: 'List Skills & Learning Goals',
      description:
        'Specify skills you can teach (e.g. Python, Figma, Japanese) and what you want to learn. Set your skill proficiency level and campus background.',
      icon: UserCheck,
      color: 'from-violet-600 to-indigo-600',
    },
    {
      step: '02',
      title: 'Discover & Smart Match',
      description:
        'Browse verified student peers across 50+ universities or use our automated Skill Matcher to find direct complementary barter partners.',
      icon: Sparkles,
      color: 'from-indigo-600 to-blue-600',
    },
    {
      step: '03',
      title: 'Schedule 1-on-1 Swap Sessions',
      description:
        'Book 45 or 60 minute interactive peer sessions. Connect via instant video rooms, screen share, code together, or review designs in real time.',
      icon: Calendar,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      step: '04',
      title: 'Earn Credits, XP & Credibility',
      description:
        'Teaching earns you Time-Bank credits to book any lesson you need, plus XP, achievement badges, and verifiable peer reviews for your student portfolio.',
      icon: Award,
      color: 'from-cyan-600 to-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Simple 4-Step Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How <span className="text-gradient-purple">SkillSwap</span> Works
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            A frictionless peer-to-peer exchange where your knowledge is your currency. No money changes hands — just students helping students succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Step badge & icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 shadow-md`}
                    >
                      <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center text-white">
                        <Icon className="w-6 h-6 text-violet-300 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-violet-500/40 transition-colors font-mono">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-violet-400">
                  <span>Step {item.step} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
