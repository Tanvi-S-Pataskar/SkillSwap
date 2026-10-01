import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

const OnboardingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [teachingSkills, setTeachingSkills] = useState(['Python & Data Structures', 'React & Next.js']);
  const [learningSkills, setLearningSkills] = useState(['Figma & UI/UX Design']);

  const popularSkills = [
    'Python & Data Structures',
    'React & Next.js',
    'TypeScript Fullstack',
    'Machine Learning & PyTorch',
    'Rust Systems Programming',
    'Figma & UI/UX Design',
    '3D Modeling with Blender',
    'SQL & Analytics Engineering',
    'Conversational Japanese',
    'Business Spanish',
    'Linear Algebra & Multivariable Calculus',
    'Startup Pitching & VC Decks',
    'Ableton Live & Music Production',
  ];

  const toggleTeaching = (skill) => {
    setTeachingSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleLearning = (skill) => {
    setLearningSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = () => {
    showToast('Onboarding complete! +250 XP earned. Welcome to SkillSwap!', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-3xl p-8 border border-white/[0.1] shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-glow-sm">
                {step}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {step === 1 ? 'What Can You Teach?' : 'What Do You Want to Learn?'}
                </h2>
                <p className="text-xs text-slate-400">Step {step} of 2 · Student Onboarding</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-violet-400 font-mono">
              {step === 1 ? '50% Complete' : '100% Ready'}
            </span>
          </div>

          {step === 1 ? (
            <div>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Select skills you feel comfortable explaining to a peer or helping someone debug. You don’t need to be a professor — sharing what you've learned is enough!
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {popularSkills.map((skill) => {
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

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Learning Skills
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Now pick 1 or more subjects you want to explore or improve this semester. Our Smart Matcher will suggest student mentors based on this list.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {popularSkills.map((skill) => {
                  const isSelected = learningSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleLearning(skill)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                          : 'bg-charcoal-card text-slate-300 border border-white/[0.06] hover:border-white/[0.2]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFinish}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Complete Profile & Enter Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
