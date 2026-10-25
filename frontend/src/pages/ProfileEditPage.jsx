import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
];

const ACADEMIC_YEARS = [
  'Freshman (1st Year)',
  'Sophomore (2nd Year)',
  'Junior (3rd Year)',
  'Senior (4th Year)',
  'Graduate / Master’s',
  'PhD / Postgrad',
];

const LEARNING_STYLES = [
  'One-to-one',
  'Group session',
  'Project-based',
  'Quick doubt solving',
  'Long-term mentoring',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOT_OPTIONS = [
  'Morning (9 AM - 12 PM)',
  'Afternoon (1 PM - 5 PM)',
  'Evening (5 PM - 9 PM)',
  'Flexible / On Demand',
];

const ProfileEditPage = () => {
  const { user, updateProfile, checkUsername } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    avatar_url: user?.avatar_url || AVATAR_PRESETS[0],
    college: user?.college || user?.university || '',
    course: user?.course || user?.major || '',
    academic_year: user?.academic_year || 'Junior (3rd Year)',
    graduation_year: user?.graduation_year || 2026,
    headline: user?.profile?.headline || '',
    bio: user?.bio || '',
    skill_level: user?.profile?.skill_level || 'Intermediate',
    learning_styles: user?.profile?.learning_style
      ? user.profile.learning_style.split(',').map((s) => s.trim())
      : ['One-to-one', 'Project-based'],
  });

  // Availability schedule state: { [day]: slotString }
  const [availabilitySchedule, setAvailabilitySchedule] = useState(() => {
    const initial = {};
    DAYS_OF_WEEK.forEach((day) => {
      const match = user?.availabilities?.find(
        (a) => a.day_of_week?.toLowerCase() === day.toLowerCase()
      );
      initial[day] = match && match.is_available ? match.time_slots : '';
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Debounced real-time username availability check if username changed
  useEffect(() => {
    const raw = formData.username.trim().toLowerCase();
    if (!raw || raw === user?.username?.toLowerCase() || raw.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      const res = await checkUsername(raw);
      setUsernameChecking(false);
      setUsernameStatus(res);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username, user?.username]);

  const handleLearningStyleToggle = (style) => {
    setFormData((prev) => {
      const exists = prev.learning_styles.includes(style);
      const updated = exists
        ? prev.learning_styles.filter((s) => s !== style)
        : [...prev.learning_styles, style];
      return { ...prev, learning_styles: updated };
    });
  };

  const handleAvailabilityToggle = (day, slot) => {
    setAvailabilitySchedule((prev) => ({
      ...prev,
      [day]: prev[day] === slot ? '' : slot,
    }));
  };

  const generateRandomDicebear = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData((prev) => ({
      ...prev,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    const u = formData.username.trim().toLowerCase();
    if (!u) {
      setErrorMsg('Username is required.');
      return;
    }
    if (u.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(u)) {
      setErrorMsg('Username can only contain letters, numbers, underscores, and dashes.');
      return;
    }
    if (usernameStatus && usernameStatus.available === false && !usernameStatus.error) {
      setErrorMsg(usernameStatus.message || 'This username is already taken.');
      return;
    }

    // Format availability array
    const availList = [];
    Object.entries(availabilitySchedule).forEach(([day, slots]) => {
      if (slots) {
        availList.push({ day, slots });
      }
    });

    const payload = {
      name: formData.name.trim(),
      username: u,
      avatar_url: formData.avatar_url,
      college: formData.college.trim(),
      university: formData.college.trim(),
      course: formData.course.trim(),
      major: formData.course.trim(),
      academic_year: formData.academic_year,
      graduation_year: Number(formData.graduation_year),
      headline: formData.headline.trim(),
      bio: formData.bio.trim(),
      skill_level: formData.skill_level,
      learning_style: formData.learning_styles.join(', '),
      availability: availList,
    };

    try {
      setIsSaving(true);
      const res = await updateProfile(payload);
      setIsSaving(false);

      if (res.success) {
        showToast('Student profile updated and saved to database!', 'success');
        navigate('/profile');
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
        showToast(res.error || 'Update failed', 'error');
      }
    } catch (err) {
      setIsSaving(false);
      setErrorMsg('An unexpected error occurred while saving profile.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Profile</span>
      </Link>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl">
        <div className="border-b border-white/[0.08] pb-4 mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Student Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your academic credentials, profile picture, and skill swap preferences. Changes persist directly to the database.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Profile Picture Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Profile Picture / Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-dark-950/70 border border-white/[0.08] rounded-2xl">
              <div className="relative">
                <Avatar
                  src={formData.avatar_url}
                  name={formData.name || 'User'}
                  size="xl"
                  className="border-2 border-violet-500 shadow-glow-sm"
                />
                <button
                  type="button"
                  onClick={generateRandomDicebear}
                  title="Generate unique avatar"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow transition-transform hover:scale-110"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="text-[11px] text-slate-400">Choose from preset student avatars:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, avatar_url: preset })}
                      className={`relative rounded-full transition-all ${
                        formData.avatar_url === preset
                          ? 'ring-2 ring-violet-500 scale-105'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt="preset"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="Or paste custom image URL..."
                    className="w-full text-xs bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Full Name & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div>
              <Input
                label="Student Handle / Username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''),
                  })
                }
                leftIcon={<span className="text-xs font-bold text-slate-400">@</span>}
                rightIcon={
                  usernameChecking ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                  ) : usernameStatus?.available === true ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : usernameStatus && usernameStatus.available === false && !usernameStatus.error ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : null
                }
                helperText={
                  usernameStatus
                    ? usernameStatus.available === true
                      ? 'Username is available!'
                      : usernameStatus.error
                      ? 'Verification unavailable (will check on submit)'
                      : usernameStatus.message || 'Username taken'
                    : 'Unique student handle'
                }
                required
              />
            </div>
          </div>

          {/* 3. College & Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="College / University"
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              leftIcon={<GraduationCap className="w-4 h-4" />}
              placeholder="e.g. UC Berkeley, Stanford, MIT"
              required
            />

            <Input
              label="Course / Major"
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              leftIcon={<BookOpen className="w-4 h-4" />}
              placeholder="e.g. Computer Science, HCI, Data Science"
              required
            />
          </div>

          {/* 4. Academic Year & Graduation Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-sm px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 appearance-none cursor-pointer"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-dark-900 text-slate-100">
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            <Input
              label="Graduation Year"
              type="number"
              value={formData.graduation_year}
              onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
              min="2020"
              max="2035"
              required
            />
          </div>

          {/* 5. Headline */}
          <Input
            label="Profile Headline"
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="e.g. Junior CS student enthusiastic about React & AI agents"
          />

          {/* 6. Bio */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Student Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-sm p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
              placeholder="Tell other students what topics you enjoy teaching, your favorite tech stacks, or what projects you are building..."
            />
          </div>

          {/* 7. Learning Style Preferences */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Preferred Learning Styles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEARNING_STYLES.map((style) => {
                const isSelected = formData.learning_styles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => handleLearningStyleToggle(style)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-glow-sm'
                        : 'bg-dark-950/60 border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{style}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Skill Level */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Overall Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFormData({ ...formData, skill_level: lvl })}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    formData.skill_level === lvl
                      ? 'bg-violet-600 border-violet-400 text-white shadow-glow-sm'
                      : 'bg-dark-950/60 border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 9. Weekly Availability Slots */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Weekly Peer Swap Hours
            </label>
            <div className="space-y-2 p-4 bg-dark-950/60 border border-white/[0.08] rounded-2xl">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-white/[0.04] last:border-b-0"
                >
                  <span className="text-xs font-bold text-white w-28">{day}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TIME_SLOT_OPTIONS.map((slot) => {
                      const isActive = availabilitySchedule[day] === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => handleAvailabilityToggle(day, slot)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            isActive
                              ? 'bg-violet-600 text-white'
                              : 'bg-white/[0.05] text-slate-400 hover:text-white'
                          }`}
                        >
                          {slot.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;
