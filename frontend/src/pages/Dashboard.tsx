import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  FolderOpen,
  RefreshCw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: {
    tasks: number;
  };
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
  assignee: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch active projects
      const projectsRes = await api.get<{ status: string; data: { projects: Project[] } }>('/projects');
      
      // 2. Fetch tasks
      const tasksRes = await api.get<{ status: string; data: { tasks: Task[] } }>('/tasks');
      
      // 3. Fetch overdue tasks
      const overdueRes = await api.get<{ status: string; data: { tasks: Task[] } }>('/tasks/overdue');

      setProjects(projectsRes.data.projects);
      setTasks(tasksRes.data.tasks);
      setOverdueTasks(overdueRes.data.tasks);
    } catch (err: any) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.message || 'Failed to sync with workspace server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute stats
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueCount = overdueTasks.length;
  const completedCount = tasks.filter(t => t.status === 'DONE').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const stats = [
    { name: 'Total Tasks', value: totalTasks.toString(), change: 'Registered active tasks', icon: CheckSquare, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
    { name: 'In Progress', value: inProgressCount.toString(), change: 'Tasks in execution', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { name: 'Overdue Tasks', value: overdueCount.toString(), change: overdueCount > 0 ? 'Requires priority action' : 'All clear', icon: AlertCircle, color: overdueCount > 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-slate-400 bg-slate-900 border-slate-800' },
    { name: 'Task Completion Rate', value: `${completionRate}%`, change: `${completedCount} of ${totalTasks} completed`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  // Get recent 4 tasks for list display
  const recentTasks = tasks.slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome Skeleton */}
        <div className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl"></div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/40 border border-slate-950 rounded-2xl"></div>
          ))}
        </div>
        {/* Main Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 h-96 bg-slate-900/40 border border-slate-950 rounded-2xl"></div>
          <div className="h-96 bg-slate-900/40 border border-slate-950 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl glass border border-rose-500/20 text-center space-y-4 max-w-lg mx-auto mt-12 animate-fadeIn">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Sync Failure</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white mx-auto transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-indigo-900/20 to-slate-950 border border-brand-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Welcome Back, {user?.name}!</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            {overdueCount > 0 ? (
              <>
                You have <strong className="text-rose-400 font-semibold">{overdueCount} overdue tasks</strong>. Let's get these resolved!
              </>
            ) : (
              <>
                Excellent! You have <strong className="text-emerald-400 font-semibold">0 overdue tasks</strong>. Keep up the amazing work!
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl glass-card border border-slate-900 hover:border-slate-850 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">{stat.name}</span>
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-3xl font-extrabold text-white tracking-tight leading-none">{stat.value}</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                  <span>{stat.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Projects & Workload */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Active Workload Table */}
        <div className="xl:col-span-2 rounded-2xl glass border border-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-base text-white tracking-tight">Active Workload</h4>
                <p className="text-xs text-slate-400 mt-0.5">Tasks currently assigned to your team</p>
              </div>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2 border border-dashed border-slate-900 rounded-xl">
                <CheckSquare className="w-8 h-8 mx-auto text-slate-650 opacity-40" />
                <p className="text-xs">No active tasks in workspace. Admins can create tasks.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Task Description</th>
                      <th className="pb-3">Project</th>
                      <th className="pb-3">Assignee</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Priority</th>
                      <th className="pb-3 pr-2 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-xs">
                    {recentTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 pl-2 font-semibold text-white max-w-xs truncate">{task.title}</td>
                        <td className="py-3.5 text-slate-300 font-medium">{task.project?.name || 'Global'}</td>
                        <td className="py-3.5 text-slate-400 flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[9px] text-brand-400 uppercase">
                            {task.assignee ? task.assignee.name.substring(0, 2) : '??'}
                          </div>
                          {task.assignee?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            task.status === 'REVIEW' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                            task.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-850 text-slate-400 border-slate-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[10px] font-semibold ${
                            task.priority === 'HIGH' ? 'text-rose-400' :
                            task.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-right font-medium text-slate-450">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Limit'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Active Projects progress card */}
        <div className="rounded-2xl glass border border-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-base text-white tracking-tight">Active Projects</h4>
                <p className="text-xs text-slate-400 mt-0.5">Workspace projects and task counts</p>
              </div>
              <div className="p-1.5 border border-slate-900 rounded-lg text-slate-400">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2 border border-dashed border-slate-900 rounded-xl">
                <FolderOpen className="w-8 h-8 mx-auto text-slate-650 opacity-40" />
                <p className="text-xs">No active projects yet. Admins can create projects.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {projects.slice(0, 4).map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-colors">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide">{proj.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-full truncate">{proj.description || 'No description provided.'}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-brand-400">{proj._count?.tasks || 0} tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
