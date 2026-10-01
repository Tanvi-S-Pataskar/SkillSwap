import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Star, Award, Calendar, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/community/notifications?user_id=${user?.id || 1}`);
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'session':
        return <Calendar className="w-4 h-4 text-violet-400" />;
      case 'badge':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-400">Updates on sessions, reviews, and badges</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl bg-charcoal-card border transition-all flex items-start gap-4 ${
                !n.is_read ? 'border-violet-500/40 shadow-glow-sm' : 'border-white/[0.06]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{n.created_at}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any unread notifications right now."
        />
      )}
    </div>
  );
};

export default NotificationsPage;
