import React from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { Languages } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, t } = useApp();

  const options: { code: Language; label: string; nativeName: string; shortName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English', shortName: 'English' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', shortName: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', shortName: 'हिन्दी' }
  ];

  if (compact) {
    return (
      <div
        className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200"
        data-no-translate="true"
      >
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              language === opt.code
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            {opt.shortName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden xl:flex items-center gap-1 text-stone-500 text-xs font-semibold">
        <Languages className="w-4 h-4 text-emerald-700" />
        <span>{t('language_label')}</span>
      </div>
      <div
        className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-300"
        data-no-translate="true"
      >
        {options.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              language === opt.code
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            {opt.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};
