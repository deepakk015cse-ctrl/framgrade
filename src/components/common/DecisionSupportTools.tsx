import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateOfferNetRealisation,
  compareBuyerOffersNetRealisation,
  evaluateWhatIfScenarios,
  generateExplainablePriceInsight,
  WhatIfScenarioInput,
  sanitizeNonNegativeNumber,
  sanitizeQuantity,
  sanitizePrice,
} from '../../services/decisionCalculations';
import { localizeCropName, localizeUnit, localizeQuality } from '../../locales/translations';
import { api } from '../../services/api';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Calculator,
  HelpCircle,
  Scale,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Plus,
  RotateCcw,
} from 'lucide-react';

// ============================================================================
// 1. WHY THIS PRICE? EXPLAINABLE AI PRICE INSIGHT MODAL & INLINE PANEL
// ============================================================================
export interface WhyThisPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string | number;
  cropName?: string;
  unit?: string;
  quantity?: number;
  quality?: string;
  location?: string;
  currentMarketPrice?: number | null;
  marketMin?: number | null;
  marketMax?: number | null;
  recentTrend?: string | null;
  buyerDemand?: string | null;
  expectedMin?: number | null;
  expectedMax?: number | null;
  confidence?: string | null;
}

export const WhyThisPriceModal: React.FC<WhyThisPriceModalProps> = ({
  isOpen,
  onClose,
  listingId,
  cropName = 'Tomato',
  unit = 'kg',
  quantity = 300,
  quality = 'Good',
  location,
  currentMarketPrice,
  marketMin,
  marketMax,
  recentTrend,
  buyerDemand,
  expectedMin = 24,
  expectedMax = 27,
  confidence = 'Medium',
}) => {
  const { language, bids, mandiPrices } = useApp();

  // Derive actual market price and buyer offers from AppContext if not explicitly passed
  const cleanCrop = (cropName || 'Tomato').split('(')[0].trim();
  const matchedMandi = useMemo(
    () =>
      mandiPrices.find((m) =>
        m.cropName.toLowerCase().includes(cleanCrop.toLowerCase())
      ) || null,
    [mandiPrices, cleanCrop]
  );

  const matchingBids = useMemo(
    () =>
      bids.filter(
        (b) =>
          b.status !== 'rejected' &&
          b.status !== 'cancelled' &&
          (listingId
            ? String(b.listingId) === String(listingId)
            : b.cropName.toLowerCase().includes(cleanCrop.toLowerCase()))
      ),
    [bids, listingId, cleanCrop]
  );

  const offersPrices = matchingBids.map((b) => b.bidPricePerUnit).filter((p) => p > 0);
  const offersMin = offersPrices.length > 0 ? Math.min(...offersPrices) : null;
  const offersMax = offersPrices.length > 0 ? Math.max(...offersPrices) : null;

  const actualMarketModal =
    currentMarketPrice !== undefined ? currentMarketPrice : matchedMandi?.modalPrice || null;
  const actualMarketMin =
    marketMin !== undefined ? marketMin : matchedMandi?.minPrice || null;
  const actualMarketMax =
    marketMax !== undefined ? marketMax : matchedMandi?.maxPrice || null;

  const actualTrend =
    recentTrend ||
    (actualMarketMin && actualMarketMax
      ? language === 'ta'
        ? `விலை சுமார் ₹${actualMarketMin}–₹${actualMarketMax}/${localizeUnit(unit, language)} ஆக உள்ளது`
        : language === 'hi'
        ? `भाव लगभग ₹${actualMarketMin}–₹${actualMarketMax}/${localizeUnit(unit, language)} के बीच रहे हैं`
        : `Prices have remained around ₹${actualMarketMin}–₹${actualMarketMax}/${unit}`
      : null);

  const actualDemand =
    buyerDemand ||
    (matchingBids.length >= 2
      ? language === 'ta'
        ? 'அதிகம்'
        : language === 'hi'
        ? 'अधिक (High)'
        : 'High'
      : matchingBids.length === 1
      ? language === 'ta'
        ? 'நடுத்தரம்'
        : language === 'hi'
        ? 'मध्यम (Medium)'
        : 'Moderate'
      : null);

  const insight = useMemo(
    () =>
      generateExplainablePriceInsight({
        cropName: cleanCrop,
        unit,
        currentMarketPrice: actualMarketModal,
        marketMin: actualMarketMin,
        marketMax: actualMarketMax,
        recentTrend: actualTrend,
        localMarketName: matchedMandi?.mandiName || null,
        buyerDemand: actualDemand,
        quantity,
        quality,
        location: location || matchedMandi?.district || null,
        nearbyOffersMin: offersMin,
        nearbyOffersMax: offersMax,
        nearbyOffersCount: matchingBids.length,
        expectedMin,
        expectedMax,
        confidence,
      }),
    [
      cleanCrop,
      unit,
      actualMarketModal,
      actualMarketMin,
      actualMarketMax,
      actualTrend,
      matchedMandi,
      actualDemand,
      quantity,
      quality,
      location,
      offersMin,
      offersMax,
      matchingBids.length,
      expectedMin,
      expectedMax,
      confidence,
    ]
  );

  if (!isOpen) return null;

  const locUnit = localizeUnit(unit, language);
  const locCrop = localizeCropName(cleanCrop, language);

  const translateFactorLabel = (key: string, defaultLabel: string) => {
    if (language === 'ta') {
      const mapTa: Record<string, string> = {
        current_market_price: 'தற்போதைய சந்தை விலை',
        recent_trend: 'சமீபத்திய போக்கு',
        historical_prices: 'வரலாற்று விலைகள்',
        local_market_conditions: 'உள்ளூர் சந்தை நிலவரம்',
        buyer_demand: 'வாங்குபவர் தேவை',
        produce_quantity: 'உங்கள் அளவு',
        produce_quality: 'தரம்',
        location: 'இடம்',
        nearby_offers: 'அருகிலுள்ள சலுகைகள்',
      };
      return mapTa[key] || defaultLabel;
    }
    if (language === 'hi') {
      const mapHi: Record<string, string> = {
        current_market_price: 'वर्तमान बाजार भाव',
        recent_trend: 'हाल का रुझान',
        historical_prices: 'ऐतिहासिक भाव',
        local_market_conditions: 'स्थानीय मंडी स्थिति',
        buyer_demand: 'खरीदार मांग',
        produce_quantity: 'आपकी मात्रा',
        produce_quality: 'गुणवत्ता',
        location: 'स्थान',
        nearby_offers: 'आस-पास के ऑफ़र',
      };
      return mapHi[key] || defaultLabel;
    }
    return defaultLabel;
  };

  const translateConfidence = (conf: string | null) => {
    if (!conf) return language === 'ta' ? 'குறைந்த தகவல்' : language === 'hi' ? 'सीमित जानकारी' : 'Limited Information';
    const c = conf.toLowerCase();
    if (language === 'ta') {
      if (c.includes('high')) return 'அதிகம் (High)';
      if (c.includes('medium')) return 'நடுத்தரம் (Medium)';
      return 'குறைவு / குறைந்த தகவல்';
    }
    if (language === 'hi') {
      if (c.includes('high')) return 'उच्च (High)';
      if (c.includes('medium')) return 'मध्यम (Medium)';
      return 'कम / सीमित जानकारी';
    }
    return conf;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'ta'
          ? `இந்த விலை ஏன்? — ${locCrop}`
          : language === 'hi'
          ? `यह भाव क्यों? — ${locCrop}`
          : `Why This Price? — ${locCrop}`
      }
      subtitle={
        language === 'ta'
          ? 'கிடைக்கும் சந்தை மற்றும் விளைபொருள் தகவல்களின் அடிப்படையில் கணக்கிடப்பட்ட மதிப்பீடு'
          : language === 'hi'
          ? 'उपलब्ध बाजार और उपज जानकारी के आधार पर मूल्य अनुमान'
          : 'Simple explanation of the available factors used to generate this estimate'
      }
    >
      <div className="space-y-4 text-left">
        {/* Top Summary: Estimated Range & Confidence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
              {language === 'ta'
                ? 'மதிப்பிடப்பட்ட விலை வரம்பு'
                : language === 'hi'
                ? 'अनुमानित मूल्य सीमा'
                : 'Estimated range'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {expectedMin && expectedMax
                ? `₹${expectedMin}–₹${expectedMax}/${locUnit}`
                : insight.expectedRangeText}
            </span>
            <span className="text-[11px] text-amber-300 font-bold block mt-0.5">
              {language === 'ta'
                ? 'மதிப்பீடு மட்டுமே (Estimated only)'
                : language === 'hi'
                ? 'केवल अनुमानित (Estimated only)'
                : 'Estimated only'}
            </span>
          </div>

          <div className="sm:border-l sm:border-emerald-800 sm:pl-4 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
              {language === 'ta'
                ? 'நம்பகத்தன்மை (Confidence)'
                : language === 'hi'
                ? 'विश्वसनीयता (Confidence)'
                : 'Confidence'}
            </span>
            <span className="text-lg font-black text-amber-300 mt-0.5">
              {translateConfidence(insight.confidence)}
            </span>
          </div>
        </div>

        {/* Limited Information Warning if applicable */}
        {insight.hasLimitedInformation && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {language === 'ta'
                ? 'இந்த மதிப்பீட்டிற்கு குறைந்த சந்தை தகவல்களே உள்ளன.'
                : language === 'hi'
                ? 'इस अनुमान के लिए सीमित बाजार जानकारी उपलब्ध है।'
                : 'Limited market information is available for this estimate.'}
            </span>
          </div>
        )}

        {/* Available Factors List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
            {language === 'ta'
              ? 'பயன்படுத்தப்பட்ட தற்போதைய காரணிகள்:'
              : language === 'hi'
              ? 'इस अनुमान में प्रयुक्त उपलब्ध कारक:'
              : 'Available factors used in this estimate:'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {insight.factors.map((f) => (
              <div
                key={f.key}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between"
              >
                <span className="text-xs font-bold text-stone-500">
                  {translateFactorLabel(f.key, f.label)}:
                </span>
                <span className="text-base font-black text-stone-900 mt-0.5">
                  {f.key === 'produce_quality' ? localizeQuality(f.value, language) : f.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Non-Guarantee Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            {language === 'ta'
              ? 'இது கிடைக்கும் தகவலின் அடிப்படையில் கணக்கிடப்பட்ட மதிப்பீடு மட்டுமே, உறுதியான விற்பனை விலை அல்ல.'
              : language === 'hi'
              ? 'यह केवल उपलब्ध आंकड़ों पर आधारित एक अनुमान है, गारंटीकृत बिक्री मूल्य नहीं।'
              : 'This is an estimate based on available data, not a guaranteed selling price.'}
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="md" variant="primary" onClick={onClose}>
            {language === 'ta' ? 'மூடு' : language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// 2. NET REALISATION CALCULATOR (Interactive Cost Editor & Buyer Comparison)
// ============================================================================
export interface NetRealisationCalculatorProps {
  listingId?: string | number;
  cropName?: string;
  quantity?: number;
  unit?: string;
  initialTransportCost?: number;
  initialLoadingCost?: number;
  initialOtherCost?: number;
  highlightBidId?: string;
  onSelectBuyer?: (bidId: string, buyerName: string, price: number) => void;
  compact?: boolean;
}

export const NetRealisationCalculator: React.FC<NetRealisationCalculatorProps> = ({
  listingId,
  cropName = 'Tomato',
  quantity: propQuantity = 300,
  unit = 'kg',
  initialTransportCost = 300,
  initialLoadingCost = 100,
  initialOtherCost = 0,
  highlightBidId,
  onSelectBuyer,
  compact = false,
}) => {
  const { language, bids, acceptBid, addToast } = useApp();

  const [quantity, setQuantity] = useState<number>(sanitizeQuantity(propQuantity, 300));
  const [transportInput, setTransportInput] = useState<string>(String(initialTransportCost));
  const [loadingInput, setLoadingInput] = useState<string>(String(initialLoadingCost));
  const [otherInput, setOtherInput] = useState<string>(String(initialOtherCost));

  useEffect(() => {
    setQuantity(sanitizeQuantity(propQuantity, 300));
  }, [propQuantity]);

  const cleanCrop = (cropName || 'Tomato').split('(')[0].trim();
  const locUnit = localizeUnit(unit, language);
  const locCrop = localizeCropName(cleanCrop, language);

  // Parse cost inputs safely; detect if cost inputs are cleared/empty
  const isCostEmpty =
    transportInput.trim() === '' && loadingInput.trim() === '' && otherInput.trim() === '';

  const transportCost =
    transportInput.trim() === '' ? null : sanitizeNonNegativeNumber(transportInput, 0);
  const loadingCost =
    loadingInput.trim() === '' ? null : sanitizeNonNegativeNumber(loadingInput, 0);
  const otherCost =
    otherInput.trim() === '' ? null : sanitizeNonNegativeNumber(otherInput, 0);

  // Get actual buyer offers from AppContext
  const activeOffers = useMemo(() => {
    const relevant = bids.filter(
      (b) =>
        b.status !== 'rejected' &&
        b.status !== 'cancelled' &&
        (listingId
          ? String(b.listingId) === String(listingId)
          : b.cropName.toLowerCase().includes(cleanCrop.toLowerCase()))
    );
    const sourceBids = relevant.length > 0 ? relevant : bids.filter((b) => b.status !== 'rejected' && b.status !== 'cancelled');

    return sourceBids.map((b: any) => {
      const isFarmGate =
        (b.pickupPreference || b.pickupOption || '').toLowerCase().includes('farm gate') ||
        (b.notes || '').toLowerCase().includes('farm gate');
      return {
        id: b.id,
        buyerName: b.buyerName,
        buyerCompany: b.buyerCompany || b.buyerBusiness || 'Verified Buyer',
        location: b.buyerLocation || b.location || 'Regional Market',
        distanceKm: b.distanceKm || 12,
        pickupOption: b.pickupPreference || b.pickupOption || 'Buyer Pickup / Delivery',
        paymentTerms: b.paymentTerms || 'Immediate UPI',
        bidPricePerUnit: b.bidPricePerUnit,
        quantity: quantity,
        unit,
        transportCost:
          transportCost !== null ? (isFarmGate && b.bidPricePerUnit <= 26 ? Math.min(transportCost, 150) : transportCost) : null,
        loadingCost,
        otherCost,
        status: b.status,
      };
    });
  }, [bids, listingId, cleanCrop, quantity, unit, transportCost, loadingCost, otherCost]);

  // Also calculate single-offer breakdown for the selected/top offer
  const focusOfferRaw =
    activeOffers.find((o) => o.id === highlightBidId) || activeOffers[0] || {
      id: 'default-offer',
      buyerName: 'Buyer Offer',
      bidPricePerUnit: 27,
      quantity,
      unit,
      transportCost,
      loadingCost,
      otherCost,
    };

  const singleCalculation = calculateOfferNetRealisation({
    ...focusOfferRaw,
    quantity,
    transportCost,
    loadingCost,
    otherCost,
  });

  const buyerComparison = useMemo(
    () =>
      compareBuyerOffersNetRealisation(
        activeOffers.map((o) => ({
          ...o,
          // Give each buyer realistic cost reflection based on their pickup distance if farmer uses default cost
          transportCost:
            transportCost !== null
              ? o.distanceKm && o.distanceKm <= 6
                ? Math.round(transportCost * 0.5)
                : transportCost
              : null,
          loadingCost,
          otherCost,
        })),
        undefined,
        quantity
      ),
    [activeOffers, transportCost, loadingCost, otherCost, quantity]
  );

  const handleRecalculateNotify = () => {
    addToast({
      type: 'price',
      title:
        language === 'ta'
          ? 'நிகர வருமானம் கணக்கிடப்பட்டது'
          : language === 'hi'
          ? 'शुद्ध आय की गणना की गई'
          : 'Net Realisation Calculated',
      message:
        language === 'ta'
          ? 'உங்கள் மதிப்பிடப்பட்ட நிகர வருமானம் கணக்கிடப்பட்டது.'
          : language === 'hi'
          ? 'आपकी अनुमानित शुद्ध आय की गणना कर ली गई है।'
          : 'Your estimated net realisation has been calculated.',
    });
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-xs text-left space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
            <Calculator className="w-4 h-4" />
            <span>
              {language === 'ta'
                ? 'நிகர வருமான கணிப்பான்'
                : language === 'hi'
                ? 'शुद्ध आय कैलकुलेटर (Net Realisation Calculator)'
                : 'Net Realisation Calculator'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
            {language === 'ta'
              ? `மதிப்பிடப்பட்ட நிகர வருமானம் (${quantity} ${locUnit} ${locCrop})`
              : language === 'hi'
              ? `अनुमानित शुद्ध आय (${quantity} ${locUnit} ${locCrop})`
              : `Estimated Net Realisation (${quantity} ${locUnit} ${locCrop})`}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {language === 'ta'
              ? 'வாங்குபவரின் விலையை மட்டும் பார்க்காமல், போக்குவரத்து மற்றும் ஏற்றுதல் செலவுகளுக்குப் பிறகு கைக்கு வரும் தொகையை ஒப்பிடுங்கள்.'
              : language === 'hi'
              ? 'केवल बोली मूल्य देखने के बजाय परिवहन और लोडिंग खर्च घटाने के बाद अपनी अनुमानित शुद्ध आय समझें।'
              : 'Understand your expected take-home amount after transport, loading, and other costs before choosing a buyer.'}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black self-start">
          {language === 'ta'
            ? 'மதிப்பீடு மட்டுமே (Estimated Only)'
            : language === 'hi'
            ? 'केवल अनुमानित (Estimated Only)'
            : 'Estimated Only'}
        </span>
      </div>

      {/* Missing Cost Information Notice (Requirement 10) */}
      {isCostEmpty && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs sm:text-sm font-bold text-amber-950 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <span>
            {language === 'ta'
              ? 'செலவு விவரம் இல்லை. நிகர வருமானத்தைக் கணக்கிட மதிப்பிடப்பட்ட செலவை உள்ளிடவும்.'
              : language === 'hi'
              ? 'लागत की जानकारी उपलब्ध नहीं है। शुद्ध आय की गणना करने के लिए अनुमानित लागत दर्ज करें।'
              : 'Cost information is not available. Enter the estimated cost to calculate net realisation.'}
          </span>
        </div>
      )}

      {/* Editable Cost & Quantity Inputs */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-stone-700">
            {language === 'ta'
              ? 'உங்கள் செலவுகளை உள்ளிடவும் / மாற்றவும்:'
              : language === 'hi'
              ? 'अपनी अनुमानित लागत दर्ज करें या बदलें:'
              : 'Enter or Edit Your Estimated Costs:'}
          </span>
          <button
            type="button"
            onClick={handleRecalculateNotify}
            className="text-xs font-black text-emerald-800 hover:underline cursor-pointer"
          >
            {language === 'ta'
              ? '✓ கணக்கீட்டைப் புதுப்பி'
              : language === 'hi'
              ? '✓ गणना अपडेट करें'
              : '✓ Update Calculation'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {language === 'ta'
                ? `அளவு (${locUnit})`
                : language === 'hi'
                ? `मात्रा (${locUnit})`
                : `Quantity (${locUnit})`}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(sanitizeQuantity(e.target.value, 1))}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-stone-900 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {language === 'ta'
                ? 'போக்குவரத்து செலவு (₹)'
                : language === 'hi'
                ? 'परिवहन लागत (₹)'
                : 'Transport Cost (₹)'}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={transportInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || Number(v) >= 0) setTransportInput(v);
              }}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-stone-900 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {language === 'ta'
                ? 'ஏற்றுதல்/இறக்குதல் செலவு (₹)'
                : language === 'hi'
                ? 'लोडिंग/अनलोडिंग लागत (₹)'
                : 'Loading Cost (₹)'}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={loadingInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || Number(v) >= 0) setLoadingInput(v);
              }}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-stone-900 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {language === 'ta'
                ? 'பிற செலவுகள் (₹)'
                : language === 'hi'
                ? 'अन्य लागत (₹)'
                : 'Other Costs (₹)'}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={otherInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || Number(v) >= 0) setOtherInput(v);
              }}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-stone-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Formula & Breakdown Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <span className="text-xs font-bold text-stone-500 block">
            {language === 'ta'
              ? 'மொத்த தொகை (Gross Amount)'
              : language === 'hi'
              ? 'कुल राशि (Gross Amount)'
              : 'Gross Amount'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-0.5 block">
            ₹{singleCalculation.grossAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-stone-500 font-semibold">
            ₹{singleCalculation.bidPricePerUnit}/{locUnit} × {singleCalculation.quantity} {locUnit}
          </span>
        </div>

        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <span className="text-xs font-bold text-stone-500 block">
            {language === 'ta'
              ? 'மதிப்பிடப்பட்ட மொத்த செலவுகள்'
              : language === 'hi'
              ? 'अनुमानित कुल लागत (Estimated Costs)'
              : 'Estimated Total Costs'}
          </span>
          <span className="text-2xl font-black text-rose-700 mt-0.5 block">
            −₹{singleCalculation.estimatedTotalCosts.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-stone-500 font-semibold">
            {language === 'ta'
              ? `போக்குவரத்து ₹${singleCalculation.transportCost} + ஏற்றுதல் ₹${singleCalculation.loadingCost} + பிற ₹${singleCalculation.otherCost}`
              : language === 'hi'
              ? `परिवहन ₹${singleCalculation.transportCost} + लोडिंग ₹${singleCalculation.loadingCost} + अन्य ₹${singleCalculation.otherCost}`
              : `Transport ₹${singleCalculation.transportCost} + Loading ₹${singleCalculation.loadingCost} + Other ₹${singleCalculation.otherCost}`}
          </span>
        </div>

        <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800">
          <span className="text-xs font-bold text-emerald-300 block">
            {language === 'ta'
              ? 'மதிப்பிடப்பட்ட நிகர வருமானம்'
              : language === 'hi'
              ? 'अनुमानित शुद्ध आय (Estimated Net)'
              : 'Estimated Net Realisation'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5 block">
            ₹{singleCalculation.expectedNetRealisation.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-200 font-semibold">
            ~₹{singleCalculation.netPerUnit}/{locUnit} ({singleCalculation.buyerName})
          </span>
        </div>
      </div>

      {/* Buyer-by-Buyer Net Realisation Comparison Cards */}
      {!compact && buyerComparison.offers.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
              {language === 'ta'
                ? 'வாங்குபவர்களின் நிகர வருமான ஒப்பீடு (உங்கள் முடிவுக்கு):'
                : language === 'hi'
                ? 'खरीदारों के बीच अनुमानित शुद्ध आय की तुलना (निर्णय आपका):'
                : 'Buyer Comparison by Estimated Net Realisation (Farmer Decides):'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {buyerComparison.offers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                  highlightBidId === offer.id
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-stone-200 bg-stone-50/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-black text-stone-900 text-sm">{offer.buyerName}</h5>
                      {offer.location && (
                        <span className="text-[11px] text-stone-500 font-semibold block">
                          {offer.location}
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-xs font-black text-emerald-900">
                      ₹{offer.bidPricePerUnit}/{locUnit}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-stone-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">
                        {language === 'ta' ? 'சலுகை விலை:' : language === 'hi' ? 'बोली भाव:' : 'Offer:'}
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{offer.bidPricePerUnit}/{locUnit} (₹{offer.grossAmount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">
                        {language === 'ta'
                          ? 'மதிப்பிடப்பட்ட செலவுகள்:'
                          : language === 'hi'
                          ? 'अनुमानित लागत:'
                          : 'Estimated costs:'}
                      </span>
                      <span className="font-bold text-rose-700">
                        ₹{offer.estimatedTotalCosts.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-stone-100">
                      <span className="font-black text-stone-800">
                        {language === 'ta'
                          ? 'மதிப்பிடப்பட்ட நிகர தொகை:'
                          : language === 'hi'
                          ? 'अनुमानित शुद्ध आय:'
                          : 'Estimated net:'}
                      </span>
                      <span className="font-black text-emerald-900 text-sm">
                        ₹{offer.expectedNetRealisation.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {offer.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (onSelectBuyer) {
                        onSelectBuyer(offer.id, offer.buyerName, offer.bidPricePerUnit);
                      } else {
                        acceptBid(offer.id);
                      }
                    }}
                  >
                    {language === 'ta'
                      ? 'இந்த வாங்குபவரைத் தேர்ந்தெடு'
                      : language === 'hi'
                      ? 'इस खरीदार को चुनें'
                      : 'Select Buyer'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Guarantee & Farmer Autonomy Footer */}
      <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 font-semibold flex items-center justify-between gap-2">
        <span>
          {language === 'ta'
            ? 'குறிப்பு: இது மதிப்பிடப்பட்ட நிகர வருமானம் மட்டுமே. எந்த வாங்குபவரைத் தேர்ந்தெடுப்பது என்பது விவசாயியின் முழு முடிவாகும்.'
            : language === 'hi'
            ? 'नोट: यह केवल अनुमानित शुद्ध आय है। किस खरीदार को चुनना है, यह पूरी तरह किसान का निर्णय है।'
            : 'Note: This is an Estimated Net Realisation, not a guaranteed final amount. Compare the buyers above and make your own decision.'}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 3. WHAT-IF SIMULATOR (Compare Multiple Selling Scenarios Side-by-Side)
// ============================================================================
export interface WhatIfSimulatorProps {
  cropName?: string;
  defaultQuantity?: number;
  unit?: string;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  cropName = 'Tomato',
  defaultQuantity = 300,
  unit = 'kg',
}) => {
  const { language, bids, addToast } = useApp();

  const cleanCrop = (cropName || 'Tomato').split('(')[0].trim();
  const locUnit = localizeUnit(unit, language);
  const locCrop = localizeCropName(cleanCrop, language);

  // Use actual bids to initialize Scenarios A, B, and C
  const activeBids = useMemo(
    () =>
      bids.filter(
        (b) =>
          b.status !== 'rejected' &&
          b.status !== 'cancelled' &&
          b.cropName.toLowerCase().includes(cleanCrop.toLowerCase())
      ),
    [bids, cleanCrop]
  );

  const buildInitialScenarios = (): WhatIfScenarioInput[] => {
    const b1 = activeBids[0];
    const b2 = activeBids[1];
    return [
      {
        id: 'scenario-a',
        scenarioName:
          language === 'ta' ? 'காட்சி A (Scenario A)' : language === 'hi' ? 'परिदृश्य A (Scenario A)' : 'Scenario A',
        buyerName: b1?.buyerName || 'Buyer A (Direct Offer)',
        quantity: sanitizeQuantity(defaultQuantity, 300),
        unit,
        bidPrice: b1?.bidPricePerUnit || 27,
        transportCost: 300,
        loadingCost: 100,
        otherCost: 0,
        sellingScenario: 'Sell Today — Buyer Delivery',
      },
      {
        id: 'scenario-b',
        scenarioName:
          language === 'ta' ? 'காட்சி B (Scenario B)' : language === 'hi' ? 'परिदृश्य B (Scenario B)' : 'Scenario B',
        buyerName: b2?.buyerName || 'Buyer B (Farm-Gate Pickup)',
        quantity: sanitizeQuantity(defaultQuantity, 300),
        unit,
        bidPrice: b2?.bidPricePerUnit || 26,
        transportCost: 150,
        loadingCost: 0,
        otherCost: 0,
        sellingScenario: 'Sell Today — Farm-Gate Pickup',
      },
      {
        id: 'scenario-c',
        scenarioName:
          language === 'ta' ? 'காட்சி C (Scenario C)' : language === 'hi' ? 'परिदृश्य C (Scenario C)' : 'Scenario C',
        buyerName: 'Custom Quantity / Mandi Option',
        quantity: sanitizeQuantity(defaultQuantity, 300),
        unit,
        bidPrice: 25,
        transportCost: 0,
        loadingCost: 100,
        otherCost: 50,
        sellingScenario: 'Different Cost / Timing Assumption',
      },
    ];
  };

  const [scenarios, setScenarios] = useState<WhatIfScenarioInput[]>(buildInitialScenarios);
  const [comparisonHighlighted, setComparisonHighlighted] = useState<boolean>(false);

  const evaluated = useMemo(() => evaluateWhatIfScenarios(scenarios), [scenarios]);

  const handleUpdateScenario = (
    id: string,
    field: keyof WhatIfScenarioInput,
    value: string | number
  ) => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== id) return sc;
        if (field === 'quantity') {
          return { ...sc, quantity: sanitizeQuantity(value, 1) };
        }
        if (
          field === 'bidPrice' ||
          field === 'transportCost' ||
          field === 'loadingCost' ||
          field === 'otherCost'
        ) {
          return { ...sc, [field]: sanitizeNonNegativeNumber(value, 0) };
        }
        return { ...sc, [field]: String(value) };
      })
    );
  };

  const handleCompareOptions = async () => {
    setComparisonHighlighted(true);
    try {
      await api.decision.compare(scenarios);
    } catch {
      // Local calculation is already synchronous and accurate
    }
    addToast({
      type: 'info',
      title:
        language === 'ta'
          ? 'ஒப்பீடு தயார்'
          : language === 'hi'
          ? 'तुलना तैयार है'
          : 'Comparison Ready',
      message:
        language === 'ta'
          ? 'உங்கள் வாங்குபவர் ஒப்பீடு தயாராக உள்ளது.'
          : language === 'hi'
          ? 'आपकी खरीदार तुलना तैयार है।'
          : 'Your buyer comparison is ready.',
    });
  };

  const handleAddScenario = () => {
    if (scenarios.length >= 5) return;
    const nextLetter = String.fromCharCode(65 + scenarios.length);
    setScenarios((prev) => [
      ...prev,
      {
        id: `scenario-${Date.now()}`,
        scenarioName: `Scenario ${nextLetter}`,
        buyerName: activeBids[0]?.buyerName || `Buyer ${nextLetter}`,
        quantity: sanitizeQuantity(defaultQuantity, 300),
        unit,
        bidPrice: 26,
        transportCost: 200,
        loadingCost: 50,
        otherCost: 0,
        sellingScenario: 'Custom Assumption',
      },
    ]);
  };

  return (
    <div
      id="what-if-simulator-section"
      className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-7 shadow-xs text-left space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
            <Sliders className="w-4 h-4" />
            <span>
              {language === 'ta'
                ? 'என்ன-என்றால் ஒப்பீட்டு உருவகப்படுத்தி (What-If Simulator)'
                : language === 'hi'
                ? 'क्या-अगर सिम्युलेटर (What-If Simulator)'
                : 'What-If Simulator'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
            {language === 'ta'
              ? `வெவ்வேறு விற்பனை சூழ்நிலைகளை ஒப்பிடுக (${locCrop})`
              : language === 'hi'
              ? `विभिन्न बिक्री स्थितियों की तुलना करें (${locCrop})`
              : `Compare Selling Scenarios Before Deciding (${locCrop})`}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {language === 'ta'
              ? 'அளவு, வாங்குபவர், விலை, போக்குவரத்து மற்றும் ஏற்றுதல் செலவுகளை மாற்றி நிகர வருமானத்தை உடனடியாக ஒப்பிட்டுப் பாருங்கள்.'
              : language === 'hi'
              ? 'मात्रा, खरीदार, बोली भाव, परिवहन और लोडिंग लागत बदलकर तुरंत अनुमानित शुद्ध आय की तुलना करें।'
              : 'Change quantity, buyer, bid price, transport, loading, or other costs to immediately compare Estimated Net Realisation across scenarios.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {scenarios.length < 5 && (
            <Button size="sm" variant="outline" onClick={handleAddScenario}>
              <Plus className="w-4 h-4 mr-1" />
              <span>
                {language === 'ta'
                  ? 'காட்சி சேர்'
                  : language === 'hi'
                  ? 'परिदृश्य जोड़ें'
                  : 'Add Scenario'}
              </span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setScenarios(buildInitialScenarios());
              setComparisonHighlighted(false);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>{language === 'ta' ? 'மீட்டமை' : language === 'hi' ? 'रीसेट' : 'Reset'}</span>
          </Button>
          <Button size="md" variant="primary" onClick={handleCompareOptions}>
            <Scale className="w-4 h-4 mr-1.5" />
            <span>
              {language === 'ta'
                ? 'விருப்பங்களை ஒப்பிடு (Compare Options)'
                : language === 'hi'
                ? 'विकल्पों की तुलना करें (Compare Options)'
                : 'Compare Options'}
            </span>
          </Button>
        </div>
      </div>

      {/* Interactive Scenario Editor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {evaluated.scenarios.map((sc) => (
          <div
            key={sc.id}
            className={`rounded-2xl border-2 p-4 space-y-3.5 transition-all ${
              comparisonHighlighted
                ? 'border-emerald-600 bg-emerald-50/30'
                : 'border-stone-200 bg-stone-50/70'
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <span className="px-2.5 py-1 rounded-full bg-emerald-900 text-white text-xs font-black">
                {sc.scenarioName}
              </span>
              <span className="text-xs font-bold text-stone-500">
                {language === 'ta'
                  ? 'மதிப்பீடு மட்டுமே'
                  : language === 'hi'
                  ? 'केवल अनुमानित'
                  : 'Estimated only'}
              </span>
            </div>

            {/* Editable Inputs */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'ta' ? 'வாங்குபவர் / விருப்பம்' : language === 'hi' ? 'खरीदार / विकल्प' : 'Buyer / Option'}
                </label>
                <input
                  type="text"
                  value={sc.buyerName}
                  onChange={(e) => handleUpdateScenario(sc.id, 'buyerName', e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {language === 'ta'
                      ? `விலை (₹/${locUnit})`
                      : language === 'hi'
                      ? `बोली भाव (₹/${locUnit})`
                      : `Bid Price (₹/${locUnit})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sc.bidPrice}
                    onChange={(e) => handleUpdateScenario(sc.id, 'bidPrice', e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-black text-emerald-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {language === 'ta'
                      ? `அளவு (${locUnit})`
                      : language === 'hi'
                      ? `मात्रा (${locUnit})`
                      : `Quantity (${locUnit})`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sc.quantity}
                    onChange={(e) => handleUpdateScenario(sc.id, 'quantity', e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-black text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-600 block mb-1">
                    {language === 'ta' ? 'போக்குவரத்து ₹' : language === 'hi' ? 'परिवहन ₹' : 'Transport ₹'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sc.transportCost}
                    onChange={(e) => handleUpdateScenario(sc.id, 'transportCost', e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">
                    {language === 'ta' ? 'ஏற்றுதல் ₹' : language === 'hi' ? 'लोडिंग ₹' : 'Loading ₹'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sc.loadingCost}
                    onChange={(e) => handleUpdateScenario(sc.id, 'loadingCost', e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 block mb-1">
                    {language === 'ta' ? 'பிற ₹' : language === 'hi' ? 'अन्य ₹' : 'Other ₹'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sc.otherCost}
                    onChange={(e) => handleUpdateScenario(sc.id, 'otherCost', e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'ta'
                    ? 'விற்பனை சூழல் / நேரம்'
                    : language === 'hi'
                    ? 'बिक्री परिदृश्य / समय'
                    : 'Selling Scenario / Timing'}
                </label>
                <select
                  value={sc.sellingScenario}
                  onChange={(e) => handleUpdateScenario(sc.id, 'sellingScenario', e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
                >
                  <option value="Sell Today — Buyer Delivery">
                    {language === 'ta'
                      ? 'இன்றே விற்பனை — நேரில் விநியோகம்'
                      : language === 'hi'
                      ? 'आज बेचें — खरीदार डिलीवरी'
                      : 'Sell Today — Buyer Delivery'}
                  </option>
                  <option value="Sell Today — Farm-Gate Pickup">
                    {language === 'ta'
                      ? 'இன்றே விற்பனை — பண்ணை வாயில் எடுப்பு'
                      : language === 'hi'
                      ? 'आज बेचें — फार्म गेट पिकअप'
                      : 'Sell Today — Farm-Gate Pickup'}
                  </option>
                  <option value="Different Cost / Timing Assumption">
                    {language === 'ta'
                      ? 'மாற்று செலவு / அளவு கணக்கீடு'
                      : language === 'hi'
                      ? 'अलग लागत / मात्रा अनुमान'
                      : 'Different Cost / Timing Assumption'}
                  </option>
                  <option value="Wait 2–3 Days (If Safe Storage Available)">
                    {language === 'ta'
                      ? '2–3 நாட்கள் காத்திருப்பு (சேமிப்பு இருந்தால்)'
                      : language === 'hi'
                      ? '2–3 दिन प्रतीक्षा (यदि भंडारण हो)'
                      : 'Wait 2–3 Days (If Safe Storage Available)'}
                  </option>
                </select>
              </div>
            </div>

            {/* Immediate Calculation Output */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">
                  {language === 'ta' ? 'மொத்த தொகை:' : language === 'hi' ? 'कुल राशि:' : 'Gross Amount:'}
                </span>
                <span className="font-bold text-stone-900">
                  ₹{sc.grossAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">
                  {language === 'ta'
                    ? 'மதிப்பிடப்பட்ட செலவுகள்:'
                    : language === 'hi'
                    ? 'अनुमानित लागत:'
                    : 'Estimated Costs:'}
                </span>
                <span className="font-bold text-rose-700">
                  −₹{sc.estimatedCosts.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-stone-200 items-baseline">
                <span className="font-black text-stone-900">
                  {language === 'ta'
                    ? 'மதிப்பிடப்பட்ட நிகர வருமானம்:'
                    : language === 'hi'
                    ? 'अनुमानित शुद्ध आय:'
                    : 'Estimated Net:'}
                </span>
                <span className="text-lg font-black text-emerald-900">
                  ₹{sc.estimatedNetRealisation.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {sc.isFutureScenario && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-semibold">
                {language === 'ta'
                  ? 'எதிர்கால விலை உறுதியானது அல்ல. சந்தை நிலவரம் மாறலாம்.'
                  : language === 'hi'
                  ? 'भविष्य के भाव की गारंटी नहीं दी जा सकती। बाजार बदल सकता है।'
                  : 'Future price information cannot be guaranteed. Outcome depends on market arrivals.'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clean Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-stone-100 text-stone-700 uppercase font-black text-[11px] border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">
                {language === 'ta' ? 'காட்சி' : language === 'hi' ? 'परिदृश्य' : 'Scenario'}
              </th>
              <th className="py-3 px-4">
                {language === 'ta' ? 'வாங்குபவர்' : language === 'hi' ? 'खरीदार' : 'Buyer'}
              </th>
              <th className="py-3 px-4">
                {language === 'ta' ? 'விலை' : language === 'hi' ? 'बोली भाव' : 'Bid Price'}
              </th>
              <th className="py-3 px-4">
                {language === 'ta' ? 'மொத்த தொகை' : language === 'hi' ? 'कुल राशि' : 'Gross Amount'}
              </th>
              <th className="py-3 px-4">
                {language === 'ta'
                  ? 'மதிப்பிடப்பட்ட செலவு'
                  : language === 'hi'
                  ? 'अनुमानित लागत'
                  : 'Estimated Costs'}
              </th>
              <th className="py-3 px-4">
                {language === 'ta'
                  ? 'மதிப்பிடப்பட்ட நிகர வருமானம்'
                  : language === 'hi'
                  ? 'अनुमानित शुद्ध आय'
                  : 'Estimated Net Realisation'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {evaluated.scenarios.map((sc) => (
              <tr key={sc.id} className="hover:bg-stone-50">
                <td className="py-3 px-4 font-black text-stone-900">{sc.scenarioName}</td>
                <td className="py-3 px-4 font-bold text-stone-800">{sc.buyerName}</td>
                <td className="py-3 px-4 font-bold text-emerald-900">
                  ₹{sc.bidPrice}/{locUnit} ({sc.quantity} {locUnit})
                </td>
                <td className="py-3 px-4 font-bold text-stone-900">
                  ₹{sc.grossAmount.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-bold text-rose-700">
                  −₹{sc.estimatedCosts.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-black text-emerald-900 text-base">
                  ₹{sc.estimatedNetRealisation.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Non-Prediction Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 font-semibold flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <span>
          {language === 'ta'
            ? 'காத்திருப்பதால் அதிக விலை கிடைக்கும் என்று உறுதியாகக் கூற முடியாது. எதிர்கால சந்தை விளைவுகளுக்கு உத்தரவாதம் இல்லை. இறுதி முடிவு விவசாயியுடையது.'
            : language === 'hi'
            ? 'प्रतीक्षा करने से निश्चित रूप से अधिक कीमत मिलेगी, इसका दावा नहीं किया जा सकता। भविष्य के परिणामों की गारंटी नहीं है। अंतिम निर्णय किसान का है।'
            : 'Waiting does not guarantee a higher price, and future market outcomes cannot be guaranteed. Compare these scenarios and make your own selling decision.'}
        </span>
      </div>
    </div>
  );
};
