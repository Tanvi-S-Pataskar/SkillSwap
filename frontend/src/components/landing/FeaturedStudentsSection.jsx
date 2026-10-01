import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, GraduationCap, ArrowRight, ArrowLeftRight, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../api/client';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Rating from '../ui/Rating';
import Button from '../ui/Button';

const FALLBACK_STUDENTS = [
  {
    id: 1,
    name: 'Maya Lin',
    university: 'UC Berkeley',
    major: 'Computer Science',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    rating: 4.95,
    review_count: 28,
    sessions_completed: 34,
    xp: 3420,
    level: 6,
    teaching_skills: ['Python & Data Structures', 'React & Next.js'],
    learning_skills: ['Figma & UI/UX Design', 'Conversational Japanese'],
    is_verified: true,
  },
  {
    id: 2,
    name: 'Liam Vance',
    university: 'Stanford University',
    major: 'Product Design & HCI',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    rating: 4.98,
    review_count: 42,
    sessions_completed: 51,
    xp: 4850,
    level: 8,
    teaching_skills: ['Figma & UI/UX Design', '3D Modeling with Blender'],
    learning_skills: ['Rust Systems Programming', 'Machine Learning & PyTorch'],
    is_verified: true,
  },
  {
    id: 3,
    name: 'Aarav Sharma',
    university: 'MIT',
    major: 'Electrical Eng & CS',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    rating: 4.92,
    review_count: 31,
    sessions_completed: 39,
    xp: 3900,
    level: 7,
    teaching_skills: ['Python & Data Structures', 'Rust Systems Programming'],
    learning_skills: ['Business Spanish', 'Startup Pitching & VC Decks'],
    is_verified: true,
  },
];

const FeaturedStudentsSection = () => {
  const [students, setStudents] = useState(FALLBACK_STUDENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/students/featured?limit=6');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data);
        }
      } catch (err) {
        // Keeps fallback students
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Top Rated Peer Mentors
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured <span className="text-gradient-purple">Students</span>
            </h2>
            <p className="text-slate-400 mt-2 text-base">
              Connect with high-achieving university students verified by community ratings.
            </p>
          </div>

          <Link to="/students">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Students
            </Button>
          </Link>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Name, University, Rating */}
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
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/student/${student.id}`}
                          className="font-bold text-base text-white group-hover:text-violet-300 transition-colors"
                        >
                          {student.name}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {student.university}
                      </div>
                      <div className="text-[11px] text-violet-400">
                        {student.major}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{Number(student.rating).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {student.review_count} reviews
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                  {student.bio}
                </p>

                {/* Skills Can Teach */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Teaches:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.teaching_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills Wants to Learn */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Wants to Learn:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.learning_skills.map((s, idx) => (
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

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 font-mono">
                  {student.sessions_completed} sessions done
                </div>
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStudentsSection;
