
import React from 'react';
import { ArrowDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingOptionsProps {
  preferences: {
    location: string;
    time: string;
    budget: string;
    preferences: string[];
  };
  onBack: () => void;
}

const BookingOptions: React.FC<BookingOptionsProps> = ({ preferences, onBack }) => {
  const restaurants = [
    {
      id: '1',
      name: 'The Cove',
      distance: '3.2 km',
      tags: ['Beachside', 'Live Music', 'Alcohol'],
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      available: true,
    },
    {
      id: '2',
      name: 'Sunset Grill',
      distance: '2.8 km',
      tags: ['Beachside', 'Live Band', 'Alcohol'],
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
      available: true,
    },
    {
      id: '3',
      name: 'Marina Bay',
      distance: '4.1 km',
      tags: ['Waterfront', 'Live Music', 'Cocktails'],
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
      available: false,
    },
  ];

  const handleBookNow = (restaurantName: string) => {
    alert(`Great choice! Booking ${restaurantName} for ${preferences.time}. You'll receive a confirmation shortly! 🎉`);
  };

  return (
    <div className="mobile-container bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors duration-200"
          >
            <ArrowDown className="w-5 h-5 mr-2 rotate-90" />
            Back to preferences
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-sunset-400 to-sunset-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-3">
              Perfect matches found!
            </h1>
            <p className="text-slate-600 text-sm">
              Here are restaurants available for booking tonight at 7 PM
            </p>
          </div>
        </div>

        {/* AI Message */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-4 rounded-2xl shadow-md">
            <p className="text-slate-800 text-sm leading-relaxed text-center">
              Great news! I found {restaurants.filter(r => r.available).length} restaurants that match your preferences and have availability tonight. Would you like to book one now? 🎉
            </p>
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="space-y-4">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="animate-fade-in"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                restaurant.available ? 'hover:shadow-xl' : 'opacity-60'
              }`}>
                {/* Restaurant Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <span className="mr-1">⭐</span>
                      {restaurant.rating}
                    </div>
                  </div>
                  {!restaurant.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">Fully Booked</span>
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {restaurant.distance}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {restaurant.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  {restaurant.available ? (
                    <Button
                      onClick={() => handleBookNow(restaurant.name)}
                      className="w-full bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-white rounded-xl py-3 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                      Book Now for {preferences.time}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-slate-200 text-slate-500 rounded-xl py-3 cursor-not-allowed font-semibold"
                    >
                      Fully Booked
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default BookingOptions;
