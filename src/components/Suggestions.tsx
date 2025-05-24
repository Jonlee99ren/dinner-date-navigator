
import React from 'react';
import { ArrowDown } from 'lucide-react';
import SuggestionCard from './SuggestionCard';

interface SuggestionsProps {
  onBack: () => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ onBack }) => {
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
          </button>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Perfect dinner spots for you
          </h1>
          <p className="text-slate-600 text-sm">
            Based on your preferences: Beachside • Live Band • Serves Alcohol
          </p>
        </div>

        {/* Restaurant Cards */}
        <div className="space-y-6">
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

        {/* Bottom Padding */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Suggestions;
