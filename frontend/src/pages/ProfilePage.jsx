import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit3,
  Award,
  Plus,
  Star,
  CheckCircle2,
  ShieldCheck,
  Coins,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Zap,
  Check,
  MessageSquare,
  Upload,
} from 'lucide-react';
import api, { formatApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview, skills, certificates, availability, reviews
  const [certs, setCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Upload certificate modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '2026',
    related_skill: '',
    credential_id: '',
    credential_url: '',
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete certificate confirmation modal state
  const [deleteModalCert, setDeleteModalCert] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Refresh user data on mount to ensure fresh database state
  useEffect(() => {
    refreshUser();
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoadingCerts(true);
      const res = await api.get('/certificates');
      setCerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not fetch certificates:', err.message);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) {
      setUploadFile(null);
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller file.');
      setUploadFile(null);
      return;
    }

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      setUploadError('Unsupported file type. Please upload a PDF, JPG, or PNG document.');
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadFile) {
      setUploadError('Please select a certificate file (PDF, JPG, or PNG) to upload.');
      return;
    }

    if (!uploadFormData.title.trim()) {
      setUploadError('Certificate title is required.');
      return;
    }

    if (!uploadFormData.issuer.trim()) {
      setUploadError('Issuing organization is required.');
      return;
    }

    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append('file', uploadFile);
      data.append('title', uploadFormData.title.trim());
      data.append('issuer', uploadFormData.issuer.trim());
      data.append('issue_date', uploadFormData.issue_date.trim());
      data.append('related_skill', uploadFormData.related_skill.trim());
      data.append('credential_id', uploadFormData.credential_id.trim());
      data.append('credential_url', uploadFormData.credential_url.trim());

      await api.post('/certificates/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadLoading(false);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadFormData({
        title: '',
        issuer: '',
        issue_date: '2026',
        related_skill: '',
        credential_id: '',
        credential_url: '',
      });

      showToast('Certificate uploaded! It is queued in Pending verification.', 'success');
      fetchCertificates();
      refreshUser();
    } catch (err) {
      setUploadLoading(false);
      const errorMsg = formatApiError(err, 'Failed to upload certificate.');
      setUploadError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteCertificate = async () => {
    if (!deleteModalCert) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/certificates/${deleteModalCert.id}`);
      setDeleteLoading(false);
      setDeleteModalCert(null);
      showToast('Certificate removed from your profile.', 'info');
      fetchCertificates();
      refreshUser();
    } catch (err) {
      setDeleteLoading(false);
      showToast(formatApiError(err, 'Failed to delete certificate.'), 'error');
    }
  };

  // Helper for verification status badge
  const renderVerificationBadge = (status, isVerified) => {
    const s = status || (isVerified ? 'Verified' : 'Pending');
    if (s === 'Verified') {
      return (
        <Badge variant="emerald" size="sm" isVerified={true}>
          Verified
        </Badge>
      );
    }
    if (s === 'Rejected') {
      return (
        <Badge
          variant="rose"
          size="sm"
          icon={<XCircle className="w-3 h-3 text-rose-400" />}
        >
          Rejected
        </Badge>
      );
    }
    return (
      <Badge
        variant="amber"
        size="sm"
        icon={<Clock className="w-3 h-3 text-amber-400" />}
      >
        Pending Review
      </Badge>
    );
  };

  const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const teachSkills = user?.skills?.filter((s) => s.skill_type === 'teach') || [];
  const learnSkills = user?.skills?.filter((s) => s.skill_type === 'learn') || [];
  const displayCerts = certs.length > 0 ? certs : user?.certificates || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. TOP HERO PROFILE BANNER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <Avatar
                src={user?.avatar_url}
                name={user?.name || 'Student'}
                size="2xl"
                isVerified={user?.is_verified}
                isOnline={true}
                className="border-2 border-violet-500/50 shadow-glow-sm"
              />
              <Link
                to="/profile/edit"
                className="absolute -bottom-1 -right-1 p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                title="Change Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user?.name || 'Student'}
                </h1>
                {user?.username && (
                  <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                    @{user.username}
                  </span>
                )}
                <Badge variant="verified" size="sm" isVerified={true}>
                  Verified Student
                </Badge>
                {user?.is_admin && (
                  <Badge variant="violetGlow" size="sm">
                    Admin
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5 text-violet-300">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  {user?.college || user?.university || 'University'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {user?.course || user?.major || 'Major'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  {user?.academic_year || 'Junior (3rd Year)'} (Class of {user?.graduation_year || 2026})
                </span>
              </div>

              {/* Headline */}
              {user?.profile?.headline && (
                <p className="text-xs text-slate-300 font-medium italic pt-1">
                  "{user.profile.headline}"
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Rating value={user?.rating || 5.0} reviewCount={user?.review_count || 0} size="sm" />
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {user?.sessions_completed || 0} Sessions
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {user?.time_credits || 5} Time Credits
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-violet-300 font-semibold flex items-center gap-1 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Level {user?.level || 1} ({user?.xp || 500} XP)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link to="/profile/edit" className="flex-1 md:flex-none">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Edit3 className="w-4 h-4" />}
                className="w-full"
              >
                Edit Profile
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 md:flex-none shadow-glow-sm"
            >
              Upload Certificate
            </Button>
          </div>
        </div>

        {/* Bio Section */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            About Me
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed max-w-4xl">
            {user?.bio ||
              'Computer science student building peer collaboration tools. Enthusiastic about sharing knowledge, solving technical challenges, and learning new skills through time-banking.'}
          </p>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Skills' },
          { id: 'certificates', label: `Certificates (${displayCerts.length})` },
          { id: 'availability', label: 'Weekly Schedule' },
          { id: 'reviews', label: `Reviews (${user?.reviews?.length || user?.review_count || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Learning Preferences Card */}
          <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Learning Preferences & Academic Profile</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Preferred Learning Style
                </div>
                <div className="text-sm font-bold text-white">
                  {user?.profile?.learning_style || 'One-to-one, Project-based'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Overall Skill Level
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Badge variant="purple" size="sm">
                    {user?.profile?.skill_level || 'Intermediate'}
                  </Badge>
                  <span className="text-xs text-slate-400">Student Mentor</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Campus Affiliation
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {user?.college || user?.university || 'UC Berkeley'}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills I Can Teach */}
            <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Skills I Can Teach</span>
                  <span className="text-xs font-mono text-slate-400">({teachSkills.length})</span>
                </h2>
                <Link
                  to="/profile/edit"
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Edit Skills
                </Link>
              </div>

              {teachSkills.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No teaching skills listed yet. Add what you can teach to start swapping!
                </div>
              )}
            </div>

            {/* Skills I Want to Learn */}
            <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                  <span>Skills I Want to Learn</span>
                  <span className="text-xs font-mono text-slate-400">({learnSkills.length})</span>
                </h2>
                <Link
                  to="/profile/edit"
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Add Learning Goal
                </Link>
              </div>

              {learnSkills.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No learning goals added yet. What would you like to master?
                </div>
              )}
            </div>
          </div>

          {/* Badges & Achievements */}
          {user?.badges?.length > 0 && (
            <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Earned Student Badges & Recognitions</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06] flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{b.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{b.description}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">+{b.xp_value} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: CERTIFICATES & CREDENTIALS */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-xl font-bold text-white">Student Certificates & Credentials</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload verified proof of hackathon prizes, certifications, and academic excellence.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="shadow-glow-sm"
            >
              Upload Certificate (PDF, JPG, PNG)
            </Button>
          </div>

          {displayCerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayCerts.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] shadow-sm hover:border-violet-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {renderVerificationBadge(c.verification_status, c.is_verified)}
                        {/* Delete certificate button */}
                        <button
                          onClick={() => setDeleteModalCert(c)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{c.title}</h3>
                    <div className="text-xs text-slate-300 font-medium">Issued by {c.issuer}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Year: {c.issue_date}</div>

                    {c.related_skill && (
                      <div className="mt-3">
                        <span className="text-[11px] font-medium text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
                          Skill: {c.related_skill}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">
                      {c.credential_id ? `ID: ${c.credential_id}` : 'Student Verified'}
                    </span>

                    <div className="flex items-center gap-3">
                      {c.file_url ? (
                        <a
                          href={c.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </a>
                      ) : c.credential_url ? (
                        <a
                          href={c.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Verify Link</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No certificates added yet"
              description="Upload proof of AWS, Meta, hackathon awards or academic distinctions to establish peer credibility."
              actionLabel="Upload Certificate"
              onAction={() => setIsUploadModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 5. TAB: WEEKLY AVAILABILITY */}
      {activeTab === 'availability' && (
        <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>Weekly Peer Swap Availability</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active time slots when you are available for 1-on-1 skill bartering.
              </p>
            </div>
            <Link to="/profile/edit">
              <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Update Hours
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DAYS_ORDER.map((day) => {
              const avail = user?.availabilities?.find(
                (a) => a.day_of_week?.toLowerCase() === day.toLowerCase()
              );
              const isAvailable = avail && avail.is_available && avail.time_slots;

              return (
                <div
                  key={day}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAvailable
                      ? 'bg-violet-600/10 border-violet-500/30'
                      : 'bg-dark-950/40 border-white/[0.04] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{day}</span>
                    {isAvailable ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {isAvailable ? avail.time_slots : 'Unavailable'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB: REVIEWS & RATINGS */}
      {activeTab === 'reviews' && (
        <div className="bg-charcoal-card border border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Peer Feedback & Testimonials</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reviews from fellow students following completed skill barter sessions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-extrabold text-white">
                {user?.rating ? user.rating.toFixed(1) : '5.0'}
              </div>
              <Rating value={user?.rating || 5.0} reviewCount={user?.reviews?.length || user?.review_count || 0} />
            </div>
          </div>

          {user?.reviews && user.reviews.length > 0 ? (
            <div className="space-y-4">
              {user.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-dark-950/60 border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={rev.reviewer_avatar} name={rev.reviewer_name} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-white">{rev.reviewer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rev.created_at ? rev.created_at.split('T')[0] : 'Verified Session'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-10">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">No reviews yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Complete your first skill swap session to start receiving peer ratings and written recommendations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. UPLOAD CERTIFICATE MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Student Certificate Proof"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Certificate Document (PDF, JPG, PNG · Max 5MB)
            </label>
            <div className="border-2 border-dashed border-white/20 hover:border-violet-500/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-dark-950/60">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="cert-file-input"
              />
              <label htmlFor="cert-file-input" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-white block">
                  {uploadFile ? uploadFile.name : 'Click to select certificate file'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {uploadFile
                    ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB · Ready to upload`
                    : 'Supported formats: PDF, PNG, JPG'}
                </span>
              </label>
            </div>
          </div>

          <Input
            label="Certificate Title"
            type="text"
            value={uploadFormData.title}
            onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
            placeholder="e.g. AWS Certified Cloud Practitioner"
            required
          />

          <Input
            label="Issuing Organization / University"
            type="text"
            value={uploadFormData.issuer}
            onChange={(e) => setUploadFormData({ ...uploadFormData, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services, Google, MIT Hackathon"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Year / Date"
              type="text"
              value={uploadFormData.issue_date}
              onChange={(e) => setUploadFormData({ ...uploadFormData, issue_date: e.target.value })}
              placeholder="2026"
              required
            />

            <Input
              label="Related Skill"
              type="text"
              value={uploadFormData.related_skill}
              onChange={(e) => setUploadFormData({ ...uploadFormData, related_skill: e.target.value })}
              placeholder="e.g. Cloud Computing"
            />
          </div>

          <Input
            label="Credential ID / License Number (Optional)"
            type="text"
            value={uploadFormData.credential_id}
            onChange={(e) => setUploadFormData({ ...uploadFormData, credential_id: e.target.value })}
            placeholder="e.g. AWS-992182-EDU"
          />

          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/20 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-violet-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span>Verification Policy:</span>
            </div>
            <p>
              Uploaded certificates are stored securely and queued under{' '}
              <strong className="text-amber-300">Pending Review</strong>. Verified certificates will earn you{' '}
              <strong className="text-violet-300">+100 XP</strong> and unlock the "Certified Pro" student badge.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={uploadLoading}>
              Upload & Submit Proof
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. DELETE CERTIFICATE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteModalCert}
        onClose={() => setDeleteModalCert(null)}
        title="Delete Certificate Proof"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete{' '}
            <strong className="text-white">{deleteModalCert?.title}</strong>? This will permanently
            remove the certificate and its proof file from your profile.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setDeleteModalCert(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteLoading}
              onClick={handleDeleteCertificate}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
