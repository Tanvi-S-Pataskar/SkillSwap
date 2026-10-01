import React from 'react';
import { FolderSearch } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'Try changing your search keywords or adjusting your filters to find what you are looking for.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-10 bg-charcoal-card/60 border border-white/[0.06] rounded-2xl ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 shadow-glow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
