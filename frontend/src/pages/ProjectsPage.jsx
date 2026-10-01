import React, { useState, useEffect } from 'react';
import { Rocket, Plus, Github, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills_needed: 'React, Figma, FastAPI',
    team_size: 4,
    github_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/community/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post(`/community/projects?creator_id=${user?.id || 1}`, formData);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', skills_needed: 'React, Figma, FastAPI', team_size: 4, github_url: '' });
      showToast('Collaborative project posted to campus! +150 XP earned!', 'success');
      fetchProjects();
    } catch (err) {
      setIsSubmitting(false);
      showToast('Failed to create project', 'error');
    }
  };

  const handleJoinProject = (projectTitle) => {
    showToast(`Request sent to join "${projectTitle}"! Creator will reach out via Messages.`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Interdisciplinary Teams
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Student <span className="text-gradient-purple">Collaborative Projects</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Team up with peers to build real-world software, hardware, and research capstones. Exchange skills while shipping portfolio-ready work.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-glow-sm"
        >
          Post a Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-3xl bg-charcoal-card border border-white/[0.08] hover:border-violet-500/40 transition-all shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={proj.status === 'open' ? 'emerald' : 'purple'} size="sm">
                    {proj.status === 'open' ? 'Recruiting Peers' : 'In Progress'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Team: {proj.team_size} students
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {proj.description}
                </p>

                {/* Skills Needed */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Skills Needed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skills_needed.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Creator & Actions Footer */}
              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={proj.creator_avatar} name={proj.creator_name} size="xs" />
                    <div>
                      <div className="text-xs font-bold text-white">{proj.creator_name}</div>
                      <div className="text-[10px] text-slate-400">{proj.creator_university}</div>
                    </div>
                  </div>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleJoinProject(proj.title)}
                  className="w-full"
                >
                  Request to Join Team
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Rocket}
          title="No open projects right now"
          description="Be the first to post a hackathon or open-source idea and recruit fellow students!"
          actionLabel="Post a Project"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Post Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Collaborative Student Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Campus Food Rescue App"
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Project Description & Goals
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What are you building? What problem does it solve for students?"
              className="w-full rounded-xl bg-dark-950 border border-white/[0.1] text-slate-100 text-sm p-4 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <Input
            label="Skills Needed (comma-separated)"
            type="text"
            value={formData.skills_needed}
            onChange={(e) => setFormData({ ...formData, skills_needed: e.target.value })}
            placeholder="React Native, Figma, Node.js"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Team Size"
              type="number"
              value={formData.team_size}
              onChange={(e) => setFormData({ ...formData, team_size: Number(e.target.value) })}
              required
            />
            <Input
              label="GitHub Repository (Optional)"
              type="text"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Publish Project (+150 XP)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
