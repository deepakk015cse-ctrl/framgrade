import React from 'react';
import { useApp } from '../../context/AppContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  const { t } = useApp();

  const finalTitle = title || t('notify_empty_bids_title') || 'No buyer offers yet.';
  const finalDescription =
    description || t('notify_empty_bids_desc') || "We'll show them here when buyers respond.";

  return (
    <div className="bg-white rounded-3xl border-3 border-dashed border-stone-300 p-8 sm:p-12 text-center max-w-lg mx-auto my-6 shadow-xs">
      <div className="w-16 h-16 bg-stone-100 text-stone-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-stone-200 text-3xl shadow-inner">
        {icon || <span role="img" aria-label="Notification">🔔</span>}
      </div>
      <h3 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">
        {finalTitle}
      </h3>
      <p className="text-stone-600 text-base font-bold leading-relaxed mb-6">
        {finalDescription}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md transition-transform active:scale-95"
        >
          {actionIcon}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
