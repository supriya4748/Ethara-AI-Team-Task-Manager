import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Internal AppShell to access useAuth hook safely
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {authView === 'login' ? (
          <Login onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  // Logged-in App Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <Navbar title={currentTab} />

        {/* Dynamic Tab Panel */}
        <main className="flex-grow p-8 ml-64 max-w-7xl w-[calc(100%-16rem)]">
          {currentTab === 'dashboard' && <Dashboard />}

          {currentTab === 'projects' && <Projects />}
          {currentTab === 'tasks' && <Tasks />}

          {currentTab === 'team' && (
            <div className="p-8 rounded-2xl glass border border-slate-900 text-center space-y-4 max-w-2xl mx-auto mt-12 animate-fadeIn">
              <h3 className="text-lg font-bold text-white">Team Roster & Roles</h3>
              <p className="text-xs text-slate-400">
                Provides Admin-only privileges to invite, edit, or remove members and alter permission matrix scopes. Non-admin members will view a read-only list of directory members.
              </p>
              <div className="p-3 bg-slate-900/50 rounded-lg text-[10px] text-slate-500 font-mono">
                Component Location: src/pages/Team.tsx
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="p-8 rounded-2xl glass border border-slate-900 text-center space-y-4 max-w-2xl mx-auto mt-12 animate-fadeIn">
              <h3 className="text-lg font-bold text-white">System Settings</h3>
              <p className="text-xs text-slate-400">
                Configure profile settings, notifications, integrations, database configurations, and overall workspace parameters.
              </p>
              <div className="p-3 bg-slate-900/50 rounded-lg text-[10px] text-slate-500 font-mono">
                Component: Settings Panel
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
