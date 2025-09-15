/*
  # Add Issuance Tracking Columns to inventory_items table

  1. New Columns
    - `issuedto` (text) - Name of the employee who received the item
    - `issuedby` (text) - Name of the admin/manager who issued the item
    - `issueddate` (timestamptz) - Date when the item was issued
    - `dateofissue` (timestamptz) - Alias for issueddate for compatibility
    - `expectedreturndate` (timestamptz) - Expected return date for the item

  2. Purpose
    - Track which items are issued to which employees
    - Track who issued the items (for accountability)
    - Track when items were issued
    - Track expected return dates for better management
*/

-- Add issuance tracking columns to inventory_items table
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
