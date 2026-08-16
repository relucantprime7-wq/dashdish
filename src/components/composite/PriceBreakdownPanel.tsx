import React from 'react';
import { PricingBreakdown } from '../../types';
import { PriceTag } from '../ui/PriceTag';
import { ShieldCheck, Info } from 'lucide-react';

export interface PriceBreakdownPanelProps {
  pricing: PricingBreakdown;
  title?: string;
  showHonestyHeader?: boolean;
  className?: string;
}

export const PriceBreakdownPanel: React.FC<PriceBreakdownPanelProps> = ({
  pricing,
  title = 'Price Breakdown',
  showHonestyHeader = true,
  className = '',
}) => {
  return (
    <div className={`bg-surface rounded-card border border-border p-4 sm:p-5 flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-semibold text-base text-text-primary">{title}</h3>
        {showHonestyHeader && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-honesty/10 text-honesty text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-honesty" />
            Zero Hidden Fees
          </span>
        )}
      </div>

      {/* Itemized Rows */}
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-0.5">
          <span>Items Subtotal</span>
          <PriceTag cents={pricing.subtotalCents} size="sm" />
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between items-center py-0.5">
          <span className="flex items-center gap-1">
            Delivery Fee
            <span className="group relative cursor-pointer text-text-tertiary hover:text-text-primary">
              <Info className="w-3.5 h-3.5 inline" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-text-primary text-white text-[11px] px-2 py-1 rounded whitespace-nowrap z-20">
                Based on distance & driver availability
              </span>
            </span>
          </span>
          <PriceTag cents={pricing.deliveryFeeCents} size="sm" />
        </div>

        {/* Service Fee */}
        <div className="flex justify-between items-center py-0.5">
          <span className="flex items-center gap-1">
            Service Fee
            <span className="group relative cursor-pointer text-text-tertiary hover:text-text-primary">
              <Info className="w-3.5 h-3.5 inline" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-text-primary text-white text-[11px] px-2 py-1 rounded whitespace-nowrap z-20">
                10% standard platform maintenance
              </span>
            </span>
          </span>
          <PriceTag cents={pricing.serviceFeeCents} size="sm" />
        </div>

        {/* Estimated Tax */}
        <div className="flex justify-between items-center py-0.5">
          <span>Taxes (8.875%)</span>
          <PriceTag cents={pricing.taxCents} size="sm" />
        </div>

        {/* Tip */}
        <div className="flex justify-between items-center py-0.5">
          <span>Courier Tip</span>
          <PriceTag cents={pricing.tipCents} size="sm" />
        </div>

        {/* Discount (if applicable) */}
        {pricing.discountCents > 0 && (
          <div className="flex justify-between items-center py-0.5 text-honesty font-medium">
            <span>Promo Discount</span>
            <span>-{pricing.discountCents > 0 ? `$${(pricing.discountCents / 100).toFixed(2)}` : '$0.00'}</span>
          </div>
        )}
      </div>

      {/* Total Section */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-base text-text-primary">Total Price</span>
          <span className="text-[11px] text-text-tertiary">Guaranteed price lock</span>
        </div>
        <PriceTag cents={pricing.totalCents} size="display" isAccent={true} showHonestyCheck={true} />
      </div>
    </div>
  );
};
