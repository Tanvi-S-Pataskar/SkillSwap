import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-violet-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-dark-900/90 text-emerald-100',
    error: 'border-rose-500/40 bg-dark-900/90 text-rose-100',
    warning: 'border-amber-500/40 bg-dark-900/90 text-amber-100',
    info: 'border-violet-500/40 bg-dark-900/90 text-slate-100',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
        borders[type] || borders.info
      }`}
    >
      <div className="flex items-center gap-3">
        {icons[type] || icons.info}
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
