import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ProduceListing } from '../../types';
import { ProduceCard } from '../../components/common/ProduceCard';
import {
  ProduceDetailsModal,
  SellOrWaitAdvisorCard,
  NearbyCropPoolCard
} from '../../components/common/InnovationModules';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, Tag } from 'lucide-react';

export const FarmerListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { listings } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'negotiating' | 'sold'>('all');
  const [selectedListingForDetails, setSelectedListingForDetails] = useState<ProduceListing | null>(null);

  const filteredListings = listings.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900">
            My Produce Listings
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Manage your crop lots listed across local markets and monitor incoming bids.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          icon={<PlusCircle className="w-5 h-5" />}
          onClick={() => navigate('/farmer/add-produce')}
        >
          Add New Produce
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Lots ({listings.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Active on Market ({listings.filter((l) => l.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('negotiating')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'negotiating'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Bids Received ({listings.filter((l) => l.status === 'negotiating').length})
        </button>
        <button
          onClick={() => setFilter('sold')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            filter === 'sold'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Sold & Settled ({listings.filter((l) => l.status === 'sold').length})
        </button>
      </div>

      {/* Produce Grid */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-8 h-8" />}
          title="No produce found in this category"
          description="You don't have any produce lots matching your selected filter right now."
          actionText="List New Produce Now"
          onAction={() => navigate('/farmer/add-produce')}
          actionIcon={<PlusCircle className="w-5 h-5" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ProduceCard
              key={listing.id}
              listing={listing}
              onViewBids={() => navigate('/farmer/bids')}
              onViewDetails={(lot) => setSelectedListingForDetails(lot)}
            />
          ))}
        </div>
      )}

      {/* Sell-or-Wait Advisor & Nearby Crop Pool for Farmer Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
        <SellOrWaitAdvisorCard
          listing={filteredListings[0] || listings[0]}
          cropName={(filteredListings[0] || listings[0])?.cropName || 'Tomato'}
          quantity={(filteredListings[0] || listings[0])?.quantity || 300}
          unit={(filteredListings[0] || listings[0])?.unit || 'kg'}
        />
        <NearbyCropPoolCard
          cropName={(filteredListings[0] || listings[0])?.cropName || 'Tomato'}
          farmerQuantity={(filteredListings[0] || listings[0])?.quantity || 150}
          unit={(filteredListings[0] || listings[0])?.unit || 'kg'}
        />
      </div>

      {/* 11-Section Produce Details Modal */}
      {selectedListingForDetails && (
        <ProduceDetailsModal
          listing={selectedListingForDetails}
          onClose={() => setSelectedListingForDetails(null)}
          isBuyer={false}
          onViewOffers={() => navigate('/farmer/bids')}
        />
      )}
    </div>
  );
};
