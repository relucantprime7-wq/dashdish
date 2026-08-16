import { Restaurant, MenuCategory, PricingBreakdown, CartItem } from '../types';
import { MOCK_RESTAURANTS, MOCK_MENUS } from '../data/mockData';
import { calculateOrderTotal } from '../utils/pricingEngine';

const DELAY_MS = 250; // Simulate small natural network latency

/**
 * Service handling all catalog, restaurant discovery, and pricing calls.
 */
export const apiService = {
  async getRestaurants(sort: 'eta' | 'rating' | 'distance' = 'rating'): Promise<Restaurant[]> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    const restaurants = [...MOCK_RESTAURANTS];

    if (sort === 'eta') {
      restaurants.sort((a, b) => a.etaRangeMinMinutes - b.etaRangeMinMinutes);
    } else if (sort === 'rating') {
      restaurants.sort((a, b) => b.rating - a.rating);
    }

    return restaurants;
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    return MOCK_RESTAURANTS.find((r) => r.id === id) || null;
  },

  async getMenuByRestaurantId(restaurantId: string): Promise<MenuCategory[]> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    return MOCK_MENUS[restaurantId] || [];
  },

  async searchCatalog(query: string): Promise<{ restaurants: Restaurant[]; items: any[] }> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    const q = query.toLowerCase().trim();

    if (!q) {
      return { restaurants: [], items: [] };
    }

    const matchedRestaurants = MOCK_RESTAURANTS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.cuisineType.toLowerCase().includes(q)
    );

    const matchedItems: any[] = [];
    Object.entries(MOCK_MENUS).forEach(([restId, categories]) => {
      const rest = MOCK_RESTAURANTS.find((r) => r.id === restId);
      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
            matchedItems.push({
              ...item,
              restaurantId: restId,
              restaurantName: rest?.name || 'Unknown Restaurant',
            });
          }
        });
      });
    });

    return { restaurants: matchedRestaurants, items: matchedItems };
  },

  async calculatePricing(
    items: CartItem[],
    deliveryFeeCents: number,
    tipCents: number,
    promoCode?: string
  ): Promise<PricingBreakdown> {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    return calculateOrderTotal({
      items,
      deliveryFeeCents,
      tipCents,
      promoCode,
    });
  },
};
