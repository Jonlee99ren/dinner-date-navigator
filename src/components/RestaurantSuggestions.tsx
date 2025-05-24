import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Star, Phone, Globe, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenRouterService } from '@/services/openrouter';

interface RestaurantSuggestionsProps {
  onBack: () => void;
  preferences: any;
  onBooking?: (restaurant: any) => void;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: string;
  description: string;
  image: string;
  features: string[];
}

const RestaurantSuggestions: React.FC<RestaurantSuggestionsProps> = ({ onBack, preferences, onBooking }) => {
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openRouterService] = useState(new OpenRouterService());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        // Load both the conversational AI response and structured restaurant data
        const [suggestions, structuredData] = await Promise.all([
          openRouterService.generateRestaurantSuggestions(preferences),
          openRouterService.generateStructuredRestaurantData(preferences)
        ]);
        
        setAiSuggestions(suggestions);
        setRestaurants(structuredData);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setAiSuggestions('Here are some popular dining options based on your preferences.');
        // Set fallback restaurants if needed
        setRestaurants([
          {
            id: 'fallback_1',
            name: 'Local Favorite Restaurant',
            cuisine: 'Local',
            rating: 4.5,
            priceRange: 'RM60-100',
            distance: '2.0 km',
            description: 'Popular local restaurant with great atmosphere and authentic flavors.',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            features: ['Local Favorite', 'Authentic', 'Good Value']
          }
        ]);
      }
      setIsLoading(false);
    };

    loadSuggestions();
  }, [preferences, openRouterService]);

  const loadMoreRestaurants = async () => {
    setIsLoadingMore(true);
    try {
      const moreRestaurants = await openRouterService.generateStructuredRestaurantData({
        ...preferences,
        additionalRequest: 'different restaurants from previous suggestions'
      });
      
      // Add unique restaurants (avoid duplicates)
      const existingIds = new Set(restaurants.map(r => r.name.toLowerCase()));
      const newRestaurants = moreRestaurants.filter(r => 
        !existingIds.has(r.name.toLowerCase())
      );
      
      setRestaurants(prev => [...prev, ...newRestaurants]);
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    }
    setIsLoadingMore(false);
  };

  const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => (
    <div 
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 hover:shadow-md ${
        selectedRestaurant === restaurant.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
      }`}
      onClick={() => setSelectedRestaurant(selectedRestaurant === restaurant.id ? null : restaurant.id)}
    >
      <div className="relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
            {restaurant.cuisine}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{restaurant.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{restaurant.description}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">{restaurant.priceRange}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.features.map((feature, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Globe className="w-4 h-4 mr-2" />
            Menu
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onBooking?.(restaurant);
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to chat</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Restaurant Recommendations</h1>
              <p className="text-sm text-gray-600">
                Based on: {preferences?.preferences?.join(' • ') || 'Your preferences'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* AI Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 mb-2">AI Analysis & Recommendations</h2>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {aiSuggestions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <MapPin className="w-3 h-3 inline mr-1" />
            {preferences?.location || 'Near you'}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3 inline mr-1" />
            {preferences?.time || 'Tonight'}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            💰 {preferences?.budget || 'RM100-150'}
          </span>
        </div>        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            // Loading skeleton for restaurant cards
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                </div>
              </div>
            ))
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No restaurants found. Please try adjusting your preferences.</p>
            </div>
          )}
        </div>        {/* Load More */}
        {!isLoading && restaurants.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="px-8"
              onClick={loadMoreRestaurants}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Finding More Restaurants...
                </>
              ) : (
                'Load More Restaurants'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSuggestions;
