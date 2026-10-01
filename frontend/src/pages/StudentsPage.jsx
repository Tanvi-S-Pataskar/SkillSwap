import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, GraduationCap, ArrowLeftRight, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../api/client';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton';

const StudentsPage = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [skillFilter, setSkillFilter] = useState(searchParams.get('skill') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        let url = `/students?sort_by=${sortBy}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        if (skillFilter) url += `&skill=${encodeURIComponent(skillFilter)}`;
        const res = await api.get(url);
        setStudents(res.data);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [query, skillFilter, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Campus Network
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Find <span className="text-gradient-purple">Student Mentors & Peers</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Browse verified students ready to swap knowledge. Request 1-on-1 sessions, review backgrounds, and connect on campus.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, major, campus..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'rating', label: 'Highest Rated' },
                { value: 'sessions', label: 'Most Sessions' },
                { value: 'xp', label: 'Highest XP' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Active Skill Filter pill if present */}
      {skillFilter && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filtering by skill:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/30 text-violet-200 border border-violet-500/40 text-xs font-semibold">
            {skillFilter}
            <button onClick={() => setSkillFilter('')} className="hover:text-white ml-1">
              ×
            </button>
          </span>
        </div>
      )}

      {/* Student Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.avatar_url}
                      name={student.name}
                      size="lg"
                      isVerified={student.is_verified}
                      isOnline={true}
                    />
                    <div>
                      <Link
                        to={`/student/${student.id}`}
                        className="font-bold text-base text-white group-hover:text-violet-300 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <div className="text-xs text-slate-400 font-medium">
                        {student.university}
                      </div>
                      <div className="text-[11px] text-violet-400">
                        {student.major} · Class of {student.graduation_year}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{Number(student.rating).toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                  {student.bio}
                </p>

                {/* Teaching Skills */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Teaches:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.teaching_skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Skills */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Wants to Learn:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.learning_skills.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-mono">
                  {student.sessions_completed} sessions
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/messages?with=${student.id}`}>
                    <Button variant="ghost" size="sm" className="px-2.5">
                      <MessageSquare className="w-4 h-4 text-slate-300" />
                    </Button>
                  </Link>
                  <Link to={`/student/${student.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                    >
                      Request Swap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students found"
          description="Try broadening your search term or removing specific skill filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setQuery('');
            setSkillFilter('');
          }}
        />
      )}
    </div>
  );
};

export default StudentsPage;
