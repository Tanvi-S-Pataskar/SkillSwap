import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while retrieving data. Please try again.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-rose-950/20 border border-rose-500/30 rounded-2xl ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-300 max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
