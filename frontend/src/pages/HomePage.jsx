import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PopularSkillsSection from '../components/landing/PopularSkillsSection';
import FeaturedStudentsSection from '../components/landing/FeaturedStudentsSection';
import SkillExchangeSection from '../components/landing/SkillExchangeSection';
import WhySkillSwapSection from '../components/landing/WhySkillSwapSection';
import CtaSection from '../components/landing/CtaSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Platform Statistics */}
      <StatsSection />

      {/* 3. Section 1: How SkillSwap Works */}
      <HowItWorksSection />

      {/* 4. Section 2: Popular Skills */}
      <PopularSkillsSection />

      {/* 5. Section 3: Featured Students */}
      <FeaturedStudentsSection />

      {/* 6. Section 4: Skill Exchange */}
      <SkillExchangeSection />

      {/* 7. Section 5: Why SkillSwap */}
      <WhySkillSwapSection />

      {/* 8. Section 6: Final CTA */}
      <CtaSection />
    </div>
  );
};

export default HomePage;
