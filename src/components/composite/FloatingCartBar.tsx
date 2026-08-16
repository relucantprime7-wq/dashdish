import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCentsToCurrency } from '../../utils/formatters';

export const FloatingCartBar: React.FC = () => {
  const navigate = useNavigate();
  const { items, pricing, cartRestaurant } = useCart();

  if (items.length === 0 || !cartRestaurant) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-40 animate-in slide-in-from-bottom duration-300">
      <div
        onClick={() => navigate('/cart')}
        className="bg-text-primary text-white rounded-card p-4 shadow-floating flex items-center justify-between gap-4 cursor-pointer hover:bg-text-primary/95 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-accent flex items-center justify-center text-white font-bold shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/80 truncate max-w-[120px] sm:max-w-[150px]">{cartRestaurant.name}</span>
            </div>
            <span className="text-xs text-honesty font-medium">All fees included</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">
            {formatCentsToCurrency(pricing.totalCents)}
          </span>
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
};
