import React, { useState } from 'react';
import { Bid } from '../../types';
import { useApp } from '../../context/AppContext';
import { localizeCropName, localizeUnit, translateText } from '../../locales/translations';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { BuyerActivitySection } from './InnovationModules';
import { Truck, CreditCard, Check, X, Ban, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface BidCardProps {
  bid: Bid;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
  onCounter?: (bid: Bid) => void;
  onCancel?: (bidId: string) => void;
  readOnly?: boolean;
  isBuyer?: boolean;
}

export const BidCard: React.FC<BidCardProps> = ({
  bid,
  onAccept,
  onReject,
  onCounter,
  onCancel,
  readOnly = false,
  isBuyer = false
}) => {
  const { language, t } = useApp();
  const [showTakeHome, setShowTakeHome] = useState(false);
  const qty = bid.requestedQuantity || 300;
  const unitDisplay = localizeUnit(bid.unit || 'kg', language);
  const cropDisplay = localizeCropName(bid.cropName, language);
  const defaultTransport = bid.pickupPreference?.toLowerCase().includes('farm') ? 0 : 300;
  const [transportCost, setTransportCost] = useState<number>(defaultTransport);
  const [loadingCost, setLoadingCost] = useState<number>(100);
  const [otherCost, setOtherCost] = useState<number>(0);

  const grossVal = Math.round((bid.bidPricePerUnit || 0) * qty);
  const totalCosts = Math.round(transportCost + loadingCost + otherCost);
  const estTakeHome = Math.max(0, grossVal - totalCosts);

  return (
    <div
      className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition-all text-left shadow-xs ${
        bid.status === 'accepted'
          ? 'border-emerald-500 bg-emerald-50/20'
          : bid.status === 'completed'
          ? 'border-purple-400 bg-purple-50/20'
          : bid.status === 'rejected' || bid.status === 'cancelled'
          ? 'border-stone-200 opacity-60'
          : 'border-stone-300 hover:border-emerald-500 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xl font-black text-stone-900">{bid.buyerName}</h4>
          </div>
          <p className="text-sm font-semibold text-stone-600">
            {bid.buyerCompany} •{' '}
            {language === 'ta' ? 'அருகில்' : language === 'hi' ? 'आस-पास' : 'Nearby'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
            <span>{t('Offer received today')}</span>
          </div>
        </div>

        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
          <StatusBadge status={bid.status} />
        </div>
      </div>

      {/* Offer Highlight Box */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('Offered Rate & Quantity')}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            ₹{bid.bidPricePerUnit}
            <span className="text-sm font-semibold text-stone-600"> / {unitDisplay}</span>
          </div>
          <div className="text-xs text-stone-700 font-bold mt-0.5">
            {bid.requestedQuantity ? `${bid.requestedQuantity} ${unitDisplay}` : cropDisplay}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('Gross Value')}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            ₹{grossVal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-800 font-bold mt-0.5">
            {translateText(`Est. Take-Home: ₹${estTakeHome.toLocaleString('en-IN')}`, language)}
          </div>
        </div>
      </div>

      {/* Expandable Net Realisation Calculator */}
      {!isBuyer && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowTakeHome(!showTakeHome)}
            className="w-full flex items-center justify-between text-xs font-black text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 px-3.5 py-2.5 rounded-xl cursor-pointer text-left"
          >
            <span className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {language === 'ta'
                  ? `நிகர வருமானத்தைக் காண்க: ₹${estTakeHome.toLocaleString('en-IN')} (மதிப்பீடு)`
                  : language === 'hi'
                  ? `शुद्ध आय देखें: ₹${estTakeHome.toLocaleString('en-IN')} (अनुमानित)`
                  : `View Net Realisation — Estimated Net: ₹${estTakeHome.toLocaleString('en-IN')}`}
              </span>
            </span>
            {showTakeHome ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </button>
          {showTakeHome && (
            <div className="mt-2 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5 text-stone-700">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">
                    {language === 'ta' ? 'போக்குவரத்து (₹)' : language === 'hi' ? 'परिवहन (₹)' : 'Transport (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white font-black text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">
                    {language === 'ta' ? 'ஏற்றுதல் (₹)' : language === 'hi' ? 'लोडिंग (₹)' : 'Loading (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={loadingCost}
                    onChange={(e) => setLoadingCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white font-black text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">
                    {language === 'ta' ? 'பிற செலவு (₹)' : language === 'hi' ? 'अन्य खर्च (₹)' : 'Other Costs (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white font-black text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>
                    {language === 'ta'
                      ? `மொத்த தொகை (${qty} ${unitDisplay} × ₹${bid.bidPricePerUnit}):`
                      : language === 'hi'
                      ? `कुल राशि (${qty} ${unitDisplay} × ₹${bid.bidPricePerUnit}):`
                      : `Gross Amount (${qty} ${unitDisplay} × ₹${bid.bidPricePerUnit}):`}
                  </span>
                  <span className="font-bold text-stone-900">₹{grossVal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {language === 'ta'
                      ? 'மதிப்பிடப்பட்ட மொத்த செலவுகள்:'
                      : language === 'hi'
                      ? 'अनुमानित कुल लागत:'
                      : 'Estimated Total Costs:'}
                  </span>
                  <span className="font-bold text-rose-700">−₹{totalCosts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 font-black text-emerald-900 text-sm">
                  <span>
                    {language === 'ta'
                      ? 'மதிப்பிடப்பட்ட நிகர வருமானம்:'
                      : language === 'hi'
                      ? 'अनुमानित शुद्ध आय (Estimated Net Realisation):'
                      : 'Estimated Net Realisation:'}
                  </span>
                  <span>₹{estTakeHome.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logistics & Payment info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-stone-700 mb-4">
        <div className="flex items-center gap-2 bg-stone-100/70 p-2.5 rounded-xl">
          <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="truncate">
            <span className="text-stone-500 block text-[11px] font-semibold">{t('Pickup')}</span>
            <span className="font-bold text-stone-900 truncate block">
              {translateText(bid.pickupPreference || bid.offeredPickupDate, language)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-stone-100/70 p-2.5 rounded-xl">
          <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="truncate">
            <span className="text-stone-500 block text-[11px] font-semibold">{t('Payment')}</span>
            <span className="font-bold text-stone-900 truncate block">
              {translateText(bid.paymentTerms, language)}
            </span>
          </div>
        </div>
      </div>

      {bid.notes && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-stone-800 mb-3">
          <span className="font-bold text-amber-900">{t('Buyer Note: ')}</span>
          {translateText(bid.notes, language)}
        </div>
      )}

      {/* Buyer Reliability Timeline (Buyer Activity) */}
      {!isBuyer && <BuyerActivitySection buyerName={bid.buyerName} />}

      {/* Farmer Actions (View Net Realisation / View Offer / Accept / Decline) */}
      {!readOnly && !isBuyer && (bid.status === 'pending' || bid.status === ('backup_offered' as any)) && (
        <div className="pt-3 border-t border-stone-200 flex flex-wrap sm:flex-nowrap items-center gap-2">
          <Button
            size="md"
            variant="outline"
            className="flex-1 font-bold"
            onClick={() => setShowTakeHome((prev) => !prev)}
          >
            {language === 'ta'
              ? 'நிகர வருமானத்தைக் காண்க'
              : language === 'hi'
              ? 'शुद्ध आय देखें'
              : 'View Net Realisation'}
          </Button>
          {onCounter && (
            <Button
              size="md"
              variant="outline"
              className="flex-1 font-bold"
              onClick={() => onCounter(bid)}
            >
              {t('View Offer')}
            </Button>
          )}
          <Button
            size="md"
            variant="success"
            className="flex-1 font-bold"
            icon={<Check className="w-5 h-5" />}
            onClick={() => onAccept?.(bid.id)}
          >
            {t('Accept')}
          </Button>
          <Button
            size="md"
            variant="danger"
            className="px-4 font-bold"
            icon={<X className="w-4 h-4" />}
            onClick={() => onReject?.(bid.id)}
          >
            {t('Decline')}
          </Button>
        </div>
      )}

      {/* Buyer Action (Cancel Pending Bid) */}
      {isBuyer && bid.status === 'pending' && onCancel && (
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 italic">
            {t('Waiting for farmer approval at village kiosk')}
          </span>
          <Button
            size="sm"
            variant="outline"
            icon={<Ban className="w-4 h-4 text-rose-600" />}
            onClick={() => onCancel(bid.id)}
          >
            {t('Cancel Bid')}
          </Button>
        </div>
      )}

      {/* Accepted State Notification */}
      {bid.status === 'accepted' && (
        <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t('Deal confirmed! Direct farm pickup unlocked.')}</span>
        </div>
      )}

      {/* Completed State Notification */}
      {bid.status === 'completed' && (
        <div className="pt-2 text-xs font-bold text-purple-800 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-purple-600" />
          <span>{t('Purchase completed & settled via UPI. Weighment slip archived.')}</span>
        </div>
      )}
    </div>
  );
};
