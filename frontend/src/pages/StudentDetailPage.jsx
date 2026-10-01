import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowLeftRight,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Clock,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { StudentCardSkeleton } from '../components/ui/LoadingSkeleton';

const StudentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSkillId, setBookingSkillId] = useState('');
  const [bookingDate, setBookingDate] = useState('Tomorrow at 4:00 PM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
        if (res.data.skills?.length > 0) {
          const teachSkills = res.data.skills.filter((s) => s.skill_type === 'teach');
          if (teachSkills.length > 0) setBookingSkillId(teachSkills[0].skill_id);
        }
      } catch (err) {
        console.error('Failed to load student detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookingSkillId) {
      showToast('Please select a skill for the session', 'error');
      return;
    }
    try {
      setIsSubmittingBooking(true);
      await api.post(`/sessions?learner_id=${user?.id || 1}`, {
        teacher_id: student.id,
        skill_id: Number(bookingSkillId),
        title: `1-on-1 Peer Swap with ${student.name}`,
        description: `Barter session covering practical concepts and review.`,
        scheduled_at: bookingDate,
        duration_minutes: 60,
        notes: bookingNotes,
      });
      setIsSubmittingBooking(false);
      setIsBookingModalOpen(false);
      showToast(`Skill Swap session requested with ${student.name}!`, 'success');
      navigate('/sessions');
    } catch (err) {
      setIsSubmittingBooking(false);
      showToast(err.response?.data?.detail || 'Failed to book session', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <StudentCardSkeleton />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Student Not Found</h2>
        <Link to="/students">
          <Button variant="secondary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const teachSkills = (student.skills || []).filter((s) => s.skill_type === 'teach');
  const learnSkills = (student.skills || []).filter((s) => s.skill_type === 'learn');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Directory</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-5">
            <Avatar
              src={student.avatar_url}
              name={student.name}
              size="2xl"
              isVerified={student.is_verified}
              isOnline={true}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {student.name}
                </h1>
                <Badge variant="verified" size="sm" isVerified={true}>
                  Verified Student
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-300">
                {student.university} · {student.major}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Class of {student.graduation_year} · Level {student.level} Scholar ({student.xp} XP)
              </p>

              <div className="flex items-center gap-3 mt-3">
                <Rating value={student.rating} reviewCount={student.review_count} size="sm" />
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {student.sessions_completed} completed sessions
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsBookingModalOpen(true)}
              leftIcon={<ArrowLeftRight className="w-4 h-4" />}
              className="flex-1 sm:flex-initial shadow-glow-sm"
            >
              Request Skill Swap
            </Button>
            <Link to={`/messages?with=${student.id}`} className="flex-1 sm:flex-initial">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="w-full"
              >
                Send Message
              </Button>
            </Link>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            About Me
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
            {student.bio || 'Passionate student eager to teach and learn collaboratively on SkillSwap.'}
          </p>
        </div>
      </div>

      {/* 2-Column: Skills & Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Teaching & Learning Skills */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skills Can Teach */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Skills {student.name} Can Teach</span>
            </h2>

            <div className="space-y-3">
              {teachSkills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-emerald-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{sk.name}</div>
                    <div className="text-xs text-slate-400">{sk.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm">
                      {sk.proficiency}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sk.endorsements_count} endorsements
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Wants to Learn */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>Skills {student.name} Wants to Learn</span>
            </h2>

            <div className="space-y-3">
              {learnSkills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-violet-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{sk.name}</div>
                    <div className="text-xs text-slate-400">{sk.category}</div>
                  </div>
                  <Badge variant="purple" size="sm">
                    {sk.proficiency}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Peer Reviews ({student.reviews?.length || 0})</span>
              </h2>
              <span className="text-xs text-amber-300 font-bold font-mono">
                {Number(student.rating).toFixed(2)} Avg
              </span>
            </div>

            <div className="space-y-4">
              {(student.reviews || []).map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={rev.reviewer_avatar} name={rev.reviewer_name} size="xs" />
                      <span className="text-xs font-bold text-white">{rev.reviewer_name}</span>
                    </div>
                    <Rating value={rev.rating} showScore={false} size="xs" />
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Certificates & Badges */}
        <div className="lg:col-span-5 space-y-6">
          {/* Certificates */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                <span>Verified Credentials</span>
              </h2>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>

            <div className="space-y-3">
              {(student.certificates || []).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-dark-950/60 border border-violet-500/20 space-y-1"
                >
                  <div className="text-xs font-bold text-white">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.issuer} · {c.issue_date}</div>
                  {c.credential_id && (
                    <div className="text-[10px] text-violet-400 font-mono">
                      ID: {c.credential_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Earned Achievements</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {(student.badges || []).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-dark-950/60 border border-white/[0.06] text-center flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center mb-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-white">{b.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{b.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Book Skill Swap Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title={`Request Skill Swap with ${student.name}`}
      >
        <form onSubmit={handleBookSession} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Skill to Learn:
            </label>
            <select
              value={bookingSkillId}
              onChange={(e) => setBookingSkillId(e.target.value)}
              className="w-full rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500"
              required
            >
              {teachSkills.map((sk) => (
                <option key={sk.skill_id} value={sk.skill_id} className="bg-dark-900 text-white">
                  {sk.name} ({sk.proficiency})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Preferred Schedule Date & Time"
            type="text"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            placeholder="e.g. Tomorrow at 4:30 PM"
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Session Goal / What You Want to Cover:
            </label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="e.g. Can you explain binary tree traversals and give me feedback on my LeetCode solution?"
              rows={3}
              className="w-full rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm px-4 py-2.5 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-slate-300 flex items-center justify-between">
            <span>Barter Payment:</span>
            <span className="font-bold text-amber-300 font-mono">1.0 Time Credit / Swap</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingBooking}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Book Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDetailPage;
