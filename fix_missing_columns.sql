-- Add missing issuance tracking columns to inventory_items table
-- Run this script to fix the "Could not find the 'issuedby' column" error

-- Add the missing columns
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS issuedto text,
ADD COLUMN IF NOT EXISTS issuedby text,
ADD COLUMN IF NOT EXISTS issueddate timestamptz,
ADD COLUMN IF NOT EXISTS dateofissue timestamptz,
ADD COLUMN IF NOT EXISTS expectedreturndate timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN inventory_items.issuedto IS 'Name of the employee who received the item';
COMMENT ON COLUMN inventory_items.issuedby IS 'Name of the admin/manager who issued the item';
COMMENT ON COLUMN inventory_items.issueddate IS 'Date when the item was issued';
COMMENT ON COLUMN inventory_items.dateofissue IS 'Alias for issueddate for compatibility';
COMMENT ON COLUMN inventory_items.expectedreturndate IS 'Expected return date for the item';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_issuedto 
ON inventory_items(issuedto);

CREATE INDEX IF NOT EXISTS idx_inventory_items_issuedby 
ON inventory_items(issuedby);

CREATE INDEX IF NOT EXISTS idx_inventory_items_issueddate 
ON inventory_items(issueddate);

CREATE INDEX IF NOT EXISTS idx_inventory_items_status_issued 
ON inventory_items(status) WHERE status = 'issued';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND column_name IN ('issuedto', 'issuedby', 'issueddate', 'dateofissue', 'expectedreturndate')
ORDER BY column_name;
