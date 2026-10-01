import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PriceCard } from '../../components/common/PriceCard';
import { Button } from '../../components/common/Button';
import {
  Sprout,
  ShieldCheck,
  ArrowRight,
  Mic,
  Scale,
  DollarSign,
  Truck,
  Building2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, mandiPrices } = useApp();

  const handleStartFarmer = () => {
    setRole('farmer');
    navigate('/farmer/dashboard');
  };

  const handleStartBuyer = () => {
    setRole('buyer');
    navigate('/buyer/dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-900 text-white pt-14 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
              Farm<span className="text-emerald-400">Grade</span>
            </h1>
          </div>

          <p className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-wide mb-4">
            Right Price. Right Buyer. Right Time.
          </p>

          <p className="text-base sm:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed mb-8">
            Connect your produce with nearby buyers and make informed selling decisions.
          </p>

          {/* Primary Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-10">
            <button
              onClick={() => {
                setRole('farmer');
                navigate('/farmer/add-produce');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-base sm:text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[52px]"
            >
              <span>Sell My Produce</span>
              <ArrowRight className="w-5 h-5 text-emerald-950" />
            </button>

            <button
              onClick={() => {
                setRole('buyer');
                navigate('/buyer/market');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-stone-800 hover:bg-stone-700 text-white font-bold text-base sm:text-lg rounded-2xl border-2 border-stone-600 flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[52px]"
            >
              <span>Find Produce</span>
              <ArrowRight className="w-5 h-5 text-stone-300" />
            </button>
          </div>

          {/* Simple Visual Flow: Farmer -> Produce -> Market Price -> Buyers -> Sale */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold text-white">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center gap-1.5">
                <span>👨‍🌾</span>
                <span>Farmer</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="px-3.5 py-2 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center gap-1.5">
                <span>🌾</span>
                <span>Produce</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="px-3.5 py-2 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center gap-1.5">
                <span>💰</span>
                <span>Market Price</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="px-3.5 py-2 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center gap-1.5">
                <span>🤝</span>
                <span>Buyers</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-stone-950 flex items-center gap-1.5">
                <span>✅</span>
                <span>Sale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="bg-white border-b border-stone-200 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
            How FarmGrade Works
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Direct trading from farm gate to verified buyers in three steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                  Add Produce
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Select your crop, enter quantity, or speak in your local language to list produce.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Voice & Kiosk Supported</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-300 p-6 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-lg flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                  Check Fair Price
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  View live market prices and quality-based price recommendations for Grade A, B, or C produce.
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>Transparent Quality Grading</span>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white font-black text-lg flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                  Accept Best Offer
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Compare offers from verified buyers and receive direct UPI payment on pickup.
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Farm-Gate Pickup & UPI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">Quality Grading</h4>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Clear Grade A, B, and C standards build trust between farmers and buyers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">Market Prices</h4>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Daily wholesale market rates help farmers negotiate fair prices.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">Village Kiosk Support</h4>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Local kiosk operators assist farmers with listing and digital weighing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">Direct Settlement</h4>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Verified weighment slips and direct UPI payments without middlemen.
            </p>
          </div>
        </div>
      </section>

      {/* Market Prices Snapshot */}
      <section className="bg-stone-100/70 border-t border-stone-200 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div className="text-left">
              <h2 className="text-2xl font-extrabold text-stone-900">
                Market Prices
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Today's regional mandi rates
              </p>
            </div>
            <Link
              to="/farmer/market-prices"
              className="text-emerald-800 font-bold text-sm hover:underline flex items-center gap-1"
            >
              <span>View All Market Prices</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mandiPrices.slice(0, 3).map((price) => (
              <PriceCard
                key={price.id}
                price={price}
                onSelect={() => navigate('/farmer/market-prices')}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
