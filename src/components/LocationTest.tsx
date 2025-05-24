import React, { useState, useEffect } from 'react';
import LocationService, { LocationData } from '@/services/location';
import { OpenRouterService } from '@/services/openrouter';

const LocationTest: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationService] = useState(LocationService.getInstance());
  const [openRouterService] = useState(new OpenRouterService());
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing location
    const existingLocation = locationService.getCurrentLocation();
    if (existingLocation) {
      setLocationData(existingLocation);
    }
  }, [locationService]);

  const testLocationRequest = async () => {
    setIsLoading(true);
    try {
      const location = await locationService.requestLocation();
      setLocationData(location);
      setTestResult(location ? 'Location detected successfully!' : 'Location detection failed');
    } catch (error) {
      setTestResult(`Location error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testManualLocation = () => {
    const manualLocation: LocationData = {
      latitude: 3.1390,
      longitude: 101.6869,
      address: 'Kuala Lumpur City Centre, Kuala Lumpur',
      city: 'Kuala Lumpur',
      country: 'Malaysia'
    };
    locationService.setManualLocation(manualLocation);
    setLocationData(manualLocation);
    setTestResult('Manual location set successfully!');
  };

  const testAIWithLocation = async () => {
    setIsLoading(true);
    try {
      const response = await openRouterService.generateDinnerResponse(
        'I want a nice restaurant near me for dinner tonight'
      );
      setTestResult(`AI Response (with location): ${response.substring(0, 200)}...`);
    } catch (error) {
      setTestResult(`AI test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Location Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Current Location:</h3>
          <div className="text-sm text-gray-600">
            {locationData ? (
              <>
                <p>Address: {locationData.address || 'N/A'}</p>
                <p>City: {locationData.city || 'N/A'}</p>
                <p>Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}</p>
                <p>Location String: {locationService.getLocationString()}</p>
              </>
            ) : (
              <p>No location data available</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={testLocationRequest}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test GPS Location'}
          </button>
          
          <button
            onClick={testManualLocation}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Manual Location (KL)
          </button>
          
          <button
            onClick={testAIWithLocation}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test AI with Location'}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p>{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationTest;
