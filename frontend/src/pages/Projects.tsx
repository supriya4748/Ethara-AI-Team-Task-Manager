import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle, 
  Clock,
  Briefcase
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    tasks: number;
  };
}

export const Projects: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal forms management states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal accessibility: close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ status: string; data: { projects: Project[] } }>('/projects');
      setProjects(response.data.projects);
    } catch (err: any) {
      console.error('Failed to resolve project list:', err);
      setError(err.message || 'Unable to sync with projects server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setFormError(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setName(project.name);
    setDescription(project.description || '');
    setFormError(null);
    setSelectedProjectId(project.id);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (modalType === 'create') {
        const res = await api.post<{ status: string; data: { project: Project } }>('/projects', { name, description });
        setProjects(prev => [res.data.project, ...prev]);
        showToast('Project workspace created successfully!');
      } else {
        const res = await api.put<{ status: string; data: { project: Project } }>(`/projects/${selectedProjectId}`, { name, description });
        setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, ...res.data.project } : p));
        showToast('Project details updated successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Form execution error:', err);
      const errMsg = err.message || 'Form validation failed.';
      setFormError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? All associated tasks will be permanently deleted.')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast('Project and its associated tasks deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      const errMsg = err.message || 'Failed to delete selected project.';
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-indigo-900/10 to-slate-950 border border-brand-500/10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            Projects Workspace
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isAdmin ? 'Manage workspace projects, build tasks, and track metrics.' : 'Browse projects and view associated team operations.'}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-95 transition-all text-xs font-bold px-4 py-2.5 rounded-lg text-white shadow-lg shadow-brand-500/15"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </div>


      {/* Primary Loading & Error States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/40 border border-slate-950 rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-center space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-450 mx-auto" />
          <h4 className="font-bold text-white">Retrieval Failed</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <button 
            onClick={fetchProjects}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
          >
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-900 p-8 space-y-4 max-w-lg mx-auto">
          <FolderOpen className="w-12 h-12 text-slate-650 mx-auto opacity-30" />
          <h4 className="font-bold text-white">No Projects Active</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isAdmin ? 'Get started by creating your very first team project workspace now!' : 'There are no active projects to display right now.'}
          </p>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="text-xs font-bold px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white"
            >
              Add Project
            </button>
          )}
        </div>
      ) : (
        /* Projects Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="p-5 rounded-2xl glass-card border border-slate-900/90 hover:border-slate-800 flex flex-col justify-between h-48 relative overflow-hidden transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-sm text-white tracking-wide truncate max-w-[80%]">{project.name}</h4>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-md transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {project.description || 'No description has been formulated for this workspace project.'}
                </p>
              </div>

              <div className="border-t border-slate-900/80 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded font-bold">
                  {project._count?.tasks || 0} Tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal dialog */}
      {isModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-slate-900 relative animate-scaleUp">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h4 className="font-bold text-white text-base tracking-tight mb-5">
              {modalType === 'create' ? 'Create Project Workspace' : 'Edit Project Details'}
            </h4>

            {/* Modal Errors */}
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{formError}</p>
              </div>
            )}

            {/* Project input fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Portal App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={formLoading}
                  className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50"
                  required
                  minLength={2}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core target value of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formLoading}
                  className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-350 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="text-xs font-bold px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white transition-all shadow-md shadow-brand-500/10 disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    modalType === 'create' ? 'Create Project' : 'Save Details'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
