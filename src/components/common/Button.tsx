import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'kiosk';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap cursor-pointer';

  const sizeClasses = {
    sm: 'text-sm px-3.5 py-2 min-h-[38px] gap-1.5',
    md: 'text-base px-5 py-2.5 min-h-[46px] gap-2',
    lg: 'text-lg px-6 py-3.5 min-h-[54px] gap-2.5 shadow-sm',
    xl: 'text-xl px-7 py-4 min-h-[64px] gap-3 font-bold shadow-md rounded-2xl'
  };

  const variantClasses = {
    primary:
      'bg-emerald-700 hover:bg-emerald-800 text-white focus:ring-emerald-600 shadow-emerald-900/10 shadow',
    secondary:
      'bg-stone-800 hover:bg-stone-900 text-white focus:ring-stone-700',
    outline:
      'bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 focus:ring-emerald-600',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white focus:ring-rose-600',
    kiosk:
      'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 text-lg border-2 border-amber-700'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
