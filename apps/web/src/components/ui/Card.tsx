import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'elevated' | 'secondary' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  className = '',
  variant = 'elevated',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-6',
  }[padding];

  const variantStyles = {
    elevated: 'bg-bg-elevated border border-boundary/70 shadow-sm',
    secondary: 'bg-bg-secondary border border-boundary/50',
    outline: 'bg-transparent border border-boundary',
  }[variant];

  return (
    <div
      className={`rounded-lg transition-colors ${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
