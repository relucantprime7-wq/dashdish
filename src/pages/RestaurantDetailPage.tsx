import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Restaurant, MenuCategory } from '../types';
import { apiService } from '../services/apiService';
import { useCart } from '../hooks/useCart';
import { MenuItemCard } from '../components/composite/MenuItemCard';
import { Badge } from '../components/ui/Badge';
import { CustomizationSheet } from './CustomizationSheet';
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react';
import { formatEtaRange } from '../utils/formatters';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openCustomizationSheet, activeMenuItemForCustomization } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([apiService.getRestaurantById(id), apiService.getMenuByRestaurantId(id)]).then(
      ([restData, menuData]) => {
        setRestaurant(restData);
        setCategories(menuData);
        if (menuData.length > 0) {
          setActiveCategory(menuData[0].id);
        }
        setIsLoading(false);
      }
    );
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-4 animate-pulse">
        <div className="h-48 bg-border/60 rounded-card w-full" />
        <div className="h-8 bg-border/60 rounded w-1/3" />
        <div className="h-20 bg-border/60 rounded-card w-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center flex flex-col items-center gap-3">
        <p className="font-bold text-lg text-text-primary">Restaurant Not Found</p>
        <button onClick={() => navigate('/')} className="text-accent text-sm font-semibold hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 flex flex-col gap-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary self-start transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurants</span>
      </button>

      {/* Restaurant Header Banner */}
      <div className="bg-surface rounded-card border border-border overflow-hidden shadow-xs">
        <div className="relative h-44 sm:h-56 w-full bg-border/40">
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-xl sm:text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-xs text-white/80">{restaurant.cuisineType}</p>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 font-bold text-text-primary bg-bg px-2.5 py-1 rounded-full border border-border">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-text-secondary font-medium">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{formatEtaRange(restaurant.etaRangeMinMinutes, restaurant.etaRangeMaxMinutes)}</span>
            </div>
            <div className="flex items-center gap-1 text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="truncate max-w-[200px]">{restaurant.address}</span>
            </div>
          </div>

          {/* Delivery Fee Honest Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="honesty">
              Delivery: {restaurant.deliveryFeeCents === 0 ? 'Free' : `$${(restaurant.deliveryFeeCents / 100).toFixed(2)}`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Sticky Tabs */}
      {categories.length > 0 && (
        <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-md border-b border-border py-2 px-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-text-primary text-white'
                  : 'bg-bg text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Categories & Items */}
      <div className="flex flex-col gap-8">
        {categories.map((cat) => (
          <div key={cat.id} id={cat.id} className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">
              {cat.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onSelect={() => openCustomizationSheet(restaurant, item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Customization Sheet Overlay */}
      {activeMenuItemForCustomization && <CustomizationSheet />}
    </div>
  );
};
