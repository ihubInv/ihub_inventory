import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { Category, Asset } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category', 'Asset', 'InventoryItem'],
  endpoints: (builder) => ({
    // Categories
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw new Error(error.message);
        return { data: data as Category[] };
      },
      providesTags: ['Category'],
    }),

    getCategoryById: builder.query<Category, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        return { data: data as Category };
      },
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<Category, Omit<Category, 'id' | 'createdat' | 'updatedat'>>({
      queryFn: async (newCategory) => {
        const { data, error } = await supabase.from('categories').insert([{
          ...newCategory,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        }]).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Category };
      },
      invalidatesTags: ['Category'],
    }),

      updateCategory: builder.mutation<Category, { id: string; updates: Partial<Category>; assetNameChanges?: { oldName: string; newName: string }[] }>({
        queryFn: async ({ id, updates, assetNameChanges = [] }) => {
          // If assetnames are being updated, handle dynamic updates
          if (updates.assetnames !== undefined) {
            // Get current category to compare asset names
            const { data: currentCategory, error: currentError } = await supabase
              .from('categories')
              .select('assetnames')
              .eq('id', id)
              .single();
            
            if (currentError) {
              throw new Error(`Failed to get current category: ${currentError.message}`);
            }
            
            const currentAssetNames = currentCategory.assetnames || [];
            const newAssetNames = updates.assetnames || [];
            
            // Create a map of asset name changes (old name -> new name)
            const assetNameChangesMap = new Map<string, string>();
            assetNameChanges.forEach(change => {
              assetNameChangesMap.set(change.oldName, change.newName);
            });
            
            // Find asset names that are being removed (not renamed)
            const removedAssetNames = currentAssetNames.filter((name: string) => {
              // If this name is being renamed, it's not being removed
              if (assetNameChangesMap.has(name)) {
                return false;
              }
              // If this name is not in the new list, it's being removed
              return !newAssetNames.includes(name);
            });
            
            // If any asset names are being removed, check if they're used by inventory items
            if (removedAssetNames.length > 0) {
              // Check if any inventory items are using the removed asset names
              const { data: inventoryItems, error: inventoryError } = await supabase
                .from('inventory_items')
                .select('id, assetname')
                .eq('assetcategoryid', id)
                .in('assetname', removedAssetNames);
              
              if (inventoryError) {
                throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
              }
              
              // If there are inventory items using the removed asset names, prevent removal
              if (inventoryItems && inventoryItems.length > 0) {
                const itemNames = inventoryItems.map(item => item.assetname).join(', ');
                throw new Error(
                  `Cannot remove asset names from category. The following asset names are currently being used by ${inventoryItems.length} inventory item(s): ${itemNames}. ` +
                  `Please delete or reassign these inventory items first before removing asset names from the category.`
                );
              }
            }
            
            // Handle asset name changes (renaming) using the provided changes
            if (assetNameChanges.length > 0) {
              for (const change of assetNameChanges) {
                // Update inventory items with the new asset name
                const { error: updateError } = await supabase
                  .from('inventory_items')
                  .update({ 
                    assetname: change.newName,
                    lastmodifieddate: new Date().toISOString()
                  })
                  .eq('assetcategoryid', id)
                  .eq('assetname', change.oldName);
                
                if (updateError) {
                  throw new Error(`Failed to update inventory items for asset name change: ${updateError.message}`);
                }
              }
              
              // Force refresh of inventory items by invalidating the cache
              // This ensures the inventory list updates immediately
              console.log('Asset names updated, inventory cache should refresh automatically');
            }
          }
          
          // Proceed with the category update
          const { data, error } = await supabase
            .from('categories')
            .update({ ...updates, updatedat: new Date().toISOString() })
            .eq('id', id)
            .select();
          if (error) throw new Error(error.message);
          return { data: data[0] as Category };
        },
        invalidatesTags: ['Category', 'InventoryItem'], // Also invalidate inventory items
      }),

    deleteCategory: builder.mutation<void, string>({
      queryFn: async (id) => {
        // First, check if any inventory items are using this category
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('id, assetname')
          .eq('assetcategoryid', id);
        
        if (inventoryError) {
          throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
        }
        
        // If there are inventory items using this category, prevent deletion
        if (inventoryItems && inventoryItems.length > 0) {
          const itemNames = inventoryItems.map(item => item.assetname).join(', ');
          throw new Error(
            `Cannot delete category. It is currently being used by ${inventoryItems.length} inventory item(s): ${itemNames}. ` +
            `Please delete or reassign these inventory items first before deleting the category.`
          );
        }
        
        // If no inventory items are using this category, proceed with deletion
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['Category'],
    }),

    // Assets
    getAssets: builder.query<Asset[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('assets').select('*');
        if (error) throw new Error(error.message);
        return { data: data as Asset[] };
      },
      providesTags: ['Asset'],
    }),

    getAssetById: builder.query<Asset, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        return { data: data as Asset };
      },
      providesTags: ['Asset'],
    }),

    getAssetsByCategory: builder.query<Asset[], string>({
      queryFn: async (categoryId) => {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('categoryid', categoryId);
        if (error) throw new Error(error.message);
        return { data: data as Asset[] };
      },
      providesTags: ['Asset'],
    }),

    createAsset: builder.mutation<Asset, Omit<Asset, 'id' | 'createdat' | 'updatedat'>>({
      queryFn: async (newAsset) => {
        const { data, error } = await supabase.from('assets').insert([{
          ...newAsset,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        }]).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Asset };
      },
      invalidatesTags: ['Asset'],
    }),

    updateAsset: builder.mutation<Asset, { id: string; updates: Partial<Asset> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('assets')
          .update({ ...updates, updatedat: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Asset };
      },
      invalidatesTags: ['Asset'],
    }),

    deleteAsset: builder.mutation<void, string>({
      queryFn: async (id) => {
        // First, get the asset to find its category
        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .select('categoryid')
          .eq('id', id)
          .single();
        
        if (assetError) {
          throw new Error(`Failed to get asset: ${assetError.message}`);
        }
        
        // Then check if any inventory items are using this asset's category
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('id, assetname')
          .eq('assetcategoryid', asset.categoryid);
        
        if (inventoryError) {
          throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
        }
        
        // If there are inventory items using this asset's category, prevent deletion
        if (inventoryItems && inventoryItems.length > 0) {
          const itemNames = inventoryItems.map(item => item.assetname).join(', ');
          throw new Error(
            `Cannot delete asset. The category containing this asset is currently being used by ${inventoryItems.length} inventory item(s): ${itemNames}. ` +
            `Please delete or reassign these inventory items first before deleting the asset.`
          );
        }
        
        // If no inventory items are using this asset's category, proceed with deletion
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['Asset'],
    }),

    // Check if category can be deleted (for UI validation)
    canDeleteCategory: builder.query<{ canDelete: boolean; inventoryItems: string[] }, string>({
      queryFn: async (id) => {
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('assetname')
          .eq('assetcategoryid', id);
        
        if (inventoryError) {
          throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
        }
        
        const itemNames = inventoryItems?.map(item => item.assetname) || [];
        return { 
          data: { 
            canDelete: itemNames.length === 0, 
            inventoryItems: itemNames 
          } 
        };
      },
      providesTags: ['Category'],
    }),

      // Check if specific asset names can be removed from category (for UI validation)
      canRemoveAssetNamesFromCategory: builder.query<{ canRemove: boolean; inventoryItems: string[] }, { categoryId: string; assetNames: string[] }>({
        queryFn: async ({ categoryId, assetNames }) => {
          if (!assetNames || assetNames.length === 0) {
            return { 
              data: { 
                canRemove: true, 
                inventoryItems: [] 
              } 
            };
          }
          
          const { data: inventoryItems, error: inventoryError } = await supabase
            .from('inventory_items')
            .select('assetname')
            .eq('assetcategoryid', categoryId)
            .in('assetname', assetNames);
          
          if (inventoryError) {
            throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
          }
          
          const usedAssetNames = inventoryItems?.map(item => item.assetname) || [];
          return { 
            data: { 
              canRemove: usedAssetNames.length === 0, 
              inventoryItems: usedAssetNames 
            } 
          };
        },
        providesTags: ['Category'],
      }),

    // Check if asset can be deleted (for UI validation)
    canDeleteAsset: builder.query<{ canDelete: boolean; inventoryItems: string[] }, string>({
      queryFn: async (id) => {
        // First, get the asset to find its category
        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .select('categoryid')
          .eq('id', id)
          .single();
        
        if (assetError) {
          throw new Error(`Failed to get asset: ${assetError.message}`);
        }
        
        // Then check if any inventory items are using this asset's category
        const { data: inventoryItems, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('assetname')
          .eq('assetcategoryid', asset.categoryid);
        
        if (inventoryError) {
          throw new Error(`Failed to check inventory items: ${inventoryError.message}`);
        }
        
        const itemNames = inventoryItems?.map(item => item.assetname) || [];
        return { 
          data: { 
            canDelete: itemNames.length === 0, 
            inventoryItems: itemNames 
          } 
        };
      },
      providesTags: ['Asset'],
    }),
  }),
});

export const {
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCanDeleteCategoryQuery,
  useCanRemoveAssetNamesFromCategoryQuery,
  
  // Asset hooks
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useGetAssetsByCategoryQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useCanDeleteAssetQuery,
} = categoriesApi;
