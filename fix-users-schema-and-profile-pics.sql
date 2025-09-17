-- Fix users table schema and profile picture CRUD operations
-- This will add missing columns and fix RLS policies

-- Step 1: Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updatedat timestamptz DEFAULT now();

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location text;

-- Step 2: Create trigger to automatically update updatedat column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updatedat ON users;

-- Create trigger
CREATE TRIGGER update_users_updatedat
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Fix RLS policies for users table
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'stock-manager')
    )
  );

-- Allow anonymous users to insert data (for registration)
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 4: Create test users with profile pictures
INSERT INTO users (
  id, email, name, role, department, location, isactive, createdat, updatedat, profilepicture
) VALUES 
(
  '2a7f659c-ab12-48d6-ab77-03f96adee5ec',
  'test1@ihubiitmandi.in',
  'Test User 1',
  'employee',
  'IT Department',
  'Storage Room A',
  true,
  now(),
  now(),
  'https://hblwibqoyghpfibzlzja.supabase.co/storage/v1/object/public/profile-pictures/2a7f659c-ab12-48d6-ab77-03f96adee5ec/1757505113688-wicdh19iov.jpg'
),
(
  '8d83f1a9-870a-44d5-b752-a54389f8b9d5',
  'test2@ihubiitmandi.in',
  'Test User 2',
  'stock-manager',
  'Operations',
  'IT Department',
  true,
  now(),
  now(),
  'https://hblwibqoyghpfibzlzja.supabase.co/storage/v1/object/public/profile-pictures/8d83f1a9-870a-44d5-b752-a54389f8b9d5/1757502859584-uc4axs4afe.jpg'
),
(
  'bc7e5a99-2bea-49fd-b5b3-bd6553aad32e',
  'test3@ihubiitmandi.in',
  'Test User 3',
  'admin',
  'Administration',
  'Office Floor 1',
  true,
  now(),
  now(),
  'https://hblwibqoyghpfibzlzja.supabase.co/storage/v1/object/public/profile-pictures/bc7e5a99-2bea-49fd-b5b3-bd6553aad32e/1757503644150-7tgq9ug710x.jpg'
),
(
  'fb4e4c9f-8123-4a8f-af2b-286931d7da62',
  'test4@ihubiitmandi.in',
  'Test User 4',
  'employee',
  'Finance',
  'Office Floor 2',
  true,
  now(),
  now(),
  'https://hblwibqoyghpfibzlzja.supabase.co/storage/v1/object/public/profile-pictures/fb4e4c9f-8123-4a8f-af2b-286931d7da62/1758015352378-v0dzzryc8wj.png'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  location = EXCLUDED.location,
  profilepicture = EXCLUDED.profilepicture,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  bio = EXCLUDED.bio,
  updatedat = now();
