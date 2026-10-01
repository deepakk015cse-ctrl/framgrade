import React from 'react';
import {
  Check,
  Star,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

export interface ComparisonBid {
  id: number;
  listingId: number;
  cropName: string;
  unit: string;
  bidPrice: number;
  bidPricePerUnit: number;
  quantity: number;
  totalAmount: number;
  buyerId: number;
  buyerName: string;
  buyerPhone: string;
  buyerCompany: string;
  buyerType: string;
  buyerLocation: string;
  distanceKm: number;
  buyerRating: number;
  pickupPreference?: string;
  paymentTerms: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface BidComparisonTableProps {
  bids: ComparisonBid[];
  onSelectBuyer: (bidId: number) => void;
  onRejectBid?: (bidId: number) => void;
  selectedBidId?: number | null;
  unit?: string;
  isActionLoading?: boolean;
}

export const BidComparisonTable: React.FC<BidComparisonTableProps> = ({
  bids,
  onSelectBuyer,
  onRejectBid,
  selectedBidId,
  unit = 'kg',
  isActionLoading = false,
}) => {
  const [sortCriterion, setSortCriterion] = React.useState<'net' | 'price' | 'distance'>('net');

  if (!bids || bids.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center text-stone-500 font-semibold">
        No bids submitted yet for this produce listing.
      </div>
    );
  }

  // Compute approximate Net Realisation for each bid based on pickup terms & distance
  const enrichedBids = bids.map((b) => {
    const isFarmGatePickup = (b.pickupPreference || '').toLowerCase().includes('farm');
    const estTransportCost = isFarmGatePickup ? 0 : Math.max(250, Math.round((b.distanceKm || 10) * 25));
    const estHandlingCost = 150;
    const estNetRealisation = Math.max(0, b.totalAmount - estTransportCost - estHandlingCost);
    return {
      ...b,
      estTransportCost,
      estHandlingCost,
      estNetRealisation,
    };
  });

  const sortedBids = [...enrichedBids].sort((a, b) => {
    if (sortCriterion === 'net') return b.estNetRealisation - a.estNetRealisation;
    if (sortCriterion === 'price') return b.bidPrice - a.bidPrice;
    return (a.distanceKm || 999) - (b.distanceKm || 999);
  });

  // Find max bid price and max net realisation to contextualize trade-offs
  const maxPrice = Math.max(...enrichedBids.map((b) => b.bidPrice));
  const maxNetRealisation = Math.max(...enrichedBids.map((b) => b.estNetRealisation));
  const minDistance = Math.min(...enrichedBids.map((b) => b.distanceKm || 999));

  return (
    <div className="bg-white border-2 border-stone-200 rounded-3xl p-4 sm:p-6 shadow-xs text-left space-y-4">
      {/* Header and Farmer Decision Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Competitive Buyer Bids & Net Realisation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {bids.length} Offers
            </span>
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            Compare verified buyer offers by Estimated Net Realisation (Gross Value minus known transport & handling costs).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start">
          <button
            type="button"
            onClick={() => setSortCriterion('net')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
              sortCriterion === 'net' ? 'bg-emerald-700 text-white' : 'text-stone-700'
            }`}
          >
            By Net Realisation
          </button>
          <button
            type="button"
            onClick={() => setSortCriterion('price')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
              sortCriterion === 'price' ? 'bg-emerald-700 text-white' : 'text-stone-700'
            }`}
          >
            By Price
          </button>
          <button
            type="button"
            onClick={() => setSortCriterion('distance')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
              sortCriterion === 'distance' ? 'bg-emerald-700 text-white' : 'text-stone-700'
            }`}
          >
            By Distance
          </button>
        </div>
      </div>

      {/* Decision Guidance Notice */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold text-amber-900">Net Realisation Tip: </strong>
          Do not rank offers simply by the highest selling price. A buyer offering direct farm-gate pickup (₹0 transport) often provides a higher Estimated Net Realisation than a distant buyer requiring delivery.
        </p>
      </div>

      {/* MOBILE SINGLE-COLUMN CARDS (Zero horizontal scroll, touch-friendly) */}
      <div className="md:hidden space-y-3">
        {sortedBids.map((b) => {
          const isSelected =
            b.status === 'awaiting_buyer_confirmation' ||
            b.status === 'confirmed' ||
            b.id === selectedBidId;
          const isMaxPrice = b.bidPrice === maxPrice;
          const isMaxNet = b.estNetRealisation === maxNetRealisation;
          const isNearest = b.distanceKm === minDistance;

          return (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                  : b.status === 'cancelled'
                  ? 'border-stone-200 bg-stone-50 opacity-60'
                  : 'border-stone-200 bg-white'
              }`}
            >
              {/* Buyer info & Rating */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-stone-900 text-base">{b.buyerName}</h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-semibold mt-0.5">
                    <span>{b.buyerCompany}</span>
                    <span>•</span>
                    <span className="font-bold text-stone-700">{b.buyerType || 'Wholesaler'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md text-xs font-black shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Active buyer</span>
                </div>
              </div>

              {/* Price and Lot Value */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Rate Offered</span>
                  <div className="text-xl font-black text-emerald-800 flex items-center gap-1">
                    <span>₹{b.bidPrice}</span>
                    <span className="text-xs font-semibold text-stone-500">/{unit}</span>
                    {isMaxPrice && (
                      <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                        High Rate
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Gross / Net Realisation</span>
                  <div className="text-xs font-bold text-stone-600">
                    Gross: ₹{b.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm font-black text-emerald-900">
                    Est. Net: ₹{b.estNetRealisation.toLocaleString('en-IN')}
                  </div>
                  {isMaxNet && (
                    <span className="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.5 rounded inline-block mt-0.5">
                      Highest Est. Net
                    </span>
                  )}
                </div>
              </div>

              {/* Logistics & Payment */}
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Location:</span>
                  </span>
                  <span className="font-bold text-stone-900">
                    {b.buyerLocation || 'Salem'} ({b.distanceKm} km {isNearest ? '⚡ Nearest' : ''})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pickup:</span>
                  </span>
                  <span className="font-semibold text-stone-800 truncate max-w-[180px]">
                    {b.pickupPreference || 'Farm Gate Pickup'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Payment:</span>
                  </span>
                  <span className="font-semibold text-stone-800">
                    {b.paymentTerms}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <StatusBadge status={b.status as any} />

                {b.status === 'pending' || b.status === 'backup_offered' ? (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => onSelectBuyer(b.id)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Select Buyer</span>
                  </button>
                ) : b.status === 'awaiting_buyer_confirmation' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selected</span>
                  </span>
                ) : b.status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmed</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 font-medium capitalize">
                    {b.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP / TABLET TABLE VIEW (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-stone-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-stone-100/90 text-stone-700 uppercase font-black tracking-wider text-[11px] border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">Buyer & Type</th>
              <th className="py-3 px-4">Location & Distance</th>
              <th className="py-3 px-4">Offered Rate</th>
              <th className="py-3 px-4">Gross & Est. Net Realisation</th>
              <th className="py-3 px-4">Logistics & Payment</th>
              <th className="py-3 px-4">Bid Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {sortedBids.map((b) => {
              const isSelected =
                b.status === 'awaiting_buyer_confirmation' ||
                b.status === 'confirmed' ||
                b.id === selectedBidId;
              const isMaxPrice = b.bidPrice === maxPrice;
              const isMaxNet = b.estNetRealisation === maxNetRealisation;
              const isNearest = b.distanceKm === minDistance;

              return (
                <tr
                  key={b.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/60 font-semibold'
                      : b.status === 'cancelled'
                      ? 'bg-rose-50/30 opacity-60'
                      : 'hover:bg-stone-50/80'
                  }`}
                >
                  {/* Buyer & Type */}
                  <td className="py-3 px-4">
                    <div className="font-black text-stone-900 text-sm">{b.buyerName}</div>
                    <div className="text-stone-500 text-xs flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3 h-3 text-stone-400" />
                      <span>{b.buyerCompany}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {b.buyerType || 'Wholesaler'}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>Active buyer</span>
                      </div>
                    </div>
                  </td>

                  {/* Location & Distance */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-stone-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{b.buyerLocation || 'Salem District'}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isNearest
                            ? 'bg-emerald-100 text-emerald-900 font-black'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {b.distanceKm} km away {isNearest && '⚡ Nearest'}
                      </span>
                    </div>
                  </td>

                  {/* Offered Rate */}
                  <td className="py-3 px-4">
                    <div className="text-base sm:text-lg font-black text-emerald-800 flex items-center gap-1.5">
                      <span>₹{b.bidPrice}</span>
                      <span className="text-xs font-semibold text-stone-500">/ {unit}</span>
                      {isMaxPrice && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                          Highest Rate
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Lot: {b.quantity} {unit}
                    </div>
                  </td>

                  {/* Net Lot Value */}
                  <td className="py-3 px-4">
                    <div className="text-xs font-bold text-stone-600">
                      Gross: ₹{b.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm sm:text-base font-black text-emerald-900">
                      Est. Net: ₹{b.estNetRealisation.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Costs: −₹{(b.estTransportCost + b.estHandlingCost).toLocaleString('en-IN')} ({b.estTransportCost === 0 ? 'Farm Pickup' : 'Delivery'})
                    </div>
                    {isMaxNet && (
                      <span className="inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                        Highest Est. Net Realisation
                      </span>
                    )}
                  </td>

                  {/* Logistics & Payment */}
                  <td className="py-3 px-4 text-xs">
                    <div className="flex items-center gap-1 text-stone-700">
                      <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {b.pickupPreference || 'Farm Gate Pickup'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-700 mt-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate max-w-[140px] font-semibold text-stone-800">
                        {b.paymentTerms}
                      </span>
                    </div>
                  </td>

                  {/* Bid Time */}
                  <td className="py-3 px-4 text-stone-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>
                        {new Date(b.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={b.status as any} />
                    {b.status === 'awaiting_buyer_confirmation' && (
                      <div className="text-[10px] text-amber-700 font-bold mt-1">
                        Awaiting Buyer Confirm
                      </div>
                    )}
                    {b.status === 'backup_offered' && (
                      <div className="text-[10px] text-blue-700 font-bold mt-1">
                        Backup Offer Sent
                      </div>
                    )}
                  </td>

                  {/* Farmer Action */}
                  <td className="py-3 px-4 text-right">
                    {b.status === 'pending' || b.status === 'backup_offered' ? (
                      <Button
                        size="sm"
                        variant="success"
                        className="font-bold text-xs"
                        icon={<Check className="w-3.5 h-3.5" />}
                        disabled={isActionLoading}
                        onClick={() => onSelectBuyer(b.id)}
                      >
                        Select Buyer
                      </Button>
                    ) : b.status === 'awaiting_buyer_confirmation' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </span>
                    ) : b.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium capitalize">
                        {b.status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
