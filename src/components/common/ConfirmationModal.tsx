import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, AlertOctagon, HelpCircle, CheckCircle2, ArrowLeft, Check } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmationState, hideConfirmation, language, t } = useApp();

  if (!confirmationState.isOpen) return null;

  const {
    title,
    message,
    confirmText,
    cancelText,
    type = 'warning',
    onConfirm,
    onCancel,
  } = confirmationState;

  const defaultTitle = t('confirm_are_you_sure') || 'Are you sure?';
  const defaultConfirmText = t('confirm_yes_continue') || 'Yes, Continue';
  const defaultCancelText = t('confirm_go_back') || 'Go Back';

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      hideConfirmation();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    hideConfirmation();
  };

  const iconByType = {
    warning: (
      <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
        <span className="text-2xl" role="img" aria-label="Warning">⚠️</span>
      </div>
    ),
    problem: (
      <div className="w-14 h-14 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-700 shadow-sm shrink-0">
        <span className="text-2xl" role="img" aria-label="Problem">❌</span>
      </div>
    ),
    info: (
      <div className="w-14 h-14 rounded-2xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 shadow-sm shrink-0">
        <span className="text-2xl" role="img" aria-label="Notification">🔔</span>
      </div>
    ),
    success: (
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
        <span className="text-2xl" role="img" aria-label="Success">✅</span>
      </div>
    ),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-left shadow-2xl border-4 border-stone-200 space-y-5">
        <div className="flex items-center gap-4">
          {iconByType[type] || iconByType.warning}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">
              {language === 'ta' ? 'உறுதிப்படுத்தல்' : language === 'hi' ? 'पुष्टि करें' : 'Action Confirmation'}
            </span>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
              {title || defaultTitle}
            </h3>
          </div>
        </div>

        {message && (
          <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200">
            <p className="text-base sm:text-lg font-bold text-stone-800 leading-snug">
              {message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
            <span>{cancelText || defaultCancelText}</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
          >
            <Check className="w-5 h-5 text-white" />
            <span>{confirmText || defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
