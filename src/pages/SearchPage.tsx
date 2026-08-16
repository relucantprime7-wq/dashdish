import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../types';
import { apiService } from '../services/apiService';
import { TextInput } from '../components/ui/TextInput';
import { RestaurantCard } from '../components/composite/RestaurantCard';
import { PriceTag } from '../components/ui/PriceTag';
import { Search, ArrowLeft, Utensils } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<{ restaurants: Restaurant[]; items: any[] }>({
    restaurants: [],
    items: [],
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ restaurants: [], items: [] });
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      apiService.searchCatalog(query).then((res) => {
        setResults(res);
        setIsSearching(false);
      });
    }, 300); // 300ms debounce requirement

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Header with Search Field */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <TextInput
            placeholder="Search for bowls, pizza, sushi, or restaurants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />
        </div>
      </div>

      {/* Results view */}
      {isSearching ? (
        <div className="py-12 text-center text-text-secondary text-sm">
          Searching menus & prices...
        </div>
      ) : !query.trim() ? (
        <div className="py-12 text-center text-text-tertiary text-xs">
          Type a food item, allergen, or restaurant name to search.
        </div>
      ) : results.restaurants.length === 0 && results.items.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center flex flex-col items-center gap-2">
          <Utensils className="w-8 h-8 text-text-tertiary" />
          <p className="font-semibold text-text-primary text-base">No matches found</p>
          <p className="text-xs text-text-secondary">Try searching for "Bowl", "Pizza", or "Green".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Matched Restaurants */}
          {results.restaurants.length > 0 && (
            <div>
              <h3 className="font-bold text-base text-text-primary mb-3">Restaurants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.restaurants.map((rest) => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    onClick={() => navigate(`/restaurants/${rest.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matched Menu Items */}
          {results.items.length > 0 && (
            <div>
              <h3 className="font-bold text-base text-text-primary mb-3">Menu Items</h3>
              <div className="flex flex-col gap-3">
                {results.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/restaurants/${item.restaurantId}`)}
                    className="bg-surface border border-border rounded-card p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-accent transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-accent">{item.restaurantName}</span>
                      <span className="font-semibold text-sm text-text-primary">{item.name}</span>
                      <span className="text-xs text-text-secondary line-clamp-1">{item.description}</span>
                    </div>
                    <PriceTag cents={item.basePriceCents} size="md" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
