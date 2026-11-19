import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-status-success/15 text-status-success border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    error: 'bg-status-error/15 text-status-error border-status-error/30',
    accent: 'bg-accent-primary/15 text-accent-primary border-accent-primary/30',
    neutral: 'bg-bg-elevated text-content-secondary border-boundary',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-sm tracking-wide ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
