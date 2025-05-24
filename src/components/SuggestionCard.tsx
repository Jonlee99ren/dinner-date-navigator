
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Restaurant {
  id: string;
  name: string;
  distance: string;
  tags: string[];
  rating: number;
  image: string;
}

interface SuggestionCardProps {
  restaurant: Restaurant;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-scale-in">
      {/* Restaurant Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center text-sm font-medium text-slate-700">
            <span className="mr-1">⭐</span>
            {restaurant.rating}
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {restaurant.name}
          </h3>
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {restaurant.distance}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl py-2"
          >
            View on Map
          </Button>
          <Button
            className="flex-1 rounded-xl py-2 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
