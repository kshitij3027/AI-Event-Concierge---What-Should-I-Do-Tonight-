import { useState, useCallback } from 'react';
import type { UserLocation } from '../types';

interface GeolocationState {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
}

interface UseGeolocationReturn extends GeolocationState {
  detectLocation: () => Promise<UserLocation | null>;
  clearLocation: () => void;
  setManualLocation: (location: UserLocation) => void;
}

/**
 * Hook for detecting user's location via browser Geolocation API
 * and reverse geocoding to get city name
 */
export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
  });

  /**
   * Reverse geocode coordinates to get city name
   * Uses free Nominatim API from OpenStreetMap
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<Partial<UserLocation>> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        {
          headers: {
            'User-Agent': 'EventConcierge/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || address.municipality || 'Unknown',
        state: address.state || address.county,
        country: address.country,
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        city: 'Unknown',
      };
    }
  };

  /**
   * Detect user's current location using browser Geolocation API
   */
  const detectLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          
          // Reverse geocode to get city name
          const geoData = await reverseGeocode(lat, lng);
          
          const location: UserLocation = {
            lat,
            lng,
            city: geoData.city || 'Unknown',
            state: geoData.state,
            country: geoData.country,
          };

          setState({
            location,
            isLoading: false,
            error: null,
          });

          resolve(location);
        },
        (error) => {
          let errorMessage: string;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
          }

          setState({
            location: null,
            isLoading: false,
            error: errorMessage,
          });

          resolve(null);
        },
        {
          enableHighAccuracy: false, // Faster response, less accurate
          timeout: 10000, // 10 second timeout
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, []);

  /**
   * Clear the current location
   */
  const clearLocation = useCallback(() => {
    setState({
      location: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Set location manually (for city search)
   */
  const setManualLocation = useCallback((location: UserLocation) => {
    setState({
      location,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    detectLocation,
    clearLocation,
    setManualLocation,
  };
}

export default useGeolocation;

