import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PriceTag } from '../components/ui/PriceTag';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const orderId = state.orderId || 'order_1001';
  const restaurantName = state.restaurantName || 'Green Bowl Organics';
  const totalCents = state.pricing?.totalCents || 3820;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-10 flex flex-col gap-6 text-center">
      {/* Hero Success Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-honesty/10 text-honesty flex items-center justify-center animate-in zoom-in-50 duration-300">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Your order <span className="font-semibold text-text-primary">#{orderId.slice(-6)}</span> has been placed at <span className="font-semibold text-text-primary">{restaurantName}</span>.
        </p>
      </div>

      {/* Honest Price Lock Box */}
      <div className="bg-surface rounded-card border border-honesty/30 p-5 flex flex-col gap-3 text-left shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-semibold text-text-secondary">Total Paid</span>
          <PriceTag cents={totalCents} size="lg" isAccent={true} showHonestyCheck={true} />
        </div>

        {/* Explainable ETA Section */}
        <div className="flex items-start gap-3 pt-1">
          <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-base text-text-primary">Estimated Arrival: 25–32 min</span>
            <span className="text-xs text-text-secondary mt-0.5">
              Explainable breakdown: 12 min prep time at restaurant + 15 min courier route.
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate('/tracking')}
          variant="primary"
          size="lg"
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          <span>Track Live Order</span>
          <ArrowRight className="w-5 h-5" />
        </Button>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-text-secondary hover:text-text-primary py-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
