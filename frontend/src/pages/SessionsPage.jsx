import React, { useState, useEffect } from 'react';
import { Calendar, Video, CheckCircle2, Star, Clock, MessageSquare, ArrowLeftRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Rating from '../components/ui/Rating';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

const SessionsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5.0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sessions?user_id=${user?.id || 1}&status=${statusFilter}`);
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, statusFilter]);

  const handleMarkComplete = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}/complete?user_id=${user?.id || 1}`);
      showToast('Session marked as completed! +150 XP and +1 Time Credit awarded!', 'success');
      fetchSessions();
    } catch (err) {
      showToast('Failed to complete session', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSessionForReview) return;
    try {
      setIsSubmittingReview(true);
      await api.post(`/sessions/review?reviewer_id=${user?.id || 1}`, {
        session_id: selectedSessionForReview.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setIsSubmittingReview(false);
      setSelectedSessionForReview(null);
      setReviewComment('');
      showToast('Review submitted! Peer profile updated & +50 XP awarded!', 'success');
      fetchSessions();
    } catch (err) {
      setIsSubmittingReview(false);
      showToast(err.response?.data?.detail || 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Skill Barter Log
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My <span className="text-gradient-purple">Swap Sessions</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track confirmed peer meetings, launch video rooms, complete swaps to bank time credits, and leave verified ratings.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-charcoal-card p-1.5 rounded-2xl border border-white/[0.08]">
          {['all', 'confirmed', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const partnerName = sess.is_teacher ? sess.learner_name : sess.teacher_name;
            const partnerAvatar = sess.is_teacher ? sess.learner_avatar : sess.teacher_avatar;
            const roleLabel = sess.is_teacher ? 'You are Teaching' : 'You are Learning';

            return (
              <div
                key={sess.id}
                className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] hover:border-violet-500/30 transition-all shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={partnerAvatar} name={partnerName} size="lg" isOnline={true} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white leading-snug">
                          {sess.title}
                        </h3>
                        <Badge
                          variant={sess.status === 'completed' ? 'emerald' : 'purple'}
                          size="sm"
                        >
                          {sess.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        With <span className="font-semibold text-slate-200">{partnerName}</span> · {sess.skill_name}
                      </div>
                      <div className="text-[11px] text-violet-400 font-medium mt-0.5">
                        {roleLabel} ({sess.duration_minutes} min barter)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-xs font-semibold text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                      {sess.scheduled_at}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {sess.description}
                </p>

                {/* Session Review If Completed */}
                {sess.review && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Review: {sess.review.rating} / 5.0 Stars</div>
                      <p className="text-slate-300 italic mt-0.5">"{sess.review.comment}"</p>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Time Credit: 1.0 hr barter
                  </span>

                  <div className="flex items-center gap-2.5">
                    {sess.status === 'confirmed' && (
                      <>
                        <a
                          href={sess.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Room</span>
                        </a>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMarkComplete(sess.id)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        >
                          Mark as Completed
                        </Button>
                      </>
                    )}

                    {sess.status === 'completed' && !sess.review && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedSessionForReview(sess)}
                        leftIcon={<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      >
                        Rate & Review Peer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No sessions found"
          description="You don't have any scheduled sessions in this view. Browse student mentors and request your next skill barter."
          actionLabel="Find a Student Mentor"
          onAction={() => window.location.assign('/students')}
        />
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedSessionForReview}
        onClose={() => setSelectedSessionForReview(null)}
        title="Leave a Peer Rating & Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Rating (1 to 5 Stars):
            </label>
            <Rating
              value={reviewRating}
              interactive={true}
              onChange={(val) => setReviewRating(val)}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Feedback / Review Comment:
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How clear were their explanations? What did you build together?"
              className="w-full rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm p-4 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setSelectedSessionForReview(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Submit Review (+50 XP)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SessionsPage;
