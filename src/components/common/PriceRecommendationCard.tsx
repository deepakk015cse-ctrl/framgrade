import React, { useState } from 'react';
import {
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { localizeCropName, localizeUnit } from '../../locales/translations';
import { WhyThisPriceModal } from './DecisionSupportTools';

export interface PriceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  impactPercentage: number;
  description: string;
}

export interface PriceRecommendationData {
  cropName: string;
  unit: string;
  currentMarketRange: {
    min: number;
    max: number;
    modal: number;
  };
  suggestedMinPrice: number;
  suggestedMaxPrice: number;
  expectedPrice: number;
  confidence: 'Low' | 'Medium' | 'High';
  confidenceScore: number;
  confidenceReason: string;
  explanation: string;
  majorFactors: PriceFactor[];
  modelVersion: string;
  isDemoEstimate: boolean;
  estimateLabel: string;
  disclaimer: string;
  historicalSeries?: any[];
  featuresUsed?: {
    quantity: number;
    qualityGrade: string;
    location: string;
    recentTrend: string;
    demandLevel: string;
    activeBuyersCount: number;
  };
}

interface PriceRecommendationCardProps {
  data: PriceRecommendationData;
  isLoading?: boolean;
  onRefresh?: () => void;
  showHistoricalChart?: boolean;
}

export const PriceRecommendationCard: React.FC<PriceRecommendationCardProps> = ({
  data,
}) => {
  const { language, addToast } = useApp();
  const [showFactorDetails, setShowFactorDetails] = useState<boolean>(false);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);

  const locCrop = localizeCropName(data.cropName, language);
  const locUnit = localizeUnit(data.unit, language);

  const getConfidenceBadge = (confidence: 'Low' | 'Medium' | 'High') => {
    switch (confidence) {
      case 'High':
        return {
          bg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
          dot: 'bg-emerald-600',
          label: language === 'ta' ? 'அதிகம் (High)' : language === 'hi' ? 'उच्च (High)' : 'High',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-100 border-amber-300 text-amber-900',
          dot: 'bg-amber-600',
          label:
            language === 'ta'
              ? 'நடுத்தரம் (Medium)'
              : language === 'hi'
              ? 'मध्यम (Medium)'
              : 'Medium',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-rose-100 border-rose-300 text-rose-900',
          dot: 'bg-rose-600',
          label:
            language === 'ta'
              ? 'குறைவு (Low)'
              : language === 'hi'
              ? 'कम (Low)'
              : 'Low',
        };
    }
  };

  const badge = getConfidenceBadge(data.confidence);

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-stone-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-7 shadow-sm text-left space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1">
            {language === 'ta'
              ? 'AI விலை மதிப்பீடு'
              : language === 'hi'
              ? 'AI मूल्य अनुमान'
              : 'AI Price Insight'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {locCrop}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <span>
              {language === 'ta'
                ? `நம்பகத்தன்மை: ${badge.label}`
                : language === 'hi'
                ? `विश्वसनीयता: ${badge.label}`
                : `Confidence: ${badge.label}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowWhyModal(true);
              addToast({
                type: 'info',
                title:
                  language === 'ta'
                    ? 'இந்த விலை ஏன்?'
                    : language === 'hi'
                    ? 'यह भाव क्यों?'
                    : 'Why This Price?',
                message:
                  language === 'ta'
                    ? 'விலை விளக்கம் தயாராக உள்ளது.'
                    : language === 'hi'
                    ? 'मूल्य स्पष्टीकरण उपलब्ध है।'
                    : 'Price explanation is available.',
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-black cursor-pointer shadow-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {language === 'ta'
                ? 'இந்த விலை ஏன்?'
                : language === 'hi'
                ? 'यह भाव क्यों?'
                : 'Why This Price?'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Pricing Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Market Price Box */}
        <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
            {language === 'ta'
              ? 'தற்போதைய சந்தை விலை'
              : language === 'hi'
              ? 'वर्तमान बाजार भाव'
              : 'Current Market Price'}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-800">
            ₹{data.currentMarketRange.modal}
            <span className="text-sm font-semibold text-stone-500"> / {locUnit}</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {language === 'ta'
              ? 'சந்தை வரம்பு: '
              : language === 'hi'
              ? 'बाजार सीमा: '
              : 'Market Range: '}
            <span className="font-bold text-stone-700">
              ₹{data.currentMarketRange.min} – ₹{data.currentMarketRange.max} / {locUnit}
            </span>
          </div>
        </div>

        {/* Expected Range Box with "Why This Price?" Button */}
        <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {language === 'ta'
                  ? 'எதிர்பார்க்கப்படும் விலை வரம்பு'
                  : language === 'hi'
                  ? 'अनुमानित मूल्य सीमा'
                  : 'Expected Price Range'}
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-800 text-amber-300">
                {language === 'ta'
                  ? 'மதிப்பீடு மட்டுமே'
                  : language === 'hi'
                  ? 'केवल अनुमानित'
                  : 'Estimated only'}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              ₹{data.suggestedMinPrice} – ₹{data.suggestedMaxPrice}
              <span className="text-sm font-semibold text-emerald-300"> / {locUnit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-800">
            <span className="text-xs text-emerald-200">
              {language === 'ta'
                ? 'கிடைக்கும் சந்தை தகவலின் அடிப்படையில்'
                : language === 'hi'
                ? 'उपलब्ध बाजार जानकारी के आधार पर'
                : 'Based on available market data'}
            </span>
            <button
              type="button"
              onClick={() => setShowWhyModal(true)}
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs cursor-pointer shrink-0"
            >
              {language === 'ta'
                ? 'இந்த விலை ஏன்?'
                : language === 'hi'
                ? 'यह भाव क्यों?'
                : 'Why This Price?'}
            </button>
          </div>
        </div>
      </div>

      {/* Reason Box */}
      <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 text-sm text-stone-800 space-y-1">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-stone-900 leading-snug">
              {language === 'ta'
                ? 'சமீபத்திய சந்தை விலைகள், இடம், அளவு மற்றும் தரத்தின் அடிப்படையில் கணக்கிடப்பட்டது.'
                : language === 'hi'
                ? 'हाल के बाजार भाव, स्थान, मात्रा और गुणवत्ता के आधार पर अनुमानित।'
                : 'Based on recent market prices, location, quantity and available market information.'}
            </p>
            {data.explanation && (
              <p className="text-xs text-stone-600 mt-1">{data.explanation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Major Factors */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowFactorDetails(!showFactorDetails)}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>
              {language === 'ta'
                ? `முக்கிய விலை காரணிகளைப் பார்க்கவும் (${data.majorFactors?.length || 4})`
                : language === 'hi'
                ? `प्रमुख मूल्य कारक देखें (${data.majorFactors?.length || 4})`
                : `View Major Factors & Influence Breakdown (${data.majorFactors?.length || 4})`}
            </span>
          </span>
          {showFactorDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showFactorDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-fadeIn">
            {data.majorFactors?.map((f, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-stone-900">{f.factor}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      f.impact === 'positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.impact === 'negative'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {f.impactPercentage > 0
                      ? `+${f.impactPercentage}%`
                      : f.impactPercentage < 0
                      ? `${f.impactPercentage}%`
                      : 'Anchor'}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Decision Support Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold">
          {language === 'ta'
            ? 'இது ஒரு மதிப்பீடு மட்டுமே, உறுதியான விற்பனை விலை அல்ல.'
            : language === 'hi'
            ? 'यह केवल एक अनुमान है, गारंटीकृत बिक्री मूल्य नहीं।'
            : 'This is an estimate, not a guaranteed selling price.'}
        </p>
      </div>

      {/* Why This Price Modal */}
      <WhyThisPriceModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        cropName={data.cropName}
        unit={data.unit}
        quantity={data.featuresUsed?.quantity || 300}
        quality={data.featuresUsed?.qualityGrade || 'Good'}
        location={data.featuresUsed?.location}
        currentMarketPrice={data.currentMarketRange?.modal}
        marketMin={data.currentMarketRange?.min}
        marketMax={data.currentMarketRange?.max}
        recentTrend={data.featuresUsed?.recentTrend}
        buyerDemand={data.featuresUsed?.demandLevel}
        expectedMin={data.suggestedMinPrice}
        expectedMax={data.suggestedMaxPrice}
        confidence={data.confidence}
      />
    </div>
  );
};
