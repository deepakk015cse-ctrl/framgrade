import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Check,
  Clock,
  User,
  Building2
} from 'lucide-react';

interface SihDemoRunnerProps {
  embedded?: boolean;
}

export const SihDemoRunner: React.FC<SihDemoRunnerProps> = ({ embedded = false }) => {
  const {
    sihDemo,
    selectSihDemoBuyer,
    simulateSihBuyerCancel,
    confirmSihBackupSale,
    resetSihDemo
  } = useApp();

  const {
    farmerName,
    village,
    cropName,
    variety,
    quantity,
    unit,
    currentMarketPrice,
    aiPriceMin,
    aiPriceMax,
    stage,
    selectedBuyerId,
    buyers,
    completedSaleReceipt,
    isLoading
  } = sihDemo;

  const stepsList = [
    { key: 'bids_open', label: '1. Buyer Offers' },
    { key: 'buyer_selected', label: '2. Buyer Selected' },
    { key: 'buyer_cancelled', label: '3. Buyer Cancelled' },
    { key: 'backup_offered', label: '4. Next Buyer' },
    { key: 'sale_completed', label: '5. Sale Completed' },
  ];

  const getStepIndex = () => {
    switch (stage) {
      case 'bids_open': return 0;
      case 'buyer_selected': return 1;
      case 'buyer_cancelled': return 2;
      case 'backup_offered': return 3;
      case 'sale_completed': return 4;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex();

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-6'}`}>
      {/* Header */}
      <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live Buyer Matching & Re-allocation
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-0.5">
              Automatic backup buyer matching when a selected buyer cancels.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSihDemo}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
          >
            <RotateCcw className={`w-4 h-4 text-emerald-800 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>

        {/* Step Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-stone-800">
          {stepsList.map((st, i) => {
            const isDone = i < activeStepIdx;
            const isCurrent = i === activeStepIdx;
            return (
              <div
                key={st.key}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white'
                    : isDone
                    ? 'bg-stone-800 text-emerald-400'
                    : 'bg-stone-800/50 text-stone-400'
                }`}
              >
                <span>{st.label}</span>
                {isDone && <Check className="w-3.5 h-3.5 inline ml-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produce Lot Summary */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-xs text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-black uppercase text-stone-500 tracking-wider">
                Produce Listing
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Grade A
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl shrink-0">
                🍅
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {cropName} ({variety})
                </h3>
                <p className="text-sm font-bold text-stone-600">
                  {quantity} {unit}
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  Farmer:
                </span>
                <span className="font-bold text-stone-900">{farmerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  Location:
                </span>
                <span className="font-bold text-stone-900">{village}, Tamil Nadu</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  Pickup:
                </span>
                <span className="font-bold text-emerald-700">Today</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-amber-900">
                    Market Price
                  </p>
                  <p className="text-xs text-amber-800">
                    Salem Mandi
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-stone-900">₹{currentMarketPrice}</span>
                  <span className="text-xs font-bold text-stone-600"> / kg</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-950">
                    Expected Fair Price
                  </p>
                  <p className="text-xs text-emerald-800">
                    Grade A Range
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-950">
                    ₹{aiPriceMin}–₹{aiPriceMax}
                  </span>
                  <span className="text-xs font-bold text-emerald-800"> / kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Offers */}
        <div className="lg:col-span-2 space-y-5 text-left">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  Buyer Offers
                </h3>
                <p className="text-xs text-stone-500">
                  {buyers.length} verified buyers nearby
                </p>
              </div>

              <div className="flex items-center gap-2">
                {stage === 'buyer_selected' && (
                  <button
                    type="button"
                    onClick={simulateSihBuyerCancel}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-stone-950" />
                    <span>Buyer Cancelled</span>
                  </button>
                )}

                {stage === 'backup_offered' && (
                  <button
                    type="button"
                    onClick={confirmSihBackupSale}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Accept Next Buyer (₹26/kg)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3.5 mt-4">
              {buyers.map((b) => {
                const isSelected = b.id === selectedBuyerId;
                const isCancelled = b.status === 'cancelled';
                const isBackup = b.status === 'backup';
                const isConfirmed = b.status === 'confirmed';

                let cardBorder = 'border-stone-200 bg-white';
                let statusText = 'Pending';

                if (isSelected && stage === 'buyer_selected') {
                  cardBorder = 'border-emerald-600 bg-emerald-50/40';
                  statusText = 'Selected';
                } else if (isCancelled) {
                  cardBorder = 'border-rose-200 bg-rose-50/30 opacity-75';
                  statusText = 'Cancelled';
                } else if (isBackup) {
                  cardBorder = 'border-amber-500 bg-amber-50/40';
                  statusText = 'Next Buyer';
                } else if (isConfirmed) {
                  cardBorder = 'border-emerald-700 bg-emerald-50';
                  statusText = 'Sale Completed';
                }

                return (
                  <div
                    key={b.id}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${cardBorder}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-base text-stone-900">{b.name}</h4>
                          <span className="text-xs font-bold text-amber-700">
                            ★ {b.rating}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>{b.company}</span>
                          <span>·</span>
                          <span>{b.location} ({b.distanceKm} km)</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-950">
                              ₹{b.bidPricePerUnit}
                            </span>
                            <span className="text-xs font-bold text-stone-600">/ kg</span>
                          </div>
                          <p className="text-xs text-stone-500">
                            Total: ₹{b.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800">
                          {statusText}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-stone-200/80 text-xs text-stone-600">
                      <div className="flex items-center gap-3">
                        <span>Pickup: <strong className="text-stone-900">{b.pickupDate}</strong></span>
                        <span>·</span>
                        <span>Payment: <strong className="text-stone-900">{b.paymentTerms}</strong></span>
                      </div>

                      <div>
                        {stage === 'bids_open' && (
                          <button
                            type="button"
                            onClick={() => selectSihDemoBuyer(b.id)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                          >
                            Select Buyer
                          </button>
                        )}

                        {stage === 'backup_offered' && b.code === 'Buyer C' && (
                          <button
                            type="button"
                            onClick={confirmSihBackupSale}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                          >
                            Accept Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sale Completed Receipt */}
          {completedSaleReceipt && (
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-600 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div>
                  <h3 className="text-lg font-black text-emerald-950">
                    Sale Completed
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Direct UPI payment verified
                  </p>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  {completedSaleReceipt.upiRef}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <span className="text-stone-500 font-bold uppercase block">Weighment Slip</span>
                  <span className="font-mono font-black text-stone-900 text-sm">
                    {completedSaleReceipt.weighmentSlipId}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold uppercase block">Receipt</span>
                  <span className="font-mono font-black text-stone-900 text-sm">
                    {completedSaleReceipt.receiptNumber}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold uppercase block">Price</span>
                  <span className="font-black text-emerald-950 text-sm">
                    ₹{completedSaleReceipt.finalPricePerUnit} / kg
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 font-bold uppercase block">Total Paid</span>
                  <span className="font-black text-emerald-900 text-base">
                    ₹{completedSaleReceipt.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
