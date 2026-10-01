import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Video, Star, TrendingUp, Award } from 'lucide-react';
import api from '../../api/client';

const StatsSection = () => {
  const [stats, setStats] = useState({
    skills_shared: '10K+',
    students_count: '5K+',
    sessions_completed: '20K+',
    average_rating: '4.8',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        // Fallback to static numbers
      }
    };
    fetchStats();
  }, []);

  const items = [
    {
      label: 'Skills Shared',
      value: stats.skills_shared || '10K+',
      subtext: 'Across tech, design, & languages',
      icon: BookOpen,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Active Students',
      value: stats.students_count || '5K+',
      subtext: 'From 50+ leading universities',
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Completed Sessions',
      value: stats.sessions_completed || '20K+',
      subtext: '1-on-1 peer exchange hours',
      icon: Video,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Average Peer Rating',
      value: stats.average_rating || '4.8',
      subtext: 'Rated by fellow students',
      icon: Star,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <section className="relative z-10 py-12 border-y border-white/[0.08] bg-charcoal-card/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center sm:items-start sm:text-left p-4 rounded-2xl transition-all hover:bg-white/[0.02]"
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 shadow-sm ${stat.bgColor} ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
