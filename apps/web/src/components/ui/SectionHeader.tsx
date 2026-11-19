import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div>
        <h2 className="text-base md:text-lg font-semibold text-content-primary tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-content-secondary mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
