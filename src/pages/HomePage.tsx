import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../types';
import { apiService } from '../services/apiService';
import { RestaurantCard } from '../components/composite/RestaurantCard';
import { SkeletonBlock } from '../components/ui/SkeletonBlock';
import { ShieldCheck, Search, Sparkles, Filter } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSort, setActiveSort] = useState<'rating' | 'eta'>('rating');
  const [filterCuisine, setFilterCuisine] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiService.getRestaurants(activeSort).then((data) => {
      if (isMounted) {
        setRestaurants(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeSort]);

  const cuisines = ['All', 'Bowls', 'Pizza', 'Japanese', 'Mexican'];

  const filteredRestaurants = restaurants.filter((r) => {
    if (filterCuisine === 'All') return true;
    return r.cuisineType.toLowerCase().includes(filterCuisine.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Promise Banner (Beatriz & Adrian Personas) */}
      <div className="bg-surface border border-honesty/30 rounded-card p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-btn bg-honesty/10 text-honesty shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-text-primary">
              No Hidden Fees. Real ETAs. Guaranteed.
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Every price shown includes estimated fees before you open the menu. No checkout surprises.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-btn bg-bg border border-border text-text-primary text-xs font-semibold hover:border-accent flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Search className="w-4 h-4 text-accent" />
          <span>Explore All Menus</span>
        </button>
      </div>

      {/* Quick Filter & Sort Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCuisine(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filterCuisine === c
                  ? 'bg-accent text-white font-semibold shadow-xs'
                  : 'bg-surface text-text-secondary border border-border hover:border-text-tertiary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-medium text-text-secondary">
          <Filter className="w-3.5 h-3.5 text-text-tertiary" />
          <span>Sort:</span>
          <button
            onClick={() => setActiveSort('rating')}
            className={`px-2.5 py-1 rounded-btn transition-colors ${
              activeSort === 'rating' ? 'bg-text-primary text-white font-semibold' : 'hover:text-text-primary'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setActiveSort('eta')}
            className={`px-2.5 py-1 rounded-btn transition-colors ${
              activeSort === 'eta' ? 'bg-text-primary text-white font-semibold' : 'hover:text-text-primary'
            }`}
          >
            Fastest ETA
          </button>
        </div>
      </div>

      {/* Restaurant List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span>Honest Price Restaurants</span>
          </h2>
          <span className="text-xs text-text-tertiary">{filteredRestaurants.length} places available</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface rounded-card border border-border p-4 flex flex-col gap-3">
                <SkeletonBlock height="160px" rounded="rounded-btn" />
                <SkeletonBlock height="20px" width="70%" />
                <SkeletonBlock height="16px" width="40%" />
                <div className="pt-2 border-t border-border flex justify-between">
                  <SkeletonBlock height="16px" width="30%" />
                  <SkeletonBlock height="16px" width="35%" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-surface rounded-card border border-border p-12 text-center flex flex-col items-center gap-3">
            <p className="text-base font-semibold text-text-primary">No restaurants match your filter</p>
            <p className="text-xs text-text-secondary">Try selecting "All" or searching for a different item.</p>
            <button
              onClick={() => setFilterCuisine('All')}
              className="mt-2 text-xs font-semibold text-accent hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
