import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { baseQueryWithReauth } from './baseQuery';

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

export interface LocationStats {
  total: number;
  active: number;
  inactive: number;
}

export const locationApi = createApi({
  reducerPath: 'locationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Location'],
  endpoints: (builder) => ({
    // Get all locations
    getLocations: builder.query<Location[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw new Error(error.message);
        return { data: data as Location[] };
      },
      providesTags: ['Location'],
    }),

    // Get active locations only
    getActiveLocations: builder.query<Location[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('isactive', true)
          .order('name', { ascending: true });
        
        if (error) throw new Error(error.message);
        return { data: data as Location[] };
      },
      providesTags: ['Location'],
    }),

    // Get location by ID
    getLocationById: builder.query<Location, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw new Error(error.message);
        return { data: data as Location };
      },
      providesTags: ['Location'],
    }),

    // Create location
    createLocation: builder.mutation<Location, CreateLocationData>({
      queryFn: async (locationData) => {
        const { data, error } = await supabase
          .from('locations')
          .insert([{
            ...locationData,
            createdat: new Date().toISOString(),
            updatedat: new Date().toISOString()
          }])
          .select();
        
        if (error) throw new Error(error.message);
        return { data: data[0] as Location };
      },
      invalidatesTags: ['Location'],
    }),

    // Update location
    updateLocation: builder.mutation<Location, { id: string; updates: UpdateLocationData }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('locations')
          .update({
            ...updates,
            updatedat: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        
        if (error) throw new Error(error.message);
        return { data: data[0] as Location };
      },
      invalidatesTags: ['Location'],
    }),

    // Delete location
    deleteLocation: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);
        
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['Location'],
    }),

    // Toggle location status
    toggleLocationStatus: builder.mutation<Location, { id: string; currentStatus: boolean }>({
      queryFn: async ({ id, currentStatus }) => {
        const { data, error } = await supabase
          .from('locations')
          .update({
            isactive: !currentStatus,
            updatedat: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        
        if (error) throw new Error(error.message);
        return { data: data[0] as Location };
      },
      invalidatesTags: ['Location'],
    }),

    // Get location statistics
    getLocationStats: builder.query<LocationStats, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('locations')
          .select('isactive');
        
        if (error) throw new Error(error.message);
        
        const stats = data.reduce((acc, location) => {
          acc.total++;
          if (location.isactive) {
            acc.active++;
          } else {
            acc.inactive++;
          }
          return acc;
        }, { total: 0, active: 0, inactive: 0 });
        
        return { data: stats };
      },
      providesTags: ['Location'],
    }),

    // Search locations
    searchLocations: builder.query<Location[], string>({
      queryFn: async (searchTerm) => {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });
        
        if (error) throw new Error(error.message);
        return { data: data as Location[] };
      },
      providesTags: ['Location'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetActiveLocationsQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useToggleLocationStatusMutation,
  useGetLocationStatsQuery,
  useSearchLocationsQuery,
} = locationApi;
