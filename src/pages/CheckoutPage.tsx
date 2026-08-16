import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { MOCK_ADDRESSES, MOCK_PAYMENT_METHODS } from '../data/mockData';
import { PriceBreakdownPanel } from '../components/composite/PriceBreakdownPanel';
import { Button } from '../components/ui/Button';
import { PriceTag } from '../components/ui/PriceTag';
import { ArrowLeft, MapPin, CreditCard, HeartHandshake, ShieldCheck, CheckCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, cartRestaurant, pricing, tipCents, setTipCents, clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(MOCK_ADDRESSES[0].id);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(MOCK_PAYMENT_METHODS[0].id);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  if (items.length === 0 || !cartRestaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="font-semibold text-text-primary">No active checkout session</p>
        <button onClick={() => navigate('/')} className="text-accent text-sm font-semibold hover:underline mt-2">
          Return to Home
        </button>
      </div>
    );
  }

  const tipOptionsCents = [0, 200, 300, 400, 500];

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    // Simulate order placement with client-generated Idempotency-Key
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    setTimeout(() => {
      setIsPlacingOrder(false);
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderId: `order_${Date.now()}`,
          idempotencyKey,
          restaurantName: cartRestaurant.name,
          pricing,
          placedAt: new Date().toISOString(),
        },
      });
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Top Header */}
      <button
        onClick={() => navigate('/cart')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-2xl font-bold text-text-primary">Review & Place Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Options Form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Address Section */}
          <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {MOCK_ADDRESSES.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3.5 rounded-btn border flex items-center justify-between cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-accent bg-accent/5 font-medium'
                      : 'border-border bg-surface hover:border-text-tertiary'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">{addr.label}</span>
                    <span className="text-xs text-text-secondary">{addr.street}, {addr.city}</span>
                  </div>
                  {selectedAddressId === addr.id && <CheckCircle className="w-4 h-4 text-accent" />}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {MOCK_PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setSelectedPaymentId(pm.id)}
                  className={`p-3.5 rounded-btn border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPaymentId === pm.id
                      ? 'border-accent bg-accent/5 font-medium'
                      : 'border-border bg-surface hover:border-text-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-border/60 rounded flex items-center justify-center font-bold text-xs">
                      {pm.brand}
                    </div>
                    <span className="text-sm text-text-primary">•••• {pm.last4}</span>
                  </div>
                  {selectedPaymentId === pm.id && <CheckCircle className="w-4 h-4 text-accent" />}
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Tip Selector (NO DARK PATTERNS) */}
          <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-accent" />
                <span>Courier Tip</span>
              </h3>
              <span className="text-xs text-honesty font-medium">100% goes to your driver</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tipOptionsCents.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipCents(amt)}
                  className={`flex-1 py-2 px-3 rounded-btn text-xs font-semibold border transition-all ${
                    tipCents === amt
                      ? 'bg-accent text-white border-accent shadow-xs'
                      : 'bg-bg text-text-primary border-border hover:border-text-tertiary'
                  }`}
                >
                  {amt === 0 ? 'No Tip' : `$${(amt / 100).toFixed(2)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary & Place Order Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PriceBreakdownPanel pricing={pricing} title="Final Order Total" showHonestyHeader={true} />

          <Button
            onClick={handlePlaceOrder}
            isLoading={isPlacingOrder}
            variant="primary"
            size="lg"
            fullWidth
            className="shadow-md"
          >
            Place Order — <PriceTag cents={pricing.totalCents} size="md" isAccent={false} className="text-white ml-1" />
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-honesty font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Price Lock & Idempotent Submission</span>
          </div>
        </div>
      </div>
    </div>
  );
};
