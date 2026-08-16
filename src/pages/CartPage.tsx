import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { PriceBreakdownPanel } from '../components/composite/PriceBreakdownPanel';
import { PriceTag } from '../components/ui/PriceTag';
import { Stepper } from '../components/ui/Stepper';
import { TextInput } from '../components/ui/TextInput';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    cartRestaurant,
    pricing,
    updateQuantity,
    removeFromCart,
    clearCart,
    promoCode,
    setPromoCode,
  } = useCart();

  const [inputPromo, setInputPromo] = useState<string>(promoCode);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoCode(inputPromo);
  };

  if (items.length === 0 || !cartRestaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-border/40 flex items-center justify-center text-text-tertiary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Your Cart is Empty</h2>
        <p className="text-xs text-text-secondary">
          Explore restaurants around you to discover honest prices and fast delivery.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" size="md">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={clearCart}
          className="text-xs font-medium text-error hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      {/* Cart Title & Restaurant */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Your Cart</h1>
        <p className="text-xs text-text-secondary mt-0.5">Ordering from <span className="font-semibold text-text-primary">{cartRestaurant.name}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Line Items Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {items.map((cartItem) => (
              <div
                key={cartItem.id}
                className="bg-surface rounded-card border border-border p-4 flex justify-between gap-4"
              >
                <div className="flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{cartItem.menuItem.name}</h4>
                    {cartItem.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cartItem.selectedOptions.map((opt) => (
                          <span key={opt.optionId} className="text-[11px] text-text-secondary bg-bg px-2 py-0.5 rounded border border-border">
                            {opt.optionName} {opt.priceDeltaCents > 0 && `(+$${(opt.priceDeltaCents / 100).toFixed(2)})`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Stepper
                      value={cartItem.quantity}
                      onChange={(newQty) => updateQuantity(cartItem.id, newQty)}
                      size="sm"
                    />

                    <div className="flex items-center gap-3">
                      <PriceTag cents={cartItem.lineItemPriceCents * cartItem.quantity} size="md" />
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="text-text-tertiary hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <form onSubmit={handleApplyPromo} className="bg-surface border border-border rounded-card p-4 flex gap-2 items-center">
            <TextInput
              placeholder="Try promo 'WELCOME10'"
              value={inputPromo}
              onChange={(e) => setInputPromo(e.target.value)}
              leftIcon={<Tag className="w-4 h-4" />}
            />
            <Button type="submit" variant="secondary" size="md" className="shrink-0">
              Apply
            </Button>
          </form>
          {pricing.promoError && (
            <p className="text-xs text-error font-medium px-2">{pricing.promoError}</p>
          )}
        </div>

        {/* Breakdown & Checkout Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PriceBreakdownPanel pricing={pricing} title="Order Summary" showHonestyHeader={true} />

          <Button
            onClick={() => navigate('/checkout')}
            variant="primary"
            size="lg"
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
