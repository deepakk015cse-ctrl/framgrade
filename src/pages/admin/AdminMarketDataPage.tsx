import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriceCard } from '../../components/common/PriceCard';
import {
  TrendingUp,
  RefreshCw,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AdminMarketDataPage: React.FC = () => {
  const { mandiPrices, addToast } = useApp();
  const [selectedCrop, setSelectedCrop] = useState(mandiPrices[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        type: 'success',
        title: 'Mandi Feed Synced',
        message: 'APMC Agmarknet prices synced for 12 regulated mandis in Tamil Nadu.',
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Market Data & APMC Feeds
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Connected
            </span>
          </div>
          <p className="text-stone-600 text-sm mt-0.5">
            Real-time price discovery benchmarks, modal rates, and historical mandi movements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Agmarknet APMC</span>
        </button>
      </div>

      {/* Selected Crop Historical Chart */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              {selectedCrop.mandiName} • {selectedCrop.district}
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-0.5">
              {selectedCrop.cropName} Modal Rate Trend
            </h2>
            <p className="text-xs text-stone-500">
              6-Day Historical Benchmark in ₹/{selectedCrop.unit}
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left sm:text-right">
            <div className="text-xs text-stone-500 font-bold uppercase">Current Modal</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">
              ₹{selectedCrop.modalPrice} <span className="text-xs font-normal text-stone-600">/ {selectedCrop.unit}</span>
            </div>
            <div className="text-xs text-stone-600 font-bold mt-0.5">
              Range: ₹{selectedCrop.minPrice} - ₹{selectedCrop.maxPrice}
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedCrop.historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminPriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="day" tick={{ fill: '#78716c', fontSize: 12 }} />
              <YAxis tick={{ fill: '#78716c', fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                formatter={(value: any) => [`₹${value}/${selectedCrop.unit}`, 'Modal Rate']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="price" stroke="#047857" strokeWidth={3} fill="url(#adminPriceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mandi Cards Grid */}
      <div>
        <h3 className="text-lg font-black text-stone-900 mb-3">Benchmark Mandi Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mandiPrices.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedCrop(m)}
              className={`cursor-pointer transition-all rounded-2xl ${
                selectedCrop.id === m.id ? 'ring-2 ring-emerald-700 shadow-md' : 'hover:shadow-xs'
              }`}
            >
              <PriceCard price={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
