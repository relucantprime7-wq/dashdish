import { CartItem, PricingBreakdown, LineItemBreakdown } from '../types';

export interface PricingInput {
  items: CartItem[];
  deliveryFeeCents: number;
  tipCents: number;
  promoCode?: string;
}

/**
 * Single source of pricing calculation logic for optimistic client-side preview.
 * All monetary amounts are integers in cents.
 */
export function calculateOrderTotal({
  items,
  deliveryFeeCents,
  tipCents,
  promoCode,
}: PricingInput): PricingBreakdown {
  let subtotalCents = 0;

  const lineItems: LineItemBreakdown[] = items.map((cartItem) => {
    // Base item price + selected option deltas
    const optionsDelta = cartItem.selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaCents, 0);
    const unitPriceCents = cartItem.menuItem.basePriceCents + optionsDelta;
    const lineTotalCents = unitPriceCents * cartItem.quantity;
    
    subtotalCents += lineTotalCents;

    return {
      menuItemId: cartItem.menuItem.id,
      name: cartItem.menuItem.name,
      quantity: cartItem.quantity,
      unitPriceCents,
      lineTotalCents,
      selectedOptions: cartItem.selectedOptions,
    };
  });

  // Calculate fees and taxes
  // Standard Service Fee = 10% of subtotal (min 150 cents)
  const serviceFeeCents = subtotalCents > 0 ? Math.max(150, Math.round(subtotalCents * 0.1)) : 0;
  
  // Tax = 8.875% of (subtotal + service fee)
  const taxCents = subtotalCents > 0 ? Math.round((subtotalCents + serviceFeeCents) * 0.08875) : 0;

  // Handle promo codes
  let discountCents = 0;
  let promoError: string | undefined;

  if (promoCode && promoCode.trim().length > 0) {
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      discountCents = Math.round(subtotalCents * 0.1); // 10% off subtotal
    } else if (cleanCode === 'FREEDELIVERY') {
      discountCents = deliveryFeeCents;
    } else {
      promoError = 'Invalid or expired promo code';
    }
  }

  const effectiveDeliveryFee = subtotalCents > 0 ? deliveryFeeCents : 0;
  const totalCents = Math.max(
    0,
    subtotalCents + effectiveDeliveryFee + serviceFeeCents + taxCents + tipCents - discountCents
  );

  return {
    subtotalCents,
    deliveryFeeCents: effectiveDeliveryFee,
    serviceFeeCents,
    taxCents,
    tipCents,
    discountCents,
    totalCents,
    lineItems,
    promoError,
  };
}
