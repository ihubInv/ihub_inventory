/*
  # Create inventory_items table

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `uniqueid` (text, unique)
      - `financialyear` (text)
      - `dateofinvoice` (date)
      - `dateofentry` (date)
      - `invoicenumber` (text)
      - `assetcategory` (text)
      - `assetname` (text)
      - `specification` (text)
      - `makemodel` (text)
      - `productserialnumber` (text)
      - `vendorname` (text)
      - `quantityperitem` (integer)
      - `rateinclusivetax` (numeric)
      - `totalcost` (numeric)
      - `locationofitem` (text)
      - `balancequantityinstock` (integer)
      - `description` (text)
      - `unitofmeasurement` (text)
      - `conditionofasset` (text)
      - `status` (text)
      - `minimumstocklevel` (integer)
      - `lastmodifiedby` (text)
      - `lastmodifieddate` (timestamp)
      - `createdat` (timestamp)

  2. Security
    - Enable RLS on `inventory_items` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uniqueid text UNIQUE NOT NULL,
  financialyear text NOT NULL,
  dateofinvoice date NOT NULL,
  dateofentry date NOT NULL,
  invoicenumber text NOT NULL,
  assetcategory text NOT NULL,
  assetname text NOT NULL,
  specification text,
  makemodel text,
  productserialnumber text,
  vendorname text,
  quantityperitem integer DEFAULT 1,
  rateinclusivetax numeric(12,2),
  totalcost numeric(12,2),
  locationofitem text,
  balancequantityinstock integer DEFAULT 0,
  description text,
  unitofmeasurement text DEFAULT 'Pieces',
  conditionofasset text DEFAULT 'excellent' CHECK (conditionofasset IN ('excellent', 'good', 'fair', 'poor')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance', 'disposed')),
  minimumstocklevel integer DEFAULT 0,
  lastmodifiedby text,
  lastmodifieddate timestamptz DEFAULT now(),
  createdat timestamptz DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read inventory items
CREATE POLICY "Users can read inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admins/managers to manage inventory items
CREATE POLICY "Admins can manage inventory items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'stock-manager')
    )
  );

-- Insert sample inventory items
INSERT INTO inventory_items (
  uniqueid, financialyear, dateofinvoice, dateofentry, invoicenumber,
  assetcategory, assetname, specification, makemodel, productserialnumber,
  vendorname, quantityperitem, rateinclusivetax, totalcost, locationofitem,
  balancequantityinstock, description, unitofmeasurement, conditionofasset,
  status, minimumstocklevel, lastmodifiedby
) VALUES
  ('IT-LAP-001', '2024-25', '2024-01-15', '2024-01-16', 'INV-2024-001',
   'Electronics', 'Dell Laptop', 'Intel i7, 16GB RAM, 512GB SSD', 'Dell Inspiron 15', 'DL123456789',
   'Dell Technologies', 1, 75000.00, 75000.00, 'IT Department',
   10, 'Laptop for development work', 'Pieces', 'excellent',
   'available', 5, 'admin'),
  ('OFF-CHR-001', '2024-25', '2024-01-10', '2024-01-11', 'INV-2024-002',
   'Furniture', 'Office Chair', 'Ergonomic, Height Adjustable', 'Herman Miller Aeron', 'HM987654321',
   'Herman Miller', 1, 25000.00, 25000.00, 'Office Floor 2',
   25, 'Ergonomic office chair', 'Pieces', 'excellent',
   'available', 10, 'admin')
ON CONFLICT (uniqueid) DO NOTHING;