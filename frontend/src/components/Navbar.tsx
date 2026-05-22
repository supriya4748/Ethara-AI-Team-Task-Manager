import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Sun, HelpCircle } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-8 sticky top-0 z-20 w-[calc(100%-16rem)] ml-64">
      {/* Title / Tab Name */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight capitalize">{title}</h2>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Search bar placeholder */}
        <div className="relative w-64 hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all duration-200"
          />
        </div>

        {/* Notifications and theme placeholder */}
        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-1.5 hover:bg-slate-950 rounded-lg hover:text-white transition-colors duration-150">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-950 rounded-lg hover:text-white transition-colors duration-150">
            <Sun className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-950 rounded-lg hover:text-white transition-colors duration-150">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Separation border */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Quick info user info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
            <span className="text-[10px] text-slate-400 font-medium">{user?.email}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-brand-500/10">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
};
