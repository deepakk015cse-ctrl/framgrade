import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BidCard } from '../../components/common/BidCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Truck,
  CreditCard,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const BuyerBidsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bids: localBids, cancelBid, addToast } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serverBids, setServerBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchBuyerBids = async () => {
    setIsLoading(true);
    try {
      const res = await api.bids.getSent();
      if (res.success && res.data) {
        setServerBids(res.data);
      }
    } catch (err) {
      console.warn('Backend sent bids fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerBids();
  }, []);

  // Format bids
  const allBids = serverBids.length > 0 ? serverBids : localBids;

  const filteredBids = allBids.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  // Action required bids (awaiting_buyer_confirmation or backup_offered)
  const actionRequiredBids = allBids.filter(
    (b) =>
      b.status === 'awaiting_buyer_confirmation' ||
      b.status === 'backup_offered' ||
      b.status === 'selected'
  );

  // Handle Buyer Confirm
  const handleBuyerConfirm = async (bidId: number | string) => {
    setIsActionLoading(true);
    try {
      const numId = typeof bidId === 'number' ? bidId : parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      const res = await api.bids.confirmPurchase(numId);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Sale completed.',
          message: `Weighment slip ${res.weighmentSlipNo || 'FG-W492'} generated.`,
        });
        await fetchBuyerBids();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Please try again.',
        message: 'Please try again.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Buyer Cancel / Decline
  const handleBuyerCancel = async (bidId: number | string) => {
    setIsActionLoading(true);
    try {
      const numId = typeof bidId === 'number' ? bidId : parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      const res = await api.bids.cancelSelection(
        numId,
        'Buyer declined confirmation.'
      );

      if (res.success) {
        if (res.backupBuyerFound && res.backupOffer) {
          addToast({
            type: 'warning',
            title: 'Buyer cancelled. Finding another buyer.',
            message: `Offered to next buyer (${res.backupOffer.buyerName}) at ₹${res.backupOffer.bidPrice}.`,
          });
        } else {
          addToast({
            type: 'info',
            title: 'Bid cancelled.',
            message: 'The listing is open for other buyers.',
          });
        }
        await fetchBuyerBids();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Please try again.',
        message: 'Please try again.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const pendingCount = allBids.filter((b) => b.status === 'pending').length;
  const awaitingCount = allBids.filter(
    (b) => b.status === 'awaiting_buyer_confirmation' || b.status === 'backup_offered'
  ).length;
  const confirmedCount = allBids.filter(
    (b) => b.status === 'confirmed' || b.status === 'accepted' || b.status === 'completed'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Bids
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Track your offers and confirm accepted bids.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/buyer/market')}
          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs cursor-pointer"
        >
          Find Produce
        </button>
      </div>

      {/* Prominent Action Required Banner for Buyer Confirmation */}
      {actionRequiredBids.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Farmer Selected Your Bid
                </h3>
                <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
                  Confirm your purchase to schedule pickup and generate the weighment slip.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {actionRequiredBids.map((ab) => (
              <div
                key={ab.id}
                className="bg-white/95 text-stone-900 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-stone-900">
                      {ab.cropName} • {ab.quantity || ab.requestedQuantity} {ab.unit || 'kg'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                      {ab.status === 'backup_offered' ? 'Next Buyer Offer' : 'Selected'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 mt-1 flex flex-wrap items-center gap-3">
                    <span>
                      Price: <strong className="text-emerald-800 font-black text-sm">₹{ab.bidPrice || ab.bidPricePerUnit}</strong> / {ab.unit || 'kg'}
                    </span>
                    <span>•</span>
                    <span>
                      Total: <strong>₹{(ab.totalAmount || (ab.bidPrice * ab.quantity)).toLocaleString('en-IN')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Pickup: <strong>{ab.pickupPreference || 'Farm Gate'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="success"
                    className="font-bold text-xs"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleBuyerConfirm(ab.id)}
                    disabled={isActionLoading}
                  >
                    Confirm Purchase
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-bold text-xs text-rose-700 hover:bg-rose-50 border-rose-300"
                    icon={<XCircle className="w-4 h-4 text-rose-600" />}
                    onClick={() => handleBuyerCancel(ab.id)}
                    disabled={isActionLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'all', label: 'All Bids', count: allBids.length },
          { id: 'awaiting_buyer_confirmation', label: 'Action Required', count: awaitingCount },
          { id: 'pending', label: 'Pending Farmer Review', count: pendingCount },
          { id: 'confirmed', label: 'Confirmed Deals', count: confirmedCount },
          { id: 'cancelled', label: 'Cancelled / Reallocated', count: allBids.filter((b) => b.status === 'cancelled').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-8 h-8" />}
          title={`No ${statusFilter === 'all' ? '' : statusFilter} bids found`}
          description="Browse available farmer produce in the market to place direct bids."
          actionText="Browse Farmer Produce"
          onAction={() => navigate('/buyer/market')}
          actionIcon={<ShoppingBag className="w-5 h-5" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBids.map((bid) => (
            <div key={bid.id} className="relative">
              <BidCard
                bid={{
                  id: `bid-${bid.id}`,
                  listingId: `list-${bid.listingId}`,
                  cropName: bid.cropName,
                  buyerName: bid.buyerName || 'You',
                  buyerCompany: bid.buyerCompany || 'Direct Wholesale',
                  buyerPhone: bid.buyerPhone || 'Verified',
                  buyerRating: 4.8,
                  bidPricePerUnit: bid.bidPrice || bid.bidPricePerUnit,
                  requestedQuantity: bid.quantity || bid.requestedQuantity,
                  totalAmount: bid.totalAmount || ((bid.bidPrice || bid.bidPricePerUnit) * (bid.quantity || bid.requestedQuantity)),
                  offeredPickupDate: bid.pickupPreference || bid.offeredPickupDate || 'Tomorrow',
                  pickupPreference: bid.pickupPreference || 'Farm Gate Pickup',
                  paymentTerms: bid.paymentTerms,
                  status: bid.status,
                  createdAt: bid.createdAt,
                  notes: bid.notes,
                }}
                readOnly={false}
                isBuyer={true}
                onCancel={() => handleBuyerCancel(bid.id)}
              />

              {/* Action buttons embedded on card if in awaiting_buyer_confirmation */}
              {bid.status === 'awaiting_buyer_confirmation' && (
                <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    Farmer Selected Your Bid!
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="success"
                      className="font-bold text-xs"
                      onClick={() => handleBuyerConfirm(bid.id)}
                      disabled={isActionLoading}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-bold text-xs text-rose-700 hover:bg-rose-50 border-rose-300"
                      onClick={() => handleBuyerCancel(bid.id)}
                      disabled={isActionLoading}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
