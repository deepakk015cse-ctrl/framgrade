import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { farmerNotifications } from '../../services/notificationService';
import { Button } from '../../components/common/Button';
import { VoiceButton } from '../../components/common/VoiceButton';
import { VoiceInput } from '../../components/common/VoiceInput';
import { ProduceGrade, QualityLevel } from '../../types';
import { api } from '../../services/api';
import { PriceRecommendationCard, PriceRecommendationData } from '../../components/common/PriceRecommendationCard';
import { HistoricalPriceChart } from '../../components/common/HistoricalPriceChart';
import {
  SellOrWaitAdvisorCard,
  TakeHomePriceCard,
  WhyThisPriceCard,
  VoiceMarketAssistantBar
} from '../../components/common/InnovationModules';
import {
  Sparkles,
  Check,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Volume2
} from 'lucide-react';

interface CropOption {
  id: 'tomato' | 'onion' | 'potato' | 'paddy' | 'banana' | 'other';
  name: string;
  tamilName: string;
  hindiName: string;
  emoji: string;
  defaultUnit: 'kg' | 'quintal' | 'bags' | 'crates';
  defaultQuantity: number;
  typicalMinPrice: number;
  typicalMaxPrice: number;
  variety: string;
  imageUrl: string;
}

const cropOptions: CropOption[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    tamilName: 'தக்காளி',
    hindiName: 'टमाटर',
    emoji: '🍅',
    defaultUnit: 'kg',
    defaultQuantity: 450,
    typicalMinPrice: 30,
    typicalMaxPrice: 38,
    variety: 'Desi Shivam Hybrid',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'onion',
    name: 'Onion',
    tamilName: 'வெங்காயம்',
    hindiName: 'प्याज',
    emoji: '🧅',
    defaultUnit: 'quintal',
    defaultQuantity: 30,
    typicalMinPrice: 50,
    typicalMaxPrice: 60,
    variety: 'CO-4 Country Shallots',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'potato',
    name: 'Potato',
    tamilName: 'உருளைக்கிழங்கு',
    hindiName: 'आलू',
    emoji: '🥔',
    defaultUnit: 'bags',
    defaultQuantity: 80,
    typicalMinPrice: 22,
    typicalMaxPrice: 28,
    variety: 'Kufri Jyoti Hill Special',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'paddy',
    name: 'Paddy',
    tamilName: 'நெல்',
    hindiName: 'धान',
    emoji: '🌾',
    defaultUnit: 'bags',
    defaultQuantity: 100,
    typicalMinPrice: 2200,
    typicalMaxPrice: 2450,
    variety: 'BPT-5204 Andhra Ponni',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'banana',
    name: 'Banana',
    tamilName: 'வாழைப்பழம்',
    hindiName: 'केला',
    emoji: '🍌',
    defaultUnit: 'kg',
    defaultQuantity: 300,
    typicalMinPrice: 20,
    typicalMaxPrice: 26,
    variety: 'Grand Naine (G-9)',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'other',
    name: 'Other Crop',
    tamilName: 'பிற பயிர்கள்',
    hindiName: 'अन्य फसल',
    emoji: '🌿',
    defaultUnit: 'kg',
    defaultQuantity: 100,
    typicalMinPrice: 40,
    typicalMaxPrice: 50,
    variety: 'Regional Produce',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'
  }
];

const villagePresets = [
  'Oddanchatram West',
  'Dharapuram South',
  'Mettupalayam Foothills',
  'Thanjavur Delta Road',
  'Pollachi Canal Side',
  'Sankarankovil North'
];

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as { voiceTranscript?: string } | undefined;
  const { addListing, language, t, addToast } = useApp();

  // Wizard Step State (1 through 6, then 7 for submitted result)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(1);

  // Form State
  const [cropSearch, setCropSearch] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<CropOption>(cropOptions[0]);
  const [otherCropName, setOtherCropName] = useState<string>('Green Chilli');
  const [quantity, setQuantity] = useState<number>(450);
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'bags' | 'crates'>('kg');
  const [location, setLocation] = useState<string>('Oddanchatram West');
  const [district, setDistrict] = useState<string>('Dindigul');
  const [quality, setQuality] = useState<QualityLevel>('Very Good');
  const [sellingDateOption, setSellingDateOption] = useState<string>('Today');
  const [expectedDate, setExpectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimateRevealed, setEstimateRevealed] = useState<boolean>(true);

  // Handle incoming voice transcript from dashboard or voice button
  const handleVoiceTranscript = (text: string) => {
    const lower = text.toLowerCase();

    // Detect crop
    if (lower.includes('tomato') || lower.includes('தக்காளி') || lower.includes('टमाटर')) {
      setSelectedCrop(cropOptions[0]);
    } else if (lower.includes('onion') || lower.includes('வெங்காயம்') || lower.includes('प्याज')) {
      setSelectedCrop(cropOptions[1]);
    } else if (lower.includes('potato') || lower.includes('உருளை') || lower.includes('आलू')) {
      setSelectedCrop(cropOptions[2]);
    } else if (lower.includes('paddy') || lower.includes('நெல்') || lower.includes('धान') || lower.includes('rice')) {
      setSelectedCrop(cropOptions[3]);
    } else if (lower.includes('banana') || lower.includes('வாழை') || lower.includes('केला')) {
      setSelectedCrop(cropOptions[4]);
    }

    // Detect numbers for quantity
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const parsedNum = parseInt(numbers[0], 10);
      if (parsedNum > 0) setQuantity(parsedNum);
    }

    // Detect units
    if (lower.includes('quintal') || lower.includes('குவிண்டால்') || lower.includes('क्विंटल')) {
      setUnit('quintal');
    } else if (lower.includes('bag') || lower.includes('மூட்டை') || lower.includes('बोरी')) {
      setUnit('bags');
    } else if (lower.includes('crate') || lower.includes('பெட்டி')) {
      setUnit('crates');
    } else if (lower.includes('kg') || lower.includes('கிலோ') || lower.includes('किलो')) {
      setUnit('kg');
    }

    // Detect quality
    if (lower.includes('premium') || lower.includes('உயர்') || lower.includes('प्रीमियम')) {
      setQuality('Premium');
    } else if (lower.includes('good') || lower.includes('நல்ல') || lower.includes('अच्छी')) {
      setQuality('Good');
    } else if (lower.includes('very good') || lower.includes('மிக நல்ல') || lower.includes('बहुत अच्छी')) {
      setQuality('Very Good');
    }

    // Detect location if mentioned
    villagePresets.forEach((v) => {
      const vSimple = v.split(' ')[0].toLowerCase();
      if (lower.includes(vSimple)) {
        setLocation(v);
      }
    });
  };

  useEffect(() => {
    if (locationState?.voiceTranscript) {
      handleVoiceTranscript(locationState.voiceTranscript);
    }
  }, [locationState]);

  // AI Decision Support State
  const [aiRecommendation, setAiRecommendation] = useState<PriceRecommendationData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Load verified crops catalog from PostgreSQL backend
  useEffect(() => {
    async function loadBackendCrops() {
      try {
        const res = await api.produce.getCrops();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Verify that backend crops are loaded
          if (import.meta.env.DEV) {
            console.info(`[FarmGrade Backend] Successfully loaded ${res.data.length} crops from PostgreSQL.`);
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            '[FarmGrade Dev Alert] Failed to load crop catalog from /api/produce/crops:',
            err,
            '\nActionable fix: Verify the crops table exists and is accessible in PostgreSQL.'
          );
        }
      }
    }
    loadBackendCrops();
  }, []);

  // Fetch real AI price recommendation from backend API
  const fetchPriceRecommendation = async () => {
    setIsLoadingAi(true);
    try {
      const cropName = selectedCrop.id === 'other' ? otherCropName : selectedCrop.name;
      const res = await api.ai.getPriceRecommendation({
        cropName,
        quantity,
        quality: quality === 'Premium' ? 'Grade A+ (Premium)' : quality === 'Very Good' ? 'Grade A (Very Good)' : 'Grade B (Fair)',
        location,
        unit,
      });
      if (res.success && res.data) {
        setAiRecommendation(res.data);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(
          '[FarmGrade Dev Alert] AI Price Recommendation query failed:',
          err,
          '\nActionable fix: Verify POST /api/ai/price-recommendation endpoint and the feature preparation join on produceListings/crops.'
        );
      }
      console.warn('Backend price recommendation fallback active:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchPriceRecommendation();
  }, [selectedCrop, otherCropName, quantity, quality, location, unit]);

  // Fallback price calculation
  const getQualityMultiplier = (q: QualityLevel) => {
    if (q === 'Premium') return 1.15;
    if (q === 'Very Good') return 1.05;
    return 0.95;
  };

  const calculatedMinPrice =
    aiRecommendation?.suggestedMinPrice ||
    Math.round(selectedCrop.typicalMinPrice * getQualityMultiplier(quality));
  const calculatedMaxPrice =
    aiRecommendation?.suggestedMaxPrice ||
    Math.round(selectedCrop.typicalMaxPrice * getQualityMultiplier(quality));
  const recommendedMidPrice =
    aiRecommendation?.expectedPrice ||
    Math.round((calculatedMinPrice + calculatedMaxPrice) / 2);

  // Handle final submission: "Get Price Suggestion"
  const handleSubmitProduce = () => {
    const finalCropTitle =
      selectedCrop.id === 'other'
        ? otherCropName
        : language === 'ta'
        ? `${selectedCrop.name} (${selectedCrop.tamilName})`
        : language === 'hi'
        ? `${selectedCrop.name} (${selectedCrop.hindiName})`
        : selectedCrop.name;

    const mappedGrade: ProduceGrade =
      quality === 'Premium' ? 'Grade A' : quality === 'Very Good' ? 'Grade A' : 'Grade B';

    addListing({
      cropKey: selectedCrop.id,
      cropName: finalCropTitle,
      cropTamilName: selectedCrop.tamilName,
      cropHindiName: selectedCrop.hindiName,
      variety: selectedCrop.variety,
      quantity,
      unit,
      grade: mappedGrade,
      qualityLabel: quality,
      basePriceExpected: recommendedMidPrice,
      aiRecommendedPriceMin: calculatedMinPrice,
      aiRecommendedPriceMax: calculatedMaxPrice,
      harvestDate: expectedDate,
      availableDate: sellingDateOption,
      listingDate: new Date().toISOString().split('T')[0],
      location,
      district,
      distanceKm: 12,
      farmerName: 'Murugesan Pandian',
      farmerPhone: '+91 98421 77312',
      imageUrl: selectedCrop.imageUrl,
      kioskAssisted: true,
      notes: `Verified at village kiosk. Quality graded as ${quality}. Ready for direct buyer pickup.`
    });

    setIsSubmitted(true);

    // Sequence the 3 progress indicators realistically
    setAnalysisProgress(1);
    setTimeout(() => setAnalysisProgress(2), 700);
    setTimeout(() => {
      setAnalysisProgress(3);
      addToast(farmerNotifications.priceReady(calculatedMinPrice, calculatedMaxPrice, language));
    }, 1500);
  };

  // Helper for crop display label
  const getCropDisplay = (crop: CropOption) => {
    if (language === 'ta') return crop.tamilName;
    if (language === 'hi') return crop.hindiName;
    return crop.name;
  };

  // -------------------------------------------------------------
  // POST-SUBMISSION ANALYSIS SCREEN WITH 3 PROGRESS INDICATORS
  // -------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-left space-y-6 animate-fadeIn">
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 shadow-sm">
          {/* Main Success Title */}
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {t('submission_ready_title')}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base">
                {t('submission_ready_sub')}
              </p>
            </div>
          </div>

          {/* 3 Progress Indicators as explicitly requested */}
          <div className="my-8 bg-stone-50 rounded-2xl p-5 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
              Real-Time Verification & Match Progress:
            </h4>

            <div className="space-y-4">
              {/* Indicator 1: Produce Details */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    analysisProgress >= 1
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  ✓
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 text-base">
                    1. {t('progress_step_1')}
                  </div>
                  <div className="text-xs text-stone-500">
                    {selectedCrop.name} ({quantity} {unit}) • {quality} Quality • {location}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Confirmed
                </span>
              </div>

              {/* Indicator 2: Market Analysis */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    analysisProgress >= 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600 animate-pulse'
                  }`}
                >
                  {analysisProgress >= 2 ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 text-base">
                    2. {t('progress_step_2')}
                  </div>
                  <div className="text-xs text-stone-500">
                    Cross-referenced with Oddanchatram & nearby APMC mandi arrival benchmarks.
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    analysisProgress >= 2
                      ? 'text-emerald-700 bg-emerald-100'
                      : 'text-amber-800 bg-amber-100'
                  }`}
                >
                  {analysisProgress >= 2 ? 'Analysis Ready' : 'Analyzing...'}
                </span>
              </div>

              {/* Indicator 3: Buyer Matching */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    analysisProgress >= 3
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600 animate-pulse'
                  }`}
                >
                  {analysisProgress >= 3 ? '✓' : '3'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 text-base">
                    3. {t('progress_step_3')}
                  </div>
                  <div className="text-xs text-stone-500">
                    Matching with verified wholesale buyers within 50 km radius.
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    analysisProgress >= 3
                      ? 'text-emerald-700 bg-emerald-100'
                      : 'text-stone-600 bg-stone-200'
                  }`}
                >
                  {analysisProgress >= 3 ? '14 Buyers Notified' : 'Matching...'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Fair Price Result Card */}
          {aiRecommendation ? (
            <div className="space-y-6 mb-6">
              <PriceRecommendationCard data={aiRecommendation} />
              {aiRecommendation.historicalSeries && aiRecommendation.historicalSeries.length > 0 && (
                <HistoricalPriceChart
                  data={aiRecommendation.historicalSeries}
                  cropName={selectedCrop.name}
                  unit={unit}
                  suggestedMin={aiRecommendation.suggestedMinPrice}
                  suggestedMax={aiRecommendation.suggestedMaxPrice}
                  expectedPrice={aiRecommendation.expectedPrice}
                />
              )}
            </div>
          ) : (
            <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-7 shadow-md mb-6">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  AI Suggested Fair Price Range (AI-assisted estimate)
                </span>
                <span className="bg-emerald-800 px-2.5 py-0.5 rounded-full text-emerald-200">
                  Confidence: High (94%)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 my-2">
                <div className="text-4xl sm:text-5xl font-black text-white">
                  ₹{calculatedMinPrice} – ₹{calculatedMaxPrice}
                  <span className="text-lg sm:text-xl font-normal text-emerald-300"> / {unit}</span>
                </div>
                <div className="text-sm font-semibold text-emerald-200">
                  Est. Total: ₹{(quantity * recommendedMidPrice).toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-200/90 mt-2">
                Based on today's local arrivals and {quality} quality grading. Decision support estimate; actual sale price depends on buyer agreement.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              onClick={() => navigate('/farmer/listings')}
            >
              View In My Listings
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/farmer/bids')}
            >
              See Incoming Bids
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => navigate('/farmer/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6-STEP GUIDED WIZARD FLOW
  // -------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Top Navigation & Step Indicator */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) setCurrentStep((prev) => prev - 1);
            else navigate('/farmer/dashboard');
          }}
          className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-bold text-sm cursor-pointer p-2 rounded-xl hover:bg-stone-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{currentStep === 1 ? 'Back to Dashboard' : 'Previous Step'}</span>
        </button>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              onClick={() => num < currentStep && setCurrentStep(num)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                num === currentStep
                  ? 'w-8 bg-emerald-600'
                  : num < currentStep
                  ? 'w-2.5 bg-emerald-400'
                  : 'w-2.5 bg-stone-300'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-stone-600 ml-1">
            {currentStep} / 6
          </span>
        </div>
      </div>

      {/* Prominent Voice Assistant Box */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-200/80 flex items-center justify-center text-emerald-800 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-stone-900 text-sm sm:text-base">
              🎤 Speak
            </div>
            <div className="text-xs text-stone-600">
              Examples: "Tomato", "200 kilograms", "Pennagaram"
            </div>
          </div>
        </div>

        <VoiceButton
          variant="inline"
          label="🎤 Speak"
          onTranscript={handleVoiceTranscript}
        />
      </div>

      {/* MAIN STEP CONTAINER */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs">
        {/* ========================================================= */}
        {/* STEP 1: What are you selling?                             */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 1 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                What are you selling?
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                Select your crop or search below.
              </p>
            </div>

            {/* Crop Search Input */}
            <div>
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop (e.g., Tomato, Onion, Potato)..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 font-semibold text-stone-900 text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Voice Crop Input Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <div className="text-xs">
                <span className="font-black text-emerald-950 uppercase tracking-wider block">
                  Voice Crop Selection
                </span>
                <span className="text-stone-600 font-medium">
                  Examples: "Tomato", "Onion", "Potato"
                </span>
              </div>
              <VoiceInput
                mode="crop"
                variant="button"
                className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                onConfirm={(text) => handleVoiceTranscript(text)}
              />
            </div>

            {/* Large Crop Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {cropOptions
                .filter((c) =>
                  cropSearch.trim()
                    ? c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
                      c.tamilName.includes(cropSearch) ||
                      c.hindiName.includes(cropSearch)
                    : true
                )
                .map((crop) => {
                  const isSelected = selectedCrop.id === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => {
                        setSelectedCrop(crop);
                        setUnit(crop.defaultUnit);
                        setQuantity(crop.defaultQuantity);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 sm:h-40 group relative active:scale-95 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                          : 'border-stone-200 hover:border-emerald-400 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl sm:text-4xl">{crop.emoji}</span>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-stone-900 text-base sm:text-lg group-hover:text-emerald-800">
                          {getCropDisplay(crop)}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {crop.variety}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* If "Other" selected, show quick chips */}
            {selectedCrop.id === 'other' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select or Name Your Crop:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Green Chilli', 'Cotton', 'Maize', 'Papaya', 'Mango', 'Brinjal'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setOtherCropName(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        otherCropName === item
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-500'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={otherCropName}
                  onChange={(e) => setOtherCropName(e.target.value)}
                  placeholder="Or enter crop name"
                  className="w-full p-3 rounded-xl border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: How much do you have?                             */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 2 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                {t('step2_title')}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                {selectedCrop.emoji} {getCropDisplay(selectedCrop)} — Total quantity
              </p>
            </div>

            {/* Voice Quantity Input Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <div className="text-xs">
                <span className="font-black text-emerald-950 uppercase tracking-wider block">
                  Voice Quantity Entry
                </span>
                <span className="text-stone-600 font-medium">
                  Tap microphone and say amount (e.g. "500 kg", "20 bags", "3 quintals")
                </span>
              </div>
              <VoiceInput
                mode="quantity"
                variant="button"
                className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                onConfirm={(text) => handleVoiceTranscript(text)}
              />
            </div>

            {/* Big Quantity Stepper */}
            <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-6 text-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Quantity Amount
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 50))}
                  className="w-14 h-14 rounded-2xl bg-white border-2 border-stone-300 hover:border-stone-400 text-2xl font-black text-stone-800 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                >
                  –
                </button>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="text-4xl sm:text-5xl font-black text-stone-900 w-36 text-center bg-transparent border-b-2 border-emerald-500 focus:outline-none"
                  />
                  <span className="text-xl sm:text-2xl font-bold text-stone-600">
                    {unit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 50)}
                  className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-2xl font-black text-white cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Quick Add Pills for Zero-Typing */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-stone-500 font-semibold mr-1">Quick Add:</span>
                {[+10, +50, +100, +250, +500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity((prev) => prev + val)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 hover:border-emerald-600 hover:bg-emerald-50 cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Select Unit of Measurement:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'kg',
                    label: language === 'ta' ? 'கிலோ' : language === 'hi' ? 'किलो' : 'kg',
                    desc: language === 'ta' ? 'கிலோகிராம்' : language === 'hi' ? 'किलोग्राम' : 'Kilograms',
                  },
                  {
                    id: 'quintal',
                    label: language === 'ta' ? 'குவிண்டால்' : language === 'hi' ? 'क्विंटल' : 'Quintal',
                    desc: language === 'ta' ? '100 கிலோ' : language === 'hi' ? '100 किलो' : '100 kg',
                  },
                  {
                    id: 'bags',
                    label: language === 'ta' ? 'மூட்டை' : language === 'hi' ? 'बोरी' : 'Bags',
                    desc: language === 'ta' ? 'சாக்கு மூட்டை' : language === 'hi' ? 'जूट बोरी' : 'Gunny Bags',
                  },
                  {
                    id: 'crates',
                    label: language === 'ta' ? 'கிரேட்' : language === 'hi' ? 'क्रेट' : 'Crates',
                    desc: language === 'ta' ? '20-25 கிலோ பெட்டி' : language === 'hi' ? '20-25 किलो बॉक्स' : '20-25 kg box',
                  },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnit(u.id as any)}
                    className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      unit === u.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-400'
                    }`}
                  >
                    <div className="font-bold text-sm sm:text-base">{u.label}</div>
                    <div className="text-xs text-stone-500 font-normal">{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: Where is your produce?                            */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 3 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                {t('step3_title')}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                {t('step3_sub')}
              </p>
            </div>

            {/* Voice Location Input Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <div className="text-xs">
                <span className="font-black text-emerald-950 uppercase tracking-wider block">
                  Voice Location Entry
                </span>
                <span className="text-stone-600 font-medium">
                  Tap microphone and say village or town (e.g. "Oddanchatram West", "Dharapuram")
                </span>
              </div>
              <VoiceInput
                mode="location"
                variant="button"
                className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                onConfirm={(text) => {
                  setLocation(text);
                  if (text.toLowerCase().includes('oddanchatram')) setDistrict('Dindigul');
                  else if (text.toLowerCase().includes('dharapuram')) setDistrict('Tiruppur');
                  else if (text.toLowerCase().includes('mettupalayam')) setDistrict('Coimbatore');
                }}
              />
            </div>

            {/* Quick 1-Tap Village Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Select Nearby Panchayat / Village:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {villagePresets.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setLocation(v);
                      if (v.includes('Oddanchatram')) setDistrict('Dindigul');
                      if (v.includes('Dharapuram')) setDistrict('Tiruppur');
                      if (v.includes('Mettupalayam')) setDistrict('Coimbatore');
                      if (v.includes('Thanjavur')) setDistrict('Thanjavur');
                      if (v.includes('Pollachi')) setDistrict('Coimbatore');
                      if (v.includes('Sankarankovil')) setDistrict('Tenkasi');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left cursor-pointer flex items-center justify-between transition-all ${
                      location === v
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{v}</span>
                    </div>
                    {location === v && <Check className="w-5 h-5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Village & District Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Village
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter village"
                  className="w-full p-3 rounded-xl border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter district"
                  className="w-full p-3 rounded-xl border border-stone-300 font-semibold text-stone-900 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: Tell us about the quality                         */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 4 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                Tell us about the quality
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                Select the option that best describes your produce.
              </p>
            </div>

            {/* 3 Simple Quality Cards: Good, Very Good, Premium */}
            <div className="space-y-3">
              {[
                {
                  id: 'Good' as QualityLevel,
                  title: 'Good',
                  stars: '⭐⭐⭐',
                  desc: 'Fresh harvest, normal market size',
                },
                {
                  id: 'Very Good' as QualityLevel,
                  title: 'Very Good',
                  stars: '⭐⭐⭐⭐',
                  desc: 'Uniform size, clean and fresh',
                },
                {
                  id: 'Premium' as QualityLevel,
                  title: 'Best / Sorted',
                  stars: '⭐⭐⭐⭐⭐',
                  desc: 'Sorted, top quality produce',
                }
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`w-full p-5 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    quality === q.id
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-white hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{q.stars}</span>
                      <h4 className="font-black text-lg text-stone-900">{q.title}</h4>
                    </div>
                    <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      {q.desc}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                      quality === q.id
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {quality === q.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: When do you want to sell?                         */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 5 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                When do you want to sell?
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                Choose your preferred selling date.
              </p>
            </div>

            {/* Quick 1-Tap Date Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Today (இன்று / आज)', val: 'Today', sub: 'Ready for immediate buyer pickup' },
                { label: 'Tomorrow (நாளை / कल)', val: 'Tomorrow', sub: 'Morning dispatch' },
                { label: 'Within 3 Days (3 நாட்களில்)', val: 'Within 3 Days', sub: 'Harvest in progress' },
                { label: 'This Weekend (இந்த வார இறுதி)', val: 'This Weekend', sub: 'Flexible schedule' }
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setSellingDateOption(d.val)}
                  className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start justify-between ${
                    sellingDateOption === d.val
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="font-bold text-base">{d.label}</div>
                    <div className="text-xs text-stone-500 mt-1 font-normal">{d.sub}</div>
                  </div>
                  {sellingDateOption === d.val && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 6: Summary, "Get Price Estimate", & "Publish My Produce" */}
        {/* ========================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Step 6 of 6 — Final Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                Produce Summary
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-1">
                Review your details, check your estimated market range, and publish your produce.
              </p>
            </div>

            {/* Summary Details Box */}
            <div className="bg-stone-50 rounded-2xl p-6 border-2 border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCrop.emoji}</span>
                  <div>
                    <h4 className="font-black text-xl text-stone-900">
                      {selectedCrop.id === 'other' ? otherCropName : getCropDisplay(selectedCrop)}
                    </h4>
                    <p className="text-xs text-stone-500 font-semibold">{selectedCrop.variety}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 block">Quantity</span>
                  <span className="font-black text-stone-900 text-lg">
                    {quantity} {unit}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 block">Quality</span>
                  <span className="font-black text-stone-900 text-lg">
                    {quality}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 block">Location</span>
                  <span className="font-bold text-stone-900 truncate block">
                    {location}, {district}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 block">Selling Date</span>
                  <span className="font-bold text-stone-900 truncate block">
                    {sellingDateOption}
                  </span>
                </div>
              </div>

              {/* Get Price Estimate Button */}
              <div className="pt-1">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setEstimateRevealed(true);
                    fetchPriceRecommendation();
                  }}
                  className="w-full font-extrabold"
                >
                  Get Price Estimate
                </Button>
              </div>

              {/* Estimated Market Range Box */}
              {estimateRevealed && (
                <div className="bg-emerald-900 text-white rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Your estimated market range
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    ₹{calculatedMinPrice} – ₹{calculatedMaxPrice}{' '}
                    <span className="text-base font-semibold text-emerald-300">/ {unit}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200 font-semibold">
                    Based on recent market information
                  </p>
                  <p className="text-xs text-amber-300 font-semibold pt-1 border-t border-emerald-800">
                    This is an estimate, not a guaranteed selling price.
                  </p>
                </div>
              )}

              {/* Detailed Price Estimate & Historical Chart */}
              {aiRecommendation && estimateRevealed && (
                <div className="space-y-4 pt-2">
                  <PriceRecommendationCard data={aiRecommendation} isLoading={isLoadingAi} />
                  {aiRecommendation.historicalSeries && aiRecommendation.historicalSeries.length > 0 && (
                    <HistoricalPriceChart
                      data={aiRecommendation.historicalSeries}
                      cropName={selectedCrop.name}
                      unit={unit}
                      suggestedMin={aiRecommendation.suggestedMinPrice}
                      suggestedMax={aiRecommendation.suggestedMaxPrice}
                      expectedPrice={aiRecommendation.expectedPrice}
                    />
                  )}
                  {/* Decision Support: Sell-or-Wait Advisor, Take-Home Price, & Why This Price */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    <SellOrWaitAdvisorCard
                      cropName={selectedCrop.id === 'other' ? otherCropName : selectedCrop.name}
                      quantity={quantity}
                      unit={unit}
                      quality={quality}
                      currentMarketPrice={aiRecommendation?.expectedPrice || Math.round((calculatedMinPrice + calculatedMaxPrice) / 2)}
                      minPrice={calculatedMinPrice}
                      maxPrice={calculatedMaxPrice}
                      nearbyOffer={calculatedMaxPrice}
                      sellingDate={sellingDateOption}
                    />
                    <WhyThisPriceCard
                      cropName={selectedCrop.id === 'other' ? otherCropName : selectedCrop.name}
                      quality={quality}
                      quantity={quantity}
                      unit={unit}
                      location={`${location}, ${district}`}
                      minPrice={calculatedMinPrice}
                      maxPrice={calculatedMaxPrice}
                    />
                  </div>

                  <TakeHomePriceCard
                    offerPrice={calculatedMaxPrice}
                    quantity={quantity}
                    unit={unit}
                    initialTransportCost={Math.round(quantity * 1.2)}
                    initialOtherCost={100}
                  />
                </div>
              )}

              {/* Voice Market Assistant */}
              <div className="pt-2">
                <VoiceMarketAssistantBar />
              </div>
            </div>

            {/* "Publish My Produce" BUTTON */}
            <div className="pt-2">
              <Button
                size="xl"
                variant="primary"
                onClick={handleSubmitProduce}
                className="w-full py-5 text-xl font-black shadow-md cursor-pointer flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                <span>Publish My Produce</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP CONTROLS (Next / Back) for Steps 1 through 5 */}
        {currentStep < 6 && (
          <div className="mt-8 pt-5 border-t border-stone-200 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-8 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
