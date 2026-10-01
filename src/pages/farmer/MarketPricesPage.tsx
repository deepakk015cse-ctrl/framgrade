import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MandiPrice } from '../../types';
import { PriceCard } from '../../components/common/PriceCard';
import {
  SellOrWaitAdvisorCard,
  WhyThisPriceCard,
  VoiceMarketAssistantBar
} from '../../components/common/InnovationModules';
import {
  WhyThisPriceModal,
  WhatIfSimulator,
} from '../../components/common/DecisionSupportTools';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, MapPin, Calendar, Clock, HelpCircle } from 'lucide-react';

export const MarketPricesPage: React.FC = () => {
  const { mandiPrices, language } = useApp();
  const [selectedMandi, setSelectedMandi] = useState<MandiPrice>(mandiPrices[0]);
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'3d' | '6d'>('6d');
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);

  const locations = Array.from(new Set(mandiPrices.map((m) => m.district)));

  const filteredPrices = mandiPrices.filter((item) => {
    const matchesCrop =
      cropFilter === 'all' || item.cropName.toLowerCase().includes(cropFilter.toLowerCase());
    const matchesLocation =
      locationFilter === 'all' || item.district.toLowerCase() === locationFilter.toLowerCase();
    return matchesCrop && matchesLocation;
  });

  const chartData =
    dateRange === '3d'
      ? selectedMandi.historicalTrend.slice(-3)
      : selectedMandi.historicalTrend;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">
            Market Prices
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Current market information and expected price ranges across regional markets.
          </p>
        </div>
      </div>

      {/* Interactive Voice Market Assistant */}
      <VoiceMarketAssistantBar />

      {/* Filters: Crop Selection, Location Selection, Date Range */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Crop
          </label>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Crops</option>
            <option value="tomato">Tomato</option>
            <option value="onion">Onion</option>
            <option value="chilli">Chilli</option>
            <option value="potato">Potato</option>
            <option value="cotton">Cotton</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Location
          </label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 text-sm bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Date Range
          </label>
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setDateRange('3d')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateRange === '3d' ? 'bg-emerald-700 text-white' : 'text-stone-700'
              }`}
            >
              Last 3 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange('6d')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateRange === '6d' ? 'bg-emerald-700 text-white' : 'text-stone-700'
              }`}
            >
              Last 6 Days
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Price Trend Chart for Selected Crop */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wide">
              <span>{selectedMandi.mandiName}</span>
              <span>•</span>
              <span>{selectedMandi.district}</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 uppercase">
              {selectedMandi.cropName}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Prices can change based on market conditions.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left sm:text-right">
            <div className="text-xs text-stone-600 font-semibold">Current market information</div>
            <div className="text-3xl font-black text-emerald-950">
              ₹{selectedMandi.modalPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-stone-600">/ {selectedMandi.unit}</span>
            </div>
            <div className="text-xs font-bold text-emerald-800 mt-1 flex flex-wrap items-center justify-end gap-2">
              <span>
                Expected Price: ₹{selectedMandi.minPrice} – ₹{selectedMandi.maxPrice} / {selectedMandi.unit}
              </span>
              <button
                type="button"
                onClick={() => setShowWhyModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-[11px] font-black cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {language === 'ta'
                    ? 'இந்த விலை ஏன்?'
                    : language === 'hi'
                    ? 'यह भाव क्यों?'
                    : 'Why This Price?'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} />
              <YAxis stroke="#78716c" fontSize={12} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '2px solid #e7e5e4',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any) => [`₹${value} / ${selectedMandi.unit}`, 'Modal Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#047857"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
          <span>
            Based on recent market prices, location, quantity and available market information.
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Updated: {selectedMandi.lastUpdated}
          </span>
        </div>
      </div>

      {/* Decision Support: Sell-or-Wait Advisor & Why This Price? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SellOrWaitAdvisorCard
          cropName={selectedMandi.cropName}
          quantity={300}
          unit={selectedMandi.unit}
          quality="Good"
          currentMarketPrice={selectedMandi.modalPrice}
          minPrice={selectedMandi.minPrice}
          maxPrice={selectedMandi.maxPrice}
          nearbyOffer={selectedMandi.maxPrice}
          trend={selectedMandi.trend}
        />

        <WhyThisPriceCard
          cropName={selectedMandi.cropName}
          quality="Good"
          quantity={300}
          unit={selectedMandi.unit}
          location={selectedMandi.district}
          minPrice={selectedMandi.minPrice}
          maxPrice={selectedMandi.maxPrice}
        />
      </div>

      {/* What-If Simulator in Market Analysis section */}
      <WhatIfSimulator
        cropName={selectedMandi.cropName}
        defaultQuantity={300}
        unit={selectedMandi.unit}
      />

      <WhyThisPriceModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        cropName={selectedMandi.cropName}
        unit={selectedMandi.unit}
        quantity={300}
        quality="Good"
        location={selectedMandi.district}
        currentMarketPrice={selectedMandi.modalPrice}
        expectedMin={selectedMandi.minPrice}
        expectedMax={selectedMandi.maxPrice}
      />

      {/* Grid of Mandi Rates */}
      <div>
        <h3 className="text-xl font-bold text-stone-900 mb-4">
          All Mandi Rates (Click to view historical trend above)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price) => (
            <div
              key={price.id}
              onClick={() => setSelectedMandi(price)}
              className={`cursor-pointer rounded-2xl transition-all ${
                selectedMandi.id === price.id ? 'ring-3 ring-emerald-600' : ''
              }`}
            >
              <PriceCard price={price} onSelect={() => setSelectedMandi(price)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
