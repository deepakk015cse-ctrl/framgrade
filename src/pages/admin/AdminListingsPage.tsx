import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Layers,
  Search,
  Filter,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminListingsPage: React.FC = () => {
  const { listings } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = listings.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(search.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Marketplace Listings
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
            {listings.length} Produce Lots
          </span>
        </div>
        <p className="text-stone-600 text-sm mt-0.5">
          Audit and manage produce lots submitted by farmers and local panchayat kiosks.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search crop, farmer name, or village..."
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
            <option value="all">All Lot Statuses</option>
            <option value="active">Active</option>
            <option value="negotiating">Negotiating / Bids</option>
            <option value="sold">Sold & Settled</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {filtered.map((lot) => (
          <div
            key={lot.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                  {lot.id}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1">{lot.cropName}</h3>
                <p className="text-xs text-stone-500 font-semibold">{lot.farmerName}</p>
              </div>
              <StatusBadge status={lot.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Quantity</span>
                <span className="font-bold text-stone-900">{lot.quantity} {lot.unit}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Base Price</span>
                <span className="font-bold text-emerald-800">₹{lot.basePriceExpected}/{lot.unit}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Quality Grade</span>
                <span className="font-bold text-stone-900">{lot.grade} ({lot.qualityLabel || 'Standard'})</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-bold text-stone-900">{lot.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-600">
              <span className="font-semibold">{lot.bidsCount} Offers Received</span>
              {lot.kioskAssisted && (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Kiosk Certified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-700 text-xs uppercase font-black border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Lot ID</th>
              <th className="py-3.5 px-4">Produce</th>
              <th className="py-3.5 px-4">Farmer</th>
              <th className="py-3.5 px-4">Volume</th>
              <th className="py-3.5 px-4">Quality</th>
              <th className="py-3.5 px-4">Base Rate</th>
              <th className="py-3.5 px-4">Village</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((lot) => (
              <tr key={lot.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-stone-600">{lot.id}</td>
                <td className="py-3.5 px-4 font-black text-stone-900">{lot.cropName}</td>
                <td className="py-3.5 px-4 font-semibold text-stone-700">{lot.farmerName}</td>
                <td className="py-3.5 px-4 font-bold text-stone-800">{lot.quantity} {lot.unit}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {lot.grade}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-800">₹{lot.basePriceExpected}/{lot.unit}</td>
                <td className="py-3.5 px-4 text-stone-700 font-medium">{lot.location}</td>
                <td className="py-3.5 px-4 text-right">
                  <StatusBadge status={lot.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Layers className="w-8 h-8" />}
          title="No produce listings match your criteria"
          description="Try changing your search term or status filter."
        />
      )}
    </div>
  );
};
