import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Code, Palette, Database, Languages, Sparkles } from 'lucide-react';
import api from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const SkillsPage = () => {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, skillsRes] = await Promise.all([
          api.get('/skills/categories'),
          api.get('/skills'),
        ]);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
        setSkills(Array.isArray(skillsRes.data) ? skillsRes.data : []);
      } catch (err) {
        console.error('Failed to load skills directory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
          University Curriculum & Practical Trades
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Comprehensive <span className="text-gradient-purple">Skills Directory</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          From LeetCode algorithms and fullstack engineering to 3D Blender and conversational languages, discover everything students are teaching on campus.
        </p>
      </div>

      {/* Categories Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={`/explore?category=${cat.name}`}
            className="p-4 rounded-2xl bg-charcoal-card border border-white/[0.07] hover:border-violet-500/40 text-center transition-all hover:-translate-y-1 hover:shadow-glow-sm"
          >
            <div className="text-sm font-bold text-white mb-1">{cat.name}</div>
            <div className="text-xs text-violet-400 font-medium">{cat.skills_count} skills</div>
          </Link>
        ))}
      </div>

      {/* Categorized Skills Section */}
      <div className="space-y-10">
        {categories.map((cat) => {
          const catSkills = skills.filter((s) => s.category.toLowerCase() === cat.name.toLowerCase());
          if (catSkills.length === 0) return null;

          return (
            <div key={cat.name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span>{cat.name} Skills</span>
                </h2>
                <Link
                  to={`/explore?category=${cat.name}`}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                >
                  Explore all ({catSkills.length}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catSkills.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-5 rounded-2xl bg-charcoal-card border border-white/[0.06] hover:border-violet-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="purple" size="sm">{sk.category}</Badge>
                        <span className="text-[11px] text-slate-400">{sk.teacher_count} mentors</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1.5">{sk.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {sk.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-medium">Free swap</span>
                      <Link to={`/students?skill=${encodeURIComponent(sk.name)}`}>
                        <Button variant="secondary" size="sm">
                          Browse Peers
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsPage;
