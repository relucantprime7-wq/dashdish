export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface CustomizationOption {
  id: string;
  name: string;
  priceDeltaCents: number;
  isAvailable: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  selectionType: 'single' | 'multi';
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  basePriceCents: number;
  imageUrl: string;
  isAvailable: boolean;
  allergens: string[];
  customizationGroups: CustomizationGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  rating: number;
  prepTimeAvgMin: number;
  isOpen: boolean;
  lat: number;
  lng: number;
  address: string;
  imageUrl: string;
  etaRangeMinMinutes: number;
  etaRangeMaxMinutes: number;
  priceFromCents: number; // All-in price starting point
  deliveryFeeCents: number;
}

export interface SelectedOptionSnapshot {
  optionId: string;
  groupName: string;
  optionName: string;
  priceDeltaCents: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOptionSnapshot[];
  lineItemPriceCents: number;
  notes?: string;
}

export interface LineItemBreakdown {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  selectedOptions: SelectedOptionSnapshot[];
}

export interface PricingBreakdown {
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  taxCents: number;
  tipCents: number;
  discountCents: number;
  totalCents: number;
  lineItems: LineItemBreakdown[];
  promoError?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // "Home", "Work"
  street: string;
  city: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  providerToken: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  occurredAt: string;
  note?: string;
}

export interface Courier {
  id: string;
  name: string;
  lat: number;
  lng: number;
  signalStatus: 'live' | 'stale' | 'lost';
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  address: Address;
  idempotencyKey: string;
  status: OrderStatus;
  pricing: PricingBreakdown;
  statusEvents: OrderStatusEvent[];
  etaRangeMinMinutes: number;
  etaRangeMaxMinutes: number;
  etaReason?: string;
  courier?: Courier;
  placedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
