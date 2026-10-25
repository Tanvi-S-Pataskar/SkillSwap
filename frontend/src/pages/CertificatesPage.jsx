import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Trash2,
  Eye,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Upload,
  Check,
  X,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  FileCheck,
  RefreshCw,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';
import api, { formatApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const CertificatesPage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-certs'); // 'my-certs' | 'admin-queue'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Verified' | 'Pending' | 'Rejected'

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '2026',
    related_skill: '',
    credential_id: '',
    credential_url: '',
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Delete modal state
  const [deleteModalCert, setDeleteModalCert] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status update state (Admin)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Preview modal state
  const [previewCert, setPreviewCert] = useState(null);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      let endpoint = '/certificates';
      if (activeTab === 'admin-queue' && user?.is_admin) {
        endpoint = '/certificates?scope=all';
      }
      const res = await api.get(endpoint);
      setCerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load certificates', err);
      showToast(formatApiError(err, 'Failed to load certificates.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [user, activeTab]);

  // File selection & validation
  const validateAndSetFile = (file) => {
    setUploadError('');
    if (!file) {
      setUploadFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File exceeds 5 MB limit. Please compress or select a smaller file.');
      setUploadFile(null);
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      setUploadError('Invalid format. Only PDF, JPG, and PNG files are accepted.');
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadFormData.title.trim()) {
      setUploadError('Certificate title is required.');
      return;
    }

    if (!uploadFormData.issuer.trim()) {
      setUploadError('Issuing organization is required.');
      return;
    }

    if (!uploadFormData.issue_date.trim()) {
      setUploadError('Issue date or year is required.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (uploadFile) {
        // Multipart upload with file proof
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
      } else {
        // Metadata / credential link upload
        await api.post('/certificates', {
          title: uploadFormData.title.trim(),
          issuer: uploadFormData.issuer.trim(),
          issue_date: uploadFormData.issue_date.trim(),
          related_skill: uploadFormData.related_skill.trim(),
          credential_id: uploadFormData.credential_id.trim(),
          credential_url: uploadFormData.credential_url.trim(),
        });
      }

      setIsSubmitting(false);
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

      showToast('Certificate submitted for review! It is queued in Pending verification.', 'success');
      fetchCerts();
      if (refreshUser) refreshUser();
    } catch (err) {
      setIsSubmitting(false);
      const msg = formatApiError(err, 'Failed to submit certificate.');
      setUploadError(msg);
      showToast(msg, 'error');
    }
  };

  const handleDeleteCertificate = async () => {
    if (!deleteModalCert) return;
    try {
      setIsDeleting(true);
      await api.delete(`/certificates/${deleteModalCert.id}`);
      setIsDeleting(false);
      setDeleteModalCert(null);
      showToast('Certificate successfully deleted.', 'info');
      fetchCerts();
      if (refreshUser) refreshUser();
    } catch (err) {
      setIsDeleting(false);
      showToast(formatApiError(err, 'Failed to delete certificate.'), 'error');
    }
  };

  // Admin status update action
  const handleAdminStatusChange = async (certId, newStatus) => {
    try {
      setStatusUpdatingId(certId);
      await api.patch(`/certificates/${certId}/status`, { status: newStatus });
      setStatusUpdatingId(null);
      showToast(
        newStatus === 'Verified'
          ? 'Certificate approved & verified! +100 XP awarded to student.'
          : `Certificate status marked as ${newStatus}.`,
        newStatus === 'Verified' ? 'success' : 'info'
      );
      fetchCerts();
      if (refreshUser) refreshUser();
    } catch (err) {
      setStatusUpdatingId(null);
      showToast(formatApiError(err, 'Failed to update certificate status.'), 'error');
    }
  };

  // Safe file proof URL builder
  const getProofUrl = (cert) => {
    if (!cert?.has_file) return '';
    const token = localStorage.getItem('skillswap_token');
    const base = import.meta.env?.VITE_API_URL || '/api';
    return `${base}/certificates/${cert.id}/file${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  };

  // Helpers
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderStatusBadge = (cert) => {
    const status = cert.verification_status || (cert.is_verified ? 'Verified' : 'Pending');
    if (status === 'Verified') {
      return (
        <Badge variant="verified" size="sm" isVerified={true}>
          Verified
        </Badge>
      );
    }
    if (status === 'Rejected') {
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

  // Filtered certificates list
  const filteredCerts = certs.filter((c) => {
    if (statusFilter === 'all') return true;
    const s = c.verification_status || (c.is_verified ? 'Verified' : 'Pending');
    return s.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate statistics
  const totalCount = certs.length;
  const verifiedCount = certs.filter(
    (c) => c.verification_status === 'Verified' || c.is_verified
  ).length;
  const pendingCount = certs.filter(
    (c) => c.verification_status === 'Pending' && !c.is_verified
  ).length;
  const rejectedCount = certs.filter(
    (c) => c.verification_status === 'Rejected'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Skill Credibility & Proofs
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Student <span className="text-gradient-purple">Certificates</span> & Credentials
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Upload and showcase your academic credentials, industry certifications, and competition wins.
            Verified proofs boost your credibility and unlock the "Certified Mentor" badge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-glow-sm"
          >
            Upload Certificate
          </Button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-charcoal-card border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Credentials</span>
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Uploaded in profile</div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Verified Proofs</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{verifiedCount}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
            +{verifiedCount * 100} XP Earned
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Awaiting verification</div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Credibility Tier</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">
            {verifiedCount >= 3 ? 'Elite Mentor' : verifiedCount >= 1 ? 'Verified Peer' : 'Student Swapper'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {verifiedCount >= 3 ? 'Max Trust Multiplier' : 'Upload 3 for Elite status'}
          </div>
        </div>
      </div>

      {/* 3. TABS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Navigation Tabs (My Certificates vs Admin Moderation Queue) */}
        <div className="flex items-center gap-2 p-1 bg-dark-900/80 rounded-xl border border-white/[0.08] w-fit">
          <button
            onClick={() => setActiveTab('my-certs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'my-certs'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Certificates
          </button>

          {user?.is_admin && (
            <button
              onClick={() => setActiveTab('admin-queue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin-queue'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Moderation Queue</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-dark-950 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'Verified', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CERTIFICATES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] animate-pulse h-56"
            />
          ))}
        </div>
      ) : filteredCerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCerts.map((cert) => {
            const isOwner = user && cert.user_id === user.id;
            const canManage = isOwner || user?.is_admin;
            const proofUrl = getProofUrl(cert);

            return (
              <div
                key={cert.id}
                className="p-6 rounded-3xl bg-charcoal-card border border-violet-500/20 shadow-glow-sm hover:border-violet-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Icon & Verification Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      <Award className="w-6 h-6 text-violet-300" />
                    </div>

                    <div className="flex items-center gap-2">
                      {renderStatusBadge(cert)}
                    </div>
                  </div>

                  {/* Student info if displayed in admin queue */}
                  {activeTab === 'admin-queue' && cert.student_name && (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-dark-900/60 border border-white/[0.05] mb-3 text-xs">
                      <Avatar
                        src={cert.student_avatar}
                        name={cert.student_name}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200">
                          {cert.student_name}
                        </span>
                        {cert.student_username && (
                          <span className="text-slate-400 ml-1">
                            (@{cert.student_username})
                          </span>
                        )}
                        {cert.student_college && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {cert.student_college}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Title and Issuer */}
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                    {cert.title}
                  </h3>
                  <div className="text-sm text-slate-300 font-medium">
                    Issued by <span className="text-slate-100">{cert.issuer}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Issue Year / Date: <strong className="text-slate-300">{cert.issue_date}</strong></span>
                    {cert.related_skill && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px]">
                        {cert.related_skill}
                      </span>
                    )}
                  </div>

                  {/* Credential ID or Online URL */}
                  {(cert.credential_id || cert.credential_url) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
                      {cert.credential_id && (
                        <span>ID: {cert.credential_id}</span>
                      )}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 font-sans"
                        >
                          Verify Online <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Uploaded File Info */}
                  {cert.has_file && (
                    <div className="mt-3 p-2.5 rounded-xl bg-dark-900/70 border border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-300 truncate mr-2">
                        <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        <span className="truncate" title={cert.file_name}>
                          {cert.file_name || 'Uploaded Document'}
                        </span>
                        {cert.file_size > 0 && (
                          <span className="text-slate-500 text-[11px] flex-shrink-0">
                            ({formatFileSize(cert.file_size)})
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        {cert.mime_type?.includes('pdf') ? 'PDF' : 'IMAGE'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* View Proof Button */}
                    {cert.has_file ? (
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 font-semibold px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </button>
                    ) : cert.credential_url ? (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 font-semibold px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>External Link</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No document attached</span>
                    )}

                    {/* Delete action for owner or admin */}
                    {canManage && (
                      <button
                        onClick={() => setDeleteModalCert(cert)}
                        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete certificate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  {/* Admin Moderation Controls */}
                  {user?.is_admin && (
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Admin Action:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {cert.verification_status !== 'Verified' && (
                          <Button
                            variant="success"
                            size="sm"
                            isLoading={statusUpdatingId === cert.id}
                            onClick={() => handleAdminStatusChange(cert.id, 'Verified')}
                            className="!py-1 !px-2.5 !text-[11px]"
                            leftIcon={<Check className="w-3 h-3" />}
                          >
                            Approve
                          </Button>
                        )}

                        {cert.verification_status !== 'Rejected' && (
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={statusUpdatingId === cert.id}
                            onClick={() => handleAdminStatusChange(cert.id, 'Rejected')}
                            className="!py-1 !px-2.5 !text-[11px]"
                            leftIcon={<X className="w-3 h-3" />}
                          >
                            Reject
                          </Button>
                        )}

                        {cert.verification_status !== 'Pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={statusUpdatingId === cert.id}
                            onClick={() => handleAdminStatusChange(cert.id, 'Pending')}
                            className="!py-1 !px-2 !text-[11px] text-amber-300 hover:text-amber-200"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title={
            statusFilter === 'all'
              ? 'No certificates found'
              : `No ${statusFilter.toLowerCase()} certificates`
          }
          description={
            activeTab === 'admin-queue'
              ? 'There are currently no certificates in this queue for review.'
              : 'Add proof of your certifications (AWS, Meta, Coursera, Hackathon awards) to boost your student mentorship rank.'
          }
          actionLabel={activeTab === 'my-certs' ? 'Upload Certificate' : undefined}
          onAction={activeTab === 'my-certs' ? () => setIsUploadModalOpen(true) : undefined}
        />
      )}

      {/* 5. UPLOAD CERTIFICATE MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Student Certificate"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Certificate Title"
            type="text"
            value={uploadFormData.title}
            onChange={(e) =>
              setUploadFormData({ ...uploadFormData, title: e.target.value })
            }
            placeholder="e.g. AWS Certified Solutions Architect"
            required
          />

          <Input
            label="Issuing Organization / University"
            type="text"
            value={uploadFormData.issuer}
            onChange={(e) =>
              setUploadFormData({ ...uploadFormData, issuer: e.target.value })
            }
            placeholder="e.g. Amazon Web Services, Google, Meta, Stanford"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Year / Date"
              type="text"
              value={uploadFormData.issue_date}
              onChange={(e) =>
                setUploadFormData({ ...uploadFormData, issue_date: e.target.value })
              }
              placeholder="e.g. 2026 or Oct 2025"
              required
            />

            <Input
              label="Related Skill (Optional)"
              type="text"
              value={uploadFormData.related_skill}
              onChange={(e) =>
                setUploadFormData({ ...uploadFormData, related_skill: e.target.value })
              }
              placeholder="e.g. Cloud Computing, Python"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Credential ID (Optional)"
              type="text"
              value={uploadFormData.credential_id}
              onChange={(e) =>
                setUploadFormData({ ...uploadFormData, credential_id: e.target.value })
              }
              placeholder="e.g. AWS-992182"
            />

            <Input
              label="Verification URL (Optional)"
              type="url"
              value={uploadFormData.credential_url}
              onChange={(e) =>
                setUploadFormData({ ...uploadFormData, credential_url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Certificate Proof Document (PDF, JPG, PNG &le; 5 MB)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : uploadFile
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/[0.12] hover:border-violet-500/40 bg-white/[0.02]'
              }`}
            >
              {uploadFile ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white truncate max-w-[220px]">
                        {uploadFile.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatFileSize(uploadFile.size)} &bull; {uploadFile.type || 'Document'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2 opacity-80" />
                  <div className="text-sm font-medium text-slate-200">
                    Click to browse or drag and drop
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Accepts authentic PDF, JPG, or PNG files up to 5 MB
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-slate-300">
            <span className="text-violet-400 font-bold">Verification Process:</span> Uploaded
            documents start with <span className="text-amber-400 font-medium">Pending Review</span> status.
            Once verified by an administrator, you earn <span className="text-violet-400 font-bold">+100 XP</span> and
            a verified shield on your public student profile.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteModalCert)}
        onClose={() => setDeleteModalCert(null)}
        title="Delete Certificate"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <strong className="text-white">"{deleteModalCert?.title}"</strong>?
            This will permanently remove the credential and its attached proof from your profile.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalCert(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCertificate}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Certificate
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. PROOF PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        title={previewCert?.title || 'Certificate Proof'}
        maxWidth="max-w-3xl"
      >
        {previewCert && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
              <div>
                Issued by <strong className="text-slate-200">{previewCert.issuer}</strong> ({previewCert.issue_date})
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(previewCert)}
                <a
                  href={getProofUrl(previewCert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Open in New Tab <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-dark-950 border border-white/[0.08] min-h-[350px] max-h-[60vh] flex items-center justify-center p-2">
              {previewCert.mime_type?.includes('pdf') ? (
                <iframe
                  src={getProofUrl(previewCert)}
                  title={previewCert.title}
                  className="w-full h-[55vh] rounded-xl border-0"
                />
              ) : (
                <img
                  src={getProofUrl(previewCert)}
                  alt={previewCert.title}
                  className="max-h-[55vh] max-w-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button variant="secondary" onClick={() => setPreviewCert(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificatesPage;
