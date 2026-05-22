import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle, 
  Clock,
  User,
  Folder,
  Calendar,
  Filter,
  Search,
  ShieldCheck,
  RefreshCw,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  assignee: User | null;
  createdAt: string;
}

// Helper to format an ISO date string safely into HTML datetime-local format (YYYY-MM-DDTHH:MM)
const formatToDatetimeLocal = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date to datetime-local:', error);
    return '';
  }
};

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');

  // Modals management state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalType, setTaskModalType] = useState<'create' | 'edit'>('create');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Task Details Modal (for read-only users or quick updates)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'>('TODO');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch tasks, projects, and users in parallel
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get<{ status: string; data: { tasks: Task[] } }>('/tasks'),
        api.get<{ status: string; data: { projects: Project[] } }>('/projects'),
        api.get<{ status: string; data: { users: User[] } }>('/auth/users')
      ]);

      setTasks(tasksRes.data.tasks);
      setProjects(projectsRes.data.projects);
      setUsers(usersRes.data.users);
      
      // Auto-select first project for new task form if available
      if (projectsRes.data.projects.length > 0) {
        setProjectId(projectsRes.data.projects[0].id);
      }
    } catch (err: any) {
      console.error('Failed to sync tasks workspace:', err);
      const errMsg = err.message || 'Unable to sync with tasks workspace.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modal accessibility: close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsDetailModalOpen(false);
      }
    };
    if (isTaskModalOpen || isDetailModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTaskModalOpen, isDetailModalOpen]);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setDueDate('');
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    } else {
      setProjectId('');
    }
    setAssigneeId('');
    setFormError(null);
    setTaskModalType('create');
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setProjectId(task.projectId);
    setAssigneeId(task.assignee?.id || '');
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    setDueDate(formatToDatetimeLocal(task.dueDate));

    setFormError(null);
    setSelectedTaskId(task.id);
    setTaskModalType('edit');
    setIsTaskModalOpen(true);
    setIsDetailModalOpen(false); // Close details modal if open
  };

  const openDetailModal = (task: Task) => {
    setDetailTask(task);
    setIsDetailModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Convert dueDate (YYYY-MM-DDTHH:MM) back to ISO string for backend
    let parsedDueDate: string | null = null;
    if (dueDate) {
      const dateObj = new Date(dueDate);
      if (!isNaN(dateObj.getTime())) {
        parsedDueDate = dateObj.toISOString();
      }
    }

    const payload = {
      title,
      description: description || null,
      status,
      priority,
      dueDate: parsedDueDate,
      projectId,
      assigneeId: assigneeId || null
    };

    try {
      if (taskModalType === 'create') {
        const res = await api.post<{ status: string; data: { task: Task } }>('/tasks', payload);
        
        // Optimistically add or re-fetch
        setTasks(prev => [res.data.task, ...prev]);
        showToast('Task created successfully!');
      } else {
        const res = await api.put<{ status: string; data: { task: Task } }>(`/tasks/${selectedTaskId}`, payload);
        setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, ...res.data.task } : t));
        showToast('Task updated successfully!');
      }
      setIsTaskModalOpen(false);
    } catch (err: any) {
      console.error('Task form failure:', err);
      const errMsg = err.message || 'Validation constraints failed.';
      setFormError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.patch<{ status: string; data: { task: Task } }>(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: res.data.task.status } : t));
      
      // Update detail task in focus if it is the one updated
      if (detailTask && detailTask.id === taskId) {
        setDetailTask(prev => prev ? { ...prev, status: res.data.task.status } : null);
      }

      showToast(`Task status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to change status:', err);
      const errMsg = err.message || 'Failed to update task progress.';
      showToast(errMsg, 'error');
    }
  };

  const handleTaskDelete = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Task removed from workspace.');
      setIsDetailModalOpen(false);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      const errMsg = err.message || 'Failed to delete selected task.';
      showToast(errMsg, 'error');
    }
  };

  // Check if a task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = selectedProjectFilter === 'all' || task.projectId === selectedProjectFilter;
    const matchesAssignee = selectedAssigneeFilter === 'all' ? true : 
                            selectedAssigneeFilter === 'unassigned' ? task.assignee === null :
                            task.assignee?.id === selectedAssigneeFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;

    return matchesSearch && matchesProject && matchesAssignee && matchesPriority;
  });

  // Split tasks by status for Kanban Board
  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const reviewTasks = filteredTasks.filter(t => t.status === 'REVIEW');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  const boardColumns = [
    { id: 'TODO' as const, title: 'To Do', tasks: todoTasks, borderColor: 'border-slate-800', badgeColor: 'bg-slate-850 text-slate-400' },
    { id: 'IN_PROGRESS' as const, title: 'In Progress', tasks: inProgressTasks, borderColor: 'border-amber-500/20', badgeColor: 'bg-amber-500/10 text-amber-400' },
    { id: 'REVIEW' as const, title: 'Review', tasks: reviewTasks, borderColor: 'border-brand-500/20', badgeColor: 'bg-brand-500/10 text-brand-400' },
    { id: 'DONE' as const, title: 'Completed', tasks: doneTasks, borderColor: 'border-emerald-500/20', badgeColor: 'bg-emerald-500/10 text-emerald-400' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-indigo-900/10 to-slate-950 border border-brand-500/10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            Tasks Workspace
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Streamline active workflows, allocate resources, and keep milestones on target.
          </p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-slate-455 hover:text-white transition-all flex items-center justify-center"
            title="Reload Workspaces"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              disabled={projects.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-95 transition-all text-xs font-bold px-4 py-2.5 rounded-lg text-white shadow-lg shadow-brand-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              title={projects.length === 0 ? "You need to create a project first!" : "Add a new task"}
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Secondary Notification/Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs flex gap-2.5 items-center animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="p-4 rounded-2xl glass border border-slate-900/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
        {/* Search bar */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search task keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Project filter */}
        <div className="relative">
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg text-slate-300 focus:outline-none focus:border-brand-500/40 transition-all"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Assignee filter */}
        <div className="relative">
          <select
            value={selectedAssigneeFilter}
            onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg text-slate-300 focus:outline-none focus:border-brand-500/40 transition-all"
          >
            <option value="all">All Team members</option>
            <option value="unassigned">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg text-slate-300 focus:outline-none focus:border-brand-500/40 transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
          <Activity className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Main Workspace Board View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[450px] bg-slate-900/30 border border-slate-950 rounded-2xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-900 p-8 space-y-4 max-w-lg mx-auto">
          <Folder className="w-12 h-12 text-slate-650 mx-auto opacity-30" />
          <h4 className="font-bold text-white">Project Workspaces Absent</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Tasks can only exist inside a Project workspace. Admins must create a Project first.
          </p>
        </div>
      ) : (
        /* Kanban Board Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {boardColumns.map(column => (
            <div 
              key={column.id} 
              className={`rounded-2xl bg-slate-900/20 border ${column.borderColor} p-4 flex flex-col min-h-[480px]`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-900/60">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    column.id === 'DONE' ? 'bg-emerald-500' :
                    column.id === 'REVIEW' ? 'bg-brand-500' :
                    column.id === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-500'
                  }`}></span>
                  {column.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${column.badgeColor}`}>
                  {column.tasks.length}
                </span>
              </div>

              {/* Task Cards Stack */}
              <div className="space-y-3.5 flex-grow overflow-y-auto max-h-[550px] pr-1.5 scrollbar-thin">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-slate-600 italic border border-dashed border-slate-900/60 rounded-xl">
                    No tasks active
                  </div>
                ) : (
                  column.tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => openDetailModal(task)}
                      className={`p-4 rounded-xl border bg-slate-950/70 hover:bg-slate-950 hover:border-slate-800 transition-all duration-200 group relative cursor-pointer ${
                        isOverdue(task) ? 'border-rose-500/25 shadow-sm shadow-rose-950/20' : 'border-slate-900'
                      }`}
                    >
                      {/* Priority and Overdue tags */}
                      <div className="flex justify-between items-start mb-2.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${
                          task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' :
                          task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {task.priority}
                        </span>

                        {isOverdue(task) && (
                          <span className="text-[9px] font-bold px-1.5 py-0.25 bg-rose-500/15 text-rose-455 border border-rose-500/20 rounded flex items-center gap-0.5 animate-pulse">
                            <Clock className="w-2.5 h-2.5" /> Overdue
                          </span>
                        )}
                      </div>

                      {/* Task title */}
                      <h5 className="text-xs font-bold text-white leading-relaxed group-hover:text-brand-400 transition-colors">
                        {task.title}
                      </h5>

                      {/* Task description preview */}
                      {task.description && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Project relation indicator */}
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-3 font-semibold">
                        <Folder className="w-2.5 h-2.5 text-slate-600" />
                        <span className="truncate max-w-[120px]">{task.project.name}</span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-900/60 my-3"></div>

                      {/* Assignee & Dates footer */}
                      <div className="flex justify-between items-center">
                        {/* Assignee profile label */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center font-bold text-[8px] text-brand-400 uppercase">
                            {task.assignee ? task.assignee.name.substring(0, 2) : '??'}
                          </div>
                          <span className="text-[9px] text-slate-400 truncate max-w-[80px] font-medium">
                            {task.assignee?.name || 'Unassigned'}
                          </span>
                        </div>

                        {/* Due Date display */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[9px] font-medium text-slate-550">
                            <Calendar className="w-2.5 h-2.5 text-slate-655" />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Hover action Quick status panel for quick shifting */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex gap-1.5 items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        {column.id !== 'TODO' && (
                          <button 
                            onClick={(e) => {
                              const steps: Record<string, 'TODO' | 'IN_PROGRESS' | 'REVIEW'> = { 'IN_PROGRESS': 'TODO', 'REVIEW': 'IN_PROGRESS', 'DONE': 'REVIEW' };
                              handleStatusUpdate(task.id, steps[column.id], e);
                            }}
                            className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded"
                            title="Move left"
                          >
                            <span className="text-[10px] font-bold">&larr;</span>
                          </button>
                        )}
                        {column.id !== 'DONE' && (
                          <button 
                            onClick={(e) => {
                              const steps: Record<string, 'IN_PROGRESS' | 'REVIEW' | 'DONE'> = { 'TODO': 'IN_PROGRESS', 'IN_PROGRESS': 'REVIEW', 'REVIEW': 'DONE' };
                              handleStatusUpdate(task.id, steps[column.id], e);
                            }}
                            className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded"
                            title="Move right"
                          >
                            <span className="text-[10px] font-bold">&rarr;</span>
                          </button>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={(e) => openEditModal(task, e)}
                            className="p-1 hover:bg-slate-900 text-slate-400 hover:text-brand-400 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL DIALOG */}
      {isTaskModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsTaskModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-lg p-6 rounded-2xl glass-card border border-slate-900 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            {/* Close trigger */}
            <button 
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h4 className="font-bold text-white text-base tracking-tight mb-5 flex items-center gap-2">
              {taskModalType === 'create' ? <Plus className="w-4.5 h-4.5 text-brand-400" /> : <Edit3 className="w-4.5 h-4.5 text-brand-400" />}
              {taskModalType === 'create' ? 'Create Task Workflow' : 'Update Task Details'}
            </h4>

            {/* Error notifications */}
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{formError}</p>
              </div>
            )}

            {/* Task Form fields */}
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design backend relational models"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={formLoading}
                  className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50"
                  required
                  minLength={2}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Specify task deliverables, acceptance criteria, or design specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={formLoading}
                  className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Project Workspace</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={formLoading || taskModalType === 'edit'} // Lock project on edit
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-slate-350 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Assign To Team Member</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={formLoading}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-slate-350 focus:outline-none focus:border-brand-500/40 transition-all"
                  >
                    <option value="">Unassigned (None)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Status selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Progress status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    disabled={formLoading}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-slate-350 focus:outline-none focus:border-brand-500/40 transition-all"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>

                {/* Priority selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Priority level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    disabled={formLoading}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-slate-350 focus:outline-none focus:border-brand-500/40 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                {/* Due Date selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Due Date Limit</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={formLoading}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-3.5 py-2.5 text-slate-355 focus:outline-none focus:border-brand-500/40 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit footer buttons */}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
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
                    taskModalType === 'create' ? 'Create Task' : 'Save Task'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TASK DETAILED DRAWER / MODAL VIEW */}
      {isDetailModalOpen && detailTask && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsDetailModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-lg p-6 rounded-2xl glass-card border border-slate-900 relative animate-scaleUp">
            
            {/* Close trigger */}
            <button 
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Project association top badge */}
            <div className="flex items-center gap-1.5 text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-2">
              <Folder className="w-3.5 h-3.5" />
              <span>Project: {detailTask.project.name}</span>
            </div>

            {/* Task title */}
            <h4 className="text-base font-extrabold text-white tracking-tight leading-snug mb-3">
              {detailTask.title}
            </h4>

            {/* Priority & status inline row */}
            <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-slate-900/80">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                detailTask.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                detailTask.status === 'REVIEW' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                detailTask.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                Status: {detailTask.status}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                detailTask.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/15' :
                detailTask.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                Priority: {detailTask.priority}
              </span>
              {isOverdue(detailTask) && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/15 text-rose-450 border border-rose-500/20 rounded flex items-center gap-1 animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Overdue Attention Needed
                </span>
              )}
            </div>

            {/* Task Description content */}
            <div className="space-y-4 mb-6">
              <div>
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-1.5">Description</h5>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900/60 text-xs text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto whitespace-pre-line">
                  {detailTask.description || 'No descriptive context formulated for this task.'}
                </div>
              </div>

              {/* Grid: Assignee & due date */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-455 mb-1.5">Assigned resource</h5>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-xs text-brand-400 uppercase">
                      {detailTask.assignee ? detailTask.assignee.name.substring(0, 2) : '??'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">
                        {detailTask.assignee?.name || 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {detailTask.assignee ? `${detailTask.assignee.role} member` : 'Awaiting allocation'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-455 mb-1.5">Due Date Target</h5>
                  <div className="flex items-center gap-2 text-xs text-slate-305 mt-1 font-semibold">
                    <Calendar className="w-4 h-4 text-slate-550" />
                    <span>
                      {detailTask.dueDate 
                        ? new Date(detailTask.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'No Target Set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick progression / Status change interface - Available to all members */}
            <div className="p-3.5 rounded-xl bg-slate-900/20 border border-slate-900/80 mb-6">
              <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Progression Control Status</h5>
              <div className="grid grid-cols-4 gap-1.5">
                {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(detailTask.id, st)}
                    className={`py-1.5 px-1 rounded text-[10px] font-bold text-center border transition-all ${
                      detailTask.status === st 
                        ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/10'
                        : 'bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {st === 'TODO' ? 'To Do' :
                     st === 'IN_PROGRESS' ? 'In Dev' :
                     st === 'REVIEW' ? 'Review' : 'Done'}
                  </button>
                ))}
              </div>
            </div>

            {/* Administrative actions section - Only visible to ADMIN */}
            <div className="flex justify-between items-center gap-4 border-t border-slate-900/80 pt-4">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => handleTaskDelete(detailTask.id)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-rose-500/10 hover:bg-rose-500/5 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Task
                  </button>
                  <button
                    onClick={() => openEditModal(detailTask)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                </>
              ) : (
                <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Read-only view (Member mode restrictions active)
                </div>
              )}
              
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-xs font-semibold px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-slate-300 rounded-lg transition-colors ml-auto"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
