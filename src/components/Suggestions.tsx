
import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import { OpenRouterService } from '@/services/openrouter';

interface SuggestionsProps {
  onBack: () => void;
  onContinueToBooking?: () => void;
  preferences?: any;
}

const Suggestions: React.FC<SuggestionsProps> = ({ onBack, onContinueToBooking, preferences }) => {
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [openRouterService] = useState(new OpenRouterService());

  useEffect(() => {
    const loadSuggestions = async () => {
      if (preferences) {
        try {
          const suggestions = await openRouterService.generateRestaurantSuggestions(preferences);
          setAiSuggestions(suggestions);
        } catch (error) {
          console.error('Error loading suggestions:', error);
          setAiSuggestions('Unable to load current restaurant suggestions. Here are some popular options in your area.');
        }
      }
      setIsLoading(false);
    };

    loadSuggestions();
  }, [preferences, openRouterService]);

  const restaurants = [
    {
      id: '1',
      name: 'The Cove',
      distance: '3.2 km',
      tags: ['Beachside', 'Live Music', 'Alcohol'],
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    },
    {
      id: '2',
      name: 'Sunset Grill',
      distance: '2.8 km',
      tags: ['Beachside', 'Live Band', 'Alcohol'],
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
    },
    {
      id: '3',
      name: 'Marina Bay',
      distance: '4.1 km',
      tags: ['Waterfront', 'Live Music', 'Cocktails'],
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
    },
  ];

  return (
    <div className="mobile-container bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors duration-200"
          >
            <ArrowDown className="w-5 h-5 mr-2 rotate-90" />
            Back to search
          </button>          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Perfect dinner spots for you
          </h1>
          <p className="text-slate-600 text-sm">
            Based on your preferences: {preferences?.preferences?.join(' • ') || 'Beachside • Live Band • Serves Alcohol'}
          </p>
        </div>

        {/* AI Suggestions */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">🤖 AI-Powered Recommendations</h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {aiSuggestions}
            </div>
          </div>
        )}        {/* Restaurant Cards */}
        <div className="space-y-6 mb-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SuggestionCard restaurant={restaurant} />
            </div>
          ))}
        </div>

        {/* Continue to Booking Button */}
        {onContinueToBooking && (
          <div className="mb-6 animate-fade-in">
            <button
              onClick={onContinueToBooking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-medium transition-colors duration-200 shadow-sm"
            >
              Continue to Booking Options
            </button>
          </div>
        )}

        {/* Bottom Padding */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Suggestions;
