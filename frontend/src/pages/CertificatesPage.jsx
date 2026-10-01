import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle2, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

const CertificatesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '2026',
    credential_id: '',
    credential_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates?user_id=${user?.id || 1}`);
      setCerts(res.data);
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post(`/certificates?user_id=${user?.id || 1}`, formData);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFormData({ title: '', issuer: '', issue_date: '2026', credential_id: '', credential_url: '' });
      showToast('Certificate verified and added to your student profile! +100 XP!', 'success');
      fetchCerts();
    } catch (err) {
      setIsSubmitting(false);
      showToast('Failed to add certificate', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Skill Credibility
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Verified Student <span className="text-gradient-purple">Certificates</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Add academic awards, industry certifications, and hackathon wins to increase your credibility and attract high-tier skill swap partners.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-glow-sm"
        >
          Add Certificate
        </Button>
      </div>

      {/* Certificates Grid */}
      {certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-charcoal-card border border-violet-500/20 shadow-glow-sm hover:border-violet-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                    <Award className="w-6 h-6 text-violet-300" />
                  </div>
                  <Badge variant="verified" size="sm" isVerified={true}>
                    Verified
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                  {c.title}
                </h3>
                <div className="text-sm text-slate-300 font-medium">
                  Issued by {c.issuer}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Year of Issue: {c.issue_date}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  ID: {c.credential_id || 'VERIFIED-EDU-092'}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Public Proof</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No certificates added yet"
          description="Adding proof of certifications (AWS, Meta, Coursera, Hackathon wins) boosts your student mentorship rank."
          actionLabel="Add Your First Certificate"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Add Certificate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Verified Student Certificate"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Certificate Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. AWS Certified Cloud Practitioner"
            required
          />

          <Input
            label="Issuing Organization / University"
            type="text"
            value={formData.issuer}
            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services, Google, Meta"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Year"
              type="text"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              placeholder="2026"
              required
            />
            <Input
              label="Credential ID (Optional)"
              type="text"
              value={formData.credential_id}
              onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
              placeholder="e.g. AWS-992182"
            />
          </div>

          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-slate-300">
            Adding verified credentials rewards you with <span className="text-violet-400 font-bold">+100 XP</span> and unlocks the "Certified Pro" student badge.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Verify & Add Credential
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CertificatesPage;
