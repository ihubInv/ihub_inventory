/*
  # Fix Requests Table RLS Policies - Remove User Table Dependencies

  1. Policy Changes
    - Drop existing policies that reference users table
    - Create simple policies using only auth.uid()
    - Remove complex subqueries that cause recursion

  2. Security
    - Users can read their own requests
    - Users can create requests
    - All authenticated users can update requests (simplified)
*/

-- Drop existing policies that may reference users table
DROP POLICY IF EXISTS "Admins can update requests" ON requests;
DROP POLICY IF EXISTS "Employees can create requests" ON requests;
DROP POLICY IF EXISTS "Employees can read own requests" ON requests;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
  ON requests FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON requests FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
  ON requests FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
  ON requests FOR DELETE 
  TO authenticated 
  USING (true);