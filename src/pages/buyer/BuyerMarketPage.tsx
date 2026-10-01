import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ProduceListing } from '../../types';
import { ProduceCard } from '../../components/common/ProduceCard';
import { ProduceDetailsModal } from '../../components/common/InnovationModules';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { VoiceInput } from '../../components/common/VoiceInput';
import {
  ShoppingBag,
  CheckCircle2,
  Search,
  X
} from 'lucide-react';

export const BuyerMarketPage: React.FC = () => {
  const navigate = useNavigate();
  const { listings, addBid, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [minQuantityFilter, setMinQuantityFilter] = useState<number>(0);
  const [sellingDateFilter, setSellingDateFilter] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(100);

  // Modals state
  const [detailsListing, setDetailsListing] = useState<ProduceListing | null>(null);
  const [bidModalListing, setBidModalListing] = useState<ProduceListing | null>(null);

  // Bid form fields
  const [bidPrice, setBidPrice] = useState<number>(34);
  const [requestedQuantity, setRequestedQuantity] = useState<number>(400);
  const [pickupPreference, setPickupPreference] = useState<
    'Farm-gate direct pickup' | 'Village Kiosk hub delivery' | 'Buyer arranged transport'
  >('Farm-gate direct pickup');
  const [paymentTerms, setPaymentTerms] = useState<'Immediate UPI' | 'Bank Transfer on Weighment' | 'Cash at Kiosk'>(
    'Immediate UPI'
  );
  const [buyerMessage, setBuyerMessage] = useState<string>(
    'We can bring our certified digital weighing machine and settle via instant UPI at pickup.'
  );

  // Two-step confirmation inside Bid Modal
  const [isConfirmingBid, setIsConfirmingBid] = useState<boolean>(false);

  const handleOpenDetails = (listing: ProduceListing) => {
    setDetailsListing(listing);
  };

  const handleOpenBidModal = (listing: ProduceListing) => {
    setBidModalListing(listing);
    setBidPrice(listing.aiRecommendedPriceMin || listing.basePriceExpected);
    setRequestedQuantity(listing.quantity);
    setIsConfirmingBid(false);
  };

  const handleFinalSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModalListing) return;

    const totalAmount = bidPrice * requestedQuantity;

    addBid({
      listingId: bidModalListing.id,
      cropName: bidModalListing.cropName,
      buyerName: 'Ramesh K. (FreshBasket Retail)',
      buyerCompany: 'FreshBasket Hypermarkets Ltd',
      buyerPhone: '+91 98402 88910',
      buyerRating: 4.8,
      bidPricePerUnit: Number(bidPrice),
      requestedQuantity: Number(requestedQuantity),
      unit: bidModalListing.unit,
      totalAmount,
      offeredPickupDate: 'Tomorrow morning 09:00 AM',
      pickupPreference,
      paymentTerms,
      notes: buyerMessage
    });

    setBidModalListing(null);
    setIsConfirmingBid(false);

    addToast({
      type: 'success',
      title: 'Your offer has been sent to the farmer.',
      message: `${bidModalListing.cropName} • ₹${bidPrice}/${bidModalListing.unit} (${requestedQuantity} ${bidModalListing.unit})`
    });

    navigate('/buyer/my-bids');
  };

  const filteredListings = listings.filter((item) => {
    if (item.status === 'sold') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        item.cropName.toLowerCase().includes(q) ||
        (item.variety && item.variety.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.farmerName && item.farmerName.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (cropFilter !== 'all' && !item.cropName.toLowerCase().includes(cropFilter.toLowerCase())) return false;
    if (gradeFilter !== 'all' && item.grade !== gradeFilter && item.qualityLabel !== gradeFilter) return false;
    if (districtFilter !== 'all' && item.district !== districtFilter) return false;
    if (minQuantityFilter > 0 && item.quantity < minQuantityFilter) return false;
    if (
      sellingDateFilter !== 'all' &&
      !(item.availableDate || item.harvestDate || '').toLowerCase().includes(sellingDateFilter.toLowerCase())
    ) {
      return false;
    }
    if (item.distanceKm && item.distanceKm > maxDistance) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Find Produce
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Browse available produce from nearby farmers and submit your offer.
          </p>
        </div>
      </div>

      {/* Voice-Enabled Search Bar */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, variety, farmer or village (e.g. Tomato, Oddanchatram, Murugesan)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 font-semibold text-stone-900 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <VoiceInput
          mode="search"
          variant="button"
          className="w-full sm:w-auto px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-xs text-xs whitespace-nowrap"
          onConfirm={(text) => setSearchQuery(text)}
        />
      </div>

      {/* Filter Bar: Crop, Location, Quantity, Quality, Selling Date */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Crop
          </label>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Crops</option>
            <option value="tomato">Tomato</option>
            <option value="onion">Onion</option>
            <option value="potato">Potato</option>
            <option value="paddy">Paddy</option>
            <option value="banana">Banana</option>
            <option value="chilli">Chilli</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Location
          </label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Locations</option>
            <option value="Salem">Salem</option>
            <option value="Dindigul">Dindigul (Oddanchatram)</option>
            <option value="Tiruppur">Tiruppur (Dharapuram)</option>
            <option value="Coimbatore">Coimbatore (Mettupalayam)</option>
            <option value="Thanjavur">Thanjavur (Delta)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Quantity
          </label>
          <select
            value={minQuantityFilter}
            onChange={(e) => setMinQuantityFilter(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value={0}>Any Quantity</option>
            <option value={100}>100+ units</option>
            <option value={300}>300+ units</option>
            <option value={500}>500+ units</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Quality
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Qualities</option>
            <option value="Premium">Premium (Grade A+)</option>
            <option value="Very Good">Very Good (Grade A)</option>
            <option value="Good">Good (Grade B)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Selling Date
          </label>
          <select
            value={sellingDateFilter}
            onChange={(e) => setSellingDateFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Any Selling Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="immediate">Immediate</option>
          </select>
        </div>
      </div>

      {/* Grid of Available Lots */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No produce found matching criteria"
          description="Try resetting your filters to discover more farmer lots."
          actionText="Reset Filters"
          onAction={() => {
            setCropFilter('all');
            setGradeFilter('all');
            setDistrictFilter('all');
            setMinQuantityFilter(0);
            setSellingDateFilter('all');
            setMaxDistance(100);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="space-y-1.5">
              <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
                <span>Potential Match</span>
                <span>Good quantity & quality match</span>
              </div>
              <ProduceCard
                listing={listing}
                isBuyer={true}
                onViewDetails={handleOpenDetails}
                onPlaceBid={handleOpenBidModal}
              />
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 11-SECTION PRODUCE DETAILS MODAL                          */}
      {/* ========================================================= */}
      {detailsListing && (
        <ProduceDetailsModal
          listing={detailsListing}
          onClose={() => setDetailsListing(null)}
          isBuyer={true}
          onPlaceBid={(target) => handleOpenBidModal(target)}
        />
      )}

      {/* ========================================================= */}
      {/* BID FORM MODAL (With Clear Confirmation Step)             */}
      {/* ========================================================= */}
      {bidModalListing && (
        <Modal
          isOpen={true}
          onClose={() => {
            setBidModalListing(null);
            setIsConfirmingBid(false);
          }}
          title={isConfirmingBid ? 'Confirm Your Purchase Bid' : `Place Bid: ${bidModalListing.cropName}`}
        >
          {isConfirmingBid ? (
            /* Confirmation Review Step */
            <div className="space-y-5 text-left">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Review & Confirm Your Offer</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Please review the offer parameters before dispatching to the farmer.
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-500">Crop Lot:</span>
                  <span className="font-black text-stone-900">{bidModalListing.cropName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-500">Offered Price:</span>
                  <span className="font-black text-emerald-800 text-lg">
                    ₹{bidPrice} / {bidModalListing.unit}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-500">Purchasing Quantity:</span>
                  <span className="font-black text-stone-900">
                    {requestedQuantity} {bidModalListing.unit}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-500">Total Purchase Value:</span>
                  <span className="font-black text-stone-950 text-xl">
                    ₹{(bidPrice * requestedQuantity).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-stone-500">Pickup Preference:</span>
                  <span className="font-bold text-stone-800">{pickupPreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Terms:</span>
                  <span className="font-bold text-stone-800">{paymentTerms}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsConfirmingBid(false)}
                >
                  Edit Offer
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinalSubmitBid}
                >
                  Confirm & Submit Bid
                </Button>
              </div>
            </div>
          ) : (
            /* Input Form Step */
            <form
              onSubmit={handleFinalSubmitBid}
              className="space-y-4 text-left"
            >
              {/* Summary of Farmer's produce, Quantity, and Estimated price range */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Farmer's produce</span>
                  <span className="font-black text-stone-900 text-sm">
                    {bidModalListing.cropName}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Quantity</span>
                  <span className="font-black text-stone-900 text-sm">
                    {bidModalListing.quantity} {bidModalListing.unit}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Estimated price range</span>
                  <span className="font-black text-emerald-800 text-sm">
                    ₹{bidModalListing.aiRecommendedPriceMin} – ₹{bidModalListing.aiRecommendedPriceMax} / {bidModalListing.unit}
                  </span>
                </div>
              </div>

              {/* 1. Your offer per kg */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Your offer per {bidModalListing.unit} (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 pl-8 rounded-xl border border-stone-300 font-black text-lg text-stone-900 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute left-3 top-3.5 text-stone-500 font-bold">₹</span>
                </div>
              </div>

              {/* 2. Quantity you want */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Quantity you want ({bidModalListing.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={bidModalListing.quantity}
                  required
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-black text-stone-900 text-lg focus:outline-none focus:border-emerald-600"
                />
                <span className="text-xs text-stone-500 mt-1 block">
                  Up to {bidModalListing.quantity} {bidModalListing.unit} available
                </span>
              </div>

              {/* 3. Pickup / Delivery Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Pickup / Delivery Preference
                </label>
                <select
                  value={pickupPreference}
                  onChange={(e) => setPickupPreference(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-semibold text-stone-900 text-sm bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Farm-gate direct pickup">
                    Farm-gate direct pickup
                  </option>
                  <option value="Village Kiosk hub delivery">
                    Village Kiosk hub delivery
                  </option>
                  <option value="Buyer arranged transport">
                    Buyer arranged transport
                  </option>
                </select>
              </div>

              {/* 4. Payment Terms */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-semibold text-stone-900 text-sm bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="Immediate UPI">Immediate UPI</option>
                  <option value="Bank Transfer on Weighment">Bank Transfer on Weighment</option>
                  <option value="Cash at Kiosk">Cash at Kiosk</option>
                </select>
              </div>

              {/* Live Total Calculation */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Total Offer Amount:
                </span>
                <span className="text-xl font-black text-emerald-950">
                  ₹{(bidPrice * requestedQuantity).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setBidModalListing(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Submit Offer
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
