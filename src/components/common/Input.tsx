import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  rightElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm sm:text-base font-semibold text-stone-800 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-stone-500 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border-2 bg-white text-stone-900 placeholder:text-stone-400 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] py-2.5 transition-colors focus:outline-none ${
            icon ? 'pl-11' : 'pl-4'
          } ${rightElement ? 'pr-12' : 'pr-4'} ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
              : 'border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-stone-600">{helperText}</p>
      ) : null}
    </div>
  );
};
