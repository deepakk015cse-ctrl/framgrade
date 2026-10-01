import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmDecisionEngine } from '../../components/common/FarmDecisionEngine';
import {
  VoiceMarketAssistantBar,
  NearbyBuyerMatchesSection,
  NearbyCropPoolCard,
  WhyThisPriceCard
} from '../../components/common/InnovationModules';
import { Compass, ArrowRight, PlusCircle, Tag, TrendingUp } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const FarmDecisionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-left space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-2 border-emerald-800">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>FarmGrade Decision & Market-Linkage Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Farm Decision & Net Realisation Advisor
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base font-medium leading-relaxed">
            Helping you evaluate what selling option could provide the best expected outcome based on available market information, transport costs, buyer offers, and storage availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            size="md"
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/farmer/add-produce')}
          >
            Add Produce
          </Button>
          <Button
            size="md"
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            icon={<Tag className="w-4 h-4" />}
            onClick={() => navigate('/farmer/bids')}
          >
            Buyer Offers
          </Button>
        </div>
      </div>

      {/* Voice Market Assistant */}
      <VoiceMarketAssistantBar />

      {/* Main Farm Decision Engine & Net Realisation Comparison */}
      <FarmDecisionEngine compact={false} />

      {/* Market Linkage & Quality-to-Price Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <NearbyBuyerMatchesSection
          cropName="Tomato"
          availableQuantity={300}
          unit="kg"
          onViewOffers={() => navigate('/farmer/bids')}
        />
        <NearbyCropPoolCard />
      </div>

      <WhyThisPriceCard
        cropName="Tomato"
        quality="Very Good (Grade A)"
        quantity={300}
        unit="kg"
        location="Salem"
        minPrice={24}
        maxPrice={27}
      />
    </div>
  );
};
