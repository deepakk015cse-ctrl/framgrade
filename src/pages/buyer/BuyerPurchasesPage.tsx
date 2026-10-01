import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Truck, Receipt, CheckCircle2, MapPin, Calendar } from 'lucide-react';

export const BuyerPurchasesPage: React.FC = () => {
  const { sales } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-900">
          Purchases
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Confirmed produce purchases and completed sale receipts.
        </p>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-8 h-8" />}
          title="No confirmed purchases yet"
          description="When a farmer accepts your offer, your completed purchase records will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      {sale.receiptNumber}
                    </span>
                    <h3 className="text-xl font-bold text-stone-900 mt-1">
                      {sale.cropName}
                    </h3>
                  </div>
                  <StatusBadge status="completed" label="Completed" />
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 mb-4 grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-900">
                      ₹{sale.totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">Final Price</span>
                    <span className="text-lg font-bold text-stone-800">
                      ₹{sale.finalPricePerUnit} / {sale.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Crop:</span>
                    <span className="font-bold text-stone-900">{sale.cropName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Quantity:</span>
                    <span className="font-bold text-stone-900">{sale.quantity} {sale.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Farmer:</span>
                    <span className="font-bold text-stone-900">{sale.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span className="font-bold text-stone-900">{sale.saleDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="font-bold text-emerald-800">Completed</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Farm-gate weighment slip attached
                </span>
                <span className="underline cursor-pointer">Print Slip</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
