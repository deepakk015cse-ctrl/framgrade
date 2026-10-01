import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

export interface PricePoint {
  date: string;
  day: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  source?: string;
}

interface HistoricalPriceChartProps {
  data: PricePoint[];
  cropName: string;
  unit: string;
  suggestedMin?: number;
  suggestedMax?: number;
  expectedPrice?: number;
}

export const HistoricalPriceChart: React.FC<HistoricalPriceChartProps> = ({
  data,
  cropName,
  unit,
  suggestedMin,
  suggestedMax,
  expectedPrice,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center text-stone-500 text-sm">
        No historical price records available for {cropName}.
      </div>
    );
  }

  // Calculate chart domain bounds with padding
  const prices = data.map((d) => d.price);
  if (suggestedMin) prices.push(suggestedMin);
  if (suggestedMax) prices.push(suggestedMax);
  const minVal = Math.max(0, Math.floor(Math.min(...prices) * 0.85));
  const maxVal = Math.ceil(Math.max(...prices) * 1.15);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-stone-300">
            {item.day} • {item.date}
          </div>
          <div className="text-base font-black text-emerald-400">
            ₹{item.price} / {unit}
          </div>
          {item.minPrice && item.maxPrice && (
            <div className="text-stone-400 text-[11px]">
              Mandi Range: ₹{item.minPrice} – ₹{item.maxPrice}
            </div>
          )}
          {item.source && (
            <div className="text-[10px] text-stone-500 italic mt-0.5">{item.source}</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-stone-900 text-base sm:text-lg">
              Historical APMC Price Trend
            </h4>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified Mandi Data
            </span>
          </div>
          <p className="text-stone-500 text-xs mt-0.5">
            Daily arrival modal prices for {cropName} (₹ per {unit}) across regional regulated yards.
          </p>
        </div>

        {suggestedMin && suggestedMax && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-stone-600 font-medium">AI Estimate Bracket:</span>
            <span className="font-black text-emerald-800">
              ₹{suggestedMin} – ₹{suggestedMax}
            </span>
          </div>
        )}
      </div>

      {/* Recharts Area Plot */}
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }}
            />
            <YAxis
              domain={[minVal, maxVal]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {expectedPrice && (
              <ReferenceLine
                y={expectedPrice}
                stroke="#047857"
                strokeDasharray="4 4"
                label={{
                  value: `AI Target ₹${expectedPrice}`,
                  fill: '#047857',
                  fontSize: 10,
                  fontWeight: 700,
                  position: 'insideTopRight',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#priceGradient)"
              activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
            <span>APMC Daily Modal Rate</span>
          </div>
          {expectedPrice && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-800 border-t border-dashed border-emerald-800" />
              <span>Suggested Fair Target</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-stone-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Rates reflect regional spot market settlements</span>
        </div>
      </div>
    </div>
  );
};
