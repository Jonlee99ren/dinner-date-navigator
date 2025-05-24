import React, { useState } from 'react';
import { MapPin, X, AlertTriangle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onManualEntry: () => void;
  isLoading?: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onAllow,
  onDeny,
  onManualEntry,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Location Access</h2>
                <p className="text-blue-100 text-sm">Better restaurant recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Allow location access for better recommendations?
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We'll use your location to find nearby restaurants and provide more accurate suggestions. 
              Your location is only used for recommendations and never stored on our servers.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Benefits of sharing location:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Find restaurants within walking distance</li>
              <li>• Get accurate delivery time estimates</li>
              <li>• Discover local hidden gems</li>
              <li>• Real-time availability and wait times</li>
            </ul>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>Privacy:</strong> Your location is only used for restaurant recommendations and is not stored or shared with third parties.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onAllow}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onManualEntry}
              className="w-full"
              disabled={isLoading}
            >
              Enter Location Manually
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onDeny}
              className="w-full text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
