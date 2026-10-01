import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  User,
  Zap,
  Star,
  Plus,
  X,
  CheckCircle2,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const POPULAR_TEACH_SKILLS = [
  'Python & Data Structures',
  'React & Next.js',
  'TypeScript Fullstack',
  'Machine Learning & PyTorch',
  'Rust Systems Programming',
  'Docker & DevOps Basics',
  'Figma & UI/UX Design',
  '3D Modeling with Blender',
  'Motion Graphics & After Effects',
  'SQL & Analytics Engineering',
  'Pandas & Data Visualization',
  'Conversational Japanese',
  'Business Spanish',
  'French for Beginners',
  'Linear Algebra & Multivariable Calculus',
  'Organic Chemistry Reaction Mechanisms',
  'Microeconomic Theory',
  'Startup Pitching & VC Decks',
  'Ableton Live & Music Production',
];

const POPULAR_LEARN_SKILLS = [
  'React & Next.js',
  'TypeScript Fullstack',
  'Machine Learning & PyTorch',
  'Rust Systems Programming',
  'Figma & UI/UX Design',
  '3D Modeling with Blender',
  'SQL & Analytics Engineering',
  'Conversational Japanese',
  'Business Spanish',
  'French for Beginners',
  'Startup Pitching & VC Decks',
  'Ableton Live & Music Production',
  'Docker & DevOps Basics',
  'Product Management Fundamentals',
];

const SKILL_LEVELS = [
  {
    id: 'Beginner',
    title: 'Beginner',
    desc: 'Foundational concepts, basic syntax, or early-stage explorer.',
    icon: '🌱',
  },
  {
    id: 'Intermediate',
    title: 'Intermediate',
    desc: 'Comfortable with core patterns, course projects, and debugging.',
    icon: '🚀',
  },
  {
    id: 'Advanced',
    title: 'Advanced',
    desc: 'Deep domain mastery, production/portfolio experience, and contest/industry level.',
    icon: '⚡',
  },
];

const LEARNING_STYLES = [
  {
    id: 'One-to-one',
    title: 'One-to-one',
    desc: 'Direct private pair-programming or 1-on-1 tutoring sessions.',
  },
  {
    id: 'Group session',
    title: 'Group session',
    desc: 'Collaborative study groups, workshops, or group lab sessions.',
  },
  {
    id: 'Project-based',
    title: 'Project-based',
    desc: 'Building portfolio projects or hackathon hacks together.',
  },
  {
    id: 'Quick doubt solving',
    title: 'Quick doubt solving',
    desc: 'Fast 15-30 min unblocking for homework, bugs, or concepts.',
  },
  {
    id: 'Long-term mentoring',
    title: 'Long-term mentoring',
    desc: 'Semester-long guidance, roadmap reviews, and career coaching.',
  },
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOT_OPTIONS = [
  'Morning (9 AM - 12 PM)',
  'Afternoon (12 PM - 5 PM)',
  'Evening (5 PM - 9 PM)',
  'Night (9 PM - 11 PM)',
];

const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [teachingSkills, setTeachingSkills] = useState(['Python & Data Structures', 'React & Next.js']);
  const [customTeachInput, setCustomTeachInput] = useState('');

  const [learningSkills, setLearningSkills] = useState(['Figma & UI/UX Design']);
  const [customLearnInput, setCustomLearnInput] = useState('');

  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [learningStyles, setLearningStyles] = useState(['One-to-one', 'Project-based']);

  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Saturday']);
  const [selectedSlots, setSelectedSlots] = useState(['Evening (5 PM - 9 PM)']);

  const [bio, setBio] = useState(
    user?.bio ||
      `Hey! I'm a student at ${user?.college || 'university'} excited to share what I know and learn new skills from peers.`
  );

  // Skill toggles
  const toggleTeaching = (skill) => {
    setTeachingSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomTeach = (e) => {
    e.preventDefault();
    const val = customTeachInput.trim();
    if (val && !teachingSkills.includes(val)) {
      setTeachingSkills([...teachingSkills, val]);
      setCustomTeachInput('');
    }
  };

  const toggleLearning = (skill) => {
    setLearningSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomLearn = (e) => {
    e.preventDefault();
    const val = customLearnInput.trim();
    if (val && !learningSkills.includes(val)) {
      setLearningSkills([...learningSkills, val]);
      setCustomLearnInput('');
    }
  };

  const toggleLearningStyle = (id) => {
    setLearningStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const validateStep = () => {
    if (step === 1 && teachingSkills.length === 0) {
      showToast('Please select at least 1 skill you can teach.', 'warning');
      return false;
    }
    if (step === 2 && learningSkills.length === 0) {
      showToast('Please select at least 1 skill you want to learn.', 'warning');
      return false;
    }
    if (step === 4 && learningStyles.length === 0) {
      showToast('Please select at least 1 learning style.', 'warning');
      return false;
    }
    if (step === 5 && (selectedDays.length === 0 || selectedSlots.length === 0)) {
      showToast('Please select at least one day and time slot.', 'warning');
      return false;
    }
    if (step === 6 && !bio.trim()) {
      showToast('Please write a brief bio.', 'warning');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    // Format availability for backend
    const availabilityPayload = selectedDays.map((day) => ({
      day,
      slots: selectedSlots,
    }));

    const payload = {
      teaching_skills: teachingSkills,
      learning_skills: learningSkills,
      skill_level: skillLevel,
      learning_styles: learningStyles,
      availability: availabilityPayload,
      bio: bio.trim(),
    };

    const res = await completeOnboarding(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Onboarding complete! +250 XP earned. Welcome to SkillSwap!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Failed to save onboarding details', 'error');
    }
  };

  // Step names
  const stepsMeta = [
    { num: 1, label: 'Teach' },
    { num: 2, label: 'Learn' },
    { num: 3, label: 'Level' },
    { num: 4, label: 'Style' },
    { num: 5, label: 'Schedule' },
    { num: 6, label: 'Bio' },
    { num: 7, label: 'Complete' },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-3xl">
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/[0.1] shadow-2xl backdrop-blur-xl">
          {/* Header & Progress Indicator: 1 → 2 → 3 → 4 → 5 → 6 → Complete */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Step {step} of 7 · Student Setup
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
                  {step === 1 && 'What can you teach?'}
                  {step === 2 && 'What do you want to learn?'}
                  {step === 3 && 'Select your skill level'}
                  {step === 4 && 'How do you prefer to learn & teach?'}
                  {step === 5 && 'Set your weekly availability'}
                  {step === 6 && 'Write a short student bio'}
                  {step === 7 && 'Review your profile preview'}
                </h1>
              </div>

              {/* XP Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>+250 XP on finish</span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-between gap-1 md:gap-2 px-1">
              {stepsMeta.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      disabled={s.num > step}
                      onClick={() => s.num < step && setStep(s.num)}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        s.num === step
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white ring-4 ring-violet-500/25 shadow-glow-sm'
                          : s.num < step
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-dark-900 border border-white/[0.08] text-slate-500'
                      }`}
                    >
                      {s.num < step ? <Check className="w-3.5 h-3.5" /> : s.num === 7 ? '★' : s.num}
                    </button>
                    <span
                      className={`text-[10px] mt-1 font-medium hidden sm:block ${
                        s.num === step
                          ? 'text-violet-300 font-semibold'
                          : s.num < step
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < stepsMeta.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 rounded transition-colors ${
                        step > idx + 1 ? 'bg-emerald-500/50' : 'bg-white/[0.08]'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* STEP 1: What can you teach? */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                Select subjects or skills you can help peers with. You don’t need to be an expert —
                explaining concepts you've recently aced is often the best way to mentor!
              </p>

              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
                  Popular Student Teaching Skills ({teachingSkills.length} selected):
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_TEACH_SKILLS.map((skill) => {
                    const isSelected = teachingSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleTeaching(skill)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'bg-charcoal-card text-slate-300 border border-white/[0.06] hover:border-white/[0.2]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill adder */}
                <form onSubmit={addCustomTeach} className="flex gap-2">
                  <input
                    type="text"
                    value={customTeachInput}
                    onChange={(e) => setCustomTeachInput(e.target.value)}
                    placeholder="Add custom skill (e.g. Next.js App Router, Solidity, Swift...)"
                    className="flex-1 rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                  <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Skill
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* STEP 2: What do you want to learn? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                Pick what you want to master this semester. Our Smart Matcher pairs you with students
                who teach these topics in exchange for your skills!
              </p>

              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
                  Recommended Learning Topics ({learningSkills.length} selected):
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_LEARN_SKILLS.map((skill) => {
                    const isSelected = learningSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleLearning(skill)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-violet-500/25 text-violet-300 border border-violet-500/40 shadow-sm'
                            : 'bg-charcoal-card text-slate-300 border border-white/[0.06] hover:border-white/[0.2]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill adder */}
                <form onSubmit={addCustomLearn} className="flex gap-2">
                  <input
                    type="text"
                    value={customLearnInput}
                    onChange={(e) => setCustomLearnInput(e.target.value)}
                    placeholder="Add custom learning target (e.g. PyTorch Transformers, Spanish...)"
                    className="flex-1 rounded-xl bg-dark-950/80 border border-white/[0.1] text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                  <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Target
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* STEP 3: Skill Level */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                What is your overall peer experience level? This helps fellow students gauge pace and
                match expectations accurately.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SKILL_LEVELS.map((lvl) => {
                  const isSelected = skillLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSkillLevel(lvl.id)}
                      className={`p-5 rounded-2xl text-left border transition-all relative ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 shadow-glow-sm'
                          : 'bg-charcoal-card border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="text-2xl mb-3">{lvl.icon}</div>
                      <div className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                        <span>{lvl.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{lvl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Learning Style */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose your preferred learning styles. You can pick multiple formats that fit your
                schedule and personality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {LEARNING_STYLES.map((style) => {
                  const isSelected = learningStyles.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => toggleLearningStyle(style.id)}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 shadow-sm'
                          : 'bg-charcoal-card border-white/[0.08] hover:border-white/[0.2]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">{style.title}</div>
                        <p className="text-xs text-slate-400">{style.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                          isSelected
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'border-white/20 bg-dark-950'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                Select the days and general time windows when you're open for peer sessions or barter
                exchanges.
              </p>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
                  1. Available Days of the Week:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-glow-sm'
                            : 'bg-charcoal-card border border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
                  2. Preferred Time Windows:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_SLOT_OPTIONS.map((slot) => {
                    const isSelected = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-500 text-violet-200'
                            : 'bg-charcoal-card border-white/[0.08] text-slate-300 hover:border-white/[0.2]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {slot}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Short Bio */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-sm text-slate-300 leading-relaxed">
                Tell other students a bit about your background, what projects you're hacking on, and
                what excites you most about learning.
              </p>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Student Bio (1-3 sentences)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Junior studying Computer Science. I love building fullstack applications and mentoring beginners in React & algorithms. Looking to learn Figma design!"
                  className="w-full rounded-2xl bg-dark-950/80 border border-white/[0.1] text-slate-100 placeholder-slate-500 text-sm p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 px-1">
                  <span>Aim for friendly, conversational, and specific.</span>
                  <span>{bio.length} / 300 chars</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Profile Preview (Complete) */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Your profile setup is complete! Here is how other students will see your profile.
                  </span>
                </div>
                <span className="font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  +250 XP
                </span>
              </div>

              {/* Realistic Student Profile Preview Card */}
              <div className="bg-charcoal-card/90 border border-white/[0.1] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3.5">
                    <Avatar
                      src={user?.avatar_url}
                      name={user?.name || 'Student'}
                      size="lg"
                      className="border-2 border-violet-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{user?.name}</h3>
                        <span className="text-xs text-slate-400">@{user?.username}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Student" />
                      </div>
                      <p className="text-xs text-slate-300">
                        {user?.college || 'University'} · {user?.course || 'Major'}
                      </p>
                      <p className="text-[11px] text-slate-400">{user?.academic_year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">
                      Level: {skillLevel}
                    </Badge>
                    <Badge variant="blue" size="sm">
                      5 Barter Credits
                    </Badge>
                  </div>
                </div>

                <div className="py-4 space-y-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">About Me:</span>
                    <p className="text-slate-200 leading-relaxed italic bg-dark-950/60 p-3 rounded-xl border border-white/[0.06]">
                      "{bio}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Can Teach:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {teachingSkills.map((s) => (
                          <span
                            key={s}
                            className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-violet-400 block mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {learningSkills.map((s) => (
                          <span
                            key={s}
                            className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-slate-400 gap-2">
                    <div>
                      <span className="text-slate-400 font-semibold">Availability: </span>
                      <span className="text-slate-300">
                        {selectedDays.join(', ')} ({selectedSlots.join('; ')})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Styles: </span>
                      <span className="text-slate-300">{learningStyles.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.08]">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                isLoading={isSubmitting}
                className="font-bold shadow-glow-sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Save & Enter Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
