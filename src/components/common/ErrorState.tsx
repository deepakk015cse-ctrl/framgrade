import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isConnectionError?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isConnectionError = false,
}) => {
  const { language, t } = useApp();

  const isOffline =
    isConnectionError || (typeof navigator !== 'undefined' && !navigator.onLine);

  let defaultTitle = t('notify_error_title') || 'Something went wrong.';
  let defaultMessage = t('notify_error_desc') || 'Please try again.';
  let symbol = '❌';

  if (isOffline) {
    defaultTitle = t('notify_no_internet_title') || '📶 Internet connection is weak.';
    defaultMessage =
      t('notify_no_internet_desc') ||
      'Your information is safe. Please try again when the connection is available.';
    symbol = '📶';
  }

  const finalTitle = title || defaultTitle;
  const finalMessage = message || defaultMessage;

  return (
    <div className="bg-white border-3 border-rose-300 rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto my-6 shadow-md">
      <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-rose-200 text-3xl shadow-inner">
        <span role="img" aria-label={isOffline ? 'Connection error' : 'Problem'}>
          {symbol}
        </span>
      </div>
      <h3 className="text-2xl font-black text-stone-950 mb-2 tracking-tight">
        {finalTitle}
      </h3>
      <p className="text-stone-700 text-base font-bold mb-6 leading-relaxed">
        {finalMessage}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : language === 'hi' ? 'दोबारा प्रयास करें' : 'Try Again'}</span>
        </button>
      )}
    </div>
  );
};
