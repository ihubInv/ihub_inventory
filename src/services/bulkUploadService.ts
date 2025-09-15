import { supabase } from '../lib/supabaseClient';
import { COMPANY_INFO, validateInventoryDate, getValidInventoryDate } from '../constants/companyInfo';

export interface BulkUploadResult {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export interface InventoryItemData {
  uniqueid: string;
  financialyear: string;
  dateofinvoice: string;
  dateofentry?: string;
  invoicenumber: string;
  assetcategory: string;
  assetcategoryid?: string;
  assetname: string;
  specification: string;
  makemodel: string;
  productserialnumber: string;
  vendorname: string;
  quantityperitem: number;
  rateinclusivetax: number;
  totalcost: number;
  locationofitem: string;
  issuedto?: string;
  dateofissue?: string;
  expectedreturndate?: string;
  balancequantityinstock: number;
  description: string;
  unitofmeasurement: string;
  depreciationmethod: string;
  expectedlifespan?: number;
  salvagevalue?: number;
  warrantyinformation: string;
  maintenanceschedule: string;
  conditionofasset: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'issued' | 'maintenance' | 'retired';
  minimumstocklevel: number;
}

const validateInventoryData = (data: any, rowIndex: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    'uniqueid',
    'financialyear',
    'assetcategory',
    'assetname',
    'vendorname',
    'quantityperitem',
    'rateinclusivetax',
    'locationofitem',
    'unitofmeasurement',
    'conditionofasset',
    'status'
  ];

  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  // Data type validations
  const numericFields = ['quantityperitem', 'rateinclusivetax', 'totalcost', 'balancequantityinstock', 'minimumstocklevel'];
  for (const field of numericFields) {
    if (data[field] && isNaN(Number(data[field]))) {
      errors.push(`${field} must be a valid number`);
    }
  }

  // Optional numeric fields
  const optionalNumericFields = ['expectedlifespan', 'salvagevalue'];
  for (const field of optionalNumericFields) {
    if (data[field] && data[field] !== '' && isNaN(Number(data[field]))) {
      errors.push(`${field} must be a valid number`);
    }
  }

  // Date validations
  const dateFields = ['dateofinvoice', 'dateofentry', 'dateofissue', 'expectedreturndate'];
  for (const field of dateFields) {
    if (data[field] && data[field] !== '') {
      const date = new Date(data[field]);
      if (isNaN(date.getTime())) {
        errors.push(`${field} must be a valid date (YYYY-MM-DD format)`);
      } else if (!validateInventoryDate(date)) {
        errors.push(`${field} must be on or after ${COMPANY_INFO.MIN_INVENTORY_DATE.toLocaleDateString()} (company incorporation date)`);
      }
    }
  }

  // Enum validations
  const validConditions = ['excellent', 'good', 'fair', 'poor'];
  if (data.conditionofasset && !validConditions.includes(data.conditionofasset.toLowerCase())) {
    errors.push(`conditionofasset must be one of: ${validConditions.join(', ')}`);
  }

  const validStatuses = ['available', 'issued', 'maintenance', 'retired'];
  if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  const validUnits = ['Pieces', 'Kg', 'Liters', 'Meters', 'Sets', 'Boxes'];
  if (data.unitofmeasurement && !validUnits.includes(data.unitofmeasurement)) {
    errors.push(`unitofmeasurement must be one of: ${validUnits.join(', ')}`);
  }

  const validDepreciationMethods = ['straight-line', 'declining-balance', 'sum-of-years', ''];
  if (data.depreciationmethod && !validDepreciationMethods.includes(data.depreciationmethod.toLowerCase())) {
    errors.push(`depreciationmethod must be one of: ${validDepreciationMethods.filter(m => m).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const transformDataForDatabase = (data: any): InventoryItemData => {
  return {
    uniqueid: data.uniqueid?.toString().trim() || '',
    financialyear: data.financialyear?.toString().trim() || '',
    dateofinvoice: data.dateofinvoice ? getValidInventoryDate(new Date(data.dateofinvoice)).toISOString().split('T')[0] : COMPANY_INFO.MIN_INVENTORY_DATE.toISOString().split('T')[0],
    dateofentry: data.dateofentry ? getValidInventoryDate(new Date(data.dateofentry)).toISOString() : new Date().toISOString(),
    invoicenumber: data.invoicenumber?.toString().trim() || '',
    assetcategory: data.assetcategory?.toString().trim() || '',
    assetcategoryid: data.assetcategoryid?.toString().trim() || '',
    assetname: data.assetname?.toString().trim() || '',
    specification: data.specification?.toString().trim() || '',
    makemodel: data.makemodel?.toString().trim() || '',
    productserialnumber: data.productserialnumber?.toString().trim() || '',
    vendorname: data.vendorname?.toString().trim() || '',
    quantityperitem: Number(data.quantityperitem) || 0,
    rateinclusivetax: Number(data.rateinclusivetax) || 0,
    totalcost: Number(data.totalcost) || Number(data.rateinclusivetax) || 0,
    locationofitem: data.locationofitem?.toString().trim() || '',
    issuedto: data.issuedto?.toString().trim() || '',
    dateofissue: data.dateofissue ? getValidInventoryDate(new Date(data.dateofissue)).toISOString().split('T')[0] : null,
    expectedreturndate: data.expectedreturndate ? getValidInventoryDate(new Date(data.expectedreturndate)).toISOString().split('T')[0] : null,
    balancequantityinstock: Number(data.balancequantityinstock) || Number(data.quantityperitem) || 0,
    description: data.description?.toString().trim() || '',
    unitofmeasurement: data.unitofmeasurement?.toString().trim() || 'Pieces',
    depreciationmethod: data.depreciationmethod?.toString().toLowerCase().trim() || '',
    expectedlifespan: data.expectedlifespan ? Number(data.expectedlifespan) : null,
    salvagevalue: data.salvagevalue ? Number(data.salvagevalue) : null,
    warrantyinformation: data.warrantyinformation?.toString().trim() || '',
    maintenanceschedule: data.maintenanceschedule?.toString().trim() || '',
    conditionofasset: (data.conditionofasset?.toString().toLowerCase().trim() || 'excellent') as 'excellent' | 'good' | 'fair' | 'poor',
    status: (data.status?.toString().toLowerCase().trim() || 'available') as 'available' | 'issued' | 'maintenance' | 'retired',
    minimumstocklevel: Number(data.minimumstocklevel) || 5
  };
};

export const bulkUploadInventory = async (rawData: any[]): Promise<BulkUploadResult> => {
  const result: BulkUploadResult = {
    success: false,
    message: '',
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  if (!rawData || rawData.length === 0) {
    result.message = 'No data provided for upload';
    return result;
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      result.message = 'User not authenticated';
      return result;
    }

    const validatedItems: InventoryItemData[] = [];
    
    // Validate and transform each item
    for (let i = 0; i < rawData.length; i++) {
      const rowData = rawData[i];
      const rowIndex = i + 2; // +2 because array is 0-based and we skip header row
      
      // Skip empty rows
      if (!rowData || Object.values(rowData).every(val => !val || val.toString().trim() === '')) {
        continue;
      }

      const validation = validateInventoryData(rowData, rowIndex);
      
      if (!validation.isValid) {
        result.errors.push({
          row: rowIndex,
          error: validation.errors.join(', '),
          data: rowData
        });
        result.errorCount++;
        continue;
      }

      try {
        const transformedData = transformDataForDatabase(rowData);
        
        // Check for duplicate unique IDs in the current batch
        const duplicateInBatch = validatedItems.find(item => item.uniqueid === transformedData.uniqueid);
        if (duplicateInBatch) {
          result.errors.push({
            row: rowIndex,
            error: `Duplicate unique ID in upload batch: ${transformedData.uniqueid}`,
            data: rowData
          });
          result.errorCount++;
          continue;
        }

        // Check if unique ID already exists in database
        const { data: existingItem, error: checkError } = await supabase
          .from('inventory_items')
          .select('uniqueid')
          .eq('uniqueid', transformedData.uniqueid)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found, which is what we want
          result.errors.push({
            row: rowIndex,
            error: `Database error checking unique ID: ${checkError.message}`,
            data: rowData
          });
          result.errorCount++;
          continue;
        }

        if (existingItem) {
          result.errors.push({
            row: rowIndex,
            error: `Unique ID already exists in database: ${transformedData.uniqueid}`,
            data: rowData
          });
          result.errorCount++;
          continue;
        }

        validatedItems.push(transformedData);
        
      } catch (transformError) {
        result.errors.push({
          row: rowIndex,
          error: `Data transformation error: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`,
          data: rowData
        });
        result.errorCount++;
      }
    }

    // If we have validated items, insert them in batches
    if (validatedItems.length > 0) {
      const batchSize = 100; // Supabase recommended batch size
      const batches = [];
      
      for (let i = 0; i < validatedItems.length; i += batchSize) {
        batches.push(validatedItems.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        const { error: insertError } = await supabase
          .from('inventory_items')
          .insert(batch);

        if (insertError) {
          // If batch insert fails, try individual inserts to identify specific errors
          for (let itemIndex = 0; itemIndex < batch.length; itemIndex++) {
            const item = batch[itemIndex];
            const { error: individualError } = await supabase
              .from('inventory_items')
              .insert([item]);

            if (individualError) {
              const originalRowIndex = (batchIndex * batchSize) + itemIndex + 2;
              result.errors.push({
                row: originalRowIndex,
                error: `Database insert error: ${individualError.message}`,
                data: item
              });
              result.errorCount++;
            } else {
              result.successCount++;
            }
          }
        } else {
          result.successCount += batch.length;
        }
      }
    }

    // Set final result status
    if (result.successCount > 0 && result.errorCount === 0) {
      result.success = true;
      result.message = `Successfully uploaded ${result.successCount} items`;
    } else if (result.successCount > 0 && result.errorCount > 0) {
      result.success = true;
      result.message = `Partially successful: ${result.successCount} items uploaded, ${result.errorCount} errors`;
    } else {
      result.success = false;
      result.message = `Upload failed: ${result.errorCount} errors, no items uploaded`;
    }

  } catch (error) {
    result.success = false;
    result.message = `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errorCount = rawData.length;
  }

  return result;
};

export default {
  bulkUploadInventory
};
