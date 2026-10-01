import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { PriceCard } from '../../components/common/PriceCard';
import { BidCard } from '../../components/common/BidCard';
import {
  SellOrWaitAdvisorCard,
  NearbyCropPoolCard,
  NearbyBuyerMatchesSection,
  VoiceMarketAssistantBar
} from '../../components/common/InnovationModules';
import { FarmDecisionEngine } from '../../components/common/FarmDecisionEngine';
import {
  ArrowRight,
  PhoneCall,
  TrendingUp,
  Volume2,
  Zap,
  LayoutGrid,
  PlusCircle,
  Package,
  Tag,
  Receipt,
  Compass
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    listings,
    bids,
    sales,
    mandiPrices,
    language,
    acceptBid,
    rejectBid,
    simpleMode,
    setSimpleMode,
    user
  } = useApp();

  const activeListings = listings.filter((l) => l.status === 'active' || l.status === 'negotiating');
  const pendingBids = bids.filter((b) => b.status === 'pending');
  const recentSales = sales.slice(0, 3);

  const handleReadAloud = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  if (simpleMode) {
    const greetingText = `Welcome, ${user?.name || 'Farmer'}!`;

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 text-left space-y-6">
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-400 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 font-black px-3.5 py-1 rounded-full text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-stone-950" />
              <span>Simple Mode</span>
            </span>

            <button
              type="button"
              onClick={() => setSimpleMode(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-extrabold text-xs rounded-xl border border-stone-600 cursor-pointer min-h-[44px]"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Standard View</span>
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {greetingText}
              </h1>
              <p className="text-stone-300 text-sm sm:text-base mt-1 font-medium">
                Right Price. Right Buyer. Right Time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleReadAloud(`${greetingText}. Select an option below.`)}
              className="p-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-2xl shrink-0 cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Read aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate('/farmer/decision')}
            className="w-full p-6 rounded-3xl bg-stone-900 hover:bg-stone-800 text-white border-2 border-amber-400 shadow-sm text-left flex items-center justify-between gap-4 cursor-pointer min-h-[100px]"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">🧭</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-300">Farm Decision</h2>
                <p className="text-stone-200 text-xs sm:text-sm font-semibold mt-0.5">
                  Compare Sell Now, Options & Net Realisation
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 text-amber-300" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/farmer/add-produce')}
            className="w-full p-6 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-emerald-900 shadow-sm text-left flex items-center justify-between gap-4 cursor-pointer min-h-[100px]"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">🌾</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black">Add Produce</h2>
                <p className="text-emerald-100 text-xs sm:text-sm font-semibold mt-0.5">
                  List your harvest for sale
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/farmer/market-prices')}
            className="w-full p-6 rounded-3xl bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-300 shadow-xs text-left flex items-center justify-between gap-4 cursor-pointer min-h-[100px]"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">💰</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-950">Market Prices</h2>
                <p className="text-stone-600 text-xs sm:text-sm font-semibold mt-0.5">
                  Check today's mandi rates
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 text-stone-700" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/farmer/bids')}
            className="w-full p-6 rounded-3xl bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-300 shadow-xs text-left flex items-center justify-between gap-4 cursor-pointer min-h-[100px]"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">🤝</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-950">
                  Buyer Offers ({pendingBids.length})
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm font-semibold mt-0.5">
                  View and accept buyer bids
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 text-stone-700" />
          </button>
        </div>

        <div className="p-5 bg-stone-100 rounded-2xl border border-stone-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-800 shrink-0" />
            <div>
              <p className="text-xs font-bold text-stone-600">Helpline</p>
              <p className="text-base sm:text-lg font-black text-stone-900">1800-425-3276</p>
            </div>
          </div>
          <a
            href="tel:18004253276"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center min-h-[44px]"
          >
            Call
          </a>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FARMER DASHBOARD
  // Sections:
  // 1. Add Produce
  // 2. Market Prices
  // 3. My Listings
  // 4. Buyer Offers
  // 5. My Sales
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Helping farmers make informed selling decisions and connect with buyers.
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSimpleMode(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold rounded-xl border border-amber-300 cursor-pointer min-h-[44px]"
          >
            <Zap className="w-4 h-4 text-amber-700" />
            <span>Simple Mode</span>
          </button>

          <Button
            size="md"
            variant="outline"
            icon={<Compass className="w-4 h-4 text-emerald-700" />}
            onClick={() => navigate('/farmer/decision')}
          >
            Farm Decision
          </Button>

          <Button
            size="md"
            variant="primary"
            icon={<PlusCircle className="w-5 h-5 text-white" />}
            onClick={() => navigate('/farmer/add-produce')}
          >
            Add Produce
          </Button>
        </div>
      </div>

      {/* Farmer Action Cards (Quick Actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Link
          to="/farmer/decision"
          className="bg-stone-900 hover:bg-stone-800 text-white rounded-3xl border-2 border-amber-400 p-5 flex flex-col justify-between shadow-sm transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">🧭</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-amber-300">Farm Decision</div>
            <p className="text-xs sm:text-sm text-stone-200 font-semibold mt-0.5">Net Realisation & Options</p>
          </div>
        </Link>

        <Link
          to="/farmer/add-produce"
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-3xl p-5 flex flex-col justify-between shadow-sm transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">🌾</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black">Add Produce</div>
            <p className="text-xs sm:text-sm text-emerald-100 font-semibold mt-0.5">List your produce</p>
          </div>
        </Link>

        <Link
          to="/farmer/market-prices"
          className="bg-white hover:border-emerald-600 rounded-3xl border-2 border-stone-200 p-5 flex flex-col justify-between shadow-xs transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">💰</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-stone-900">Market Prices</div>
            <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">{mandiPrices.length} Markets</p>
          </div>
        </Link>

        <Link
          to="/farmer/bids"
          className="bg-white hover:border-emerald-600 rounded-3xl border-2 border-stone-200 p-5 flex flex-col justify-between shadow-xs transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">🤝</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-stone-900">Buyer Offers</div>
            <p className="text-xs sm:text-sm text-amber-700 font-bold mt-0.5">{pendingBids.length} Offers</p>
          </div>
        </Link>

        <Link
          to="/farmer/listings"
          className="bg-white hover:border-emerald-600 rounded-3xl border-2 border-stone-200 p-5 flex flex-col justify-between shadow-xs transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">📋</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-stone-900">My Listings</div>
            <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">{activeListings.length} Active</p>
          </div>
        </Link>

        <Link
          to="/farmer/sales"
          className="bg-white hover:border-emerald-600 rounded-3xl border-2 border-stone-200 p-5 flex flex-col justify-between shadow-xs transition-all min-h-[140px]"
        >
          <span className="text-3xl sm:text-4xl">✅</span>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-black text-stone-900">My Sales</div>
            <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">{sales.length} Completed</p>
          </div>
        </Link>
      </div>

      {/* Voice Market Assistant */}
      <VoiceMarketAssistantBar />

      {/* FARM DECISION ENGINE & NET REALISATION SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
              Farm Decision
            </span>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Farm Decision Engine & Net Realisation Comparison
            </h2>
          </div>
          <Link
            to="/farmer/decision"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>Open Full Decision Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FarmDecisionEngine compact={true} />
      </div>

      {/* PRICE INSIGHT: Current price, Expected range, and Sell-or-Wait Advisor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
              Price Insight
            </span>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Current Price, Expected Range & Sell-or-Wait Advisor
            </h2>
          </div>
          <Link
            to="/farmer/market-prices"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>Market Prices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SellOrWaitAdvisorCard
            cropName="Tomato"
            quantity={300}
            unit="kg"
            quality="Very Good"
            currentMarketPrice={25}
            minPrice={24}
            maxPrice={27}
            nearbyOffer={27}
            offersCount={pendingBids.length}
            trend="up"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mandiPrices.slice(0, 2).map((price) => (
              <PriceCard key={price.id} price={price} />
            ))}
          </div>
        </div>
      </div>

      {/* BUYER OFFERS: Latest offers */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
              Buyer Offers
            </span>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Latest Offers
            </h2>
          </div>
          <Link
            to="/farmer/bids"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>View All ({bids.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {pendingBids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBids.slice(0, 2).map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isBuyer={false}
                onAccept={acceptBid}
                onReject={rejectBid}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-600 text-sm font-semibold">
            No pending buyer offers.
          </div>
        )}
      </div>

      {/* NEARBY OPPORTUNITIES: Nearby buyers & Possible crop pooling */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
            Nearby Opportunities
          </span>
          <h2 className="text-lg sm:text-xl font-black text-stone-900">
            Nearby Buyers & Possible Crop Pooling
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <NearbyBuyerMatchesSection
            cropName="Tomato"
            availableQuantity={300}
            unit="kg"
            onViewOffers={() => navigate('/farmer/bids')}
          />

          <NearbyCropPoolCard />
        </div>
      </div>

      {/* MY SALES: Current status */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg sm:text-xl font-black text-stone-900">
            My Sales
          </h2>
          <Link
            to="/farmer/sales"
            className="text-emerald-700 hover:text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>View All ({sales.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentSales.map((sale) => (
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
                  <p className="text-xs text-stone-500">{sale.buyerName}</p>
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
            No completed sales yet.
          </div>
        )}
      </div>
    </div>
  );
};
