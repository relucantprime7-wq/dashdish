import React from 'react';
import { Restaurant } from '../../types';
import { PriceTag } from '../ui/PriceTag';
import { Star, Clock } from 'lucide-react';
import { formatEtaRange } from '../../utils/formatters';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-surface rounded-card border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-card hover:border-text-tertiary flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-video overflow-hidden bg-border/40">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Closed Overlay if applicable */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-text-primary/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-surface text-text-primary px-3 py-1.5 rounded-btn text-xs font-semibold uppercase tracking-wider">
              Closed Right Now
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-text-primary flex items-center gap-1 border border-border shadow-xs">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base text-text-primary group-hover:text-accent transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{restaurant.cuisineType}</p>
        </div>

        {/* Honest Pricing & Delivery Metadata Row */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-xs">
          {/* ETA Range */}
          <div className="flex items-center gap-1 text-text-secondary font-medium">
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{formatEtaRange(restaurant.etaRangeMinMinutes, restaurant.etaRangeMaxMinutes)}</span>
          </div>

          {/* All-In Starting Price Badge (Beatriz persona) */}
          <div className="flex items-center gap-1 bg-honesty/10 px-2 py-0.5 rounded-full border border-honesty/20">
            <span className="text-[11px] text-honesty font-medium">from</span>
            <PriceTag cents={restaurant.priceFromCents} size="sm" isAccent={false} />
            <span className="text-[10px] font-bold text-honesty uppercase tracking-wider">all-in</span>
          </div>
        </div>
      </div>
    </div>
  );
};
