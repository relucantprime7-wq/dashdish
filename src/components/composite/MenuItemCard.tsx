import React from 'react';
import { MenuItem } from '../../types';
import { PriceTag } from '../ui/PriceTag';
import { Badge } from '../ui/Badge';
import { SlidersHorizontal, Plus } from 'lucide-react';

export interface MenuItemCardProps {
  item: MenuItem;
  onSelect: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const hasCustomizations = item.customizationGroups && item.customizationGroups.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`group bg-surface rounded-card border border-border p-4 flex gap-4 transition-all duration-200 cursor-pointer hover:border-text-tertiary hover:shadow-card ${
        !item.isAvailable ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Text Information */}
      <div className="flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base text-text-primary group-hover:text-accent transition-colors">
              {item.name}
            </h4>
            {hasCustomizations && (
              <span className="text-[11px] text-text-tertiary flex items-center gap-0.5 bg-bg px-1.5 py-0.5 rounded border border-border">
                <SlidersHorizontal className="w-3 h-3" /> Customize
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Allergen Tags */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.allergens.map((allergen) => (
              <Badge key={allergen} variant="allergen">
                Contains {allergen}
              </Badge>
            ))}
          </div>
        )}

        {/* Price & Add Action */}
        <div className="flex items-center justify-between pt-2">
          <PriceTag cents={item.basePriceCents} size="md" />

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-btn bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Item Image */}
      {item.imageUrl && (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-btn overflow-hidden bg-border/40 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};
