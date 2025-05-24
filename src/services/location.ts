export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  accuracy?: number;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocation(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return null;
    }

    try {
      const position = await this.getCurrentPosition();
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Try to get human-readable address
      try {
        const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        locationData.address = address.address;
        locationData.city = address.city;
        locationData.country = address.country;
      } catch (error) {
        console.warn('Could not get address from coordinates:', error);
      }

      this.currentLocation = locationData;
      this.saveLocationToStorage(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<{address: string, city: string, country: string}> {
    // Using OpenStreetMap Nominatim API for reverse geocoding (free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DinnerDateNavigator/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
    const country = data.address?.country || 'Unknown Country';

    return { address, city, country };
  }

  getCurrentLocation(): LocationData | null {
    if (!this.currentLocation) {
      this.currentLocation = this.loadLocationFromStorage();
    }
    return this.currentLocation;
  }

  getLocationString(): string {
    const location = this.getCurrentLocation();
    if (!location) return 'Location not available';

    if (location.address) {
      return location.address;
    }

    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }

    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  getDetailedLocationString(): string {
    const location = this.getCurrentLocation();
    if (!location) return 'Location not available';

    const parts = [];
    
    if (location.address) {
      parts.push(`Address: ${location.address}`);
    }
    
    if (location.city) {
      parts.push(`City: ${location.city}`);
    }
    
    if (location.country) {
      parts.push(`Country: ${location.country}`);
    }
    
    parts.push(`Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    
    if (location.accuracy) {
      parts.push(`Accuracy: ${Math.round(location.accuracy)}m`);
    }

    return parts.join(' | ');
  }

  clearLocation(): void {
    this.currentLocation = null;
    localStorage.removeItem('userLocation');
  }

  setManualLocation(locationData: LocationData): void {
    this.currentLocation = locationData;
    this.saveLocationToStorage(locationData);
  }

  private saveLocationToStorage(location: LocationData): void {
    try {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } catch (error) {
      console.warn('Could not save location to storage:', error);
    }
  }

  private loadLocationFromStorage(): LocationData | null {
    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const location = JSON.parse(stored);
        // Check if location is not too old (24 hours)
        const now = Date.now();
        const locationTime = location.timestamp || 0;
        if (now - locationTime < 24 * 60 * 60 * 1000) {
          return location;
        }
      }
    } catch (error) {
      console.warn('Could not load location from storage:', error);
    }
    return null;
  }
}

export default LocationService;
