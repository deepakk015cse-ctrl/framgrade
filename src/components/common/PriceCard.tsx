import React from 'react';
import { MandiPrice } from '../../types';
import { useApp } from '../../context/AppContext';
import { localizeCropName, localizeUnit, translateText } from '../../locales/translations';
import { TrendingUp, TrendingDown, Minus, MapPin, Clock } from 'lucide-react';

interface PriceCardProps {
  price: MandiPrice;
  onSelect?: (price: MandiPrice) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price, onSelect }) => {
  const { language, t } = useApp();
  const unitLabel = localizeUnit(price.unit, language);
  const cropDisplay = localizeCropName(price.cropName, language);

  return (
    <div
      onClick={() => onSelect?.(price)}
      className="bg-white rounded-2xl border-2 border-stone-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all text-left flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="text-lg font-bold text-stone-900 leading-tight">
              {cropDisplay}
            </h4>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              {price.variety}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
              price.trend === 'up'
                ? 'bg-emerald-100 text-emerald-800'
                : price.trend === 'down'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {price.trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : price.trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {price.changePercent > 0 ? `+${price.changePercent}%` : `${price.changePercent}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-4">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate font-medium">{price.mandiName}, {price.district}</span>
        </div>

        {/* Current Market Price */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 mb-3">
          <div className="text-xs text-stone-500 font-semibold mb-0.5">
            {t('Current market information')}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              ₹{price.modalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-semibold text-stone-600">/ {unitLabel}</span>
          </div>
        </div>

        {/* Expected Range */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mb-2">
          <span className="text-xs text-emerald-800 font-semibold block">
            {t('Expected range')}
          </span>
          <span className="font-black text-emerald-950 text-base">
            ₹{price.minPrice} – ₹{price.maxPrice} / {unitLabel}
          </span>
        </div>

        <p className="text-[11px] text-stone-500">
          {t('Prices can change based on market conditions.')}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-400" />
          {translateText(`Updated: ${price.lastUpdated}`, language)}
        </span>
        <span className="text-emerald-700 font-semibold hover:underline cursor-pointer">
          {t('View Trend →')}
        </span>
      </div>
    </div>
  );
};
