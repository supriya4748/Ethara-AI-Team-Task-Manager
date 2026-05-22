import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(name, email, password, role);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to create account. Please verify input data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-slate-900 shadow-2xl relative overflow-hidden animate-fadeIn">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-brand-500/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create Workspace Account</h2>
        <p className="text-xs text-slate-400 mt-1">Get started with Ethara AI Task Manager</p>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400 text-xs items-start animate-shake">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Registration failed</span>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Work Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Password</label>
          <input
            type="password"
            placeholder="•••••••• (Min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full text-xs bg-slate-950 border border-slate-900 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50"
            required
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Workspace Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('MEMBER')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 border px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                role === 'MEMBER' 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400'
              } disabled:opacity-50`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Team Member
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 border px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                role === 'ADMIN' 
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 shadow-md shadow-brand-500/5' 
                  : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400'
              } disabled:opacity-50`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin / Lead
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-[0.99] transition-all text-xs font-bold py-3 rounded-lg text-white shadow-lg shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch Link */}
      <div className="mt-6 text-center text-xs border-t border-slate-900/80 pt-6">
        <span className="text-slate-500">Already have an account? </span>
        <button 
          onClick={onSwitchToLogin} 
          disabled={loading}
          className="font-semibold text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
