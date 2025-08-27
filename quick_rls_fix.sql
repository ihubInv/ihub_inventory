-- QUICK FIX: Simple RLS Policies to Allow Inventory Operations
-- Run this immediately in your Supabase SQL Editor to fix the 403 error

-- ==========================================
-- QUICK FIX: Allow all authenticated users full access
-- ==========================================

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow authenticated users to view inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to update inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete inventory items" ON public.inventory_items;

-- Create simple, permissive policies for inventory_items
CREATE POLICY "Full access for authenticated users" ON public.inventory_items
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Do the same for other tables if they exist
-- Requests table
DROP POLICY IF EXISTS "Allow authenticated users to view requests" ON public.requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert requests" ON public.requests;
DROP POLICY IF EXISTS "Allow authenticated users to update requests" ON public.requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete requests" ON public.requests;

CREATE POLICY "Full access for authenticated users" ON public.requests
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Users table
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON public.users;

CREATE POLICY "Full access for authenticated users" ON public.users
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Categories table
DROP POLICY IF EXISTS "Allow authenticated users to view categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON public.categories;

CREATE POLICY "Full access for authenticated users" ON public.categories
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('inventory_items', 'requests', 'users', 'categories')
ORDER BY tablename;
