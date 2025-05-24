import React from 'react';
import { MapPin, Navigation, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  location?: string;
  onLocationClick?: () => void;
  onSettingsClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  location,
  onLocationClick,
  onSettingsClick
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🍽️</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Smart Dinner Planner</h1>
            </div>
          </div>

          {/* Location and Settings */}
          <div className="flex items-center space-x-3">
            {/* Location Display */}
            {location && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLocationClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 max-w-xs"
              >
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="truncate text-sm">{location}</span>
              </Button>
            )}

            {/* No Location */}
            {!location && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLocationClick}
                className="flex items-center space-x-2 text-gray-500 border-gray-300"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm">Add Location</span>
              </Button>
            )}

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
