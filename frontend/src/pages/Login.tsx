import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login action failed:', err);
      setError(err.message || 'Invalid email or password credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-slate-900 shadow-2xl relative overflow-hidden animate-fadeIn">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-brand-500/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Welcome to Ethara AI</h2>
        <p className="text-xs text-slate-400 mt-1">Please sign in to access your dashboard</p>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400 text-xs items-start animate-shake">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Authentication failed</span>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50"
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
            <a href="#" className="text-[10px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] transition-all text-xs font-bold py-3 rounded-lg text-white shadow-lg shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch Link */}
      <div className="mt-8 text-center text-xs border-t border-slate-900/80 pt-6">
        <span className="text-slate-500">Don't have an account? </span>
        <button 
          onClick={onSwitchToSignup} 
          disabled={loading}
          className="font-semibold text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};
