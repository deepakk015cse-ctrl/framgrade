import React, { useState } from 'react';
import { ProduceListing } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  localizeCropName,
  localizeUnit,
  localizeQuality,
  localizeStatus,
  translateText
} from '../../locales/translations';
import { MapPin, Calendar, Sparkles, Tag, Users, Compass, Eye, DollarSign, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { WhyThisPriceModal } from './DecisionSupportTools';

interface ProduceCardProps {
  listing: ProduceListing;
  onViewDetails?: (listing: ProduceListing) => void;
  onPlaceBid?: (listing: ProduceListing) => void;
  onViewBids?: (listing: ProduceListing) => void;
  isBuyer?: boolean;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({
  listing,
  onViewDetails,
  onPlaceBid,
  onViewBids,
  isBuyer = false
}) => {
  const { language, t } = useApp();
  const [showWhyModal, setShowWhyModal] = useState(false);
  const rawQuality = listing.qualityLabel || (listing.grade === 'Grade A' ? 'Very Good' : 'Good');
  const qualityDisplay = localizeQuality(rawQuality, language);
  const gradeDisplay = localizeStatus(listing.grade, language);
  const cropDisplay = localizeCropName(listing.cropName, language);
  const unitDisplay = localizeUnit(listing.unit, language);
  const distanceText = translateText(`${listing.distanceKm || 12} km away`, language);

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between text-left">
      <div>
        {/* Card Header image & badges */}
        <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={cropDisplay}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold text-xl">
              🌾 {cropDisplay}
            </div>
          )}

          {/* Badges on top left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
              {qualityDisplay}
            </span>
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-xl shadow-xs">
              {gradeDisplay}
            </span>
          </div>

          {/* Distance pill on top right */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-black px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>{distanceText}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          {/* Crop Title & Variety */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-black text-stone-900 leading-snug">
                {cropDisplay}
              </h3>
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg shrink-0">
                {listing.variety}
              </span>
            </div>
          </div>

          {/* Quantity & Location */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
              <Tag className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-black text-stone-900 truncate">
                {listing.quantity} {unitDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
              <span className="font-bold truncate text-stone-700">
                {listing.location}
              </span>
            </div>
          </div>

          {/* Price Estimate with "Why This Price?" button */}
          <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                {t('Expected Price')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWhyModal(true);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-[11px] font-black cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>
                  {language === 'ta'
                    ? 'இந்த விலை ஏன்?'
                    : language === 'hi'
                    ? 'यह भाव क्यों?'
                    : 'Why This Price?'}
                </span>
              </button>
            </div>
            <div className="text-xl font-black text-emerald-950">
              ₹{listing.aiRecommendedPriceMin} – ₹{listing.aiRecommendedPriceMax}{' '}
              <span className="text-xs font-semibold text-emerald-800">/ {unitDisplay}</span>
            </div>
          </div>

          {/* Metadata Footer: Selling Date & Existing Bids */}
          <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
            <span className="flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {t('Selling Date')}: {translateText(listing.availableDate || listing.harvestDate, language)}
            </span>
            <span className="flex items-center gap-1 font-bold text-stone-700">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              {translateText(
                `${listing.bidsCount} ${listing.bidsCount === 1 ? 'Offer' : 'Offers'}`,
                language
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer: 'View Details' and 'Place Bid' */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        {isBuyer ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="md"
              variant="outline"
              className="w-full text-xs sm:text-sm font-bold"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => onViewDetails?.(listing)}
            >
              {t('View Details')}
            </Button>
            <Button
              size="md"
              variant="primary"
              className="w-full text-xs sm:text-sm font-bold"
              icon={<DollarSign className="w-4 h-4" />}
              onClick={() => onPlaceBid?.(listing)}
            >
              {t('Place Bid')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="md"
              variant="outline"
              className="w-full text-xs sm:text-sm font-bold"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => (onViewDetails ? onViewDetails(listing) : onViewBids?.(listing))}
            >
              {t('Produce Details')}
            </Button>
            <Button
              size="md"
              variant={listing.bidsCount > 0 ? 'primary' : 'outline'}
              className="w-full text-xs sm:text-sm font-bold"
              onClick={() => onViewBids?.(listing)}
            >
              {listing.bidsCount > 0
                ? translateText(`View ${listing.bidsCount} Offers`, language)
                : t('Buyer Offers')}
            </Button>
          </div>
        )}
      </div>

      <WhyThisPriceModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        listingId={listing.id}
        cropName={listing.cropName}
        unit={listing.unit}
        quantity={listing.quantity}
        quality={rawQuality}
        location={listing.location}
        expectedMin={listing.aiRecommendedPriceMin}
        expectedMax={listing.aiRecommendedPriceMax}
      />
    </div>
  );
};
