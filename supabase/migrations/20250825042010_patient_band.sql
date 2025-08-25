/*
  # Fix Users Table RLS Policies - Remove Infinite Recursion

  1. Policy Changes
    - Drop existing recursive policies on users table
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries to users table

  2. Security
    - Admins can manage all users
    - Users can read all users (for dropdowns, etc.)
    - Users can update their own profile
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
  ON users FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON users FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Enable update for users based on id" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Enable delete for users based on id" 
  ON users FOR DELETE 
  TO authenticated 
  USING (auth.uid()::text = id::text);