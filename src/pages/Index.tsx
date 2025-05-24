
import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import RestaurantSuggestions from '@/components/RestaurantSuggestions';
import BookingInterface from '@/components/BookingInterface';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import ManualLocationModal from '@/components/ManualLocationModal';
import LocationService, { LocationData } from '@/services/location';

type Screen = 'chat' | 'suggestions' | 'booking';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat');
  const [preferences, setPreferences] = useState<any>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showManualLocationModal, setShowManualLocationModal] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationService] = useState(LocationService.getInstance());

  // Check for existing location on component mount
  useEffect(() => {
    const checkExistingLocation = () => {
      const existingLocation = locationService.getCurrentLocation();
      if (existingLocation) {
        setLocationData(existingLocation);
      } else {
        // Show location permission modal if no location is available
        setTimeout(() => setShowLocationModal(true), 1000); // Small delay for better UX
      }
    };

    checkExistingLocation();
  }, [locationService]);
  const handleShowSuggestions = (extractedPreferences: any) => {
    setPreferences(extractedPreferences);
    setCurrentScreen('suggestions');
  };

  const handleBooking = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setCurrentScreen('booking');
  };

  const handleBackToChat = () => {
    setCurrentScreen('chat');
    setPreferences(null);
  };

  const handleBackToSuggestions = () => {
    setCurrentScreen('suggestions');
    setSelectedRestaurant(null);
  };

  const handleLocationPermissionAllow = async () => {
    setIsRequestingLocation(true);
    try {
      const location = await locationService.requestLocation();
      if (location) {
        setLocationData(location);
        setShowLocationModal(false);
      } else {
        // Failed to get location, show manual entry
        setShowLocationModal(false);
        setShowManualLocationModal(true);
      }
    } catch (error) {
      console.error('Location request failed:', error);
      setShowLocationModal(false);
      setShowManualLocationModal(true);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleLocationPermissionDeny = () => {
    setShowLocationModal(false);
  };

  const handleManualLocationEntry = () => {
    setShowLocationModal(false);
    setShowManualLocationModal(true);
  };

  const handleManualLocationConfirm = (location: string) => {
    // Create a basic location object from manual entry
    const manualLocationData: LocationData = {
      latitude: 0,
      longitude: 0,
      address: location,
      city: location,
      country: 'Malaysia'
    };
    setLocationData(manualLocationData);
    setShowManualLocationModal(false);
  };

  const handleManualLocationCancel = () => {
    setShowManualLocationModal(false);
  };

  const handleNavbarLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleSettingsClick = () => {
    // Future: Open settings modal
    console.log('Settings clicked');
  };  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          location={locationData ? locationService.getLocationString() : undefined}
          onLocationClick={handleNavbarLocationClick}
          onSettingsClick={handleSettingsClick}
        />
        
        {currentScreen === 'chat' && (
          <ChatInterface onRestaurantSuggestions={handleShowSuggestions} />
        )}
        
        {currentScreen === 'suggestions' && (
          <RestaurantSuggestions 
            onBack={handleBackToChat}
            preferences={preferences}
            onBooking={handleBooking}
          />
        )}
        
        {currentScreen === 'booking' && (
          <BookingInterface 
            onBack={handleBackToSuggestions}
            restaurant={selectedRestaurant}
          />
        )}

        {/* Location Permission Modal */}
        <LocationPermissionModal
          isOpen={showLocationModal}
          onAllow={handleLocationPermissionAllow}
          onDeny={handleLocationPermissionDeny}
          onManualEntry={handleManualLocationEntry}
          isLoading={isRequestingLocation}
        />

        {/* Manual Location Entry Modal */}
        <ManualLocationModal
          isOpen={showManualLocationModal}
          onConfirm={handleManualLocationConfirm}
          onCancel={handleManualLocationCancel}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
