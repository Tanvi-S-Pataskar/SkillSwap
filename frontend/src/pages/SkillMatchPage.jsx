import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  Zap,
  ArrowRight,
  Star,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  X,
  Calendar,
  BookOpen,
  Clock,
  Award,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import api, { formatApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

const SkillMatchPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'perfect' | 'can_teach_me' | 'wants_to_learn'
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [learningStyleFilter, setLearningStyleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Booking Modal State
  const [bookingStudent, setBookingStudent] = useState(null);
  const [bookingSkillId, setBookingSkillId] = useState('');
  const [bookingDate, setBookingDate] = useState('Tomorrow at 4:00 PM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (modeFilter !== 'all') params.append('mode', modeFilter);
      if (skillLevelFilter !== 'all') params.append('skill_level', skillLevelFilter);
      if (learningStyleFilter !== 'all') params.append('learning_style', learningStyleFilter);
      if (availabilityFilter !== 'all') params.append('availability_day', availabilityFilter);
      if (user?.id) params.append('user_id', user.id);

      const res = await api.get(`/students/matches?${params.toString()}`);
      setMatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load skill matches', err);
      showToast(formatApiError(err, 'Failed to load skill matches.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter changes (with debounce on search query)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 250);
    return () => clearTimeout(timer);
  }, [user, searchQuery, modeFilter, skillLevelFilter, learningStyleFilter, availabilityFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setModeFilter('all');
    setSkillLevelFilter('all');
    setLearningStyleFilter('all');
    setAvailabilityFilter('all');
  };

  const handleOpenBooking = (student) => {
    setBookingStudent(student);
    if (student.teaching_skills && student.teaching_skills.length > 0) {
      setBookingSkillId(student.teaching_skills[0].id || student.teaching_skills[0].skill_id || '');
    }
    setBookingDate('Tomorrow at 4:00 PM');
    setBookingNotes(`Hi ${student.name}! I would love to do a peer skill swap session with you.`);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingStudent) return;
    try {
      setIsSubmittingBooking(true);
      const skillIdNum = Number(bookingSkillId) || (bookingStudent.teaching_skills?.[0]?.id) || 1;
      await api.post(`/sessions?learner_id=${user?.id || 1}`, {
        teacher_id: bookingStudent.id,
        skill_id: skillIdNum,
        title: `Peer Swap with ${bookingStudent.name}`,
        description: `1-on-1 collaborative skill swap session covering practical knowledge.`,
        scheduled_at: bookingDate,
        duration_minutes: 60,
        notes: bookingNotes,
      });

      setIsSubmittingBooking(false);
      setBookingStudent(null);
      showToast(`Skill Swap session requested with ${bookingStudent.name}! Redirecting to sessions...`, 'success');
      navigate('/sessions');
    } catch (err) {
      setIsSubmittingBooking(false);
      showToast(formatApiError(err, 'Failed to book session.'), 'error');
    }
  };

  const perfectMatchesCount = matches.filter((m) => m.is_perfect_match).length;
  const canTeachCount = matches.filter((m) => (m.can_teach_you || []).length > 0).length;
  const wantsLearnCount = matches.filter((m) => (m.wants_from_you || []).length > 0).length;

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    modeFilter !== 'all' ||
    skillLevelFilter !== 'all' ||
    learningStyleFilter !== 'all' ||
    availabilityFilter !== 'all';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Automated Complementary Barter
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Smart <span className="text-gradient-purple">Skill Matcher</span> & Peer Discovery
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Our matching algorithm pairs what you teach with what other students want to learn, and vice versa.
              Discover zero-cost, 1:1 educational exchange partners across university campuses.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-violet-500/30 text-center">
              <div className="text-2xl font-black text-violet-400 font-mono">
                {matches.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Total Matches
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span>{perfectMatchesCount}</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mt-0.5">
                Perfect Swaps
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill name (e.g. Python, React, Figma), student name, or @username..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-charcoal-card border border-white/[0.08] text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Match Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-dark-900/80 rounded-2xl border border-white/[0.08] overflow-x-auto">
            {[
              { id: 'all', label: 'All Matches', count: matches.length },
              { id: 'perfect', label: 'Perfect 2-Way Swaps', count: perfectMatchesCount, isZap: true },
              { id: 'can_teach_me', label: 'Can Teach You', count: canTeachCount },
              { id: 'wants_to_learn', label: 'Wants What You Teach', count: wantsLearnCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setModeFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  modeFilter === tab.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.isZap && <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    modeFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-white/[0.05] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary Select Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Skill Level */}
            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-charcoal-card border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            {/* Learning Style */}
            <select
              value={learningStyleFilter}
              onChange={(e) => setLearningStyleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-charcoal-card border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Learning Styles</option>
              <option value="One-to-one">One-to-one</option>
              <option value="Project-based">Project-based</option>
              <option value="Group session">Group session</option>
              <option value="Quick doubt solving">Quick doubt solving</option>
              <option value="Long-term mentoring">Long-term mentoring</option>
            </select>

            {/* Availability */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-charcoal-card border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Any Day Availability</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MATCH CARDS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-7 rounded-3xl bg-charcoal-card border border-white/[0.08] animate-pulse h-64"
            />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((m) => {
            const isPerfect = m.is_perfect_match;

            return (
              <div
                key={m.id}
                className={`p-6 sm:p-7 rounded-3xl bg-charcoal-card border transition-all relative overflow-hidden group shadow-lg ${
                  isPerfect
                    ? 'border-violet-500/50 shadow-glow-sm bg-gradient-to-r from-violet-950/25 via-charcoal-card to-emerald-950/20 hover:border-violet-400'
                    : 'border-white/[0.08] hover:border-violet-500/30'
                }`}
              >
                {/* Glow pill for perfect matches */}
                {isPerfect && (
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Student Left Header */}
                  <div className="flex items-start gap-4 min-w-[240px]">
                    <Avatar
                      src={m.avatar_url}
                      name={m.name}
                      size="xl"
                      isVerified={m.is_verified}
                      isOnline={true}
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/student/${m.id}`}
                          className="text-lg font-bold text-white hover:text-violet-300 transition-colors"
                        >
                          {m.name}
                        </Link>
                        {m.username && (
                          <span className="text-xs text-slate-400">
                            @{m.username}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-medium">
                        {m.university || m.college} &bull; {m.major || m.course}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{Number(m.rating).toFixed(1)}</span>
                          <span className="text-slate-500 font-normal">
                            ({m.review_count || 0})
                          </span>
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-300">
                          Level {m.level} Scholar
                        </span>
                        <span>&bull;</span>
                        <span className="text-violet-400 font-mono font-semibold">
                          {m.xp} XP
                        </span>
                      </div>

                      {/* Match Classification Badge */}
                      <div className="pt-2">
                        {isPerfect ? (
                          <Badge
                            variant="verified"
                            size="sm"
                            icon={<Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                          >
                            Perfect 2-Way Swap
                          </Badge>
                        ) : m.match_type === 'can_teach_you' ? (
                          <Badge variant="purple" size="sm">
                            Teaches Your Target Skill
                          </Badge>
                        ) : m.match_type === 'wants_to_learn' ? (
                          <Badge variant="amber" size="sm">
                            Wants Your Expertise
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Campus Peer Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Complementary Skill Barter Box */}
                  <div className="flex-1 max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-dark-950/70 border border-white/[0.08]">
                    {/* They Can Teach You */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          They Teach You:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(m.teaching_skills || []).map((sk, idx) => {
                          const isTarget = (m.can_teach_you || []).some(
                            (ct) => ct.toLowerCase() === sk.name.toLowerCase()
                          );
                          return (
                            <span
                              key={idx}
                              className={`text-[11px] px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1 ${
                                isTarget
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                              }`}
                            >
                              <span>{sk.name}</span>
                              {sk.proficiency && (
                                <span className="text-[9px] opacity-75">
                                  ({sk.proficiency[0]})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* You Can Teach Them */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          You Teach Them:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(m.learning_skills || []).map((sk, idx) => {
                          const isTarget = (m.wants_from_you || []).some(
                            (wf) => wf.toLowerCase() === sk.name.toLowerCase()
                          );
                          return (
                            <span
                              key={idx}
                              className={`text-[11px] px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1 ${
                                isTarget
                                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
                                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                              }`}
                            >
                              <span>{sk.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score & Action CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-3xl font-black text-violet-400 font-mono leading-none">
                        {m.match_score}%
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Swap Score
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/student/${m.id}`}>
                        <Button variant="ghost" size="sm">
                          Profile
                        </Button>
                      </Link>

                      <Button
                        variant={isPerfect ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleOpenBooking(m)}
                        leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                        className={isPerfect ? 'shadow-glow-sm' : ''}
                      >
                        Request Swap
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Match Reason Banner */}
                {m.match_reason && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-violet-400 font-semibold flex-shrink-0">
                      Why this match:
                    </span>
                    <span className="text-slate-300 leading-relaxed">
                      {m.match_reason}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching students found"
          description={
            hasActiveFilters
              ? 'Try widening your search terms, clearing filters, or adding more skills you teach and want to learn in your profile.'
              : 'Add skills you want to learn and skills you can teach in your profile to let our matching algorithm find your barter partners!'
          }
          actionLabel={hasActiveFilters ? 'Clear All Filters' : 'Update My Profile Skills'}
          onAction={hasActiveFilters ? handleResetFilters : () => navigate('/profile/edit')}
        />
      )}

      {/* 4. REQUEST SKILL SWAP MODAL */}
      <Modal
        isOpen={Boolean(bookingStudent)}
        onClose={() => setBookingStudent(null)}
        title={bookingStudent ? `Request Skill Swap with ${bookingStudent.name}` : 'Request Swap'}
      >
        {bookingStudent && (
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
              <Avatar
                src={bookingStudent.avatar_url}
                name={bookingStudent.name}
                size="md"
              />
              <div>
                <div className="text-sm font-bold text-white">
                  {bookingStudent.name}
                </div>
                <div className="text-xs text-slate-400">
                  {bookingStudent.university} &bull; {bookingStudent.major}
                </div>
              </div>
            </div>

            {/* Skill Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Select Skill to Learn from {bookingStudent.name}:
              </label>
              <select
                value={bookingSkillId}
                onChange={(e) => setBookingSkillId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-violet-500"
                required
              >
                {(bookingStudent.teaching_skills || []).map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.proficiency || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Proposed Date / Time */}
            <Input
              label="Proposed Session Time / Slot"
              type="text"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              placeholder="e.g. Tomorrow at 4:00 PM or Friday 2:00 PM"
              required
            />

            {/* Barter Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Barter Message / Goal:
              </label>
              <textarea
                rows={3}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="What project or concept would you like to focus on during this barter session?"
                className="w-full rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm p-3 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-slate-300">
              <span className="text-violet-400 font-bold">1 Credit Barter:</span> 1 hour of peer swap exchanges 1 Time Credit. Once completed, both students earn <span className="text-violet-400 font-bold">+100 to +150 XP</span> and can leave verified ratings!
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBookingStudent(null)}
                disabled={isSubmittingBooking}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmittingBooking}
                leftIcon={<ArrowLeftRight className="w-4 h-4" />}
              >
                Send Barter Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SkillMatchPage;
