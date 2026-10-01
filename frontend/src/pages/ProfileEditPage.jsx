import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfileEditPage = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    major: user?.major || '',
    graduation_year: user?.graduation_year || 2026,
    bio: user?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setUser((prev) => ({ ...prev, ...formData }));
      setIsSaving(false);
      showToast('Profile updated successfully!', 'success');
      navigate('/profile');
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Profile</span>
      </Link>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Edit Student Profile</h1>
        <p className="text-xs text-slate-400 mb-6">
          Update your campus credentials and what you share with fellow students
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="University / College"
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            leftIcon={<GraduationCap className="w-4 h-4" />}
            required
          />

          <Input
            label="Major / Field"
            type="text"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            required
          />

          <Input
            label="Graduation Year"
            type="number"
            value={formData.graduation_year}
            onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Student Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-sm p-4 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Tell other students what you love teaching and what projects you are building..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Link to="/profile">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;
