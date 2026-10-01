import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Heart, ShieldCheck, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-950 border-t border-white/[0.08] pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-0.5 shadow-glow-sm">
                <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Skill<span className="text-violet-400">Swap</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              SkillSwap connects students who want to learn with students who are ready to teach. A peer-to-peer skill barter ecosystem built for the next generation of builders.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>LEARN ↔ TEACH ↔ CONNECT ↔ BUILD ↔ GROW</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-charcoal-card border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-charcoal-card border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-charcoal-card border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/40 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-violet-400 transition-colors">
                  Explore Skills
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-violet-400 transition-colors">
                  Browse Students
                </Link>
              </li>
              <li>
                <Link to="/skill-match" className="hover:text-violet-400 transition-colors">
                  AI Skill Matcher
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-violet-400 transition-colors">
                  Student Projects
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-violet-400 transition-colors">
                  Community & Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Learn & Teach */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Learn & Teach</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/sessions" className="hover:text-violet-400 transition-colors">
                  Swap Sessions
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="hover:text-violet-400 transition-colors">
                  Verified Certificates
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-violet-400 transition-colors">
                  Session Calendar
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-violet-400 transition-colors">
                  How Skill Barter Works
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-violet-400 transition-colors">
                  Student Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Campus */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Campus Trust</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified .edu emails</span>
              </li>
              <li>Peer Rating System</li>
              <li>Time-Bank Credit Barter</li>
              <li>Zero Financial Barrier</li>
              <li>Open Source Student Teams</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSwap Inc. Built for university learners worldwide.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Student Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
