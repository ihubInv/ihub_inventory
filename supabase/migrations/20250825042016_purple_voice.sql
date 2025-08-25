/*
  # Fix Inventory Items RLS Policies - Remove User Table Dependencies

  1. Policy Changes
    - Drop existing policies that reference users table
    - Create simple policies using only auth.uid()
    - Remove complex subqueries that cause recursion

  2. Security
    - All authenticated users can read inventory items
    - Only authenticated users can modify inventory (simplified)
*/

-- Drop existing policies that may reference users table
DROP POLICY IF EXISTS "Admins can manage inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can read inventory items" ON inventory_items;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
  ON inventory_items FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON inventory_items FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
  ON inventory_items FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
  ON inventory_items FOR DELETE 
  TO authenticated 
  USING (true);