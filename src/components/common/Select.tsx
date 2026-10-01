import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm sm:text-base font-semibold text-stone-800 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full rounded-xl border-2 bg-white text-stone-900 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] py-2.5 pl-4 pr-10 appearance-none transition-colors focus:outline-none cursor-pointer ${
            error
              ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
              : 'border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-500">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-stone-600">{helperText}</p>
      ) : null}
    </div>
  );
};
