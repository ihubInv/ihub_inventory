/*
  # Create requests table

  1. New Tables
    - `requests`
      - `id` (uuid, primary key)
      - `employeeid` (text)
      - `employeename` (text)
      - `itemtype` (text)
      - `quantity` (integer)
      - `purpose` (text)
      - `justification` (text)
      - `status` (text, default 'pending')
      - `submittedat` (timestamp)
      - `reviewedat` (timestamp)
      - `reviewedby` (text)
      - `reviewername` (text)
      - `remarks` (text)

  2. Security
    - Enable RLS on `requests` table
    - Add policy for employees to read their own requests
    - Add policy for admins/managers to read all requests
    - Add policy for employees to create requests
    - Add policy for admins/managers to update requests
*/

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employeeid text NOT NULL,
  employeename text NOT NULL,
  itemtype text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  purpose text NOT NULL,
  justification text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submittedat timestamptz DEFAULT now(),
  reviewedat timestamptz,
  reviewedby text,
  reviewername text,
  remarks text
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy for employees to read their own requests
CREATE POLICY "Employees can read own requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (
    employeeid = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'stock-manager')
    )
  );

-- Policy for employees to create requests
CREATE POLICY "Employees can create requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (employeeid = auth.uid()::text);

-- Policy for admins/managers to update requests
CREATE POLICY "Admins can update requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'stock-manager')
    )
  );

-- Insert sample requests
INSERT INTO requests (employeeid, employeename, itemtype, quantity, purpose, justification, status, submittedat) VALUES
  ('3', 'John Doe', 'Laptop', 1, 'Development Work', 'Need a new laptop for React development projects', 'pending', now() - interval '2 hours'),
  ('3', 'John Doe', 'Office Chair', 1, 'Workstation Setup', 'Current chair is causing back pain', 'approved', now() - interval '3 days')
ON CONFLICT DO NOTHING;