import React from 'react';
import { useApp } from '../../context/AppContext';
import { translateText } from '../../locales/translations';
import { X, ArrowRight } from 'lucide-react';
import { NotificationType } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, language } = useApp();

  if (toasts.length === 0) return null;

  const localizeBadgeLabel = (label: string) => {
    if (language === 'en') return label;
    const map: Record<string, { ta: string; hi: string }> = {
      Success: { ta: 'வெற்றி', hi: 'सफल' },
      Warning: { ta: 'கவனம்', hi: 'चेतावनी' },
      Problem: { ta: 'சிக்கல்', hi: 'समस्या' },
      Notification: { ta: 'அறிவிப்பு', hi: 'सूचना' },
      Processing: { ta: 'செயலாக்கம்', hi: 'प्रक्रिया में' },
      Connection: { ta: 'இணைப்பு', hi: 'कनेक्शन' },
      'Fair Price': { ta: 'நியாய விலை', hi: 'उचित दाम' },
      'Produce Added': { ta: 'பயிர் சேர்க்கப்பட்டது', hi: 'उपज जुड़ी' },
      'Voice Audio': { ta: 'குரல் உதவி', hi: 'वॉइस सहायता' },
      'Sale Confirmed': { ta: 'விற்பனை உறுதி', hi: 'बिक्री पक्की' },
    };
    return map[label]?.[language] || label;
  };

  return (
    <div
      role="region"
      aria-label="System Notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-3 pointer-events-none"
    >
      {toasts.map((toast) => {
        const getEmojiAndBadge = (type: NotificationType) => {
          switch (type) {
            case 'success':
              return {
                symbol: '✅',
                label: 'Success',
                cardClasses: 'border-emerald-600 bg-white text-stone-900 shadow-emerald-950/15',
                badgeClasses: 'bg-emerald-100 text-emerald-900 border-emerald-300',
              };
            case 'warning':
              return {
                symbol: '⚠️',
                label: 'Warning',
                cardClasses: 'border-amber-500 bg-white text-stone-900 shadow-amber-950/15',
                badgeClasses: 'bg-amber-100 text-amber-950 border-amber-300',
              };
            case 'problem':
            case 'error':
              return {
                symbol: '❌',
                label: 'Problem',
                cardClasses: 'border-rose-600 bg-white text-stone-900 shadow-rose-950/15',
                badgeClasses: 'bg-rose-100 text-rose-950 border-rose-300',
              };
            case 'notification':
            case 'info':
              return {
                symbol: '🔔',
                label: 'Notification',
                cardClasses: 'border-blue-600 bg-white text-stone-900 shadow-blue-950/15',
                badgeClasses: 'bg-blue-100 text-blue-950 border-blue-300',
              };
            case 'processing':
              return {
                symbol: '🔄',
                label: 'Processing',
                cardClasses: 'border-purple-600 bg-white text-stone-900 shadow-purple-950/15',
                badgeClasses: 'bg-purple-100 text-purple-950 border-purple-300',
              };
            case 'connection':
              return {
                symbol: '📶',
                label: 'Connection',
                cardClasses: 'border-stone-600 bg-white text-stone-900 shadow-stone-950/15',
                badgeClasses: 'bg-stone-200 text-stone-950 border-stone-400',
              };
            case 'price':
              return {
                symbol: '💰',
                label: 'Fair Price',
                cardClasses: 'border-emerald-600 bg-white text-stone-900 shadow-emerald-950/15',
                badgeClasses: 'bg-emerald-100 text-emerald-950 border-emerald-300',
              };
            case 'produce':
              return {
                symbol: '🌾',
                label: 'Produce Added',
                cardClasses: 'border-emerald-600 bg-white text-stone-900 shadow-emerald-950/15',
                badgeClasses: 'bg-emerald-100 text-emerald-950 border-emerald-300',
              };
            case 'voice':
              return {
                symbol: '🎤',
                label: 'Voice Audio',
                cardClasses: 'border-amber-600 bg-white text-stone-900 shadow-amber-950/15',
                badgeClasses: 'bg-amber-100 text-amber-950 border-amber-300',
              };
            case 'sale':
              return {
                symbol: '🎉',
                label: 'Sale Confirmed',
                cardClasses: 'border-emerald-700 bg-white text-stone-900 shadow-emerald-950/20',
                badgeClasses: 'bg-emerald-100 text-emerald-950 border-emerald-400',
              };
            default:
              return {
                symbol: '🔔',
                label: 'Notification',
                cardClasses: 'border-stone-500 bg-white text-stone-900 shadow-stone-950/10',
                badgeClasses: 'bg-stone-100 text-stone-900 border-stone-300',
              };
          }
        };

        const config = getEmojiAndBadge(toast.type);

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex flex-col p-4 sm:p-5 rounded-3xl border-3 shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-3 ${config.cardClasses}`}
          >
            {/* Header: Icon + Status Symbol + Title + Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl select-none" role="img" aria-label={config.label}>
                  {config.symbol}
                </span>
                <div>
                  <span
                    className={`inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mb-0.5 ${config.badgeClasses}`}
                  >
                    {localizeBadgeLabel(config.label)}
                  </span>
                  <h4 className="font-black text-lg sm:text-xl text-stone-950 leading-snug tracking-tight">
                    {translateText(toast.title, language)}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-900 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation Message: Short sentence, high contrast */}
            {toast.message && (
              <p className="text-stone-800 text-base font-bold mt-2.5 leading-relaxed pl-1">
                {translateText(toast.message, language)}
              </p>
            )}

            {/* Action Buttons: [View Offer] [Later] */}
            {(toast.actionLabel || toast.secondaryActionLabel) && (
              <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t-2 border-stone-100">
                {toast.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.onAction) toast.onAction();
                      removeToast(toast.id);
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{translateText(toast.actionLabel, language)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {toast.secondaryActionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.onSecondaryAction) toast.onSecondaryAction();
                      removeToast(toast.id);
                    }}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    {translateText(toast.secondaryActionLabel, language)}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
