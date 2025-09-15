-- Add assetcategoryid column to inventory_items table
-- This migration adds the missing column that's needed for proper category linking

-- Add the assetcategoryid column
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS assetcategoryid UUID REFERENCES categories(id);

-- Add a comment to explain the column purpose
COMMENT ON COLUMN inventory_items.assetcategoryid IS 'Foreign key reference to categories table';

-- Create an index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_inventory_items_assetcategoryid 
ON inventory_items(assetcategoryid);

-- Update existing records to populate the new column
-- This will match assetcategory names to category IDs
UPDATE inventory_items 
SET assetcategoryid = c.id
FROM categories c
WHERE inventory_items.assetcategory = c.name
AND inventory_items.assetcategoryid IS NULL;

-- For any remaining records that couldn't be matched, we'll leave them NULL
-- This allows for gradual migration of data
