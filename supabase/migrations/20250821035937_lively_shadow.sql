/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `type` (text)
      - `description` (text)
      - `isactive` (boolean, default true)
      - `createdat` (timestamp)
      - `updatedat` (timestamp)
      - `createdby` (text)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('tangible', 'intangible')),
  description text,
  isactive boolean DEFAULT true,
  createdat timestamptz DEFAULT now(),
  updatedat timestamptz DEFAULT now(),
  createdby text
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read categories
CREATE POLICY "Users can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admins to manage categories
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'stock-manager')
    )
  );

-- Insert sample categories
INSERT INTO categories (name, type, description, isactive, createdby) VALUES
  ('Computer Mouse', 'tangible', 'Computer input devices including wired and wireless mice', true, '1'),
  ('Software License', 'intangible', 'Software licenses and digital assets', true, '1'),
  ('Office Furniture', 'tangible', 'Desks, chairs, and other office furniture items', true, '1')
ON CONFLICT (name) DO NOTHING;