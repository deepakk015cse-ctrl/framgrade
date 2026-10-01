import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { ProduceCard } from '../../components/common/ProduceCard';
import { BidCard } from '../../components/common/BidCard';
import {
  ShoppingBag,
  Clock,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { listings, bids, sales, cancelBid } = useApp();

  const [cropFilter, setCropFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [minQuantity, setMinQuantity] = useState(0);
  const [qualityFilter, setQualityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const activeMarketLots = listings.filter((l) => l.status === 'active' || l.status === 'negotiating');
  const filteredLots = activeMarketLots.filter((lot) => {
    if (cropFilter !== 'all' && !lot.cropName.toLowerCase().includes(cropFilter.toLowerCase())) return false;
    if (locationFilter !== 'all' && lot.district !== locationFilter) return false;
    if (minQuantity > 0 && lot.quantity < minQuantity) return false;
    if (qualityFilter !== 'all' && lot.qualityLabel !== qualityFilter && lot.grade !== qualityFilter) return false;
    if (
      dateFilter !== 'all' &&
      !(lot.availableDate || lot.harvestDate || '').toLowerCase().includes(dateFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const activeBids = bids.filter((b) => b.status === 'pending' || b.status === 'accepted');
  const recentPurchases = sales.slice(0, 3);

  // -------------------------------------------------------------
  // BUYER DASHBOARD
  // Sections:
  // 1. Find Produce
  // 2. My Bids
  // 3. Purchases
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Buyer Dashboard
          </h1>
          <p className="text-stone-300 text-sm mt-1">
            Right Price. Right Buyer. Right Time.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          icon={<ShoppingBag className="w-5 h-5 text-emerald-200" />}
          onClick={() => navigate('/buyer/market')}
        >
          Find Produce
        </Button>
      </div>

      {/* 3 Core Buyer Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/buyer/market"
          className="bg-white hover:border-emerald-600 rounded-2xl border-2 border-stone-200 p-5 flex items-center justify-between shadow-xs transition-colors"
        >
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">Find Produce</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{activeMarketLots.length} Lots</div>
          </div>
          <ShoppingBag className="w-6 h-6 text-emerald-700" />
        </Link>

        <Link
          to="/buyer/my-bids"
          className="bg-white hover:border-emerald-600 rounded-2xl border-2 border-stone-200 p-5 flex items-center justify-between shadow-xs transition-colors"
        >
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">My Bids</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{activeBids.length} Active</div>
          </div>
          <Clock className="w-6 h-6 text-amber-600" />
        </Link>

        <Link
          to="/buyer/purchases"
          className="bg-white hover:border-emerald-600 rounded-2xl border-2 border-stone-200 p-5 flex items-center justify-between shadow-xs transition-colors"
        >
          <div>
            <span className="text-xs font-bold uppercase text-stone-500">Purchases</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{sales.length} Orders</div>
          </div>
          <PackageCheck className="w-6 h-6 text-emerald-700" />
        </Link>
      </div>

      {/* Find Produce with Filters & Potential Matches */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
              Potential Match
            </span>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Find Produce
            </h2>
          </div>
          <Link
            to="/buyer/market"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>View All ({activeMarketLots.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Buyer Filters: Crop, Location, Quantity, Quality, Selling date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
          <div>
            <label className="font-bold text-stone-600 uppercase block mb-1">Crop</label>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
            >
              <option value="all">All Crops</option>
              <option value="tomato">Tomato</option>
              <option value="onion">Onion</option>
              <option value="potato">Potato</option>
              <option value="paddy">Paddy</option>
              <option value="banana">Banana</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-600 uppercase block mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
            >
              <option value="all">All Locations</option>
              <option value="Salem">Salem</option>
              <option value="Dindigul">Dindigul</option>
              <option value="Tiruppur">Tiruppur</option>
              <option value="Coimbatore">Coimbatore</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-600 uppercase block mb-1">Min Quantity</label>
            <select
              value={minQuantity}
              onChange={(e) => setMinQuantity(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
            >
              <option value={0}>Any Quantity</option>
              <option value={100}>100+ units</option>
              <option value={300}>300+ units</option>
              <option value={500}>500+ units</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-600 uppercase block mb-1">Quality</label>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
            >
              <option value="all">All Qualities</option>
              <option value="Premium">Premium</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-stone-600 uppercase block mb-1">Selling Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="immediate">Immediate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.slice(0, 3).map((lot) => (
            <div key={lot.id} className="space-y-1.5">
              <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
                <span>Potential Match</span>
                <span>Good quantity & quality match</span>
              </div>
              <ProduceCard
                listing={lot}
                isBuyer={true}
                onPlaceBid={() => navigate('/buyer/market')}
                onViewDetails={() => navigate('/buyer/market')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* My Bids */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg sm:text-xl font-black text-stone-900">
            My Bids
          </h2>
          <Link to="/buyer/my-bids" className="text-emerald-700 text-xs sm:text-sm font-extrabold flex items-center gap-1">
            <span>View All ({bids.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeBids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBids.slice(0, 2).map((bid) => (
              <BidCard key={bid.id} bid={bid} isBuyer={true} onCancel={cancelBid} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-600 text-sm font-semibold">
            No active bids placed.
          </div>
        )}
      </div>

      {/* Purchases */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg sm:text-xl font-black text-stone-900">
            Purchases
          </h2>
          <Link
            to="/buyer/purchases"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>View All ({sales.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPurchases.map((sale) => (
              <div
                key={sale.id}
                className="bg-stone-50 rounded-2xl border border-stone-200 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-stone-500">{sale.receiptNumber}</span>
                    <span className="text-emerald-800 font-bold text-[11px]">Completed</span>
                  </div>
                  <h3 className="font-black text-stone-900 text-base">{sale.cropName}</h3>
                  <p className="text-xs text-stone-500">Farmer: {sale.farmerName}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-base font-black text-emerald-950">
                    ₹{sale.totalValue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-stone-600 font-semibold">
                    {sale.quantity} {sale.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-600 text-sm font-semibold">
            No completed purchases yet.
          </div>
        )}
      </div>
    </div>
  );
};
