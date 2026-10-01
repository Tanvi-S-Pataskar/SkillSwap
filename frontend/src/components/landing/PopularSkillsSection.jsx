import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Palette,
  Database,
  Languages,
  GraduationCap,
  Briefcase,
  Music,
  ArrowRight,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const PopularSkillsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Tech', icon: Code },
    { name: 'Design', icon: Palette },
    { name: 'Data', icon: Database },
    { name: 'Languages', icon: Languages },
    { name: 'Academics', icon: GraduationCap },
    { name: 'Business', icon: Briefcase },
    { name: 'Music', icon: Music },
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const url = selectedCategory === 'All' ? '/skills' : `/skills?category=${selectedCategory}`;
        const res = await api.get(url);
        setSkills(res.data);
      } catch (err) {
        console.error('Failed to fetch popular skills', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [selectedCategory]);

  return (
    <section className="py-20 bg-dark-900/50 relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Explore Learning Paths
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Popular <span className="text-gradient-purple">Skills</span> in Demand
            </h2>
            <p className="text-slate-400 mt-2 text-base">
              Learn practical tools, academic subjects, and creative crafts directly from peer practitioners.
            </p>
          </div>

          <Link to="/explore">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Browse All 100+ Skills
            </Button>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-glow-sm border border-violet-400/40'
                    : 'bg-charcoal-card text-slate-300 border border-white/[0.07] hover:text-white hover:bg-charcoal-hover'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-violet-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {skills.slice(0, 8).map((skill) => (
            <Link
              key={skill.id}
              to={`/students?skill=${encodeURIComponent(skill.name)}`}
              className="bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="purple" size="sm">
                    {skill.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Users className="w-3 h-3 text-violet-400" />
                    <span>{skill.teacher_count} teachers</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors mb-1.5 leading-snug">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Free student barter</span>
                <span className="text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Find peers <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSkillsSection;
