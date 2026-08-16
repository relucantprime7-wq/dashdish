import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, MenuItem, SelectedOptionSnapshot, PricingBreakdown, Restaurant } from '../types';
import { calculateOrderTotal } from '../utils/pricingEngine';

interface CartContextType {
  cartRestaurant: Restaurant | null;
  items: CartItem[];
  tipCents: number;
  promoCode: string;
  pricing: PricingBreakdown;
  setTipCents: (tip: number) => void;
  setPromoCode: (code: string) => void;
  addToCart: (restaurant: Restaurant, menuItem: MenuItem, selectedOptions: SelectedOptionSnapshot[], notes?: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCustomizationSheetOpen: boolean;
  activeMenuItemForCustomization: { restaurant: Restaurant; menuItem: MenuItem } | null;
  openCustomizationSheet: (restaurant: Restaurant, menuItem: MenuItem) => void;
  closeCustomizationSheet: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [tipCents, setTipCents] = useState<number>(300); // Neutral $3 default tip
  const [promoCode, setPromoCode] = useState<string>('');

  // Customization sheet overlay state
  const [isCustomizationSheetOpen, setIsCustomizationSheetOpen] = useState<boolean>(false);
  const [activeMenuItemForCustomization, setActiveMenuItemForCustomization] = useState<{
    restaurant: Restaurant;
    menuItem: MenuItem;
  } | null>(null);

  const openCustomizationSheet = (restaurant: Restaurant, menuItem: MenuItem) => {
    setActiveMenuItemForCustomization({ restaurant, menuItem });
    setIsCustomizationSheetOpen(true);
  };

  const closeCustomizationSheet = () => {
    setIsCustomizationSheetOpen(false);
    setActiveMenuItemForCustomization(null);
  };

  const addToCart = (
    restaurant: Restaurant,
    menuItem: MenuItem,
    selectedOptions: SelectedOptionSnapshot[],
    notes?: string
  ) => {
    // If cart has items from another restaurant, reset cart first per single-restaurant rule
    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      if (!confirm(`Your cart contains items from "${cartRestaurant.name}". Clear cart and add from "${restaurant.name}"?`)) {
        return;
      }
      setItems([]);
    }

    setCartRestaurant(restaurant);

    const optionsDelta = selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaCents, 0);
    const lineItemPriceCents = menuItem.basePriceCents + optionsDelta;

    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      menuItem,
      quantity: 1,
      selectedOptions,
      lineItemPriceCents,
      notes,
    };

    setItems((prev) => [...prev, newItem]);
    closeCustomizationSheet();
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== cartItemId);
      if (next.length === 0) {
        setCartRestaurant(null);
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCartRestaurant(null);
  };

  const pricing = useMemo(() => {
    return calculateOrderTotal({
      items,
      deliveryFeeCents: cartRestaurant?.deliveryFeeCents || 0,
      tipCents,
      promoCode,
    });
  }, [items, cartRestaurant, tipCents, promoCode]);

  return (
    <CartContext.Provider
      value={{
        cartRestaurant,
        items,
        tipCents,
        promoCode,
        pricing,
        setTipCents,
        setPromoCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCustomizationSheetOpen,
        activeMenuItemForCustomization,
        openCustomizationSheet,
        closeCustomizationSheet,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
