import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Building2,
  Layers,
  Tag,
  DollarSign,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { listings, sales, bids, mandiPrices } = useApp();

  const totalVolume = listings.reduce((sum, l) => sum + l.quantity, 0);
  const totalSettled = sales.reduce((sum, s) => sum + s.totalValue, 0);
  const activeBids = bids.filter((b) => b.status === 'pending');

  // -------------------------------------------------------------
  // ADMIN DASHBOARD
  // Sections:
  // 1. Farmers
  // 2. Buyers
  // 3. Listings
  // 4. Bids
  // 5. Transactions
  // 6. Market Prices
  // -------------------------------------------------------------
  const adminSections = [
    {
      id: 'farmers',
      title: 'Farmers',
      desc: 'Registered producers across local villages',
      count: '5',
      countLabel: 'Registered',
      route: '/admin/farmers',
      icon: <Users className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'buyers',
      title: 'Buyers',
      desc: 'Verified wholesalers and retail buyers',
      count: '4',
      countLabel: 'Verified',
      route: '/admin/buyers',
      icon: <Building2 className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'listings',
      title: 'Listings',
      desc: `${totalVolume} kg total listed volume`,
      count: listings.length.toString(),
      countLabel: 'Active Lots',
      route: '/admin/listings',
      icon: <Layers className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'bids',
      title: 'Bids',
      desc: `${activeBids.length} pending buyer offers`,
      count: bids.length.toString(),
      countLabel: 'Total Bids',
      route: '/admin/bids',
      icon: <Tag className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'transactions',
      title: 'Transactions',
      desc: `₹${totalSettled.toLocaleString('en-IN')} settled via UPI`,
      count: sales.length.toString(),
      countLabel: 'Completed',
      route: '/admin/transactions',
      icon: <DollarSign className="w-6 h-6 text-emerald-700" />,
    },
    {
      id: 'market-data',
      title: 'Market Prices',
      desc: 'Daily regional mandi rates',
      count: mandiPrices.length.toString(),
      countLabel: 'Mandis',
      route: '/admin/market-data',
      icon: <TrendingUp className="w-6 h-6 text-emerald-700" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-stone-300 text-sm mt-1">
          Manage farmers, buyers, listings, bids, transactions, and market prices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {adminSections.map((sec) => (
          <Link
            key={sec.id}
            to={sec.route}
            className="bg-white rounded-2xl border-2 border-stone-200 p-6 hover:border-emerald-600 transition-all shadow-xs flex flex-col justify-between group min-h-[160px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {sec.icon}
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 block leading-tight">
                    {sec.count}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                    {sec.countLabel}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
                {sec.title}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {sec.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Open {sec.title}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
