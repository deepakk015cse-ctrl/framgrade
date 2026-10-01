import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'kiosk';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-2xl transition-all duration-150 border border-stone-200';

  const variantClasses = {
    default: 'shadow-xs hover:border-stone-300',
    elevated: 'shadow-md border-stone-200/80',
    outline: 'border-2 border-stone-300 shadow-none',
    kiosk: 'border-2 border-emerald-600/30 bg-emerald-50/20 shadow-sm'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
