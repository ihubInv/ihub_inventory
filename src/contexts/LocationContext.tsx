import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, Location, CreateLocationData, UpdateLocationData } from '../services/locationService';
import { useAuth } from './AuthContext';

interface LocationContextType {
  locations: Location[];
  loading: boolean;
  error: string | null;
  addLocation: (locationData: CreateLocationData) => Promise<void>;
  updateLocation: (id: string, locationData: UpdateLocationData) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  toggleLocationStatus: (id: string, currentStatus: boolean) => Promise<void>;
  refreshLocations: () => Promise<void>;
  getLocationStats: () => Promise<{ total: number; active: number; inactive: number }>;
  searchLocations: (searchTerm: string) => Promise<Location[]>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load locations on component mount
  useEffect(() => {
    if (user) {
      refreshLocations();
    }
  }, [user]);

  const refreshLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      console.error('Error refreshing locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (locationData: CreateLocationData) => {
    try {
      setLoading(true);
      setError(null);
      const newLocation = await locationService.createLocation(locationData);
      setLocations(prev => [...prev, newLocation]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
      console.error('Error adding location:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, locationData: UpdateLocationData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedLocation = await locationService.updateLocation(id, locationData);
      setLocations(prev => 
        prev.map(location => 
          location.id === id ? updatedLocation : location
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      console.error('Error updating location:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await locationService.deleteLocation(id);
      setLocations(prev => prev.filter(location => location.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      console.error('Error deleting location:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const updatedLocation = await locationService.toggleLocationStatus(id, currentStatus);
      setLocations(prev => 
        prev.map(location => 
          location.id === id ? updatedLocation : location
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle location status');
      console.error('Error toggling location status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLocationStats = async () => {
    try {
      return await locationService.getLocationStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location stats');
      console.error('Error getting location stats:', err);
      throw err;
    }
  };

  const searchLocations = async (searchTerm: string) => {
    try {
      return await locationService.searchLocations(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search locations');
      console.error('Error searching locations:', err);
      throw err;
    }
  };

  const value: LocationContextType = {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus,
    refreshLocations,
    getLocationStats,
    searchLocations,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
