import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, Users, ArrowRight, BookOpen, Code, Palette, Database, Languages, GraduationCap, Briefcase, Music } from 'lucide-react';
import api from '../api/client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkillCardSkeleton } from '../components/ui/LoadingSkeleton';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Tech', 'Design', 'Data', 'Languages', 'Academics', 'Business', 'Music'];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const url = selectedCat === 'All' ? '/skills' : `/skills?category=${selectedCat}`;
        const res = await api.get(url);
        setSkills(res.data);
      } catch (err) {
        console.error('Failed to load skills', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [selectedCat]);

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Skill Directory
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Skills to <span className="text-gradient-purple">Swap & Learn</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Search hundreds of skills taught by university students. Pick a skill to find available peer mentors ready for a barter session.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Python, Figma, Japanese..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? 'bg-violet-600 text-white shadow-glow-sm border border-violet-400/40'
                : 'bg-charcoal-card text-slate-300 border border-white/[0.07] hover:text-white hover:bg-charcoal-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="purple" size="sm">
                    {skill.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span>{skill.teacher_count} student mentors</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                  {skill.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {skill.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">1:1 Barter Ready</span>
                <Link to={`/students?skill=${encodeURIComponent(skill.name)}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Find Mentors
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No skills found"
          description={`No skills matched "${searchQuery}". Try a different keyword or reset your filter.`}
          actionLabel="Show All Skills"
          onAction={() => {
            setSearchQuery('');
            setSelectedCat('All');
          }}
        />
      )}
    </div>
  );
};

export default ExplorePage;
