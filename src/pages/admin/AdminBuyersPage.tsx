import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building2,
  Search,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

export const AdminBuyersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [buyers, setBuyers] = useState([
    {
      id: 1,
      name: 'Ramesh Kumar',
      company: 'FreshBasket Hypermarkets Ltd',
      buyerType: 'Retail Aggregator',
      location: 'Salem & Coimbatore',
      phone: '9840288910',
      rating: 4.8,
      verified: true,
      totalOrders: 28,
    },
    {
      id: 2,
      name: 'Suresh Narayanan',
      company: 'Salem Agro Mandi Wholesalers',
      buyerType: 'Wholesale Trader',
      location: 'Salem Mandi Hub',
      phone: '9443355678',
      rating: 4.6,
      verified: true,
      totalOrders: 42,
    },
    {
      id: 3,
      name: 'Anand Chandrasekar',
      company: 'Nilgiris Food Processing Co.',
      buyerType: 'Food Processor',
      location: 'Coimbatore',
      phone: '9442388102',
      rating: 4.7,
      verified: true,
      totalOrders: 19,
    },
    {
      id: 4,
      name: 'K. Balaji',
      company: 'Southern Fruit & Vegetable Exporters',
      buyerType: 'Exporter',
      location: 'Madurai & Trichy',
      phone: '9840177211',
      rating: 4.5,
      verified: true,
      totalOrders: 34,
    },
  ]);

  useEffect(() => {
    api.buyers.getAll().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setBuyers(res.data);
      }
    }).catch(() => {});
  }, []);

  const filtered = buyers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.company.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search);
    const matchesType = filterType === 'all' || b.buyerType === filterType;
    return matchesSearch && matchesType;
  });

  const types = Array.from(new Set(buyers.map((b) => b.buyerType)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Registered Buyers
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold">
            {buyers.length} Verified
          </span>
        </div>
        <p className="text-stone-600 text-sm mt-0.5">
          Directory of verified retail aggregators, wholesale traders, and food processing companies.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search buyer name, company, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px] bg-white font-semibold"
          >
            <option value="all">All Buyer Categories</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Single-Column Cards (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
        {filtered.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-stone-900">{buyer.name}</h3>
                <p className="text-xs text-stone-600 font-bold">{buyer.company}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{buyer.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold">{buyer.buyerType}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Orders Done</span>
                <span className="font-bold text-emerald-800">{buyer.totalOrders} Purchases</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-600 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {buyer.location}
              </span>
              <a
                href={`tel:${buyer.phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 min-h-[36px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-700 text-xs uppercase font-black border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Buyer & Representative</th>
              <th className="py-3.5 px-4">Company Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Base Location</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4 text-right">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 px-4 font-black text-stone-900">{buyer.name}</td>
                <td className="py-3.5 px-4 font-semibold text-stone-800">{buyer.company}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                    {buyer.buyerType}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-stone-700 font-medium">{buyer.location}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{buyer.rating}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={`tel:${buyer.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{buyer.phone}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No buyers match your criteria"
          description="Try changing your search term or category filter."
        />
      )}
    </div>
  );
};
