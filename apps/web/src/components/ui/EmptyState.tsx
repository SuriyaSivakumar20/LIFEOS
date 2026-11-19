import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-bg-elevated/40 border border-boundary/40 rounded-lg ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-content-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-content-secondary max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
