import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SaleTransaction } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Scale,
  DollarSign,
  ShieldCheck,
  Building2,
  Share2
} from 'lucide-react';

export const FarmerSalesPage: React.FC = () => {
  const { sales, addToast } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalValue, 0);

  const handlePrint = () => {
    addToast({
      type: 'success',
      title: 'Kiosk Print Command Sent',
      message: 'Printed official receipt on village kiosk thermal printer.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">
            My Sales
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Completed produce sales and direct bank payment records.
          </p>
        </div>

        {/* Total Summary Badge */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-5 py-3 text-right">
          <div className="text-xs text-stone-500 font-semibold">Total Earnings</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-800 font-bold">
            {sales.length} Completed Sales
          </div>
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="No sales recorded yet"
          description="Once you complete a sale with a buyer, your sale records will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-xs hover:border-emerald-600/50 transition-all flex flex-col justify-between"
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

                <div className="space-y-2 text-xs text-stone-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Crop:</span>
                    <span className="font-bold text-stone-900">{sale.cropName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Quantity:</span>
                    <span className="font-bold text-stone-900">{sale.quantity} {sale.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Buyer:</span>
                    <span className="font-bold text-stone-900">{sale.buyerName}</span>
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

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Receipt className="w-4 h-4 text-emerald-700" />}
                  onClick={() => setSelectedReceipt(sale)}
                  className="w-full"
                >
                  View Receipt
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Certified FarmGate Receipt"
          subtitle={`Receipt: ${selectedReceipt.receiptNumber}`}
        >
          <div className="border-2 border-stone-300 rounded-2xl p-6 bg-white space-y-4 font-mono text-left text-xs sm:text-sm">
            <div className="text-center pb-3 border-b border-stone-300">
              <h2 className="text-lg font-black tracking-tight text-stone-900">
                FARMGRADE SETTLEMENT CERTIFICATE
              </h2>
              <p className="text-[11px] text-stone-500">
                Authorized Agricultural Trade & Weighment Voucher
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-stone-800">
              <div>
                <span className="text-stone-500 block text-[10px]">FARMER:</span>
                <span className="font-bold">{selectedReceipt.farmerName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">BUYER:</span>
                <span className="font-bold">{selectedReceipt.buyerName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">CROP LOT:</span>
                <span className="font-bold">{selectedReceipt.cropName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">DATE:</span>
                <span className="font-bold">{selectedReceipt.saleDate}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">CERTIFIED WEIGHT:</span>
                <span className="font-bold">{selectedReceipt.quantity} {selectedReceipt.unit}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">WEIGHMENT SLIP:</span>
                <span className="font-bold text-emerald-800">{selectedReceipt.weighmentSlipId}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-stone-900">
              <div className="flex justify-between text-xs mb-1">
                <span>Rate per unit:</span>
                <span>₹{selectedReceipt.finalPricePerUnit}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-emerald-950 pt-1 border-t border-emerald-200">
                <span>TOTAL SETTLEMENT:</span>
                <span>₹{selectedReceipt.totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[10px] text-emerald-800 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Payment routed directly to Farmer Bank via UPI. Zero middleman cuts.
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-stone-400">
              FarmGrade Official Settlement Receipt
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              size="md"
              variant="outline"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Receipt
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={() => setSelectedReceipt(null)}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
