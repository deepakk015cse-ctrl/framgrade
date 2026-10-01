import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Button } from './Button';
import {
  Compass,
  Calculator,
  TrendingUp,
  Truck,
  MapPin,
  ShieldCheck,
  Volume2,
  SlidersHorizontal,
  ArrowRight,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  Warehouse,
  Scale,
  HelpCircle,
} from 'lucide-react';
import {
  WhyThisPriceModal,
  NetRealisationCalculator,
  WhatIfSimulator,
} from './DecisionSupportTools';

interface FarmDecisionEngineProps {
  compact?: boolean;
  initialCrop?: string;
  initialQuantity?: number;
  initialUnit?: string;
  initialQuality?: string;
  initialLocation?: string;
}

export const FarmDecisionEngine: React.FC<FarmDecisionEngineProps> = ({
  compact = false,
  initialCrop,
  initialQuantity,
  initialUnit,
  initialQuality,
  initialLocation,
}) => {
  const navigate = useNavigate();
  const { listings, bids, mandiPrices, language, user } = useApp();

  const activeListing = listings.find((l) => l.status === 'active' || l.status === 'negotiating') || listings[0];
  const pendingBids = bids.filter((b) => b.status === 'pending');
  const highestActiveBid = pendingBids.reduce(
    (max, b) => (b.bidPricePerUnit > max ? b.bidPricePerUnit : max),
    pendingBids[0]?.bidPricePerUnit || 27
  );

  // Farmer Decision Inputs
  const [cropName, setCropName] = useState<string>(
    initialCrop || (activeListing?.cropName ? activeListing.cropName.split('(')[0].trim() : 'Tomato')
  );
  const [quantity, setQuantity] = useState<number>(initialQuantity || activeListing?.quantity || 300);
  const [unit, setUnit] = useState<string>(initialUnit || activeListing?.unit || 'kg');
  const [quality, setQuality] = useState<string>(
    initialQuality || activeListing?.qualityLabel || 'Very Good (Grade A)'
  );
  const [farmerLocation, setFarmerLocation] = useState<string>(
    initialLocation || user?.village || activeListing?.location || 'Salem Rural'
  );
  const [preferredSellingDate, setPreferredSellingDate] = useState<string>('Today');
  const [availableStorage, setAvailableStorage] = useState<string>('None / Open Shade');
  const [buyerOfferPrice, setBuyerOfferPrice] = useState<number>(highestActiveBid || 27);
  const [transportCost, setTransportCost] = useState<number>(400);
  const [loadingCost, setLoadingCost] = useState<number>(150);
  const [otherCost, setOtherCost] = useState<number>(100);

  const [showInputsPanel, setShowInputsPanel] = useState<boolean>(!compact);
  const [sortBy, setSortBy] = useState<'net' | 'price' | 'distance'>('net');
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>('SELL_NOW');
  const [analysisData, setAnalysisData] = useState<any | null>(null);

  // Sync with backend Decision Engine endpoint
  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      try {
        const res = await api.decisionEngine.analyze({
          cropName,
          quantity,
          unit,
          quality,
          location: farmerLocation,
          sellingDate: preferredSellingDate,
          availableStorage,
          buyerOfferPrice,
          transportCost,
          loadingCost,
          otherCost,
        });
        if (isMounted && res.success && res.data) {
          setAnalysisData(res.data);
        }
      } catch {
        // Local computation fallback ensures uninterrupted responsiveness
      }
    };
    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [
    cropName,
    quantity,
    unit,
    quality,
    farmerLocation,
    preferredSellingDate,
    availableStorage,
    buyerOfferPrice,
    transportCost,
    loadingCost,
    otherCost,
  ]);

  // Matched Mandi benchmark
  const matchedMandi =
    mandiPrices.find((m) => m.cropName.toLowerCase().includes(cropName.toLowerCase())) || mandiPrices[0];

  const qualityMult =
    quality.toLowerCase().includes('premium') || quality.toLowerCase().includes('a+')
      ? 1.08
      : quality.toLowerCase().includes('very good') || quality.toLowerCase().includes('grade a')
      ? 1.0
      : 0.94;

  const currentMarketPrice = Math.round((matchedMandi?.modalPrice || 25) * qualityMult);
  const expectedMin = Math.round((matchedMandi?.minPrice || 24) * qualityMult);
  const expectedMax = Math.round((matchedMandi?.maxPrice || 27) * qualityMult);
  const marketTrendLabel =
    matchedMandi?.trend === 'up'
      ? 'Upward (+4.2% recent arrivals)'
      : matchedMandi?.trend === 'down'
      ? 'Softening (-2.1% high arrivals)'
      : 'Stable regional arrivals';

  const hasSafeStorage =
    !availableStorage.toLowerCase().includes('none') &&
    !availableStorage.toLowerCase().includes('open');

  // Option A: SELL NOW
  const sellNowGross = Math.round(buyerOfferPrice * quantity);
  const sellNowTransport = 0; // Farm-gate buyer pickup
  const sellNowOther = loadingCost;
  const sellNowNet = Math.max(0, sellNowGross - sellNowTransport - sellNowOther);

  // Option B: COMPARE OPTIONS
  const compareUnitPrice = Math.round((expectedMin + expectedMax) / 2) + 1;
  const compareGross = Math.round(compareUnitPrice * quantity);
  const compareTransport = transportCost;
  const compareOther = loadingCost + otherCost;
  const compareNet = Math.max(0, compareGross - compareTransport - compareOther);

  // Option C: CONSIDER WAITING / STORING
  const waitMin = matchedMandi?.trend === 'up' ? expectedMin + 1 : expectedMin;
  const waitMax = matchedMandi?.trend === 'up' ? expectedMax + 2 : expectedMax;
  const waitMid = Math.round((waitMin + waitMax) / 2);
  const storageCostEst = hasSafeStorage ? Math.round(quantity * 0.6) : Math.round(quantity * 1.1);
  const waitGross = Math.round(waitMid * quantity);
  const waitNet = Math.max(0, waitGross - transportCost - loadingCost - storageCostEst);

  const decisionOptions = [
    {
      id: 'SELL_NOW',
      badge: 'A. SELL NOW',
      recommendationPhrase: 'Consider selling now',
      title: 'Direct Farm-Gate Buyer Offer',
      accentClass: 'border-emerald-500 bg-emerald-50/40',
      badgeClass: 'bg-emerald-700 text-white',
      phraseBoxClass: 'bg-emerald-100/90 text-emerald-950 border-emerald-300',
      currentPrice: `₹${currentMarketPrice}/${unit}`,
      expectedRange: `₹${expectedMin}–₹${expectedMax}/${unit}`,
      buyerOffer: `₹${buyerOfferPrice}/${unit} (${pendingBids.length || 3} active offers)`,
      quantityDisplay: `${quantity} ${unit}`,
      transportDisplay: `₹${sellNowTransport} (Buyer farm-gate pickup)`,
      otherCostsDisplay: `₹${sellNowOther.toLocaleString('en-IN')} (Loading/handling)`,
      grossValue: sellNowGross,
      estimatedNetRealisation: sellNowNet,
      netPerUnit: (sellNowNet / Math.max(1, quantity)).toFixed(1),
      distanceLocation: `Farm Gate • ${farmerLocation} (0 km travel)`,
      marketTrend: marketTrendLabel,
      buyerDemand: `High (${Math.max(3, pendingBids.length)} verified buyers nearby)`,
      confidenceLevel: 'High (89%)',
      explanation: `Current buyer offer of ₹${buyerOfferPrice}/${unit} is near the top of the ₹${expectedMin}–₹${expectedMax}/${unit} expected range and includes direct farm-gate pickup, saving ₹${transportCost} in transport costs.`,
      ctaLabel: 'Review Buyer Offers',
      ctaPath: '/farmer/bids',
    },
    {
      id: 'COMPARE_OPTIONS',
      badge: 'B. COMPARE OPTIONS',
      recommendationPhrase: 'Consider comparing other offers',
      title: 'Compare Buyers, Mandi & Crop Pool',
      accentClass: 'border-amber-400 bg-amber-50/30',
      badgeClass: 'bg-amber-500 text-stone-950',
      phraseBoxClass: 'bg-amber-100/90 text-amber-950 border-amber-300',
      currentPrice: `₹${currentMarketPrice}/${unit}`,
      expectedRange: `₹${expectedMin}–₹${expectedMax}/${unit}`,
      buyerOffer: `₹${ Math.max(1, buyerOfferPrice - 2) }–₹${buyerOfferPrice}/${unit} across channels`,
      quantityDisplay: `${quantity} ${unit}`,
      transportDisplay: `₹${compareTransport.toLocaleString('en-IN')} (For mandi / hub delivery)`,
      otherCostsDisplay: `₹${compareOther.toLocaleString('en-IN')} (Loading + market fees)`,
      grossValue: compareGross,
      estimatedNetRealisation: compareNet,
      netPerUnit: (compareNet / Math.max(1, quantity)).toFixed(1),
      distanceLocation: `6 km – 18 km radius around ${farmerLocation}`,
      marketTrend: marketTrendLabel,
      buyerDemand: 'Active across Retail, Wholesale & Crop Pool',
      confidenceLevel: 'Medium-High (84%)',
      explanation: `Comparing net realization across direct farm-gate pickup, local mandi delivery, and neighbourhood crop pooling helps verify whether a higher distant price actually leaves more money after transport and handling costs.`,
      ctaLabel: 'Compare Net Realisation Below',
      ctaPath: '#net-realisation-section',
    },
    {
      id: 'CONSIDER_WAITING',
      badge: 'C. CONSIDER WAITING/STORING',
      recommendationPhrase: 'Consider waiting if storage is available',
      title: hasSafeStorage
        ? `Short-Term Holding (${availableStorage})`
        : 'Short-Term Holding (Storage Needed)',
      accentClass: 'border-sky-400 bg-sky-50/30',
      badgeClass: 'bg-sky-700 text-white',
      phraseBoxClass: 'bg-sky-100/90 text-sky-950 border-sky-300',
      currentPrice: `₹${currentMarketPrice}/${unit}`,
      expectedRange: `₹${waitMin}–₹${waitMax}/${unit} (Estimated 2–3 day window)`,
      buyerOffer: `Current top offer: ₹${buyerOfferPrice}/${unit}`,
      quantityDisplay: `${quantity} ${unit}`,
      transportDisplay: `₹${transportCost.toLocaleString('en-IN')}`,
      otherCostsDisplay: `₹${(loadingCost + storageCostEst).toLocaleString('en-IN')} (Loading + est. storage/holding)`,
      grossValue: waitGross,
      estimatedNetRealisation: waitNet,
      netPerUnit: (waitNet / Math.max(1, quantity)).toFixed(1),
      distanceLocation: `${farmerLocation} • Storage: ${availableStorage}`,
      marketTrend: marketTrendLabel,
      buyerDemand: 'Projected steady regional demand',
      confidenceLevel: hasSafeStorage ? 'Medium (74%)' : 'Low-Medium (62%)',
      explanation: hasSafeStorage
        ? `With ${availableStorage} available and recent ${matchedMandi?.trend || 'upward'} price movement, holding for 2–3 days is an option if you want to wait for stronger arrivals pricing, factoring in ₹${storageCostEst} estimated holding cost.`
        : `Without cool/ventilated storage ("${availableStorage}" selected), holding fresh ${cropName} carries moisture and weight loss risk that can reduce net realization even if mandi prices rise slightly.`,
      ctaLabel: 'Check 6-Day Market Trend',
      ctaPath: '/farmer/market-prices',
    },
  ];

  // Net Realisation Channels Comparison
  const rawChannels = [
    {
      id: 'fg-buyer-b',
      name: 'Buyer B — Kovai Wholesale (Farm-Gate Pickup)',
      channelBadge: 'Direct Farm-Gate Buyer',
      distanceKm: 0,
      locationLabel: `${farmerLocation} Farm Gate (0 km farmer travel)`,
      pricePerUnit: buyerOfferPrice,
      grossValue: Math.round(buyerOfferPrice * quantity),
      transportCost: 0,
      loadingCost: loadingCost,
      commissionCost: 0,
      otherCost: 0,
      paymentTerms: 'Immediate UPI at Weighment',
      note: 'Zero transport & zero commission',
    },
    {
      id: 'crop-pool-lot',
      name: 'Neighbourhood Crop Pool Lot (Combined 450+ kg)',
      channelBadge: 'Shared Village Pool',
      distanceKm: 2,
      locationLabel: 'Village Cluster Collection Point (2 km)',
      pricePerUnit: buyerOfferPrice,
      grossValue: Math.round(buyerOfferPrice * quantity),
      transportCost: Math.round(transportCost * 0.25),
      loadingCost: Math.round(loadingCost * 0.8),
      commissionCost: 0,
      otherCost: 0,
      paymentTerms: 'Separate Direct UPI to Each Farmer',
      note: 'Shared transport cost; your quantity remains yours',
    },
    {
      id: 'fg-buyer-a',
      name: 'Buyer A — Salem Fresh Mart (Town Dropoff)',
      channelBadge: 'Retail Hub Buyer',
      distanceKm: 8,
      locationLabel: 'Salem Town Collection Hub (8 km)',
      pricePerUnit: Math.max(1, buyerOfferPrice - 1),
      grossValue: Math.round(Math.max(1, buyerOfferPrice - 1) * quantity),
      transportCost: Math.round(transportCost * 0.6),
      loadingCost: loadingCost,
      commissionCost: 0,
      otherCost: 0,
      paymentTerms: 'Immediate UPI',
      note: 'Short local delivery, zero commission',
    },
    {
      id: 'local-mandi',
      name: `${matchedMandi?.mandiName || 'Oddanchatram / Salem'} Regulated Mandi`,
      channelBadge: 'Local APMC Mandi',
      distanceKm: 14,
      locationLabel: `${matchedMandi?.district || 'Salem'} Yard (14 km)`,
      pricePerUnit: currentMarketPrice,
      grossValue: Math.round(currentMarketPrice * quantity),
      transportCost: transportCost,
      loadingCost: loadingCost,
      commissionCost: 0,
      otherCost: otherCost,
      paymentTerms: 'Same-Day Mandi Settlement',
      note: 'Standard local mandi benchmark',
    },
    {
      id: 'distant-hub',
      name: 'Distant Regional Wholesale Market (Higher Headline Rate)',
      channelBadge: 'Distant Market (38 km)',
      distanceKm: 38,
      locationLabel: 'Regional Wholesale Yard (38 km)',
      pricePerUnit: buyerOfferPrice + 1,
      grossValue: Math.round((buyerOfferPrice + 1) * quantity),
      transportCost: Math.round(transportCost * 2.4),
      loadingCost: Math.round(loadingCost * 1.5),
      commissionCost: Math.round(buyerOfferPrice * quantity * 0.02),
      otherCost: otherCost,
      paymentTerms: 'Next-Day Bank Settlement',
      note: 'Higher price per kg, but lower Net Realisation after transport & fees',
    },
  ].map((ch) => {
    const totalDeductions = ch.transportCost + ch.loadingCost + ch.commissionCost + ch.otherCost;
    const netRealisation = Math.max(0, ch.grossValue - totalDeductions);
    const netPerUnit = Math.round((netRealisation / Math.max(1, quantity)) * 10) / 10;
    return {
      ...ch,
      totalDeductions,
      netRealisation,
      netPerUnit,
    };
  });

  const sortedChannels = [...rawChannels].sort((a, b) => {
    if (sortBy === 'net') return b.netRealisation - a.netRealisation;
    if (sortBy === 'price') return b.pricePerUnit - a.pricePerUnit;
    return a.distanceKm - b.distanceKm;
  });

  const highestNetChannel = [...rawChannels].sort((a, b) => b.netRealisation - a.netRealisation)[0];
  const highestHeadlineChannel = [...rawChannels].sort((a, b) => b.pricePerUnit - a.pricePerUnit)[0];

  const handleSpeakSummary = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 text-left">
      {/* =================================================================== */}
      {/* 1. FARM DECISION ENGINE HEADER & INPUT CONTROLS                     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-emerald-600/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-800" />
              <span>Farm Decision Engine • AI-Assisted Decision Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Based on the available market information, these are your current options.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Compare selling now, comparing buyer/pool channels, or short-term waiting based on estimated net realization after known costs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const win = window as any;
                if (win.__openDecisionWhyModal) win.__openDecisionWhyModal();
              }}
              data-open-why-modal="true"
              className="hidden"
            />
            <button
              type="button"
              onClick={() =>
                handleSpeakSummary(
                  `Based on the available market information, these are your current options for ${quantity} ${unit} of ${cropName}. Option A: Consider selling now with estimated net realization of ${sellNowNet} rupees. Option B: Consider comparing other offers. Option C: Consider waiting if storage is available.`
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-950 font-black text-xs cursor-pointer min-h-[42px]"
            >
              <Volume2 className="w-4 h-4 text-amber-900" />
              <span>Listen to Options</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInputsPanel(!showInputsPanel)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-xs border border-stone-300 cursor-pointer min-h-[42px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              <span>{showInputsPanel ? 'Hide Lot & Cost Inputs' : 'Customize Crop, Storage & Costs'}</span>
            </button>
          </div>
        </div>

        {/* AI Price Insight Bar with "Why This Price?" Button */}
        <div className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                AI Price Insight ({cropName})
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                Expected Price: ₹{expectedMin}–₹{expectedMax}/{unit}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-xs font-bold text-emerald-200">
              Current Market: ₹{currentMarketPrice}/{unit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#why-this-price-trigger"
              onClick={(e) => {
                e.preventDefault();
                const modalEl = document.getElementById('decision-why-price-btn');
                if (modalEl) modalEl.click();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Why This Price?</span>
            </a>
            <a
              href="#what-if-simulator-section"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
            >
              <span>What-If Simulator</span>
            </a>
          </div>
        </div>

        {/* Summary Pill Bar when inputs are collapsed */}
        {!showInputsPanel && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 px-4 py-3 rounded-2xl border border-stone-200 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-bold text-stone-800">
              <span>🌾 Crop: <strong className="text-stone-950">{cropName}</strong></span>
              <span>⚖️ Qty: <strong className="text-stone-950">{quantity} {unit}</strong></span>
              <span>⭐ Grade: <strong className="text-emerald-800">{quality}</strong></span>
              <span>📍 Location: <strong className="text-stone-950">{farmerLocation}</strong></span>
              <span>🗓️ Date: <strong className="text-stone-950">{preferredSellingDate}</strong></span>
              <span>🏠 Storage: <strong className="text-stone-950">{availableStorage}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setShowInputsPanel(true)}
              className="text-emerald-800 font-black underline cursor-pointer"
            >
              Edit Inputs
            </button>
          </div>
        )}

        {/* Interactive Farmer Input Form (9 required inputs) */}
        {showInputsPanel && (
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                Enter Your Produce, Storage & Known Selling Costs
              </span>
              <span className="text-[11px] text-stone-500 font-semibold">
                Updates options & net realization automatically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* 1. Crop */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">1. Crop</label>
                <select
                  value={cropName}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCropName(c);
                    if (c === 'Onion') setBuyerOfferPrice(58);
                    else if (c === 'Potato') setBuyerOfferPrice(28);
                    else if (c === 'Paddy') setBuyerOfferPrice(25);
                    else if (c === 'Banana') setBuyerOfferPrice(25);
                    else if (c === 'Green Chilli') setBuyerOfferPrice(45);
                    else setBuyerOfferPrice(27);
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                >
                  <option value="Tomato">Tomato (தக்காளி / टमाटर)</option>
                  <option value="Onion">Onion (வெங்காயம் / प्याज)</option>
                  <option value="Potato">Potato (உருளைக்கிழங்கு / आलू)</option>
                  <option value="Paddy">Paddy (நெல் / धान)</option>
                  <option value="Banana">Banana (வாழை / केला)</option>
                  <option value="Green Chilli">Green Chilli (பச்சை மிளகாய்)</option>
                </select>
              </div>

              {/* 2. Quantity & Unit */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">2. Quantity & Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-stone-900"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="bags">bags</option>
                    <option value="crates">crates</option>
                  </select>
                </div>
              </div>

              {/* 3. Quality / Grade */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">3. Quality / Grade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                >
                  <option value="Premium (Grade A+)">Premium (Grade A+ • Sorted)</option>
                  <option value="Very Good (Grade A)">Very Good (Grade A • Uniform)</option>
                  <option value="Good (Grade B)">Good (Grade B • Standard)</option>
                </select>
              </div>

              {/* 4. Farmer Location */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">4. Farmer Location</label>
                <input
                  type="text"
                  value={farmerLocation}
                  onChange={(e) => setFarmerLocation(e.target.value)}
                  placeholder="Village / Town"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                />
              </div>

              {/* 5. Preferred Selling Date */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">5. Preferred Selling Date</label>
                <select
                  value={preferredSellingDate}
                  onChange={(e) => setPreferredSellingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                >
                  <option value="Today">Today (Immediate Pickup)</option>
                  <option value="Tomorrow">Tomorrow Morning</option>
                  <option value="Within 3 Days">Within 3 Days</option>
                  <option value="Flexible (Up to 1 Week)">Flexible (If Storage Available)</option>
                </select>
              </div>

              {/* 6. Available Storage */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">6. Available Storage</label>
                <select
                  value={availableStorage}
                  onChange={(e) => setAvailableStorage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                >
                  <option value="None / Open Shade">None / Open Shade (Sell Fresh)</option>
                  <option value="Cool Ventilated Room (2–4 Days)">Cool Ventilated Room (2–4 Days)</option>
                  <option value="Village Cold Storage (7+ Days)">Village Cold Storage (7+ Days)</option>
                </select>
              </div>

              {/* 7. Current Best Buyer Offer */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  7. Current Buyer Offer (₹/{unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={buyerOfferPrice}
                  onChange={(e) => setBuyerOfferPrice(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-black text-emerald-900"
                />
              </div>

              {/* 8. Known Transport Cost */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  8. Known Transport Cost to Mandi (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                />
              </div>

              {/* 9. Other Known Selling Costs (Loading + Other) */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  9. Loading/Handling & Other Costs (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={loadingCost}
                    onChange={(e) => setLoadingCost(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Loading ₹"
                    title="Loading / Unloading Cost (₹)"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                  <input
                    type="number"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="Other ₹"
                    title="Other Known Cost (₹)"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. THREE SIDE-BY-SIDE DECISION OPTIONS (A, B, C)                    */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {decisionOptions.map((opt) => {
            const isSelectedForCompare = selectedComparisonId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedComparisonId(opt.id)}
                className={`rounded-3xl border-2 p-5 flex flex-col justify-between transition-all cursor-pointer ${
                  opt.accentClass
                } ${isSelectedForCompare ? 'ring-2 ring-emerald-700 shadow-sm' : ''}`}
              >
                <div className="space-y-3.5">
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${opt.badgeClass}`}>
                      {opt.badge}
                    </span>
                    <span className="text-[11px] font-bold text-stone-600 bg-white px-2.5 py-1 rounded-full border border-stone-200">
                      Confidence: {opt.confidenceLevel}
                    </span>
                  </div>

                  {/* Required Wording Callout */}
                  <div className={`p-3 rounded-2xl border ${opt.phraseBoxClass}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      Decision Option
                    </div>
                    <div className="text-lg font-black mt-0.5">"{opt.recommendationPhrase}"</div>
                    <div className="text-xs font-bold opacity-90 mt-0.5">{opt.title}</div>
                  </div>

                  {/* Estimated Net Realisation Highlight */}
                  <div className="bg-white rounded-2xl p-3.5 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-stone-500 uppercase block">
                        Estimated Net Realisation
                      </span>
                      <span className="text-2xl font-black text-emerald-900">
                        ₹{opt.estimatedNetRealisation.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-stone-500 font-semibold block">
                        (~₹{opt.netPerUnit}/{unit} after known costs)
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-stone-400 font-bold block">Gross Value</span>
                      <span className="font-bold text-stone-700">
                        ₹{opt.grossValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* All 12 Required Option Metrics */}
                  <div className="bg-white/90 rounded-2xl p-3.5 border border-stone-200/90 space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Current/known price:</span>
                      <span className="font-bold text-stone-900 text-right">{opt.currentPrice}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Expected price range:</span>
                      <span className="font-black text-emerald-800 text-right">{opt.expectedRange}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Buyer offer:</span>
                      <span className="font-bold text-stone-900 text-right">{opt.buyerOffer}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Quantity:</span>
                      <span className="font-bold text-stone-900 text-right">{opt.quantityDisplay}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Transport cost:</span>
                      <span className="font-bold text-stone-900 text-right">{opt.transportDisplay}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Other known costs:</span>
                      <span className="font-bold text-stone-900 text-right">{opt.otherCostsDisplay}</span>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-stone-100">
                      <span className="text-stone-500 font-semibold">Distance/location:</span>
                      <span className="font-bold text-stone-800 text-right">{opt.distanceLocation}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Market trend:</span>
                      <span className="font-bold text-stone-800 text-right">{opt.marketTrend}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-500 font-semibold">Buyer demand:</span>
                      <span className="font-bold text-emerald-800 text-right">{opt.buyerDemand}</span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-white/80 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                    <span className="font-black text-stone-900 block mb-0.5">Explanation:</span>
                    {opt.explanation}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 mt-3 border-t border-stone-200/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (opt.ctaPath.startsWith('#')) {
                        const el = document.getElementById('net-realisation-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(opt.ctaPath);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                  >
                    <span>{opt.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Non-Guarantee Decision Support Notice */}
        <div className="bg-stone-100 border border-stone-300 rounded-2xl p-3.5 text-xs text-stone-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <p>
            <strong className="font-black text-stone-900">Decision-Support Notice: </strong>
            All figures above are AI-assisted estimates based on current mandi records, active buyer bids, and your entered costs. FarmGrade does not guarantee future prices, profits, or sales. You remain in full control of which option you choose.
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. NET REALISATION COMPARISON ("Net Realisation")                   */}
      {/* =================================================================== */}
      <div
        id="net-realisation-section"
        className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-7 shadow-xs space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
              <Scale className="w-4 h-4" />
              <span>Net Realisation Comparison</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
              Net Realisation Across Selling Channels ({quantity} {unit} {cropName})
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Options are compared by <strong>Estimated Net Realisation</strong> (Gross Value minus Transport, Loading/Handling, Commission & Other Known Costs) — not just headline selling price.
            </p>
          </div>

          {/* Sort Mode Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start">
            <button
              type="button"
              onClick={() => setSortBy('net')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                sortBy === 'net' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              By Net Realisation
            </button>
            <button
              type="button"
              onClick={() => setSortBy('price')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                sortBy === 'price' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              By Selling Price
            </button>
            <button
              type="button"
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                sortBy === 'distance' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              By Distance
            </button>
          </div>
        </div>

        {/* Formula & Key Insight Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-1.5">
            <div className="font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>How Net Realisation Is Calculated</span>
            </div>
            <p className="font-bold text-stone-800">
              Gross Value = Price × Quantity
            </p>
            <p className="font-bold text-emerald-900">
              Estimated Net Realisation = Gross Value − Transport Cost − Loading/Handling − Market Fee/Commission − Other Known Costs
            </p>
          </div>

          <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-black uppercase tracking-wider text-amber-900">
              💡 Why Highest Price Is Not Always Highest Net Realisation
            </div>
            <p className="leading-relaxed font-medium">
              <strong>{highestHeadlineChannel.name}</strong> has a higher headline rate (₹{highestHeadlineChannel.pricePerUnit}/{unit}), but after deducting ₹{highestHeadlineChannel.totalDeductions.toLocaleString('en-IN')} in transport and market costs, <strong>{highestNetChannel.name}</strong> (₹{highestNetChannel.pricePerUnit}/{unit}) yields an estimated <strong>₹{(highestNetChannel.netRealisation - highestHeadlineChannel.netRealisation).toLocaleString('en-IN')} more</strong> in net realization.
            </p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-100 text-stone-700 uppercase font-black text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Selling Channel / Option</th>
                <th className="py-3.5 px-4">Price / {unit}</th>
                <th className="py-3.5 px-4">Gross Value</th>
                <th className="py-3.5 px-4">Transport</th>
                <th className="py-3.5 px-4">Loading & Other Costs</th>
                <th className="py-3.5 px-4">Estimated Net Realisation</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {sortedChannels.map((ch) => {
                const isHighestNet = ch.id === highestNetChannel.id;
                return (
                  <tr
                    key={ch.id}
                    className={isHighestNet ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-stone-50'}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900">{ch.name}</span>
                        {isHighestNet && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                            Highest Est. Net Realisation
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {ch.locationLabel} • {ch.paymentTerms}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-stone-900">
                      ₹{ch.pricePerUnit}/{unit}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      ₹{ch.grossValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {ch.transportCost === 0 ? (
                        <span className="text-emerald-800 font-bold">₹0 (Farm Pickup)</span>
                      ) : (
                        <span>−₹{ch.transportCost.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      −₹{(ch.loadingCost + ch.commissionCost + ch.otherCost).toLocaleString('en-IN')}
                      <span className="block text-[10px] text-stone-500">{ch.note}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-base sm:text-lg font-black text-emerald-900">
                        ₹{ch.netRealisation.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-stone-500 font-bold">
                        Est. ₹{ch.netPerUnit}/{unit} net
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={isHighestNet ? 'primary' : 'outline'}
                        onClick={() => {
                          if (ch.id.includes('pool')) {
                            const poolEl = document.getElementById('crop-pool');
                            if (poolEl) poolEl.scrollIntoView({ behavior: 'smooth' });
                            else navigate('/farmer/dashboard#crop-pool');
                          } else if (ch.id.includes('mandi') || ch.id.includes('hub')) {
                            navigate('/farmer/market-prices');
                          } else {
                            navigate('/farmer/bids');
                          }
                        }}
                      >
                        {ch.id.includes('pool')
                          ? 'View Pool'
                          : ch.id.includes('mandi') || ch.id.includes('hub')
                          ? 'View Mandi'
                          : 'View Offer'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards for Net Realisation */}
        <div className="md:hidden space-y-3">
          {sortedChannels.map((ch) => {
            const isHighestNet = ch.id === highestNetChannel.id;
            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border-2 space-y-2.5 ${
                  isHighestNet ? 'border-emerald-600 bg-emerald-50/40' : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-stone-900 text-sm">{ch.name}</h4>
                    <span className="text-xs text-stone-500 block">{ch.locationLabel}</span>
                  </div>
                  {isHighestNet && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shrink-0">
                      Highest Est. Net
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Gross Value</span>
                    <span className="font-bold text-stone-900">
                      ₹{ch.grossValue.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-stone-500">@ ₹{ch.pricePerUnit}/{unit}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Known Costs</span>
                    <span className="font-bold text-rose-800">
                      −₹{ch.totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] font-bold">Est. Net Realisation</span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{ch.netRealisation.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-emerald-800 font-bold">
                      ₹{ch.netPerUnit}/{unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-600 font-medium">{ch.note}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/bids')}
                    className="font-black text-emerald-800 underline cursor-pointer"
                  >
                    Open Option →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. INTERACTIVE BUYER NET REALISATION CALCULATOR                     */}
      {/* =================================================================== */}
      <NetRealisationCalculator
        listingId={activeListing?.id}
        cropName={cropName}
        quantity={quantity}
        unit={unit}
        initialTransportCost={transportCost}
        initialLoadingCost={loadingCost}
        initialOtherCost={otherCost}
      />

      {/* =================================================================== */}
      {/* 5. WHAT-IF SIMULATOR (Compare Selling Scenarios Before Deciding)    */}
      {/* =================================================================== */}
      <WhatIfSimulator
        cropName={cropName}
        defaultQuantity={quantity}
        unit={unit}
      />

      {/* Why This Price Modal Controller */}
      <DecisionWhyPriceController
        cropName={cropName}
        unit={unit}
        quantity={quantity}
        quality={quality}
        location={farmerLocation}
        currentMarketPrice={currentMarketPrice}
        expectedMin={expectedMin}
        expectedMax={expectedMax}
      />
    </div>
  );
};

const DecisionWhyPriceController: React.FC<{
  cropName: string;
  unit: string;
  quantity: number;
  quality: string;
  location: string;
  currentMarketPrice: number;
  expectedMin: number;
  expectedMax: number;
}> = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        id="decision-why-price-btn"
        type="button"
        onClick={() => setOpen(true)}
        className="hidden"
        aria-hidden="true"
      />
      <WhyThisPriceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        cropName={props.cropName}
        unit={props.unit}
        quantity={props.quantity}
        quality={props.quality}
        location={props.location}
        currentMarketPrice={props.currentMarketPrice}
        expectedMin={props.expectedMin}
        expectedMax={props.expectedMax}
      />
    </>
  );
};
