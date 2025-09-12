-- Create assets table for simple asset name management
-- This table stores basic asset names that can be used in categories

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  isactive boolean DEFAULT true,
  createdat timestamptz DEFAULT now(),
  updatedat timestamptz DEFAULT now(),
  createdby text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON assets
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON assets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name);
CREATE INDEX IF NOT EXISTS idx_assets_isactive ON assets(isactive);
CREATE INDEX IF NOT EXISTS idx_assets_createdby ON assets(createdby);

-- Add comments
COMMENT ON TABLE assets IS 'Simple asset names that can be assigned to categories';
COMMENT ON COLUMN assets.name IS 'Unique asset name (e.g., Dell Laptop, Office Chair)';
COMMENT ON COLUMN assets.description IS 'Optional description of the asset';
COMMENT ON COLUMN assets.isactive IS 'Whether the asset is currently active/available';
COMMENT ON COLUMN assets.createdby IS 'ID of the user who created this asset';
