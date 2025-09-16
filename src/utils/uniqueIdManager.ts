// Utility functions for unique ID management
import { supabase } from '../lib/supabaseClient';

export interface UniqueIdValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export interface InventoryItemWithUniqueId {
  id: string;
  uniqueid: string;
  assetname: string;
  assetcategory: string;
  locationofitem: string;
  financialyear: string;
}

/**
 * Validates if a unique ID follows the correct format
 * Format: ihub/year/category/location/serial
 */
export const validateUniqueIdFormat = (uniqueId: string): UniqueIdValidationResult => {
  try {
    const parts = uniqueId.split('/');
    
    // Check basic format
    if (parts.length !== 5) {
      return {
        isValid: false,
        error: 'Invalid format. Must have exactly 5 parts separated by "/"',
        suggestion: 'Format should be: ihub/year/category/location/serial'
      };
    }

    // Check prefix
    if (parts[0] !== 'ihub') {
      return {
        isValid: false,
        error: 'Invalid prefix. Must start with "ihub"',
        suggestion: `Should be: ihub/${parts.slice(1).join('/')}`
      };
    }

    // Check for placeholders
    const placeholders = parts.filter(part => part === '--');
    if (placeholders.length > 0) {
      return {
        isValid: false,
        error: 'Contains placeholders (--)',
        suggestion: 'Fill in all required fields to generate complete unique ID'
      };
    }

    // Check if all parts are non-empty
    const emptyParts = parts.filter(part => !part || part.trim() === '');
    if (emptyParts.length > 0) {
      return {
        isValid: false,
        error: 'Contains empty parts',
        suggestion: 'All parts must be filled'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Checks if a unique ID already exists in the database
 */
export const checkUniqueIdExists = async (uniqueId: string, excludeId?: string): Promise<boolean> => {
  try {
    // Use a more robust query approach to avoid URL encoding issues
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, uniqueid')
      .eq('uniqueid', uniqueId);

    if (error) {
      console.error('Error checking unique ID existence:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Filter out the excluded ID if provided
    const filteredData = excludeId 
      ? data?.filter(item => item.id !== excludeId)
      : data;

    return (filteredData?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking unique ID existence:', error);
    throw error;
  }
};

/**
 * Generates a unique ID for an inventory item
 */
export const generateUniqueIdForItem = async (item: {
  financialyear: string;
  assetname: string;
  assetcategory: string;
  locationofitem: string;
}): Promise<string> => {
  try {
    // Generate asset code from asset name
    const generateAssetCode = (assetName: string): string => {
      return assetName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 4)
        .padEnd(4, 'X');
    };

    // Get next serial number
    const getNextSerialNumber = async (): Promise<string> => {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('uniqueid')
        .like('uniqueid', `ihub/${item.financialyear}/${generateAssetCode(item.assetname)}/${item.locationofitem}/%`);

      if (error) throw error;

      const totalItems = items?.length || 0;
      const nextSerial = totalItems + 1;
      return nextSerial.toString().padStart(3, '0');
    };

    const assetCode = generateAssetCode(item.assetname);
    const serialNumber = await getNextSerialNumber();

    return `ihub/${item.financialyear}/${assetCode}/${item.locationofitem}/${serialNumber}`;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    throw error;
  }
};

/**
 * Validates and fixes unique IDs for existing inventory items
 */
export const validateAndFixInventoryUniqueIds = async (): Promise<{
  totalItems: number;
  invalidItems: number;
  fixedItems: number;
  errors: string[];
}> => {
  const result = {
    totalItems: 0,
    invalidItems: 0,
    fixedItems: 0,
    errors: [] as string[]
  };

  try {
    // Get all inventory items
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('id, uniqueid, assetname, assetcategory, locationofitem, financialyear');

    if (error) throw error;

    result.totalItems = items?.length || 0;

    if (!items || items.length === 0) {
      return result;
    }

    // Check each item
    for (const item of items) {
      const validation = validateUniqueIdFormat(item.uniqueid);
      
      if (!validation.isValid) {
        result.invalidItems++;
        
        try {
          // Try to generate a new unique ID
          const newUniqueId = await generateUniqueIdForItem({
            financialyear: item.financialyear,
            assetname: item.assetname,
            assetcategory: item.assetcategory,
            locationofitem: item.locationofitem
          });

          // Check if the new ID is unique
          const exists = await checkUniqueIdExists(newUniqueId, item.id);
          
          if (!exists) {
            // Update the item with the new unique ID
            const { error: updateError } = await supabase
              .from('inventory_items')
              .update({ uniqueid: newUniqueId })
              .eq('id', item.id);

            if (updateError) {
              result.errors.push(`Failed to update item "${item.assetname}": ${updateError.message}`);
            } else {
              result.fixedItems++;
              console.log(`✅ Fixed unique ID for "${item.assetname}": ${item.uniqueid} → ${newUniqueId}`);
            }
          } else {
            result.errors.push(`Generated ID "${newUniqueId}" already exists for item "${item.assetname}"`);
          }
        } catch (fixError) {
          result.errors.push(`Failed to fix item "${item.assetname}": ${fixError instanceof Error ? fixError.message : 'Unknown error'}`);
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

/**
 * Gets inventory items with invalid unique IDs
 */
export const getItemsWithInvalidUniqueIds = async (): Promise<InventoryItemWithUniqueId[]> => {
  try {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('id, uniqueid, assetname, assetcategory, locationofitem, financialyear');

    if (error) throw error;

    if (!items) return [];

    return items.filter(item => {
      const validation = validateUniqueIdFormat(item.uniqueid);
      return !validation.isValid;
    });
  } catch (error) {
    console.error('Error getting items with invalid unique IDs:', error);
    throw error;
  }
};

/**
 * Bulk update unique IDs for multiple items
 */
export const bulkUpdateUniqueIds = async (updates: Array<{
  id: string;
  newUniqueId: string;
}>): Promise<{ success: number; errors: string[] }> => {
  const result = { success: 0, errors: [] as string[] };

  try {
    for (const update of updates) {
      try {
        // Validate the new unique ID
        const validation = validateUniqueIdFormat(update.newUniqueId);
        if (!validation.isValid) {
          result.errors.push(`Invalid unique ID format for item ${update.id}: ${validation.error}`);
          continue;
        }

        // Check if the new ID already exists
        const exists = await checkUniqueIdExists(update.newUniqueId, update.id);
        if (exists) {
          result.errors.push(`Unique ID "${update.newUniqueId}" already exists for item ${update.id}`);
          continue;
        }

        // Update the item
        const { error } = await supabase
          .from('inventory_items')
          .update({ uniqueid: update.newUniqueId })
          .eq('id', update.id);

        if (error) {
          result.errors.push(`Failed to update item ${update.id}: ${error.message}`);
        } else {
          result.success++;
        }
      } catch (itemError) {
        result.errors.push(`Error processing item ${update.id}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Bulk update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};
