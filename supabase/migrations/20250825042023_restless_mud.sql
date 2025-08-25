/*
  # Fix Categories Table RLS Policies - Remove User Table Dependencies

  1. Policy Changes
    - Drop existing policies that reference users table
    - Create simple policies using only auth.uid()
    - Remove complex subqueries that cause recursion

  2. Security
    - All authenticated users can read categories
    - All authenticated users can manage categories (simplified)
*/

-- Drop existing policies that may reference users table
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Users can read categories" ON categories;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
  ON categories FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON categories FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
  ON categories FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
  ON categories FOR DELETE 
  TO authenticated 
  USING (true);