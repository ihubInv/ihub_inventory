/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `department` (text)
      - `isactive` (boolean, default true)
      - `createdat` (timestamp)
      - `lastlogin` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read all users
    - Add policy for admins to manage users
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'stock-manager', 'employee')),
  department text NOT NULL,
  isactive boolean DEFAULT true,
  createdat timestamptz DEFAULT now(),
  lastlogin timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all users
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admins to manage users
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default users
INSERT INTO users (email, name, role, department, isactive) VALUES
  ('admin@company.com', 'System Administrator', 'admin', 'IT', true),
  ('manager@company.com', 'Stock Manager', 'stock-manager', 'Operations', true),
  ('employee@company.com', 'John Doe', 'employee', 'Marketing', true)
ON CONFLICT (email) DO NOTHING;