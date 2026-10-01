import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-charcoal-card border-violet-500/40 text-slate-100';
          let Icon = Info;
          let iconColor = 'text-violet-400';

          if (toast.type === 'success') {
            bg = 'bg-dark-900 border-emerald-500/50 text-emerald-100';
            Icon = CheckCircle;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bg = 'bg-dark-900 border-rose-500/50 text-rose-100';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'warning') {
            bg = 'bg-dark-900 border-amber-500/50 text-amber-100';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
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
