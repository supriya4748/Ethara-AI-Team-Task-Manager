import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Stack container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle,
            error: AlertCircle,
            info: Info,
            warning: AlertTriangle,
          }[toast.type];

          const colors = {
            success: 'border-emerald-500/25 bg-slate-950/90 text-emerald-400 shadow-emerald-950/20',
            error: 'border-rose-500/25 bg-slate-950/90 text-rose-450 shadow-rose-950/20',
            info: 'border-brand-500/25 bg-slate-950/90 text-brand-400 shadow-brand-950/20',
            warning: 'border-amber-500/25 bg-slate-950/90 text-amber-400 shadow-amber-950/20',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-slideIn ${colors}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-semibold leading-relaxed text-slate-200">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
