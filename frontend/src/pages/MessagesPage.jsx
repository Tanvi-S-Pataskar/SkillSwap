import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Search, Phone, Video, MoreVertical, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(
    Number(searchParams.get('with')) || 2
  );
  const [activeThread, setActiveThread] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/messages/conversations?user_id=${user?.id || 1}`);
        const convList = Array.isArray(res.data) ? res.data : [];
        setConversations(convList);
        if (convList.length > 0 && !searchParams.get('with')) {
          setActivePartnerId(convList[0].partner_id);
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };
    fetchConversations();
  }, [user]);

  // Load active thread
  useEffect(() => {
    if (!activePartnerId) return;
    const fetchThread = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/messages/thread/${activePartnerId}?user_id=${user?.id || 1}`
        );
        setActiveThread(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load thread', err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [activePartnerId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activePartnerId) return;

    try {
      const res = await api.post(`/messages?user_id=${user?.id || 1}`, {
        receiver_id: activePartnerId,
        content: messageInput.trim(),
      });

      setActiveThread((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), res.data],
      }));
      setMessageInput('');
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="glass-card rounded-3xl border border-white/[0.1] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[650px] max-h-[750px]">
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-4 border-r border-white/[0.08] bg-dark-950/60 flex flex-col justify-between">
          <div className="p-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white mb-1">Messages</h2>
            <p className="text-xs text-slate-400">Direct student-to-student chat</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {conversations.map((c) => {
              const isActive = c.partner_id === activePartnerId;
              return (
                <button
                  key={c.partner_id}
                  onClick={() => setActivePartnerId(c.partner_id)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                    isActive ? 'bg-violet-600/20 border-l-4 border-violet-500' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <Avatar src={c.partner_avatar} name={c.partner_name} size="md" isOnline={true} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-white truncate">
                        {c.partner_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.last_message_time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.last_message}</p>
                    <span className="text-[10px] text-violet-400 font-medium">
                      {c.partner_university}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/[0.08] text-[11px] text-slate-500 text-center">
            Encrypted campus peer channel
          </div>
        </div>

        {/* Right Side: Active Thread */}
        <div className="md:col-span-8 flex flex-col justify-between bg-dark-900/40">
          {/* Thread Header */}
          {activeThread?.partner && (
            <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-charcoal-card/80">
              <div className="flex items-center gap-3">
                <Avatar
                  src={activeThread.partner.avatar_url}
                  name={activeThread.partner.name}
                  size="md"
                  isOnline={true}
                />
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activeThread.partner.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeThread.partner.university} · Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://meet.skillswap.edu/room-${user?.id || 1}-${activePartnerId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-colors"
                  title="Start instant video call"
                >
                  <Video className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Messages Bubble Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {(activeThread?.messages || []).map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.is_mine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.is_mine
                      ? 'bg-violet-600 text-white rounded-br-none shadow-glow-sm'
                      : 'bg-charcoal-card text-slate-200 border border-white/[0.08] rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.08] bg-charcoal-card/80 flex items-center gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeThread?.partner?.name || 'peer'}...`}
              className="flex-1 bg-dark-950 border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
