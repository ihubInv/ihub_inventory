import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { InventoryItem } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['InventoryItem'],
  endpoints: (builder) => ({
    // Get all inventory items
    getInventoryItems: builder.query<InventoryItem[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('inventory_items').select('*');
        if (error) throw new Error(error.message);
        return { data: data as InventoryItem[] };
      },
      providesTags: ['InventoryItem'],
    }),

    // Get inventory item by ID
    getInventoryItemById: builder.query<InventoryItem, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        return { data: data as InventoryItem };
      },
      providesTags: ['InventoryItem'],
    }),

    // Create inventory item
    createInventoryItem: builder.mutation<InventoryItem, Omit<InventoryItem, 'id' | 'createdat' | 'lastmodifieddate'>>({
      queryFn: async (newItem) => {
        const { data, error } = await supabase.from('inventory_items').insert([{
          ...newItem,
          createdat: new Date().toISOString(),
          lastmodifieddate: new Date().toISOString()
        }]).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as InventoryItem };
      },
      invalidatesTags: ['InventoryItem'],
    }),

    // Update inventory item
    updateInventoryItem: builder.mutation<InventoryItem, { id: string; updates: Partial<InventoryItem> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('inventory_items')
          .update({ ...updates, lastmodifieddate: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        return { data: data[0] as InventoryItem };
      },
      invalidatesTags: ['InventoryItem'],
    }),

    // Delete inventory item
    deleteInventoryItem: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('inventory_items').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['InventoryItem'],
    }),

    // Search inventory items
    searchInventoryItems: builder.query<InventoryItem[], { searchTerm: string; categoryId?: string }>({
      queryFn: async ({ searchTerm, categoryId }) => {
        let query = supabase.from('inventory_items').select('*');
        
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,serialnumber.ilike.%${searchTerm}%`);
        }
        
        if (categoryId) {
          query = query.eq('assetcategoryid', categoryId);
        }
        
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return { data: data as InventoryItem[] };
      },
      providesTags: ['InventoryItem'],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetInventoryItemByIdQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useSearchInventoryItemsQuery,
} = inventoryApi;