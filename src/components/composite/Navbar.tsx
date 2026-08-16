import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Honesty Tagline */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-btn bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-accent-pressed transition-colors">
              D
            </div>
            <div className="flex flex-col">
             <span className="font-bold text-lg leading-none tracking-tight text-text-primary">
                Dash<span className="text-accent">Dish</span>
              </span>
              <span className="text-[10px] font-semibold text-honesty flex items-center gap-0.5 leading-tight mt-0.5">
                <ShieldCheck className="w-3 h-3 inline" /> 100% Honest Pricing
              </span>
            </div>
          </Link>

          {/* Delivery Address Pill */}
          <button
            onClick={() => navigate('/addresses')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg border border-border hover:border-text-tertiary transition-colors text-xs font-medium text-text-primary"
          >
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="truncate max-w-[180px]">742 Evergreen Terrace</span>
            <span className="text-text-tertiary font-normal">• 20–30 min</span>
          </button>

          
          
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Search CTA */}
          <button
            onClick={() => navigate('/search')}
            className={`p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg transition-colors ${
              location.pathname === '/search' ? 'bg-bg text-accent font-semibold' : ''
            }`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon & Badge */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 duration-150">
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full border border-border bg-bg hover:border-accent text-text-primary transition-colors"
            aria-label="User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
