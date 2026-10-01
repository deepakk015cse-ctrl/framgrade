import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BidCard } from '../../components/common/BidCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { BidComparisonTable, ComparisonBid } from '../../components/common/BidComparisonTable';
import { BiddingStatusTimeline, TimelineStep } from '../../components/common/BiddingStatusTimeline';
import { TakeHomePriceCard, SellOrWaitAdvisorCard } from '../../components/common/InnovationModules';
import {
  NetRealisationCalculator,
  WhatIfSimulator,
  WhyThisPriceModal,
} from '../../components/common/DecisionSupportTools';
import { Bid } from '../../types';
import {
  DollarSign,
  ArrowLeftRight,
  Check,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Sparkles,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { farmerNotifications, sanitizeFarmerErrorMessage } from '../../services/notificationService';

export const FarmerBidsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bids: localBids, addToast, language, showFarmerError, showConfirmation, t } = useApp();


  // State
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('cards');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedBidForCounter, setSelectedBidForCounter] = useState<any | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [backupBannerOffer, setBackupBannerOffer] = useState<any | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  // Live competitive bidding data from backend
  const [comparisonBids, setComparisonBids] = useState<ComparisonBid[]>([]);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(1);
  const [cancelledCount, setCancelledCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [activeListingId, setActiveListingId] = useState<number>(1);
  const [listingInfo, setListingInfo] = useState<any>({
    cropName: 'Tomato',
    quantity: 450,
    unit: 'kg',
    quality: 'Grade A+ (Premium)',
  });

  // Load live bids and timeline from PostgreSQL backend
  const fetchListingBidsAndTimeline = async () => {
    setIsLoading(true);
    try {
      const [bidsRes, timelineRes] = await Promise.all([
        api.bids.getByListing(activeListingId),
        api.bids.getTimeline(activeListingId),
      ]);

      if (bidsRes.success) {
        setComparisonBids(bidsRes.data);
        if (bidsRes.listing) {
          setListingInfo(bidsRes.listing);
        }
      }

      if (timelineRes.success) {
        setTimelineSteps(timelineRes.steps);
        setCurrentStageIndex(timelineRes.currentStageIndex);
        setCancelledCount(timelineRes.cancelledBidsCount || 0);
      }
    } catch (err) {
      console.warn('Backend bids fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListingBidsAndTimeline();
  }, [activeListingId]);

  // 1. Farmer Selects Buyer (Deal enters "Buyer Confirmation" stage)
  const handleSelectBuyer = async (bidId: number) => {
    setIsActionLoading(true);
    try {
      const res = await api.bids.selectBuyer(bidId);
      if (res.success) {
        addToast(farmerNotifications.buyerSelected(language));
        await fetchListingBidsAndTimeline();
      }
    } catch (err: any) {
      showFarmerError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Buyer Confirms Deal (Transaction becomes "Confirmed")
  const handleSimulateBuyerConfirm = async () => {
    const confirmingBid = comparisonBids.find(
      (b) => b.status === 'awaiting_buyer_confirmation'
    );
    if (!confirmingBid) {
      addToast({
        type: 'info',
        title: '🔔 No Active Buyer Selected',
        message: 'Please first select a buyer from the offers below.',
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await api.bids.confirmPurchase(confirmingBid.id);
      if (res.success) {
        addToast(farmerNotifications.saleConfirmed(language));
        await fetchListingBidsAndTimeline();
      }
    } catch (err: any) {
      showFarmerError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Selected Buyer Cancels -> System Automatically Offers to Next Eligible Buyer!
  const handleSimulateBuyerCancel = async () => {
    const activeConfirming = comparisonBids.find(
      (b) => b.status === 'awaiting_buyer_confirmation'
    );
    if (!activeConfirming) {
      addToast({
        type: 'warning',
        title: '⚠️ No Pending Buyer',
        message: 'Please select a buyer first before simulating cancellation.',
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await api.bids.cancelSelection(
        activeConfirming.id,
        'Selected buyer was unable to schedule transport.'
      );

      if (res.success) {
        addToast(farmerNotifications.buyerCancelled(language));

        if (res.backupBuyerFound && res.backupOffer) {
          setBackupBannerOffer(res.backupOffer);
          setTimeout(() => {
            addToast(
              farmerNotifications.backupBuyerAvailable(language, () => {
                handleOpenCounter(res.backupOffer);
              })
            );
          }, 800);
        }
        await fetchListingBidsAndTimeline();
      }
    } catch (err: any) {
      showFarmerError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineBid = (bidId: number) => {
    setComparisonBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'rejected' } : b))
    );
    addToast({
      type: 'info',
      title: 'Offer declined.',
      message: 'You can review other buyer offers at any time.',
    });
  };

  const handleOpenCounter = (bid: any) => {
    setSelectedBidForCounter(bid);
    setCounterPrice((bid.bidPrice || bid.bidPricePerUnit) + 2);
    setCounterModalOpen(true);
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBidForCounter) return;

    addToast({
      type: 'success',
      title: 'Counter Offer Submitted',
      message: `Proposed ₹${counterPrice} / unit to ${selectedBidForCounter.buyerName}.`,
    });
    setCounterModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Buyer Offers
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Compare buyer offers and select the best option for your harvest.
          </p>
        </div>

        {/* View Mode Toggle and Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchListingBidsAndTimeline}
            disabled={isLoading || isActionLoading}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 cursor-pointer text-xs font-bold flex items-center gap-1.5"
            title="Refresh Bids"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Comparison Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Produce Lot Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-3xl shrink-0">
            🍅
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <span>Lot #{activeListingId} • Active Bidding</span>
              <span className="bg-emerald-600 px-2 py-0.5 rounded text-white text-[10px]">
                {listingInfo.quality || 'Grade A+ (Premium)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {listingInfo.cropName} ({listingInfo.quantity} {listingInfo.unit})
            </h2>
            <p className="text-xs text-emerald-200 mt-1 flex flex-wrap items-center gap-2">
              <span>
                Location: Tiruchengode Rural • Expected Price: ₹{Math.max(1, (listingInfo.expectedPrice || 26) - 2)}–₹{(listingInfo.expectedPrice || 26) + 1}/{listingInfo.unit}
              </span>
              <button
                type="button"
                onClick={() => setWhyModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black cursor-pointer"
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
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-700/60 p-3 rounded-2xl text-center min-w-[120px]">
            <div className="text-[10px] text-emerald-300 font-bold uppercase">Total Offers</div>
            <div className="text-2xl font-black text-white">{comparisonBids.length}</div>
            <div className="text-[10px] text-emerald-300">Verified Buyers</div>
          </div>
        </div>
      </div>

      {/* Buyer Cancellation / Backup Buyer Banner */}
      {(cancelledCount > 0 || backupBannerOffer) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              The selected buyer is no longer available.
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-1">
              We found another eligible buyer for your produce.
            </p>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              const nextOffer =
                backupBannerOffer ||
                comparisonBids.find((b) => b.status === 'backup_offered' || b.status === 'pending') ||
                comparisonBids[0];
              if (nextOffer) {
                handleOpenCounter(nextOffer);
              }
            }}
          >
            View New Offer
          </Button>
        </div>
      )}

      {/* Live Status Timeline Component */}
      {timelineSteps.length > 0 && (
        <BiddingStatusTimeline
          steps={timelineSteps}
          currentStageIndex={currentStageIndex}
          cropName={listingInfo.cropName}
          onSimulateBuyerConfirm={handleSimulateBuyerConfirm}
          onSimulateBuyerCancel={handleSimulateBuyerCancel}
          isActionLoading={isActionLoading}
          cancelledBidsCount={cancelledCount}
        />
      )}

      {/* MAIN VIEW: Side-by-Side Comparison Matrix OR Card Grid */}
      {viewMode === 'matrix' ? (
        <BidComparisonTable
          bids={comparisonBids}
          onSelectBuyer={handleSelectBuyer}
          isActionLoading={isActionLoading}
          unit={listingInfo.unit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonBids.map((b) => (
            <BidCard
              key={b.id}
              bid={{
                id: `bid-${b.id}`,
                listingId: `list-${b.listingId}`,
                cropName: b.cropName,
                buyerName: b.buyerName,
                buyerCompany: b.buyerCompany,
                buyerPhone: b.buyerPhone,
                buyerRating: b.buyerRating || 4.8,
                bidPricePerUnit: b.bidPrice,
                requestedQuantity: b.quantity,
                totalAmount: b.totalAmount,
                offeredPickupDate: b.pickupPreference || 'Tomorrow morning',
                pickupPreference: b.pickupPreference || 'Buyer Pickup from Farm Gate',
                paymentTerms: b.paymentTerms,
                status: b.status as any,
                createdAt: b.createdAt,
                notes: b.notes,
              }}
              onAccept={() => handleSelectBuyer(b.id)}
              onReject={() => handleDeclineBid(b.id)}
              onCounter={handleOpenCounter}
            />
          ))}
        </div>
      )}

      {/* Interactive Buyer Net Realisation Calculator & Comparison */}
      <NetRealisationCalculator
        listingId={String(activeListingId)}
        cropName={listingInfo.cropName || 'Tomato'}
        quantity={listingInfo.quantity || 300}
        unit={listingInfo.unit || 'kg'}
        initialTransportCost={300}
        initialLoadingCost={100}
        initialOtherCost={0}
        onSelectBuyer={(bidId) => {
          const numId = Number(String(bidId).replace('bid-', ''));
          if (!Number.isNaN(numId) && numId > 0) {
            handleSelectBuyer(numId);
          }
        }}
      />

      {/* Decision Support on Buyer Offers: Take-Home Price & Sell-or-Wait Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TakeHomePriceCard
          offerPrice={comparisonBids[0]?.bidPrice || 27}
          quantity={listingInfo.quantity || 300}
          unit={listingInfo.unit || 'kg'}
          initialTransportCost={400}
          initialOtherCost={100}
        />
        <SellOrWaitAdvisorCard
          cropName={listingInfo.cropName || 'Tomato'}
          quantity={listingInfo.quantity || 300}
          unit={listingInfo.unit || 'kg'}
          quality={listingInfo.quality || 'Very Good'}
          currentMarketPrice={listingInfo.expectedPrice || 25}
          minPrice={(listingInfo.expectedPrice || 25) - 1}
          maxPrice={(listingInfo.expectedPrice || 25) + 2}
          nearbyOffer={comparisonBids[0]?.bidPrice || 27}
          offersCount={comparisonBids.length}
        />
      </div>

      {/* What-If Simulator */}
      <WhatIfSimulator
        cropName={listingInfo.cropName || 'Tomato'}
        defaultQuantity={listingInfo.quantity || 300}
        unit={listingInfo.unit || 'kg'}
      />

      <WhyThisPriceModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        listingId={activeListingId}
        cropName={listingInfo.cropName || 'Tomato'}
        unit={listingInfo.unit || 'kg'}
        quantity={listingInfo.quantity || 300}
        quality={listingInfo.quality || 'Very Good'}
        location="Tiruchengode Rural"
        currentMarketPrice={listingInfo.expectedPrice || 26}
        expectedMin={Math.max(1, (listingInfo.expectedPrice || 26) - 2)}
        expectedMax={(listingInfo.expectedPrice || 26) + 1}
      />

      {/* View Offer & Counter Offer Modal */}
      <Modal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Offer Details"
        subtitle={
          selectedBidForCounter
            ? `Buyer: ${selectedBidForCounter.buyerName} • ${selectedBidForCounter.cropName}`
            : ''
        }
      >
        <form onSubmit={handleSendCounter} className="space-y-4">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm">
            <div className="text-stone-500 text-xs">Buyer's Current Offer</div>
            <div className="text-xl font-bold text-stone-900">
              ₹{selectedBidForCounter?.bidPrice || selectedBidForCounter?.bidPricePerUnit} / unit
            </div>
            <div className="text-xs text-stone-500 mt-1">
              Payment: {selectedBidForCounter?.paymentTerms} | Pickup:{' '}
              {selectedBidForCounter?.pickupPreference || selectedBidForCounter?.offeredPickupDate}
            </div>
          </div>

          <div>
            <Input
              label="Your Counter Price (₹ per unit)"
              type="number"
              min="1"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              helperText="The buyer will receive an SMS and app alert with your proposed price."
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCounterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Counter Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
