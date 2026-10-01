import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Tag,
  Search,
  Building,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminBidsPage: React.FC = () => {
  const { bids } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bids.filter((b) => {
    const matchesSearch =
      b.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      b.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      b.cropName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Buyer Bids & Offers
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
            {bids.length} Total Bids
          </span>
        </div>
        <p className="text-stone-600 text-sm mt-0.5">
          Real-time log of competitive buyer bids, counter-offers, and buyer confirmations.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search buyer name, company, or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px] bg-white font-semibold"
          >
            <option value="all">All Bid Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  {b.id}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">{b.cropName}</h3>
                <p className="text-xs text-stone-500 font-semibold">{b.buyerCompany}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Offered Rate</span>
                <span className="font-bold text-emerald-800 text-sm">₹{b.bidPricePerUnit}/{b.unit || 'kg'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Total Net Value</span>
                <span className="font-black text-stone-900 text-sm">₹{b.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Pickup Mode</span>
                <span className="font-semibold text-stone-800 truncate block">{b.pickupPreference || 'Farm Gate'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-semibold text-stone-800">{b.paymentTerms}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Buyer: {b.buyerName}</span>
              <span>Pickup: {b.offeredPickupDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-700 text-xs uppercase font-black border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Bid ID</th>
              <th className="py-3.5 px-4">Produce Lot</th>
              <th className="py-3.5 px-4">Buyer Company</th>
              <th className="py-3.5 px-4">Rate Offered</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Payment Terms</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-stone-600">{b.id}</td>
                <td className="py-3.5 px-4 font-black text-stone-900">{b.cropName}</td>
                <td className="py-3.5 px-4 font-semibold text-stone-700">{b.buyerCompany}</td>
                <td className="py-3.5 px-4 font-black text-emerald-800">₹{b.bidPricePerUnit}/{b.unit || 'kg'}</td>
                <td className="py-3.5 px-4 font-black text-stone-900">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-stone-700 text-xs font-medium">{b.paymentTerms}</td>
                <td className="py-3.5 px-4 text-right">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Tag className="w-8 h-8" />}
          title="No bids match your criteria"
          description="Try changing your search term or status filter."
        />
      )}
    </div>
  );
};
