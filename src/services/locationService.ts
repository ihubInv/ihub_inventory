import { supabase } from '../lib/supabaseClient';

export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  capacity?: number;
  contactperson?: string;
  contactnumber?: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  createdby: string;
}

export interface CreateLocationData {
  name: string;
  description?: string;
  address?: string;
  capacity?: number;
  contactperson?: string;
  contactnumber?: string;
  isactive?: boolean;
  createdby: string;
}

export interface UpdateLocationData {
  name?: string;
  description?: string;
  address?: string;
  capacity?: number;
  contactperson?: string;
  contactnumber?: string;
  isactive?: boolean;
}

class LocationService {
  // Get all locations
  async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLocations:', error);
      throw error;
    }
  }

  // Get active locations only
  async getActiveLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('isactive', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching active locations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveLocations:', error);
      throw error;
    }
  }

  // Get location by ID
  async getLocationById(id: string): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching location by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getLocationById:', error);
      throw error;
    }
  }

  // Create new location
  async createLocation(locationData: CreateLocationData): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createLocation:', error);
      throw error;
    }
  }

  // Update location
  async updateLocation(id: string, locationData: UpdateLocationData): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateLocation:', error);
      throw error;
    }
  }

  // Delete location
  async deleteLocation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteLocation:', error);
      throw error;
    }
  }

  // Toggle location status
  async toggleLocationStatus(id: string, currentStatus: boolean): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({ isactive: !currentStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling location status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleLocationStatus:', error);
      throw error;
    }
  }

  // Get location statistics
  async getLocationStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('isactive');

      if (error) {
        console.error('Error fetching location stats:', error);
        throw error;
      }

      const total = data?.length || 0;
      const active = data?.filter(loc => loc.isactive).length || 0;
      const inactive = total - active;

      return { total, active, inactive };
    } catch (error) {
      console.error('Error in getLocationStats:', error);
      throw error;
    }
  }

  // Search locations
  async searchLocations(searchTerm: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error searching locations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchLocations:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService();
