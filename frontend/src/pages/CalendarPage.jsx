import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const CalendarPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentWeek, setCurrentWeek] = useState('October 2026');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get(`/sessions?user_id=${user?.id || 1}`);
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load sessions', err);
      }
    };
    fetchSessions();
  }, [user]);

  const days = [
    { day: 'Mon', date: 'Oct 05', slots: [] },
    {
      day: 'Tue',
      date: 'Oct 06',
      slots: [
        {
          title: 'Python Algorithms & Graph BFS',
          partner: 'Maya Lin',
          time: '3:00 PM - 4:00 PM',
          type: 'Learning',
          link: 'https://meet.skillswap.edu/room-maya-liam-trees',
        },
      ],
    },
    {
      day: 'Wed',
      date: 'Oct 07',
      slots: [
        {
          title: 'Figma Auto-Layout & Design Systems',
          partner: 'Liam Vance',
          time: '4:30 PM - 5:30 PM',
          type: 'Teaching',
          link: 'https://meet.skillswap.edu/room-liam-maya-figma',
        },
      ],
    },
    { day: 'Thu', date: 'Oct 08', slots: [] },
    {
      day: 'Fri',
      date: 'Oct 09',
      slots: [
        {
          title: 'Hackathon Investor Pitch Critique',
          partner: 'Aarav Sharma',
          time: '2:00 PM - 3:00 PM',
          type: 'Teaching',
          link: 'https://meet.skillswap.edu/room-chloe-aarav-pitch',
        },
      ],
    },
    { day: 'Sat', date: 'Oct 10', slots: [] },
    { day: 'Sun', date: 'Oct 11', slots: [] },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Schedule & Time Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Weekly <span className="text-gradient-purple">Swap Calendar</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your peer teaching and learning commitments across your university week.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-charcoal-card border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs font-semibold text-white">
            <CalendarIcon className="w-4 h-4 text-violet-400 mr-1" />
            <span>{currentWeek}</span>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((d, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-charcoal-card border border-white/[0.08] flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {d.day}
              </div>
              <div className="text-base font-extrabold text-white mb-3">{d.date}</div>

              {d.slots.length > 0 ? (
                <div className="space-y-2">
                  {d.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs space-y-1.5 shadow-sm"
                    >
                      <Badge
                        variant={slot.type === 'Teaching' ? 'emerald' : 'purple'}
                        size="sm"
                      >
                        {slot.type}
                      </Badge>
                      <div className="font-bold text-white leading-tight">
                        {slot.title}
                      </div>
                      <div className="text-[11px] text-slate-300">With {slot.partner}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-violet-400" />
                        <span>{slot.time}</span>
                      </div>
                      <a
                        href={slot.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-semibold pt-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 italic py-6 text-center">
                  No sessions
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[10px] text-slate-500">Free time-slot</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPage;
