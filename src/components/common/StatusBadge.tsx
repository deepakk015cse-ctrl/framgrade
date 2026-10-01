import React from 'react';
import { useApp } from '../../context/AppContext';
import { localizeStatus } from '../../locales/translations';

export type BadgeVariant =
  | 'active'
  | 'negotiating'
  | 'sold'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'grade-a'
  | 'grade-b'
  | 'grade-c'
  | 'kiosk';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md'
}) => {
  const { language } = useApp();

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-bold'
  };

  const getStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'live on market':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      case 'negotiating':
      case 'bids in review':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'sold':
      case 'paid':
      case 'completed':
        return 'bg-blue-100 text-blue-900 border border-blue-300';
      case 'accepted':
      case 'selected':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      case 'pending':
        return 'bg-stone-100 text-stone-800 border border-stone-300';
      case 'rejected':
      case 'declined':
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 border border-rose-300';
      case 'backup_offered':
      case 'backup':
        return 'bg-amber-100 text-amber-950 border border-amber-400';
      case 'grade a':
      case 'grade-a':
        return 'bg-emerald-600 text-white font-bold tracking-wide shadow-xs';
      case 'grade b':
      case 'grade-b':
        return 'bg-amber-500 text-stone-900 font-bold tracking-wide shadow-xs';
      case 'grade c':
      case 'grade-c':
        return 'bg-stone-500 text-white font-bold tracking-wide shadow-xs';
      case 'kiosk':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-medium';
      default:
        return 'bg-stone-100 text-stone-800 border border-stone-200';
    }
  };

  const displayLabel = localizeStatus(label || status, language);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg whitespace-nowrap ${sizeClasses[size]} ${getStyle(
        status
      )}`}
    >
      {displayLabel}
    </span>
  );
};
