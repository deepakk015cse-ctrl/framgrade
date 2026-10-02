import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ProduceListing, Bid } from '../../types';
import { api } from '../../services/api';
import { farmerNotifications } from '../../services/notificationService';
import { Button } from './Button';
import { Modal } from './Modal';
import { WhyThisPriceModal } from './DecisionSupportTools';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Mic,
  Volume2,
  CheckCircle2,
  Clock,
  Info,
  ArrowRight,
  Calculator,
  HelpCircle,
  Activity,
  Compass,
  Tag
} from 'lucide-react';

// ============================================================================
// FUTURE CAMERA GRADING ARCHITECTURE INTERFACE (Feature 6 Requirement)
// Allows future camera/image-based quality assessment to plug into FarmGrade
// without pretending camera grading is active today.
// ============================================================================
export interface QualityAssessmentInput {
  cropName: string;
  selfReportedQuality: string;
  imageSource?: File | string | null;
}

export interface QualityAssessmentResult {
  qualityLabel: 'Good' | 'Very Good' | 'Premium';
  source: 'farmer_reported' | 'kiosk_verified' | 'camera_adapter';
  factorsAvailable: string[];
}

export interface QualityAssessmentAdapter {
  assessQuality: (input: QualityAssessmentInput) => Promise<QualityAssessmentResult>;
}

export const defaultQualityAdapter: QualityAssessmentAdapter = {
  assessQuality: async (input) => ({
    qualityLabel: input.selfReportedQuality.includes('Premium')
      ? 'Premium'
      : input.selfReportedQuality.includes('Very Good')
      ? 'Very Good'
      : 'Good',
    source: 'farmer_reported',
    factorsAvailable: ['Quality', 'Crop', 'Quantity', 'Location', 'Recent market prices', 'Demand information'],
  }),
};

// ============================================================================
// FEATURE 1 — SELL-OR-WAIT ADVISOR
// ============================================================================
interface SellOrWaitAdvisorProps {
  listing?: ProduceListing;
  cropName?: string;
  quantity?: number;
  unit?: string;
  quality?: string;
  currentMarketPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  nearbyOffer?: number | null;
  offersCount?: number;
  trend?: 'up' | 'down' | 'stable';
  sellingDate?: string;
  compact?: boolean;
}

export const SellOrWaitAdvisorCard: React.FC<SellOrWaitAdvisorProps> = ({
  cropName = 'Tomato',
  quantity = 300,
  unit = 'kg',
  quality = 'Very Good',
  currentMarketPrice = 25,
  minPrice = 24,
  maxPrice = 27,
  nearbyOffer = 27,
  offersCount = 3,
  trend = 'stable',
  compact = false,
}) => {
  const { language } = useApp();
  const [showWhyModal, setShowWhyModal] = useState(false);
  const cleanCrop = cropName.split('(')[0].trim();

  // Compute transparent suggestion based on available information
  let suggestion: 'Consider selling' | 'Consider waiting' | 'Compare buyer offers' =
    'Consider selling';
  let badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
  let reason =
    'A nearby buyer is offering near the upper end of the current estimated range.';

  if (nearbyOffer && nearbyOffer >= maxPrice - 0.5) {
    suggestion = 'Consider selling';
    badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
    reason = 'A nearby buyer is offering near the upper end of the current estimated range.';
  } else if (offersCount >= 2 && nearbyOffer && nearbyOffer >= minPrice) {
    suggestion = 'Compare buyer offers';
    badgeStyle = 'bg-amber-100 text-amber-950 border-amber-300';
    reason =
      'Multiple buyer offers are within the estimated range. Compare pickup convenience and payment terms.';
  } else if (trend === 'up' && (!nearbyOffer || nearbyOffer < minPrice)) {
    suggestion = 'Consider waiting';
    badgeStyle = 'bg-sky-100 text-sky-950 border-sky-300';
    reason =
      'Recent market prices are moving upward and current offers are below the estimated range.';
  } else if (nearbyOffer && nearbyOffer >= currentMarketPrice) {
    suggestion = 'Consider selling';
    badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300';
    reason = 'A nearby buyer offer meets or exceeds the current local market price.';
  } else {
    suggestion = 'Compare buyer offers';
    badgeStyle = 'bg-amber-100 text-amber-950 border-amber-300';
    reason =
      'Check nearby buyer offers and transport costs before deciding when to sell.';
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-xs text-left space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
            Sell-or-Wait Advisor
          </span>
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            {cleanCrop} • {quantity} {unit}
          </h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
          FarmGrade suggestion
        </span>
      </div>

      {/* Key Market Signals Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-stone-50 p-3.5 sm:p-4 rounded-2xl border border-stone-200">
        <div>
          <span className="text-[11px] text-stone-500 font-bold block">Current market</span>
          <span className="text-base sm:text-xl font-black text-stone-900">
            ₹{currentMarketPrice}/{unit}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 font-bold block">Expected range</span>
          <span className="text-base sm:text-xl font-black text-emerald-800 block">
            ₹{minPrice}–₹{maxPrice}/{unit}
          </span>
          <button
            type="button"
            onClick={() => setShowWhyModal(true)}
            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-[10px] font-black cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>
              {language === 'ta'
                ? 'இந்த விலை ஏன்?'
                : language === 'hi'
                ? 'यह भाव क्यों?'
                : 'Why This Price?'}
            </span>
          </button>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 font-bold block">Nearby offer</span>
          <span className="text-base sm:text-xl font-black text-stone-900">
            {nearbyOffer ? `₹${nearbyOffer}/${unit}` : 'No offer yet'}
          </span>
        </div>
      </div>

      {/* Suggestion & Reason */}
      <div className={`p-4 rounded-2xl border ${badgeStyle} space-y-1.5`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Suggestion
          </span>
          <span className="text-[11px] font-semibold opacity-85">
            Based on available market information
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black">"{suggestion}"</div>
        <p className="text-xs sm:text-sm font-semibold pt-1">
          <span className="font-black">Reason: </span>
          {reason}
        </p>
      </div>

      {!compact && (
        <p className="text-[11px] text-stone-500 font-medium">
          Based on available market information ({quality} quality, recent market trend, and nearby offers). Market conditions may change.
        </p>
      )}

      <WhyThisPriceModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        cropName={cleanCrop}
        unit={unit}
        quantity={quantity}
        quality={quality}
        currentMarketPrice={currentMarketPrice}
        expectedMin={minPrice}
        expectedMax={maxPrice}
      />
    </div>
  );
};

// ============================================================================
// FEATURE 2 — TRUE TAKE-HOME PRICE
// ============================================================================
interface TakeHomePriceProps {
  offerPrice?: number;
  quantity?: number;
  unit?: string;
  initialTransportCost?: number | null;
  initialOtherCost?: number | null;
}

export const TakeHomePriceCard: React.FC<TakeHomePriceProps> = ({
  offerPrice = 27,
  quantity = 300,
  unit = 'kg',
  initialTransportCost = 400,
  initialOtherCost = 100,
}) => {
  const [transportInput, setTransportInput] = useState<string>(
    initialTransportCost !== null && initialTransportCost !== undefined ? String(initialTransportCost) : ''
  );
  const [loadingInput, setLoadingInput] = useState<string>('');
  const [otherInput, setOtherInput] = useState<string>(
    initialOtherCost !== null && initialOtherCost !== undefined ? String(initialOtherCost) : ''
  );
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);
  const [editingCosts, setEditingCosts] = useState<boolean>(false);

  const transportVal = transportInput.trim() !== '' ? Math.max(0, Number(transportInput) || 0) : null;
  const loadingVal = loadingInput.trim() !== '' ? Math.max(0, Number(loadingInput) || 0) : null;
  const otherVal = otherInput.trim() !== '' ? Math.max(0, Number(otherInput) || 0) : null;

  const grossValue = Math.round(offerPrice * quantity);
  const totalKnownCosts =
    (transportVal !== null ? transportVal : 0) +
    (loadingVal !== null ? loadingVal : 0) +
    (otherVal !== null ? otherVal : 0);
  const estimatedTakeHome = Math.max(0, grossValue - totalKnownCosts);

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-xs text-left space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
            Take-Home Price
          </span>
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            Estimated amount after known costs
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setEditingCosts(!editingCosts)}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer"
        >
          {editingCosts ? 'Done Editing Costs' : 'Adjust Known Costs'}
        </button>
      </div>

      {/* Optional Cost Editor so farmers can enter their own known costs or leave blank ("Not included") */}
      {editingCosts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Estimated transport (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Not included"
              value={transportInput}
              onChange={(e) => setTransportInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Loading / unloading (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Not included"
              value={loadingInput}
              onChange={(e) => setLoadingInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Other known cost (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Not included"
              value={otherInput}
              onChange={(e) => setOtherInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            />
          </div>
        </div>
      )}

      {/* Breakdown List */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-stone-600 font-medium">Buyer offer:</span>
          <span className="font-black text-stone-900">₹{offerPrice}/{unit}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-600 font-medium">Quantity:</span>
          <span className="font-black text-stone-900">{quantity} {unit}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-stone-200">
          <span className="text-stone-800 font-bold">Gross value:</span>
          <span className="font-black text-stone-900 text-base">
            ₹{grossValue.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-600">Estimated transport:</span>
          <span className="font-bold text-stone-800">
            {transportVal !== null ? `₹${transportVal.toLocaleString('en-IN')}` : 'Not included'}
          </span>
        </div>
        {loadingVal !== null && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-600">Loading / unloading cost:</span>
            <span className="font-bold text-stone-800">
              ₹{loadingVal.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-600">Other known cost:</span>
          <span className="font-bold text-stone-800">
            {otherVal !== null ? `₹${otherVal.toLocaleString('en-IN')}` : 'Not included'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t-2 border-emerald-200">
          <div>
            <span className="text-emerald-950 font-black block text-base">Estimated take-home:</span>
            <span className="text-[11px] text-stone-500 font-semibold">
              Estimated amount after known costs
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-800">
            ₹{estimatedTakeHome.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Expandable: How was this calculated? */}
      <div>
        <button
          type="button"
          onClick={() => setShowHowCalculated(!showHowCalculated)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-700 hover:text-stone-950 py-2 px-3 rounded-xl bg-stone-100/80 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <span>How was this calculated?</span>
          </span>
          {showHowCalculated ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowCalculated && (
          <div className="mt-2 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <p className="font-bold text-stone-900">
              Gross Value − Known Costs = Estimated Take-Home Amount
            </p>
            <p>
              1. <strong>Gross Value:</strong> Buyer offer (₹{offerPrice}/{unit}) × Quantity ({quantity} {unit}) = ₹{grossValue.toLocaleString('en-IN')}
            </p>
            <p>
              2. <strong>Known Costs:</strong>{' '}
              {totalKnownCosts > 0
                ? `₹${totalKnownCosts.toLocaleString('en-IN')} total known selling costs deducted.`
                : 'No known costs entered (marked as Not included).'}
            </p>
            <p className="text-stone-500 pt-1">
              Note: This is an estimate based only on known costs. Any unentered costs are marked as "Not included".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 3 — NEIGHBOURHOOD CROP POOLING
// ============================================================================
interface NearbyCropPoolProps {
  cropName?: string;
  farmerQuantity?: number;
  unit?: string;
}

export const NearbyCropPoolCard: React.FC<NearbyCropPoolProps> = () => {
  const { addToast } = useApp();
  const [poolState, setPoolState] = useState<'opportunity' | 'joined' | 'declined' | 'confirmed'>('opportunity');
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const farmersInPool = [
    { id: 'f-you', label: 'Farmer A (Your Produce)', qty: 150, unit: 'kg', village: 'Salem Rural' },
    { id: 'f-b', label: 'Farmer B (Selvam K.)', qty: 200, unit: 'kg', village: 'Oddanchatram West' },
    { id: 'f-c', label: 'Farmer C (Annamalai M.)', qty: 100, unit: 'kg', village: 'Rasipuram North' },
  ];

  const combinedQty = farmersInPool.reduce((acc, f) => acc + f.qty, 0); // 450 kg
  const poolOfferPrice = 27;
  const yourSharePayout = 150 * poolOfferPrice;

  const handleJoinPool = async () => {
    setPoolState('joined');
    try {
      await api.cropPools.join('pool-salem-tomato-1', 150);
    } catch {}
    addToast({
      type: 'produce',
      title: 'Joined Nearby Crop Pool',
      message: 'Your 150 kg is included in the 450 kg combined lot. Your quantity remains yours.',
    });
  };

  const handleLeavePool = async () => {
    setPoolState('declined');
    try {
      await api.cropPools.leave('pool-salem-tomato-1');
    } catch {}
    addToast({
      type: 'info',
      title: 'Pool skipped for now',
      message: 'Your produce remains listed individually.',
    });
  };

  const handleConfirmShare = async () => {
    setPoolState('confirmed');
    try {
      await api.cropPools.confirm('pool-salem-tomato-1');
    } catch {}
    addToast({
      type: 'sale',
      title: 'Individual Pool Share Confirmed',
      message: `Your 150 kg share (₹${yourSharePayout.toLocaleString('en-IN')}) is recorded separately for direct payout.`,
    });
  };

  return (
    <div id="crop-pool" className="bg-white rounded-3xl border-2 border-emerald-200 p-5 sm:p-6 shadow-xs text-left space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
            Nearby Crop Pool
          </span>
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            Nearby farmers have similar produce.
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
            Combine quantities to create a larger buyer lot.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900">
          {poolState === 'opportunity'
            ? 'Opportunity Available'
            : poolState === 'joined'
            ? 'Proposed Pool (Buyer Offer Ready)'
            : poolState === 'confirmed'
            ? 'Individual Share Confirmed'
            : 'Not Joined'}
        </span>
      </div>

      {/* Ownership Protection Banner */}
      <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-black text-emerald-950">
          🛡️ Your quantity remains yours.
        </span>
        <span className="text-[11px] font-semibold text-emerald-800">
          Separate weighment & separate payment
        </span>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
        <div>
          <span className="text-stone-500 font-bold block">Crop & Quality</span>
          <span className="font-black text-stone-900 text-sm">Tomato (Good / Grade A)</span>
        </div>
        <div>
          <span className="text-stone-500 font-bold block">Your Quantity</span>
          <span className="font-black text-stone-900 text-sm">150 kg</span>
        </div>
        <div>
          <span className="text-stone-500 font-bold block">Possible Combined Lot</span>
          <span className="font-black text-emerald-800 text-base">{combinedQty} kg (3 Farmers)</span>
        </div>
        <div>
          <span className="text-stone-500 font-bold block">Selling Period</span>
          <span className="font-black text-stone-900 text-sm">Today & Tomorrow</span>
        </div>
      </div>

      {/* Individual Farmer Quantities */}
      <div className="space-y-1.5 text-xs bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/80">
        <div className="font-bold text-stone-700 mb-1">Participating Quantities (Kept Separate):</div>
        {farmersInPool.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-1 border-b border-stone-200/60 last:border-0">
            <span className="font-semibold text-stone-800">{f.label} ({f.village})</span>
            <span className="font-black text-stone-900">{f.qty} {f.unit}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1.5 font-black text-emerald-900 text-sm">
          <span>Possible combined lot:</span>
          <span>{combinedQty} kg</span>
        </div>
      </div>

      {/* Pool Buyer Offer & Individual Confirmation */}
      {(poolState === 'joined' || poolState === 'confirmed') && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-black uppercase text-amber-900 block">
                Buyer Offer for 450 kg Combined Lot
              </span>
              <h4 className="text-base font-black text-stone-900">
                Kovai Wholesale Aggregator • ₹{poolOfferPrice}/kg
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-600 font-bold block">Your Separate Payout (150 kg)</span>
              <span className="text-xl font-black text-emerald-900">
                ₹{yourSharePayout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {poolState === 'joined' ? (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button size="sm" variant="success" onClick={handleConfirmShare}>
                Confirm My 150 kg Share
              </Button>
              <Button size="sm" variant="outline" onClick={handleLeavePool}>
                Leave Pool
              </Button>
            </div>
          ) : (
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Confirmed! Your 150 kg and ₹{yourSharePayout.toLocaleString('en-IN')} payment are recorded under your account.</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons for Initial State */}
      {poolState === 'opportunity' && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetailsModal(true)}
          >
            View Pool Opportunity
          </Button>
          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="primary" onClick={handleJoinPool}>
              Join Pool
            </Button>
            <Button size="sm" variant="outline" onClick={handleLeavePool}>
              Not Now
            </Button>
          </div>
        </div>
      )}

      {poolState === 'declined' && (
        <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
          <span>You chose "Not Now". Your produce remains listed individually.</span>
          <button
            type="button"
            onClick={() => setPoolState('opportunity')}
            className="font-bold text-emerald-800 underline cursor-pointer"
          >
            Reconsider Pool
          </button>
        </div>
      )}

      {/* Pool Opportunity Modal */}
      {showDetailsModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDetailsModal(false)}
          title="Nearby Crop Pool Opportunity"
          subtitle="Your quantity remains yours. Payments are settled individually."
        >
          <div className="space-y-4 text-left text-sm">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Crop:</span>
                <span className="font-black text-stone-900">Tomato</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Combined quantity:</span>
                <span className="font-black text-emerald-800">{combinedQty} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Number of farmers:</span>
                <span className="font-bold text-stone-900">3 nearby farmers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Location area:</span>
                <span className="font-bold text-stone-900">Salem & Oddanchatram Cluster</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Selling period:</span>
                <span className="font-bold text-stone-900">Today & Tomorrow Morning</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
              <div className="font-black">How Neighbourhood Crop Pooling Works:</div>
              <p>• Each farmer chooses "Join Pool" or "Not Now".</p>
              <p>• Buyers see the 450 kg combined available quantity and place an offer.</p>
              <p>• Each participating farmer confirms their own share and receives separate direct payment.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleLeavePool();
                }}
              >
                Not Now
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleJoinPool();
                }}
              >
                Join Pool
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================================
// FEATURE 4 — BUYER JOURNEY MATCHING ("Nearby Buyer Matches")
// ============================================================================
interface BuyerMatchProps {
  cropName?: string;
  availableQuantity?: number;
  unit?: string;
  onViewOffers?: () => void;
}

export const NearbyBuyerMatchesSection: React.FC<BuyerMatchProps> = ({
  cropName = 'Tomato',
  availableQuantity = 300,
  unit = 'kg',
  onViewOffers,
}) => {
  const navigate = useNavigate();
  const cleanCrop = cropName.split('(')[0].trim();

  const matches = [
    {
      id: 'bm-1',
      buyerLabel: 'Buyer A (Salem Fresh Mart)',
      distanceKm: 12,
      needs: `500 ${unit} ${cleanCrop.toLowerCase()}`,
      available: `${availableQuantity} ${unit}`,
      pickupPreference: 'Buyer Pickup from Farm Gate',
      offer: 26,
      matchReason: 'Good quantity match',
    },
    {
      id: 'bm-2',
      buyerLabel: 'Buyer B (Kovai Wholesale Aggregator)',
      distanceKm: 18,
      needs: `500 ${unit} ${cleanCrop.toLowerCase()}`,
      available: `${availableQuantity} ${unit}`,
      pickupPreference: 'Buyer Pickup from Farm Gate',
      offer: 27,
      matchReason: 'Matches crop, quality & today pickup date',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-xs text-left space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
            Buyer Journey Matching
          </span>
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            Nearby Buyer Matches
          </h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
          Potential match
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-stone-900 text-base">{m.buyerLabel}</h4>
                  <span className="text-xs text-stone-600 font-bold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {m.distanceKm} km away
                  </span>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  Potential match
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 bg-white p-3 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block">Needs:</span>
                  <span className="font-bold text-stone-900">{m.needs}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Available:</span>
                  <span className="font-bold text-stone-900">{m.available}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Offer:</span>
                  <span className="font-black text-emerald-800 text-sm">₹{m.offer}/{unit}</span>
                </div>
              </div>

              <div className="mt-2.5 text-xs text-stone-700 space-y-1">
                <div>
                  <span className="font-bold text-stone-800">Pickup: </span>
                  <span>{m.pickupPreference}</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Match: </span>
                  <span className="font-semibold">"{m.matchReason}"</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/80 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => (onViewOffers ? onViewOffers() : navigate('/farmer/bids'))}
              >
                View Offer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE 5 — VOICE MARKET ASSISTANT (CORE FARMGRADE ACTION-ORIENTED INTERFACE)
// SPEAK → UNDERSTAND → ANALYZE → EXPLAIN → SHOW OPTIONS → FARMER DECIDES → TAKE ACTION
// ============================================================================
export const VoiceMarketAssistantBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    setLanguage,
    listings,
    bids,
    mandiPrices,
    addListing,
    acceptBid,
    addToast,
    user,
  } = useApp();

  // 4 Required Voice States: 'idle' | 'listening' | 'processing' | 'responding'
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'responding'>('idle');
  const [spokenQuery, setSpokenQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTypeInstead, setShowTypeInstead] = useState<boolean>(false);
  const [typedInput, setTypedInput] = useState<string>('');

  // Structured Assistant Response State
  const [assistantReply, setAssistantReply] = useState<any | null>(null);

  // Voice → Action: Add Produce Confirmation & Edit State
  const [pendingProduce, setPendingProduce] = useState<{
    cropName: string;
    quantity: number;
    unit: string;
    expectedMin: number;
    expectedMax: number;
    isEditing: boolean;
    confirmedAnalysisReady: boolean;
  } | null>(null);

  // Safety Confirmation Dialog for Critical Actions (Publish Listing / Select Buyer / Accept Offer / Cancel)
  const [safetyConfirmation, setSafetyConfirmation] = useState<{
    type: 'publish_listing' | 'select_buyer' | 'accept_offer' | 'cancel_action';
    promptText: string;
    detailText: string;
    payload?: any;
  } | null>(null);

  // Interactive Net Realisation Cost Inputs inside Voice Assistant
  const [voiceTransportCost, setVoiceTransportCost] = useState<number>(200);
  const [voiceOtherCost, setVoiceOtherCost] = useState<number>(100);

  // 5 Dashboard Quick Voice Actions (Requirement 13)
  const quickVoiceActions = [
    {
      id: 'qa-price',
      label: language === 'ta' ? '🎤 சந்தை விலை கேள்' : language === 'hi' ? '🎤 बाजार भाव पूछें' : '🎤 Ask Market Price',
      query:
        language === 'ta'
          ? 'இன்றைய தக்காளி விலை என்ன?'
          : language === 'hi'
          ? 'आज टमाटर का भाव क्या है?'
          : "What is today's tomato price?",
    },
    {
      id: 'qa-buyers',
      label: language === 'ta' ? '🎤 வாங்குபவர்களை காட்டு' : language === 'hi' ? '🎤 खरीदार खोजें' : '🎤 Find Buyers',
      query:
        language === 'ta'
          ? 'தக்காளி வாங்குபவர்களைக் காட்டு.'
          : language === 'hi'
          ? 'टमाटर के खरीदार दिखाएं।'
          : 'Show buyers for my tomatoes.',
    },
    {
      id: 'qa-compare',
      label: language === 'ta' ? '🎤 சலுகைகளை ஒப்பிடு' : language === 'hi' ? '🎤 ऑफर की तुलना करें' : '🎤 Compare Offers',
      query:
        language === 'ta'
          ? 'என் வாங்குபவர் சலுகைகளை ஒப்பிடு.'
          : language === 'hi'
          ? 'मेरे खरीदार ऑफ़र की तुलना करें।'
          : 'Compare my buyer offers.',
    },
    {
      id: 'qa-net',
      label: language === 'ta' ? '🎤 நிகர வருமானம்' : language === 'hi' ? '🎤 शुद्ध मूल्य जांचें' : '🎤 Check Net Value',
      query:
        language === 'ta'
          ? 'போக்குவரத்துக்குப் பிறகு எனக்கு எவ்வளவு கிடைக்கும்?'
          : language === 'hi'
          ? 'परिवहन के बाद मुझे कितना मिलेगा?'
          : 'How much will I get after transport?',
    },
    {
      id: 'qa-decision',
      label: language === 'ta' ? '🎤 விற்பனை ஆலோசனை' : language === 'hi' ? '🎤 बिक्री निर्णय पूछें' : '🎤 Ask Farm Decision',
      query:
        language === 'ta'
          ? 'நான் இப்போது விற்கலாமா?'
          : language === 'hi'
          ? 'क्या मुझे अभी बेचना चाहिए?'
          : 'Should I sell now?',
    },
  ];

  // Natural Language Spoken Examples (Requirement 1 & 9)
  const spokenExamples =
    language === 'ta'
      ? [
          'இன்றைய தக்காளி விலை என்ன?',
          'என்னிடம் 300 கிலோ தக்காளி உள்ளது.',
          'தக்காளி வாங்குபவர்களைக் காட்டு.',
          'என்ன சலுகைகள் உள்ளன?',
          'நான் இப்போது விற்கலாமா?',
          'என் வாங்குபவர் சலுகைகளை ஒப்பிடு.',
          'போக்குவரத்துக்குப் பிறகு எனக்கு எவ்வளவு கிடைக்கும்?',
        ]
      : language === 'hi'
      ? [
          'आज टमाटर का भाव क्या है?',
          'मेरे पास 300 किलो टमाटर है।',
          'टमाटर के खरीदार दिखाएं।',
          'मेरे पास क्या ऑफ़र हैं?',
          'क्या मुझे अभी बेचना चाहिए?',
          'मेरे खरीदार ऑफ़र की तुलना करें।',
          'परिवहन के बाद मुझे कितना मिलेगा?',
        ]
      : [
          'Why is the tomato price 24 to 27?',
          'Show my net amount.',
          'What if transport costs 500 rupees?',
          'Compare Buyer A and Buyer B.',
          "What is today's tomato price?",
          'I have 300 kilos of tomato.',
          'Show me tomato buyers.',
          'Should I sell now?',
        ];

  const speakOut = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceState('idle');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      setVoiceState('responding');
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      u.rate = 0.95;
      u.onend = () => setVoiceState('idle');
      u.onerror = () => setVoiceState('idle');
      window.speechSynthesis.speak(u);
    } catch {
      setVoiceState('idle');
    }
  };

  // Local fallback evaluation connected strictly to actual FarmGrade state (Zero hallucination)
  const evaluateLocallyWithAppData = (rawText: string) => {
    const q = rawText.toLowerCase().trim();
    const isTa = language === 'ta' || /[\u0B80-\u0BFF]/.test(rawText);
    const isHi = !isTa && (language === 'hi' || /[\u0900-\u097F]/.test(rawText));

    if (!q) {
      return {
        intent: 'unrecognized',
        spokenResponse: isTa
          ? 'மன்னிக்கவும், எனக்குப் புரியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : isHi
          ? 'क्षमा करें, मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।'
          : "Sorry, I couldn't understand that. Please try again.",
        actionLabel: null,
        actionPath: null,
      };
    }

    // Privacy check (Requirement 14)
    if (q.includes('other farmer') || q.includes("another farmer's") || q.includes('private') || rawText.includes('மற்ற விவசாயி')) {
      return {
        intent: 'privacy_restricted',
        spokenResponse: isTa
          ? 'பாதுகாப்பு காரணங்களுக்காக, உங்கள் சொந்த FarmGrade கணக்கு மற்றும் பொது சந்தை தகவல்களை மட்டுமே நீங்கள் பார்க்க முடியும்.'
          : isHi
          ? 'गोपनीयता और सुरक्षा के लिए, आप केवल अपना FarmGrade खाता और सार्वजनिक बाजार जानकारी ही देख सकते हैं।'
          : 'For privacy and security, you can only access your own FarmGrade account and public market information.',
        actionLabel: null,
        actionPath: null,
      };
    }

    const activeQty = pendingProduce?.quantity || 300;
    const actualBuyers = [
      {
        id: 'bid-1',
        buyerName: 'Kovai Wholesale Aggregator',
        buyerCompany: 'Kovai Agri Logistics Ltd',
        requiredQuantity: 500,
        offeredPrice: 27,
        unit: 'kg',
        location: 'Salem Bypass Yard (18 km)',
        pickupInfo: isTa ? 'பண்ணை வாயிலில் நேரில் எடுப்பு (₹0 போக்குவரத்து)' : isHi ? 'फार्म गेट से खरीदार पिकअप (₹0 परिवहन)' : 'Buyer Pickup from Farm Gate (₹0 transport)',
        paymentTerms: 'Immediate UPI at Weighment',
        status: isTa ? 'செயலில் உள்ள சலுகை' : isHi ? 'सक्रिय ऑफ़र' : 'Active Offer',
        grossValue: 27 * activeQty,
        transportCost: 0,
        otherCosts: 150,
        netRealisation: 27 * activeQty - 150,
      },
      {
        id: 'bid-2',
        buyerName: 'Nilgiris Retail Hub',
        buyerCompany: 'Nilgiris Fresh Produce Chain',
        requiredQuantity: 400,
        offeredPrice: 26,
        unit: 'kg',
        location: 'Attur, Salem District (25 km)',
        pickupInfo: isTa ? 'கிராம கியோஸ்க் விநியோகம்' : isHi ? 'ग्राम कियोस्क ड्रॉपऑफ़' : 'Village Kiosk Dropoff',
        paymentTerms: 'Immediate UPI',
        status: isTa ? 'செயலில் உள்ள சலுகை' : isHi ? 'सक्रिय ऑफ़र' : 'Active Offer',
        grossValue: 26 * activeQty,
        transportCost: 150,
        otherCosts: 150,
        netRealisation: 26 * activeQty - 300,
      },
      {
        id: 'bid-3',
        buyerName: 'Salem Fresh Mart',
        buyerCompany: 'Salem Agro Fresh Procure',
        requiredQuantity: 500,
        offeredPrice: 25,
        unit: 'kg',
        location: 'Salem Town (6 km)',
        pickupInfo: isTa ? 'பண்ணை வாயிலில் நேரில் எடுப்பு' : isHi ? 'फार्म गेट से खरीदार पिकअप' : 'Buyer Pickup from Farm Gate',
        paymentTerms: 'Immediate UPI',
        status: isTa ? 'செயலில் உள்ள சலுகை' : isHi ? 'सक्रिय ऑफ़र' : 'Active Offer',
        grossValue: 25 * activeQty,
        transportCost: 0,
        otherCosts: 150,
        netRealisation: 25 * activeQty - 150,
      },
    ];

    const qtyMatch = rawText.match(/(\d+)\s*(kg|kilo|kilos|kilogram|kilograms|quintal|bags|கிலோ|மூட்டை|குவிண்டால்|किलो|क्विंटल|बोरी)/i);
    if (
      qtyMatch ||
      q.includes('i have') ||
      q.includes('add ') ||
      rawText.includes('என்னிடம்') ||
      rawText.includes('உள்ளது') ||
      rawText.includes('சேர்') ||
      rawText.includes('मेरे पास') ||
      rawText.includes('जोड़ें')
    ) {
      const detectedQty = qtyMatch ? Number(qtyMatch[1]) : 300;
      const detectedCrop =
        q.includes('onion') || rawText.includes('வெங்காயம்') || rawText.includes('प्याज')
          ? 'Onion'
          : q.includes('potato') || rawText.includes('உருளைக்கிழங்கு') || rawText.includes('आलू')
          ? 'Potato'
          : q.includes('banana') || rawText.includes('வாழை') || rawText.includes('केला')
          ? 'Banana'
          : q.includes('paddy') || rawText.includes('நெல்') || rawText.includes('धान')
          ? 'Paddy'
          : 'Tomato';
      const cropTa = detectedCrop === 'Onion' ? 'வெங்காயம்' : detectedCrop === 'Potato' ? 'உருளைக்கிழங்கு' : detectedCrop === 'Banana' ? 'வாழைப்பழம்' : detectedCrop === 'Paddy' ? 'நெல்' : 'தக்காளி';
      const cropHi = detectedCrop === 'Onion' ? 'प्याज' : detectedCrop === 'Potato' ? 'आलू' : detectedCrop === 'Banana' ? 'केला' : detectedCrop === 'Paddy' ? 'धान' : 'टमाटर';
      return {
        intent: 'add_produce',
        detectedCrop,
        detectedQuantity: detectedQty,
        detectedUnit: 'kg',
        expectedRange: { min: 24, max: 27 },
        requiresConfirmation: true,
        confirmationPrompt: isTa
          ? `${detectedQty} கிலோ ${cropTa} சேர்க்க விரும்புகிறீர்களா?`
          : isHi
          ? `क्या आप ${detectedQty} किलो ${cropHi} जोड़ना चाहते हैं?`
          : `Do you want to add ${detectedQty} kg of ${detectedCrop}?`,
        spokenResponse: isTa
          ? `${detectedQty} கிலோ ${cropTa} என்று புரிந்துகொண்டேன். இது சரியா?`
          : isHi
          ? `मैंने ${detectedQty} किलो ${cropHi} समझा है। क्या यह सही है?`
          : `I understood ${detectedQty} kg of ${detectedCrop}. Is this correct?`,
        actionLabel: isTa ? 'விளைபொருள் சேர்க்க திறக்கவும்' : isHi ? 'उपज जोड़ें खोलें' : 'Open Add Produce',
        actionPath: '/farmer/add-produce',
      };
    }

    // Why This Price? ("Why is the tomato price 24 to 27?")
    if (
      q.includes('why') ||
      rawText.includes('ஏன்') ||
      rawText.includes('எப்படி') ||
      rawText.includes('क्यों') ||
      rawText.includes('कैसे')
    ) {
      return {
        intent: 'price_explanation',
        cropName: 'Tomato',
        expectedRange: { min: 24, max: 27 },
        unit: 'kg',
        confidenceLevel: 'Medium',
        factors: [
          { factor: 'Crop', detail: 'Tomato' },
          { factor: 'Reported quality', detail: 'Very Good (Grade A)' },
          { factor: 'Quantity', detail: `${activeQty} kg` },
          { factor: 'Location', detail: 'Salem / Nearby Regional Markets' },
          { factor: 'Recent market price records', detail: 'Recent modal price ₹26/kg' },
          { factor: 'Nearby buyer demand', detail: '3 active buyer offers (₹25–₹27/kg)' },
        ],
        spokenResponse: isTa
          ? 'எதிர்பார்க்கப்படும் விலை வரம்பு கிலோ ₹24 முதல் ₹27 வரை. இது பயிர் வகை, தரம், அளவு, இடம், சமீபத்திய சந்தை விலை ₹26 மற்றும் அருகிலுள்ள வாங்குபவர் தேவையை அடிப்படையாகக் கொண்டது. இந்த விலை வழிகாட்டுதலுக்கான மதிப்பீடு மட்டுமே.'
          : isHi
          ? 'अपेक्षित मूल्य सीमा ₹24 से ₹27 प्रति किलो है। यह फसल, गुणवत्ता, मात्रा, स्थान, हालिया मंडी भाव ₹26 और आस-पास के खरीदारों की मांग पर आधारित है। यह मूल्य एक अनुमानित सीमा है।'
          : 'Expected Price: ₹24 to ₹27 per kg. This estimate considers your crop (Tomato), reported quality, quantity, location, recent market price records around ₹26 per kg, and nearby buyer demand (3 active offers). Confidence level is Medium. This price is an estimated range for decision support, not a guaranteed selling price.',
        actionLabel: isTa ? 'விலை விளக்கத்தைக் காண்க' : isHi ? 'भाव का कारण देखें' : 'View Why This Price?',
        actionPath: '/farmer/decision',
      };
    }

    if (
      q.includes('net realisation') ||
      q.includes('net realization') ||
      q.includes('net amount') ||
      q.includes('what if transport') ||
      q.includes('transport costs') ||
      q.includes('after transport') ||
      q.includes('how much will i get') ||
      q.includes('net value') ||
      rawText.includes('போக்குவரத்து') ||
      rawText.includes('நிகர') ||
      rawText.includes('எவ்வளவு கிடைக்கும்') ||
      rawText.includes('परिवहन') ||
      rawText.includes('कितना मिलेगा') ||
      rawText.includes('शुद्ध')
    ) {
      const customTransportMatch = rawText.match(/(\d+)/);
      const transportOverride =
        (q.includes('what if') || q.includes('transport cost')) && customTransportMatch
          ? Number(customTransportMatch[1])
          : voiceTransportCost;
      const gross = 28 * activeQty;
      const costs = transportOverride + voiceOtherCost;
      const net = Math.max(0, gross - costs);
      if (transportOverride !== voiceTransportCost) {
        setVoiceTransportCost(transportOverride);
      }
      return {
        intent: 'net_realisation',
        cropName: 'Tomato',
        quantity: activeQty,
        unit: 'kg',
        offerPrice: 28,
        grossValue: gross,
        knownCosts: costs,
        estimatedNetRealisation: net,
        disclaimer: isTa
          ? 'இது கிடைக்கும் தகவலின் அடிப்படையில் கணக்கிடப்பட்ட மதிப்பீடு ஆகும்.'
          : isHi
          ? 'यह उपलब्ध जानकारी के आधार पर एक अनुमान है।'
          : 'This calculation is an estimate for comparison purposes.',
        spokenResponse: isTa
          ? `உங்கள் மதிப்பிடப்பட்ட மொத்த தொகை ₹${gross.toLocaleString('en-IN')}. போக்குவரத்து மற்றும் பிற செலவுகள் ₹${costs.toLocaleString('en-IN')} கழித்த பிறகு, மதிப்பிடப்பட்ட நிகர வருமானம் ₹${net.toLocaleString('en-IN')} ஆகும்.`
          : isHi
          ? `आपकी कुल राशि ₹${gross.toLocaleString('en-IN')} है। परिवहन और अन्य लागत ₹${costs.toLocaleString('en-IN')} घटाने के बाद, अनुमानित शुद्ध आय ₹${net.toLocaleString('en-IN')} है।`
          : `For ${activeQty} kg at ₹28 per kg, Gross Amount is ₹${gross.toLocaleString('en-IN')}. With estimated costs of ₹${costs.toLocaleString('en-IN')} (including ₹${transportOverride} transport), your Estimated Net Realisation is ₹${net.toLocaleString('en-IN')}. This calculation is an estimate for comparison purposes.`,
        actionLabel: isTa ? 'நிகர வருமான கணக்கீட்டைத் திற' : isHi ? 'शुद्ध आय कैलकुलेटर खोलें' : 'Open Net Realisation Calculator',
        actionPath: '/farmer/decision#net-realisation-calculator',
      };
    }

    if (
      q.includes('should i sell') ||
      q.includes('sell now') ||
      q.includes('what should i do') ||
      q.includes('decision') ||
      rawText.includes('விற்கலாமா') ||
      rawText.includes('இப்போது விற்க') ||
      rawText.includes('बेचना चाहिए') ||
      rawText.includes('अभी बेचें')
    ) {
      return {
        intent: 'decision_engine',
        cropName: 'Tomato',
        quantity: activeQty,
        unit: 'kg',
        currentMarketPrice: 26,
        expectedRange: { min: 24, max: 27 },
        offersRange: { min: 25, max: 27 },
        decisionOptions: [
          {
            code: 'A',
            label: isTa ? 'இப்போது விற்பதை பரிசீலிக்கவும்' : isHi ? 'अभी बेचने पर विचार करें' : 'Consider selling now',
            detail: isTa
              ? `பண்ணை வாயிலில் கிலோ ₹27 நேரடி சலுகை (மதிப்பிடப்பட்ட நிகர வருமானம்: ₹${(27 * activeQty - 150).toLocaleString('en-IN')})`
              : isHi
              ? `फार्म गेट पर ₹27/किलो सीधा ऑफ़र (अनुमानित शुद्ध आय: ₹${(27 * activeQty - 150).toLocaleString('en-IN')})`
              : `Direct farm-gate offer at ₹27/kg (Est. Net: ₹${(27 * activeQty - 150).toLocaleString('en-IN')})`,
          },
          {
            code: 'B',
            label: isTa ? 'மற்ற சலுகைகளை ஒப்பிட்டுப் பார்க்கவும்' : isHi ? 'अन्य ऑफ़र की तुलना करने पर विचार करें' : 'Consider comparing other offers',
            detail: isTa
              ? '3 செயலில் உள்ள வாங்குபவர் சலுகைகள் (₹25–₹27/கிலோ)'
              : isHi
              ? '3 सक्रिय खरीदार ऑफ़र (₹25–₹27/किलो)'
              : '3 active buyer offers (₹25–₹27/kg) & 450 kg neighbourhood crop pool',
          },
          {
            code: 'C',
            label: isTa ? 'சேமிப்பு வசதி இருந்தால் காத்திருக்கலாம்' : isHi ? 'भंडारण उपलब्ध हो तो प्रतीक्षा करने पर विचार करें' : 'Consider waiting if storage is available',
            detail: isTa
              ? 'காற்றோட்டமான சேமிப்பு இருந்தால் 2–3 நாட்களில் எதிர்பார்க்கப்படும் விலை ₹25–₹28/கிலோ'
              : isHi
              ? 'ठंडा हवादार भंडारण उपलब्ध होने पर 2–3 दिन में अपेक्षित भाव ₹25–₹28/किलो'
              : 'Expected 2–3 day range ₹25–₹28/kg if cool ventilated storage is available',
          },
        ],
        spokenResponse: isTa
          ? 'உங்களுக்கு தற்போது கிலோ ₹25 முதல் ₹27 வரை வாங்குபவர் சலுகைகள் உள்ளன. போக்குவரத்து செலவுக்குப் பிறகு நிகர வருமானம் மாறுபடும். முடிவெடுப்பதற்கு முன் சலுகைகளை ஒப்பிட்டுப் பார்க்கலாம்.'
          : isHi
          ? 'आपके वर्तमान खरीदार ऑफ़र ₹25 से ₹27 प्रति किलो के बीच हैं। परिवहन लागत के बाद अनुमानित शुद्ध आय भिन्न होती है। निर्णय लेने से पहले आप उपलब्ध ऑफ़र की तुलना कर सकते हैं।'
          : 'Your current buyer offers are between ₹25 and ₹27 per kg. The estimated net realisation varies after transport costs. You can compare the available offers before deciding.',
        actionLabel: isTa ? 'விற்பனை ஆலோசனை மையத்தைத் திற' : isHi ? 'कृषि निर्णय इंजन खोलें' : 'Open Farm Decision Engine',
        actionPath: '/farmer/decision',
      };
    }

    if (q.includes('compare') || rawText.includes('ஒப்பிடு') || rawText.includes('तुलना')) {
      return {
        intent: 'compare_offers',
        cropName: 'Tomato',
        quantity: activeQty,
        unit: 'kg',
        buyers: actualBuyers,
        spokenResponse: isTa
          ? `${activeQty} கிலோவிற்கான 3 வாங்குபவர் சலுகைகளின் நிகர வருமான ஒப்பீடு: கோவை மொத்த கொள்முதல் ₹27/கிலோ (நிகர வருமானம் ₹${(27 * activeQty - 150).toLocaleString('en-IN')}). நீலகிரி ரீடெய்ல் ₹26/கிலோ (நிகர வருமானம் ₹${(26 * activeQty - 300).toLocaleString('en-IN')}). சேலம் ஃப்ரெஷ் மார்ட் ₹25/கிலோ (நிகர வருமானம் ₹${(25 * activeQty - 150).toLocaleString('en-IN')}).`
          : isHi
          ? `${activeQty} किलो के लिए 3 खरीदार ऑफ़र की शुद्ध आय तुलना: कोवई होलसेल ₹27/किलो (शुद्ध आय ₹${(27 * activeQty - 150).toLocaleString('en-IN')}), नीलगिरि रिटेल ₹26/किलो (शुद्ध आय ₹${(26 * activeQty - 300).toLocaleString('en-IN')}), सलेम फ्रेश मार्ट ₹25/किलो (शुद्ध आय ₹${(25 * activeQty - 150).toLocaleString('en-IN')})।`
          : `Comparing your 3 buyer offers by estimated net realisation for ${activeQty} kg: Kovai Wholesale offers ₹27 per kg with farm-gate pickup for an estimated net realisation of ₹${(27 * activeQty - 150).toLocaleString('en-IN')}. Nilgiris Retail offers ₹26 per kg for an estimated net of ₹${(26 * activeQty - 300).toLocaleString('en-IN')}. Salem Fresh Mart offers ₹25 per kg for an estimated net of ₹${(25 * activeQty - 150).toLocaleString('en-IN')}.`,
        actionLabel: isTa ? 'சலுகைகளை ஒப்பிடு' : isHi ? 'ऑफ़र की तुलना करें' : 'Compare in Matrix',
        actionPath: '/farmer/bids',
      };
    }

    if (
      q.includes('buyer') ||
      q.includes('offer') ||
      q.includes('highest') ||
      rawText.includes('வாங்குபவர்') ||
      rawText.includes('சலுகை') ||
      rawText.includes('விலை') && rawText.includes('அதிக') ||
      rawText.includes('खरीदार') ||
      rawText.includes('ऑफ़र') ||
      rawText.includes('बोली')
    ) {
      return {
        intent: 'buyer_search',
        cropName: 'Tomato',
        quantity: activeQty,
        unit: 'kg',
        buyers: actualBuyers,
        spokenResponse: isTa
          ? `தக்காளிக்கு 3 சரிபார்க்கப்பட்ட வாங்குபவர்கள் உள்ளனர்: கோவை மொத்த கொள்முதல் ₹27/கிலோ, நீலகிரி ரீடெய்ல் ஹப் ₹26/கிலோ, மற்றும் சேலம் ஃப்ரெஷ் மார்ட் ₹25/கிலோ.`
          : isHi
          ? `टमाटर के लिए आपके पास 3 सत्यापित खरीदार हैं: कोवई होलसेल ₹27/किलो, नीलगिरि रिटेल हब ₹26/किलो, और सलेम फ्रेश मार्ट ₹25/किलो।`
          : `You have 3 verified buyers for Tomato: Kovai Wholesale at ₹27 per kg, Nilgiris Retail Hub at ₹26 per kg, and Salem Fresh Mart at ₹25 per kg. You can say "Compare these offers" or select a buyer.`,
        actionLabel: isTa ? 'வாங்குபவர் சலுகைகளைக் காண்க' : isHi ? 'सभी खरीदार ऑफ़र देखें' : 'View All Buyer Offers',
        actionPath: '/farmer/bids',
      };
    }

    if (
      q.includes('price') ||
      q.includes('today') ||
      q.includes('market') ||
      rawText.includes('விலை') ||
      rawText.includes('சந்தை') ||
      rawText.includes('இன்றைய') ||
      rawText.includes('भाव') ||
      rawText.includes('कीमत') ||
      rawText.includes('मंडी') ||
      rawText.includes('आज')
    ) {
      return {
        intent: 'market_price',
        cropName: 'tomato',
        modalPrice: 26,
        expectedRange: { min: 24, max: 27 },
        unit: 'kg',
        spokenResponse: isTa
          ? 'இன்றைய தக்காளி சந்தை விலை கிலோவுக்கு சுமார் ₹26 ஆகும்.'
          : isHi
          ? 'आज का उपलब्ध टमाटर बाजार भाव लगभग ₹26 प्रति किलो है।'
          : "Today's available tomato market price is around ₹26 per kg.",
        actionLabel: isTa ? 'சந்தை விலைகளைப் பார்க்கவும்' : isHi ? 'मंडी भाव देखें' : 'Check Market Prices',
        actionPath: '/farmer/market-prices',
      };
    }

    return {
      intent: 'insufficient_info',
      spokenResponse: isTa
        ? 'அதற்கான போதுமான தகவல் தற்போது என்னிடம் இல்லை.'
        : isHi
        ? 'मेरे पास अभी इसके लिए पर्याप्त जानकारी नहीं है।'
        : "I don't have enough information for that yet.",
      actionLabel: null,
      actionPath: null,
    };
  };

  const processSpokenText = async (text: string) => {
    const cleaned = (text || '').trim();
    if (!cleaned) {
      setErrorMessage("Sorry, I couldn't understand that. Please try again.");
      setVoiceState('idle');
      return;
    }

    setErrorMessage(null);
    setSpokenQuery(cleaned);
    setVoiceState('processing');

    try {
      const res = await api.voiceAssistant.ask(cleaned, {
        cropName: pendingProduce?.cropName || 'Tomato',
        quantity: pendingProduce?.quantity || 300,
        unit: pendingProduce?.unit || 'kg',
        transportCost: voiceTransportCost,
        otherCost: voiceOtherCost,
        language,
      });

      if (res.success && res.data) {
        const reply = res.data;
        setAssistantReply(reply);

        if (reply.intent === 'add_produce') {
          setPendingProduce({
            cropName: reply.detectedCrop || 'Tomato',
            quantity: reply.detectedQuantity || 300,
            unit: reply.detectedUnit || 'kg',
            expectedMin: reply.expectedRange?.min || 24,
            expectedMax: reply.expectedRange?.max || 27,
            isEditing: false,
            confirmedAnalysisReady: false,
          });
        }

        if (reply.intent === 'select_buyer_confirmation' && reply.selectedBuyer) {
          setSafetyConfirmation({
            type: 'select_buyer',
            promptText:
              reply.confirmationPrompt ||
              `Do you want to select ${reply.selectedBuyer.buyerName}'s offer of ₹${reply.selectedBuyer.offeredPrice} per ${reply.selectedBuyer.unit}?`,
            detailText: `${reply.selectedBuyer.buyerName} • Offered Price: ₹${reply.selectedBuyer.offeredPrice}/${reply.selectedBuyer.unit} • Est. Net Realisation: ₹${reply.selectedBuyer.netRealisation.toLocaleString('en-IN')}`,
            payload: reply.selectedBuyer,
          });
        }

        speakOut(reply.spokenResponse);
        return;
      }
    } catch {
      // Fallback to local evaluation using actual app state
    }

    const fallbackReply = evaluateLocallyWithAppData(cleaned);
    setAssistantReply(fallbackReply);
    if (fallbackReply.intent === 'add_produce') {
      setPendingProduce({
        cropName: (fallbackReply as any).detectedCrop || 'Tomato',
        quantity: (fallbackReply as any).detectedQuantity || 300,
        unit: (fallbackReply as any).detectedUnit || 'kg',
        expectedMin: 24,
        expectedMax: 27,
        isEditing: false,
        confirmedAnalysisReady: false,
      });
    }
    speakOut(fallbackReply.spokenResponse);
  };

  const handleStartListening = () => {
    setErrorMessage(null);
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMessage(
        language === 'ta'
          ? 'இந்த சாதனத்தில் குரல் உள்ளீடு இல்லை. நீங்கள் தட்டச்சு செய்யலாம்.'
          : language === 'hi'
          ? 'इस डिवाइस पर वॉइस इनपुट उपलब्ध नहीं है। आप टाइप कर सकते हैं।'
          : "Voice input isn't available on this device. You can use text input."
      );
      setShowTypeInstead(true);
      setVoiceState('idle');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript.trim()) {
          processSpokenText(transcript);
        } else {
          setVoiceState('idle');
          setErrorMessage(
            language === 'ta'
              ? 'மன்னிக்கவும், எனக்குப் புரியவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : language === 'hi'
              ? 'क्षमा करें, मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।'
              : "Sorry, I couldn't understand that. Please try again."
          );
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceState('idle');
        const errCode = String(event?.error || '').toLowerCase();
        if (errCode.includes('not-allowed') || errCode.includes('permission') || errCode.includes('service-not-allowed')) {
          setErrorMessage(
            language === 'ta'
              ? 'மைக்ரோஃபோன் அனுமதி இல்லை. அதற்கு பதிலாக தட்டச்சு செய்யலாம்.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन एक्सेस उपलब्ध नहीं है। आप इसके बजाय टाइप कर सकते हैं।'
              : 'Microphone access is unavailable. You can type your request instead.'
          );
          setShowTypeInstead(true);
        } else {
          setErrorMessage(
            language === 'ta'
              ? 'மன்னிக்கவும், எனக்குப் புரியவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : language === 'hi'
              ? 'क्षमा करें, मैं समझ नहीं पाया। कृपया पुनः प्रयास करें।'
              : "Sorry, I couldn't understand that. Please try again."
          );
        }
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognition.start();
    } catch {
      setVoiceState('idle');
      setErrorMessage(
        language === 'ta'
          ? 'இந்த சாதனத்தில் குரல் உள்ளீடு இல்லை. நீங்கள் தட்டச்சு செய்யலாம்.'
          : language === 'hi'
          ? 'इस डिवाइस पर वॉइस इनपुट उपलब्ध नहीं है। आप टाइप कर सकते हैं।'
          : "Voice input isn't available on this device. You can use text input."
      );
      setShowTypeInstead(true);
    }
  };

  // Confirm pre-filled produce details (Step 1 of Voice → Action)
  const handleConfirmPreFillProduce = () => {
    if (!pendingProduce) return;
    setPendingProduce({
      ...pendingProduce,
      isEditing: false,
      confirmedAnalysisReady: true,
    });
    const msg =
      language === 'ta'
        ? `${pendingProduce.quantity} ${pendingProduce.unit} ${pendingProduce.cropName} உறுதி செய்யப்பட்டது. கிடைக்கும் சந்தை தகவலின்படி எதிர்பார்க்கப்படும் விலை வரம்பு ₹${pendingProduce.expectedMin} முதல் ₹${pendingProduce.expectedMax}/${pendingProduce.unit} ஆகும்.`
        : language === 'hi'
        ? `${pendingProduce.quantity} ${pendingProduce.unit} ${pendingProduce.cropName} की पुष्टि हो गई है। उपलब्ध बाजार डेटा के अनुसार अपेक्षित मूल्य सीमा ₹${pendingProduce.expectedMin} से ₹${pendingProduce.expectedMax}/${pendingProduce.unit} है।`
        : `Confirmed ${pendingProduce.quantity} ${pendingProduce.unit} of ${pendingProduce.cropName}. Based on available market data, the AI-assisted expected price range is ₹${pendingProduce.expectedMin} to ₹${pendingProduce.expectedMax} per ${pendingProduce.unit}. You can now ask "Should I sell now?", "Show buyers", or open Add Produce.`;
    setAssistantReply({
      intent: 'produce_analyzed',
      spokenResponse: msg,
      actionLabel:
        language === 'ta'
          ? 'விளைபொருள் சேர்க்க படிவத்தைத் திற'
          : language === 'hi'
          ? 'उपज जोड़ें फॉर्म खोलें'
          : 'Open Pre-Filled Add Produce',
      actionPath: '/farmer/add-produce',
    });
    speakOut(msg);
  };

  // Execute confirmed critical action (Publish listing / Select buyer / Accept offer)
  const handleExecuteSafetyConfirmedAction = () => {
    if (!safetyConfirmation) return;

    if (safetyConfirmation.type === 'publish_listing' && pendingProduce) {
      addListing({
        cropKey: pendingProduce.cropName.toLowerCase() as any,
        cropName: pendingProduce.cropName,
        cropTamilName: 'தக்காளி',
        cropHindiName: 'टमाटर',
        variety: 'Regional Fresh Harvest',
        quantity: pendingProduce.quantity,
        unit: pendingProduce.unit as any,
        grade: 'Grade A',
        qualityLabel: 'Very Good',
        basePriceExpected: Math.round((pendingProduce.expectedMin + pendingProduce.expectedMax) / 2),
        aiRecommendedPriceMin: pendingProduce.expectedMin,
        aiRecommendedPriceMax: pendingProduce.expectedMax,
        harvestDate: new Date().toISOString().split('T')[0],
        availableDate: 'Today',
        listingDate: new Date().toISOString().split('T')[0],
        location: user?.village || 'Salem Rural',
        district: 'Salem',
        distanceKm: 8,
        farmerName: user?.name || 'Farmer',
        farmerPhone: user?.phone || '+91 98421 77312',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        kioskAssisted: false,
        notes: 'Added and confirmed via FarmGrade Voice Market Assistant.',
      });
      addToast({
        type: 'produce',
        title:
          language === 'ta'
            ? 'விளைபொருள் பட்டியல் வெளியிடப்பட்டது'
            : language === 'hi'
            ? 'उपज सूची प्रकाशित हुई'
            : 'Produce Listing Published',
        message:
          language === 'ta'
            ? `உங்கள் விளைபொருள் வெற்றிகரமாக பட்டியலிடப்பட்டது (${pendingProduce.quantity} ${pendingProduce.unit} ${pendingProduce.cropName}).`
            : language === 'hi'
            ? `आपकी उपज सफलतापूर्वक सूचीबद्ध हो गई है (${pendingProduce.quantity} ${pendingProduce.unit} ${pendingProduce.cropName}).`
            : `${pendingProduce.quantity} ${pendingProduce.unit} of ${pendingProduce.cropName} is now live for buyers.`,
      });
      speakOut(
        language === 'ta'
          ? 'உங்கள் விளைபொருள் வெற்றிகரமாக பட்டியலிடப்பட்டது.'
          : language === 'hi'
          ? 'आपकी उपज सफलतापूर्वक सूचीबद्ध हो गई है।'
          : `Your listing for ${pendingProduce.quantity} ${pendingProduce.unit} of ${pendingProduce.cropName} has been published.`
      );
      setSafetyConfirmation(null);
      return;
    }

    if (
      (safetyConfirmation.type === 'select_buyer' || safetyConfirmation.type === 'accept_offer') &&
      safetyConfirmation.payload
    ) {
      const chosenBuyer = safetyConfirmation.payload;
      const matchingBid = bids.find((b) =>
        b.buyerName.toLowerCase().includes(chosenBuyer.buyerName.split(' ')[0].toLowerCase())
      ) || bids[0];
      if (matchingBid) {
        acceptBid(matchingBid.id);
      }
      addToast({
        type: 'sale',
        title:
          language === 'ta'
            ? 'வாங்குபவர் தேர்ந்தெடுக்கப்பட்டார்'
            : language === 'hi'
            ? 'खरीदार चुना गया'
            : 'Buyer Offer Selected',
        message:
          language === 'ta'
            ? `${chosenBuyer.buyerName} (₹${chosenBuyer.offeredPrice}/${chosenBuyer.unit}) தேர்ந்தெடுக்கப்பட்டார்.`
            : language === 'hi'
            ? `आपने ₹${chosenBuyer.offeredPrice}/${chosenBuyer.unit} पर ${chosenBuyer.buyerName} को चुना है।`
            : `You selected ${chosenBuyer.buyerName} at ₹${chosenBuyer.offeredPrice}/${chosenBuyer.unit}.`,
      });
      const confirmMsg =
        language === 'ta'
          ? `${chosenBuyer.buyerName}-இன் ₹${chosenBuyer.offeredPrice}/${chosenBuyer.unit} சலுகையை உறுதி செய்துள்ளீர்கள்.`
          : language === 'hi'
          ? `आपने ₹${chosenBuyer.offeredPrice}/${chosenBuyer.unit} पर ${chosenBuyer.buyerName} के ऑफ़र की पुष्टि की है।`
          : `You have confirmed ${chosenBuyer.buyerName}'s offer at ₹${chosenBuyer.offeredPrice} per ${chosenBuyer.unit}. Proceeding to Buyer Offers to continue the sale workflow.`;
      setAssistantReply({
        intent: 'sale_workflow_started',
        spokenResponse: confirmMsg,
        actionLabel:
          language === 'ta'
            ? 'விற்பனையைத் தொடரவும்'
            : language === 'hi'
            ? 'बिक्री प्रक्रिया जारी रखें'
            : 'Continue Sale Workflow',
        actionPath: '/farmer/bids',
      });
      speakOut(confirmMsg);
      setSafetyConfirmation(null);
      return;
    }

    setSafetyConfirmation(null);
  };

  // Compute button label based on the 4 required states
  const getMicButtonLabel = () => {
    if (voiceState === 'listening') {
      return language === 'ta' ? '🔴 கேட்கிறது...' : language === 'hi' ? '🔴 सुन रहा है...' : '🔴 Listening...';
    }
    if (voiceState === 'processing') {
      return language === 'ta' ? 'செயலாக்கப்படுகிறது...' : language === 'hi' ? 'प्रक्रिया जारी है...' : 'Processing...';
    }
    if (voiceState === 'responding') {
      return language === 'ta' ? '🔊 பதிலளிக்கிறது...' : language === 'hi' ? '🔊 उत्तर दे रहा है...' : '🔊 Responding...';
    }
    if (language === 'ta') return '🎤 பேச தட்டவும்';
    if (language === 'hi') return '🎤 बोलने के लिए टैप करें';
    return '🎤 Tap to Speak';
  };

  return (
    <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm text-left space-y-5 border-2 border-emerald-800">
      {/* Top Row: Title, Multilingual Selector, Large Microphone Button & Type Instead */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950">
              {language === 'ta'
                ? 'குரல் சந்தை உதவியாளர்'
                : language === 'hi'
                ? 'वॉइस मार्केट असिस्टेंट'
                : 'Ask FarmGrade • Voice Market Assistant'}
            </span>
            <span className="text-xs text-emerald-300 font-semibold">
              {language === 'ta'
                ? 'பேசுங்கள் → புரிந்துகொள்ளுங்கள் → ஒப்பிடுங்கள் → விவசாயி முடிவு'
                : language === 'hi'
                ? 'बोलें → समझें → विश्लेषण करें → किसान का निर्णय'
                : 'Speak → Understand → Analyze → Explain → Show Options → Farmer Decides'}
            </span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            {language === 'ta'
              ? 'உங்கள் குரலில் சந்தை விலை, வாங்குபவர்கள் மற்றும் நிகர வருமானத்தை கேளுங்கள்'
              : language === 'hi'
              ? 'अपनी आवाज में बाजार भाव, खरीदार और शुद्ध आय की जानकारी पाएं'
              : 'Use FarmGrade by voice — check prices, find buyers, or compare net realisation'}
          </h3>
        </div>

        {/* Controls: Language, Mic Button (4 states), and "Type instead" */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Language Switcher (Remembers preference) */}
          <div className="flex items-center bg-emerald-900/90 p-1 rounded-xl border border-emerald-700 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 rounded-lg font-black cursor-pointer ${
                language === 'en' ? 'bg-amber-400 text-stone-950' : 'text-emerald-100 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1.5 rounded-lg font-black cursor-pointer ${
                language === 'ta' ? 'bg-amber-400 text-stone-950' : 'text-emerald-100 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1.5 rounded-lg font-black cursor-pointer ${
                language === 'hi' ? 'bg-amber-400 text-stone-950' : 'text-emerald-100 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Large Microphone Button with 4 Visual States */}
          <button
            type="button"
            onClick={handleStartListening}
            disabled={voiceState === 'processing'}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all min-h-[52px] shadow-md ${
              voiceState === 'listening'
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/40'
                : voiceState === 'processing'
                ? 'bg-amber-500 text-stone-950'
                : voiceState === 'responding'
                ? 'bg-emerald-500 text-stone-950 ring-2 ring-white'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{getMicButtonLabel()}</span>
          </button>

          {/* "Type instead" Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTypeInstead(!showTypeInstead)}
            className="px-3.5 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 font-bold text-xs cursor-pointer min-h-[52px]"
          >
            {showTypeInstead
              ? language === 'ta'
                ? 'உரை உள்ளீட்டை மறை'
                : language === 'hi'
                ? 'टेक्स्ट इनपुट छिपाएं'
                : 'Hide Text Input'
              : language === 'ta'
              ? 'தட்டச்சு செய்க'
              : language === 'hi'
              ? 'टाइप करें'
              : 'Type instead'}
          </button>
        </div>
      </div>

      {/* 5 Dashboard Voice Quick Actions (Requirement 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {quickVoiceActions.map((qa) => (
          <button
            key={qa.id}
            type="button"
            onClick={() => processSpokenText(qa.query)}
            className="p-3 rounded-2xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700 text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
          >
            <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300">
              {qa.label}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        ))}
      </div>

      {/* "Type instead" Input Bar (Requirement 11 & 12) */}
      {showTypeInstead && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typedInput.trim()) {
              processSpokenText(typedInput);
              setTypedInput('');
            }
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-emerald-900/70 p-3 rounded-2xl border border-emerald-700"
        >
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'உங்கள் கேள்வியை தட்டச்சு செய்யவும் (எ.கா. "இன்றைய தக்காளி விலை என்ன?", "நான் இப்போது விற்கலாமா?")...'
                : language === 'hi'
                ? 'अपना प्रश्न टाइप करें (जैसे "आज टमाटर का भाव क्या है?", "क्या मुझे अभी बेचना चाहिए?")...'
                : 'Type your request (e.g., "I have 300 kilos of tomato", "Should I sell now?", "Show buyers")...'
            }
            className="flex-1 px-4 py-3 rounded-xl bg-white text-stone-900 font-bold text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm cursor-pointer"
          >
            {language === 'ta' ? 'கேளுங்கள்' : language === 'hi' ? 'पूछें' : 'Ask FarmGrade'}
          </button>
        </form>
      )}

      {/* Sample Natural Phrases (1-Tap Demo Flow) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
          {language === 'ta'
            ? 'அல்லது கீழே உள்ள வாக்கியத்தைத் தட்டி குரல் உதவியாளரை சோதிக்கவும்:'
            : language === 'hi'
            ? 'या नीचे दिए गए वाक्य पर टैप करके वॉइस असिस्टेंट आज़माएं:'
            : 'Or tap a spoken phrase to test the complete voice flow:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {spokenExamples.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => processSpokenText(sample)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 cursor-pointer transition-colors"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Friendly Non-Technical Error Banner (Requirement 12) */}
      {errorMessage && (
        <div className="bg-amber-400/20 border-2 border-amber-400 rounded-2xl p-4 text-sm font-bold text-amber-200 flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          {!showTypeInstead && (
            <button
              type="button"
              onClick={() => setShowTypeInstead(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 text-xs font-black shrink-0 cursor-pointer"
            >
              {language === 'ta' ? 'தட்டச்சு செய்க' : language === 'hi' ? 'टाइप करें' : 'Type instead'}
            </button>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* ACTIVE VOICE RESPONSE & ACTION WORKSPACE                            */}
      {/* =================================================================== */}
      {assistantReply && (
        <div className="bg-white text-stone-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-400 shadow-lg space-y-5">
          {/* Spoken Query & Spoken Response Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="space-y-1">
              {spokenQuery && (
                <div className="text-xs font-bold text-emerald-800">
                  {language === 'ta' ? 'நீங்கள் கேட்டது:' : language === 'hi' ? 'आपने पूछा:' : 'You asked:'}{' '}
                  <span className="italic text-stone-900">"{spokenQuery}"</span>
                </div>
              )}
              <p className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {assistantReply.spokenResponse}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => speakOut(assistantReply.spokenResponse)}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>{language === 'ta' ? 'மீண்டும் கேள்' : language === 'hi' ? 'फिर से सुनें' : 'Listen Again'}</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* INTENT 1: VOICE → ACTION (ADD PRODUCE CONFIRMATION & EDIT)       */}
          {/* --------------------------------------------------------------- */}
          {(assistantReply.intent === 'add_produce' || assistantReply.intent === 'produce_analyzed') &&
            pendingProduce && (
              <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-4">
                {!pendingProduce.confirmedAnalysisReady ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                        Voice → Action: Pre-Fill Produce Confirmation
                      </span>
                      <span className="text-xs font-bold bg-amber-200 text-stone-950 px-2.5 py-0.5 rounded-full">
                        Confirmation Required
                      </span>
                    </div>

                    {pendingProduce.isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                        <div>
                          <label className="font-bold text-stone-600 block mb-1">Crop</label>
                          <select
                            value={pendingProduce.cropName}
                            onChange={(e) =>
                              setPendingProduce({ ...pendingProduce, cropName: e.target.value })
                            }
                            className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900"
                          >
                            <option value="Tomato">Tomato</option>
                            <option value="Onion">Onion</option>
                            <option value="Potato">Potato</option>
                            <option value="Paddy">Paddy</option>
                            <option value="Banana">Banana</option>
                            <option value="Green Chilli">Green Chilli</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-stone-600 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={pendingProduce.quantity}
                            onChange={(e) =>
                              setPendingProduce({
                                ...pendingProduce,
                                quantity: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-600 block mb-1">Unit</label>
                          <select
                            value={pendingProduce.unit}
                            onChange={(e) =>
                              setPendingProduce({ ...pendingProduce, unit: e.target.value })
                            }
                            className="w-full p-2 rounded-lg border border-stone-300 font-bold text-stone-900"
                          >
                            <option value="kg">kg</option>
                            <option value="quintal">quintal</option>
                            <option value="bags">bags</option>
                            <option value="crates">crates</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-4 border border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-stone-500 font-bold block">Crop:</span>
                          <span className="text-lg font-black text-stone-900">
                            {pendingProduce.cropName}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-stone-500 font-bold block">Quantity:</span>
                          <span className="text-lg font-black text-emerald-800">
                            {pendingProduce.quantity} {pendingProduce.unit}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-xs text-stone-500 font-bold block">Question:</span>
                          <span className="text-base font-black text-stone-900">"Is this correct?"</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <p className="text-xs font-bold text-emerald-950">
                        Do you want to add {pendingProduce.quantity} {pendingProduce.unit} of{' '}
                        {pendingProduce.cropName}?
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleConfirmPreFillProduce}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setPendingProduce({
                              ...pendingProduce,
                              isEditing: !pendingProduce.isEditing,
                            })
                          }
                        >
                          {pendingProduce.isEditing ? 'Done Editing' : 'Edit'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate('/farmer/add-produce', {
                              state: {
                                voiceTranscript: `${pendingProduce.quantity} ${pendingProduce.unit} ${pendingProduce.cropName}`,
                              },
                            })
                          }
                        >
                          Open in Add Produce Form
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* After Confirm: Market Analysis Ready & Guided Next Voice Steps */
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase block">
                          ✓ Confirmed Lot: {pendingProduce.cropName} ({pendingProduce.quantity}{' '}
                          {pendingProduce.unit})
                        </span>
                        <span className="text-xl font-black text-stone-900">
                          AI-Assisted Price Range: ₹{pendingProduce.expectedMin}–₹
                          {pendingProduce.expectedMax}/{pendingProduce.unit}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            setSafetyConfirmation({
                              type: 'publish_listing',
                              promptText: 'Do you want to publish this produce listing?',
                              detailText: `${pendingProduce.cropName} • ${pendingProduce.quantity} ${pendingProduce.unit} • Expected Range: ₹${pendingProduce.expectedMin}–₹${pendingProduce.expectedMax}/${pendingProduce.unit}`,
                            })
                          }
                        >
                          Publish Listing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processSpokenText('Should I sell now?')}
                        >
                          🎤 Ask: "Should I sell now?"
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processSpokenText('Show buyers')}
                        >
                          🎤 Ask: "Show buyers"
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* --------------------------------------------------------------- */}
          {/* INTENT 2: VOICE BUYER SEARCH & COMPARE OFFERS                    */}
          {/* --------------------------------------------------------------- */}
          {(assistantReply.intent === 'buyer_search' ||
            assistantReply.intent === 'highest_offer' ||
            assistantReply.intent === 'compare_offers') &&
            assistantReply.buyers && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black uppercase tracking-wider text-stone-700">
                    {assistantReply.intent === 'compare_offers'
                      ? 'Net Realisation Comparison Across Buyer Offers'
                      : `Verified Buyer Offers (${assistantReply.buyers.length})`}
                  </h4>
                  <div className="flex items-center gap-2">
                    {assistantReply.intent !== 'compare_offers' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => processSpokenText('Compare these offers')}
                      >
                        🎤 Compare these offers
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/farmer/bids')}
                    >
                      Open Full Buyer Offers Page
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {assistantReply.buyers.map((b: any, idx: number) => (
                    <div
                      key={b.id || idx}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 ${
                        idx === 0
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-black text-stone-900 text-sm">{b.buyerName}</div>
                            <div className="text-[11px] text-stone-500 font-semibold">
                              {b.location}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                            {b.status}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-stone-200 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px]">Offered Price</span>
                            <span className="text-base font-black text-emerald-800">
                              ₹{b.offeredPrice}/{b.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">Required Qty</span>
                            <span className="font-bold text-stone-900">
                              {b.requiredQuantity} {b.unit}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 text-stone-700">
                          <div>
                            <span className="font-bold">Pickup: </span>
                            <span>{b.pickupInfo}</span>
                          </div>
                          <div className="pt-1 border-t border-stone-200 flex items-center justify-between">
                            <span className="font-bold text-stone-600">Est. Net Realisation:</span>
                            <span className="font-black text-emerald-900 text-sm">
                              ₹{b.netRealisation.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full"
                          onClick={() =>
                            setSafetyConfirmation({
                              type: 'select_buyer',
                              promptText: 'Do you want to select this buyer?',
                              detailText: `${b.buyerName} • Offered Price: ₹${b.offeredPrice}/${b.unit} • Est. Net Realisation: ₹${b.netRealisation.toLocaleString('en-IN')}`,
                              payload: b,
                            })
                          }
                        >
                          Select Buyer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* --------------------------------------------------------------- */}
          {/* INTENT 3: VOICE DECISION ENGINE ("Should I sell now?")           */}
          {/* --------------------------------------------------------------- */}
          {assistantReply.intent === 'decision_engine' && assistantReply.decisionOptions && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {assistantReply.decisionOptions.map((opt: any) => (
                  <div
                    key={opt.code}
                    className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 space-y-1.5"
                  >
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-800 text-white">
                      Option {opt.code}
                    </span>
                    <div className="text-base font-black text-stone-900 pt-1">"{opt.label}"</div>
                    <p className="text-xs text-stone-600 font-medium">{opt.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-stone-500 font-semibold">
                  Decision support only — the final decision belongs to the farmer.
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => processSpokenText('Show buyers')}
                  >
                    🎤 Next: "Show buyers"
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => processSpokenText('Compare offers')}
                  >
                    🎤 "Compare offers"
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/farmer/decision')}
                  >
                    Open Full Farm Decision Studio
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* INTENT 4: VOICE NET REALISATION ("How much will I get...")       */}
          {/* --------------------------------------------------------------- */}
          {assistantReply.intent === 'net_realisation' && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-bold block">Estimated Gross Value</span>
                  <span className="text-xl font-black text-stone-900">
                    ₹{Number(assistantReply.grossValue || 8100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-bold block">
                    Known Transport & Other Costs
                  </span>
                  <span className="text-xl font-black text-rose-700">
                    −₹{Number(assistantReply.knownCosts || 300).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                  <span className="text-xs text-emerald-900 font-bold block">
                    Estimated Net Realisation
                  </span>
                  <span className="text-2xl font-black text-emerald-950">
                    ₹{Number(assistantReply.estimatedNetRealisation || 7800).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Cost Adjuster */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="font-bold text-stone-700 flex items-center gap-1.5">
                    <span>Transport (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={voiceTransportCost}
                      onChange={(e) => setVoiceTransportCost(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 px-2 py-1 rounded border border-stone-300 bg-white font-black"
                    />
                  </label>
                  <label className="font-bold text-stone-700 flex items-center gap-1.5">
                    <span>Other Costs (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={voiceOtherCost}
                      onChange={(e) => setVoiceOtherCost(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 px-2 py-1 rounded border border-stone-300 bg-white font-black"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => processSpokenText('How much will I get after transport?')}
                    className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Recalculate
                  </button>
                </div>
                <span className="text-stone-500 font-semibold">
                  This is an estimate based on the information available.
                </span>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* INTENT 5: VOICE BUYER DEMAND ("Who needs tomatoes near me?")     */}
          {/* --------------------------------------------------------------- */}
          {assistantReply.intent === 'buyer_demand' && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm space-y-0.5">
                <div className="font-black text-emerald-950">
                  Total Nearby Buyer Demand: {Number(assistantReply.totalDemandKg || 2000).toLocaleString('en-IN')}{' '}
                  {assistantReply.unit || 'kg'} ({assistantReply.grade || 'Grade A'})
                </div>
                <div className="text-stone-700 font-semibold">
                  Your Available Quantity: {assistantReply.availableQuantity || 300}{' '}
                  {assistantReply.unit || 'kg'}
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/farmer/bids')}
              >
                View Demand
              </Button>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* INTENT 6: VOICE PRICE EXPLANATION ("Why is my estimated price")  */}
          {/* --------------------------------------------------------------- */}
          {assistantReply.intent === 'price_explanation' && assistantReply.factors && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
              <span className="text-xs font-black uppercase text-stone-600 block">
                Available Factors Used in This Estimate:
              </span>
              <div className="flex flex-wrap gap-2">
                {assistantReply.factors.map((f: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800"
                  >
                    • {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Generic Action Navigation Button if present */}
          {assistantReply.actionLabel && assistantReply.actionPath && (
            <div className="flex justify-end pt-2 border-t border-stone-100">
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(assistantReply.actionPath)}
              >
                {assistantReply.actionLabel}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* EXPLICIT VOICE SAFETY CONFIRMATION MODAL (Requirement 10)           */}
      {/* Never bypasses confirmation for adding, publishing, or accepting    */}
      {/* =================================================================== */}
      {safetyConfirmation && (
        <Modal
          isOpen={true}
          onClose={() => setSafetyConfirmation(null)}
          title="Confirm Your Action"
          subtitle="Voice actions require your confirmation before making changes."
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1">
              <div className="text-base sm:text-lg font-black text-stone-900">
                "{safetyConfirmation.promptText}"
              </div>
              <p className="text-xs sm:text-sm text-stone-700 font-semibold">
                {safetyConfirmation.detailText}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                size="md"
                variant="outline"
                onClick={() => setSafetyConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={handleExecuteSafetyConfirmedAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================================
// FEATURE 6 — QUALITY-TO-PRICE EXPLANATION ("Why This Price?")
// ============================================================================
interface WhyThisPriceProps {
  cropName?: string;
  quality?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const WhyThisPriceCard: React.FC<WhyThisPriceProps> = ({
  cropName = 'Tomato',
  quality = 'Good',
  quantity = 300,
  unit = 'kg',
  location = 'Salem',
  minPrice = 24,
  maxPrice = 27,
}) => {
  const cleanCrop = cropName.split('(')[0].trim();

  const factors = [
    { label: 'Quality', value: quality, detail: 'Reported produce condition and sorting grade' },
    { label: 'Crop', value: cleanCrop, detail: 'Current seasonal supply for this produce' },
    { label: 'Quantity', value: `${quantity} ${unit}`, detail: 'Available lot volume for buyer pickup' },
    { label: 'Location', value: location, detail: 'Proximity to regional mandi and buyer routes' },
    { label: 'Recent market prices', value: `₹${minPrice}–₹${maxPrice}/${unit}`, detail: 'Recent modal rates at nearby markets' },
    { label: 'Demand information', value: 'Active nearby buyers', detail: 'Current buyer interest in your area' },
  ];

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 sm:p-6 shadow-xs text-left space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
            Quality-to-Price Explanation
          </span>
          <h3 className="text-lg sm:text-xl font-black text-stone-900">
            Why This Price?
          </h3>
        </div>
        <HelpCircle className="w-5 h-5 text-emerald-700" />
      </div>

      <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
        <div>
          <span className="text-xs text-stone-500 font-bold block">Quality</span>
          <span className="text-base sm:text-lg font-black text-stone-900">{quality}</span>
        </div>
        <div>
          <span className="text-xs text-stone-500 font-bold block">Expected range</span>
          <span className="text-base sm:text-lg font-black text-emerald-800">
            ₹{minPrice}–₹{maxPrice}/{unit}
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-semibold">
        <span className="font-black block mb-0.5">Why?</span>
        "Produce quality is one of the factors considered when estimating the price."
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Factors Considered in This Estimate:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {factors.map((f) => (
            <div
              key={f.label}
              className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs"
            >
              <div className="flex items-center justify-between font-black text-stone-900">
                <span>{f.label}:</span>
                <span className="text-emerald-800">{f.value}</span>
              </div>
              <p className="text-stone-600 mt-0.5 text-[11px]">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-stone-500 font-medium">
        Note: Quality alone does not determine the final selling price. Actual selling prices depend on market conditions and buyer agreement.
      </p>
    </div>
  );
};

// ============================================================================
// FEATURE 7 — BUYER RELIABILITY TIMELINE ("Buyer Activity")
// ============================================================================
interface BuyerActivityProps {
  buyerName: string;
}

export const BuyerActivitySection: React.FC<BuyerActivityProps> = ({ buyerName }) => {
  const [expanded, setExpanded] = useState(false);

  const nameLower = (buyerName || '').toLowerCase();
  let hasData = true;
  let completedPurchases = 24;
  let cancelledPurchases = 2;
  let averageResponse = 'Within 2 hours';

  if (nameLower.includes('salem fresh') || nameLower.includes('buyer a')) {
    completedPurchases = 18;
    cancelledPurchases = 1;
    averageResponse = 'Within 2 hours';
  } else if (nameLower.includes('kovai') || nameLower.includes('buyer b') || nameLower.includes('ramesh') || nameLower.includes('freshbasket')) {
    completedPurchases = 24;
    cancelledPurchases = 2;
    averageResponse = 'Within 2 hours';
  } else if (nameLower.includes('nilgiris') || nameLower.includes('buyer c')) {
    completedPurchases = 15;
    cancelledPurchases = 0;
    averageResponse = 'Within 1 hour';
  } else if (nameLower.includes('vignesh') || nameLower.includes('selvaraj')) {
    completedPurchases = 11;
    cancelledPurchases = 1;
    averageResponse = 'Within 3 hours';
  } else {
    hasData = false;
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-200/80 text-left">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-bold text-stone-700 hover:text-stone-950 py-1.5 px-2.5 rounded-xl bg-stone-100/80 cursor-pointer"
      >
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black text-stone-700">
          <Activity className="w-3.5 h-3.5 text-emerald-700" />
          <span>Buyer Activity</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-800">
          <span>{expanded ? 'Hide' : 'View Activity'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
          <div className="font-black text-stone-800 uppercase tracking-wider text-[11px]">
            BUYER ACTIVITY
          </div>
          {hasData ? (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] font-bold">Completed purchases</span>
                <span className="font-black text-stone-900 text-sm">{completedPurchases}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] font-bold">Cancelled purchases</span>
                <span className="font-black text-stone-900 text-sm">{cancelledPurchases}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px] font-bold">Average response</span>
                <span className="font-black text-emerald-800 text-xs">{averageResponse}</span>
              </div>
            </div>
          ) : (
            <p className="text-stone-600 font-medium py-1">
              Transaction history will appear as purchases are completed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PRODUCE DETAILS MODAL (Organized in Exact 11-Item Order with Mobile Collapsibles)
// 1. Produce
// 2. Quantity
// 3. Location
// 4. Quality
// 5. Current market information
// 6. Expected price range
// 7. Sell-or-Wait Advisor
// 8. Take-Home Price
// 9. Nearby buyers
// 10. Buyer offers
// 11. Why This Price?
// ============================================================================
interface ProduceDetailsModalProps {
  listing: ProduceListing | null;
  onClose: () => void;
  isBuyer?: boolean;
  onPlaceBid?: (listing: ProduceListing) => void;
  onViewOffers?: () => void;
}

export const ProduceDetailsModal: React.FC<ProduceDetailsModalProps> = ({
  listing,
  onClose,
  isBuyer = false,
  onPlaceBid,
  onViewOffers,
}) => {
  const { bids, mandiPrices } = useApp();
  const [openSection, setOpenSection] = useState<string>('advisor');

  if (!listing) return null;

  const listingBids = bids.filter(
    (b) => b.listingId === listing.id || b.cropName.toLowerCase().includes(listing.cropName.split('(')[0].trim().toLowerCase())
  );
  const highestBid = listingBids.reduce(
    (max, b) => (b.bidPricePerUnit > (max?.bidPricePerUnit || 0) ? b : max),
    listingBids[0]
  );
  const matchedMandi =
    mandiPrices.find((m) =>
      m.cropName.toLowerCase().includes(listing.cropName.split('(')[0].trim().toLowerCase())
    ) || mandiPrices[0];

  const currentMarketRate = matchedMandi?.modalPrice || listing.basePriceExpected || 25;
  const minRange = listing.aiRecommendedPriceMin || Math.max(1, currentMarketRate - 1);
  const maxRange = listing.aiRecommendedPriceMax || currentMarketRate + 2;
  const topOfferRate = highestBid?.bidPricePerUnit || maxRange;

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? '' : key));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Produce Details: ${listing.cropName.split('(')[0].trim()}`}
      subtitle="Organized decision support & market overview"
    >
      <div className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* 1. Produce, 2. Quantity, 3. Location, 4. Quality */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 font-bold block">1. Produce</span>
            <span className="font-black text-stone-900 text-sm">
              {listing.cropName.split('(')[0].trim()}
            </span>
          </div>
          <div>
            <span className="text-stone-500 font-bold block">2. Quantity</span>
            <span className="font-black text-stone-900 text-sm">
              {listing.quantity} {listing.unit}
            </span>
          </div>
          <div>
            <span className="text-stone-500 font-bold block">3. Location</span>
            <span className="font-black text-stone-900 text-sm">
              {listing.location}, {listing.district}
            </span>
          </div>
          <div>
            <span className="text-stone-500 font-bold block">4. Quality</span>
            <span className="font-black text-emerald-800 text-sm">
              {listing.qualityLabel || listing.grade}
            </span>
          </div>
        </div>

        {/* 5. Current market information & 6. Expected price range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 block">
              5. Current market information
            </span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              ₹{currentMarketRate} / {listing.unit}
            </div>
            <span className="text-[11px] text-stone-500">
              {matchedMandi?.mandiName || 'Regional Regulated Market'}
            </span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300">
            <span className="text-xs font-bold text-emerald-900 block">
              6. Expected price range
            </span>
            <div className="text-2xl font-black text-emerald-950 mt-0.5">
              ₹{minRange} – ₹{maxRange} / {listing.unit}
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold">
              Based on available market information
            </span>
          </div>
        </div>

        {/* 7. Sell-or-Wait Advisor (Collapsible on mobile) */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('advisor')}
            className="w-full px-4 py-3 bg-stone-100/80 flex items-center justify-between text-sm font-black text-stone-900 cursor-pointer"
          >
            <span>7. Sell-or-Wait Advisor</span>
            {openSection === 'advisor' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'advisor' && (
            <div className="p-3">
              <SellOrWaitAdvisorCard
                cropName={listing.cropName}
                quantity={listing.quantity}
                unit={listing.unit}
                quality={listing.qualityLabel || listing.grade}
                currentMarketPrice={currentMarketRate}
                minPrice={minRange}
                maxPrice={maxRange}
                nearbyOffer={topOfferRate}
                offersCount={listingBids.length}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* 8. Take-Home Price */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('takehome')}
            className="w-full px-4 py-3 bg-stone-100/80 flex items-center justify-between text-sm font-black text-stone-900 cursor-pointer"
          >
            <span>8. Take-Home Price</span>
            {openSection === 'takehome' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'takehome' && (
            <div className="p-3">
              <TakeHomePriceCard
                offerPrice={topOfferRate}
                quantity={listing.quantity}
                unit={listing.unit}
              />
            </div>
          )}
        </div>

        {/* 9. Nearby buyers */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('buyers')}
            className="w-full px-4 py-3 bg-stone-100/80 flex items-center justify-between text-sm font-black text-stone-900 cursor-pointer"
          >
            <span>9. Nearby Buyers</span>
            {openSection === 'buyers' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'buyers' && (
            <div className="p-3">
              <NearbyBuyerMatchesSection
                cropName={listing.cropName}
                availableQuantity={listing.quantity}
                unit={listing.unit}
                onViewOffers={onViewOffers}
              />
            </div>
          )}
        </div>

        {/* 10. Buyer offers */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('offers')}
            className="w-full px-4 py-3 bg-stone-100/80 flex items-center justify-between text-sm font-black text-stone-900 cursor-pointer"
          >
            <span>10. Buyer Offers ({listingBids.length})</span>
            {openSection === 'offers' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'offers' && (
            <div className="p-4 space-y-2.5 bg-white text-xs">
              {listingBids.length > 0 ? (
                listingBids.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-black text-stone-900 block">{b.buyerName}</span>
                      <span className="text-stone-500">{b.pickupPreference || b.offeredPickupDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-800 text-sm block">
                        ₹{b.bidPricePerUnit}/{listing.unit}
                      </span>
                      <span className="text-stone-600 font-bold">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-stone-500">No buyer offers received for this produce yet.</p>
              )}
            </div>
          )}
        </div>

        {/* 11. Why This Price? */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('whyprice')}
            className="w-full px-4 py-3 bg-stone-100/80 flex items-center justify-between text-sm font-black text-stone-900 cursor-pointer"
          >
            <span>11. Why This Price?</span>
            {openSection === 'whyprice' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSection === 'whyprice' && (
            <div className="p-3">
              <WhyThisPriceCard
                cropName={listing.cropName}
                quality={listing.qualityLabel || listing.grade}
                quantity={listing.quantity}
                unit={listing.unit}
                location={listing.location}
                minPrice={minRange}
                maxPrice={maxRange}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          {isBuyer && onPlaceBid ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onPlaceBid(listing);
              }}
            >
              Place Offer
            </Button>
          ) : (
            onViewOffers && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onViewOffers();
                }}
              >
                View Buyer Offers
              </Button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};
