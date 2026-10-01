import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  DollarSign,
  Search,
  Receipt,
  CheckCircle2,
  Calendar,
  Scale,
  Printer
} from 'lucide-react';

export const AdminTransactionsPage: React.FC = () => {
  const { sales, addToast } = useApp();
  const [search, setSearch] = useState('');

  const totalValue = sales.reduce((acc, s) => acc + s.totalValue, 0);

  const filtered = sales.filter((s) => {
    return (
      s.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      s.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      s.cropName.toLowerCase().includes(search.toLowerCase()) ||
      s.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.weighmentSlipId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handlePrintSlip = (receiptNo: string) => {
    addToast({
      type: 'success',
      title: 'Receipt Printed',
      message: `Voucher ${receiptNo} sent to kiosk printer.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Header with Cumulative Settlements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Settled Transactions
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
              {sales.length} Deals
            </span>
          </div>
          <p className="text-stone-600 text-sm mt-0.5">
            Audit logs of digital weighment slips, escrow disbursements, and direct UPI receipts.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl px-5 py-3 text-left sm:text-right">
          <span className="text-xs text-stone-500 font-bold block uppercase tracking-wider">
            Total Settled Value
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950">
            ₹{totalValue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by receipt number, weighment slip, farmer, or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          />
        </div>
      </div>

      {/* Mobile Card View (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {filtered.map((sale) => (
          <div
            key={sale.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                  {sale.receiptNumber}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">{sale.cropName}</h3>
              </div>
              <StatusBadge status="paid" label="Settled (Paid)" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Total Amount</span>
                <span className="font-black text-emerald-900 text-sm">₹{sale.totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Certified Quantity</span>
                <span className="font-bold text-stone-900">{sale.quantity} {sale.unit}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Farmer Partner</span>
                <span className="font-semibold text-stone-900">{sale.farmerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Buyer Partner</span>
                <span className="font-semibold text-stone-900">{sale.buyerName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="font-mono text-emerald-800 font-bold">
                Slip: {sale.weighmentSlipId}
              </span>
              <button
                type="button"
                onClick={() => handlePrintSlip(sale.receiptNumber)}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1 min-h-[36px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-700 text-xs uppercase font-black border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Receipt #</th>
              <th className="py-3.5 px-4">Produce</th>
              <th className="py-3.5 px-4">Farmer</th>
              <th className="py-3.5 px-4">Buyer</th>
              <th className="py-3.5 px-4">Net Weight</th>
              <th className="py-3.5 px-4">Agreed Rate</th>
              <th className="py-3.5 px-4">Total Payout</th>
              <th className="py-3.5 px-4">Weighment Slip</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((sale) => (
              <tr key={sale.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-stone-700">{sale.receiptNumber}</td>
                <td className="py-3.5 px-4 font-black text-stone-900">{sale.cropName}</td>
                <td className="py-3.5 px-4 font-semibold text-stone-700">{sale.farmerName}</td>
                <td className="py-3.5 px-4 font-semibold text-stone-700">{sale.buyerName}</td>
                <td className="py-3.5 px-4 font-bold text-stone-800">{sale.quantity} {sale.unit}</td>
                <td className="py-3.5 px-4 text-stone-700">₹{sale.finalPricePerUnit}/{sale.unit}</td>
                <td className="py-3.5 px-4 font-black text-emerald-800">₹{sale.totalValue.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">{sale.weighmentSlipId}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handlePrintSlip(sale.receiptNumber)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="No transactions match your search"
          description="Try searching with a different term."
        />
      )}
    </div>
  );
};
