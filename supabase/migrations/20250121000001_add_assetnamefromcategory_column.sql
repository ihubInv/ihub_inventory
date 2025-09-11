-- Add assetnamefromcategory column to inventory_items table
-- This migration adds the missing column that's causing the database error

-- Add the assetnamefromcategory column
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS assetnamefromcategory VARCHAR(255);

-- Add a comment to explain the column purpose
COMMENT ON COLUMN inventory_items.assetnamefromcategory IS 'Asset name selected from category dropdown';

-- Create an index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_inventory_items_assetnamefromcategory 
ON inventory_items(assetnamefromcategory);

-- Update existing records to populate the new column
-- Set assetnamefromcategory to the same value as assetname for existing records
UPDATE inventory_items 
SET assetnamefromcategory = assetname 
WHERE assetnamefromcategory IS NULL OR assetnamefromcategory = '';

-- Make the column NOT NULL after populating existing data
-- First, let's ensure all records have a value
UPDATE inventory_items 
SET assetnamefromcategory = COALESCE(assetnamefromcategory, assetname, 'Unknown')
WHERE assetnamefromcategory IS NULL OR assetnamefromcategory = '';

-- Now we can make it NOT NULL if needed (uncomment if required)
-- ALTER TABLE inventory_items ALTER COLUMN assetnamefromcategory SET NOT NULL;
