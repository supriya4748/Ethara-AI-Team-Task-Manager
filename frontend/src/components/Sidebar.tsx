import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  CheckSquare, 
  Settings, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Projects', icon: FolderKanban },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'team', name: 'Team Members', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen fixed left-0 top-0 text-slate-300 z-10">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wide leading-none">Ethara AI</h1>
            <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Workspace</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 rounded-xl glass border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-gradient text-sm">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.role === 'ADMIN' ? (
                <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded font-medium">
                  Member
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15' 
                    : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings & Logout */}
      <div className="p-4 border-t border-slate-800/60 space-y-1">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentTab === 'settings' 
              ? 'bg-slate-800 text-white' 
              : 'hover:bg-slate-800/40 hover:text-slate-100 text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
