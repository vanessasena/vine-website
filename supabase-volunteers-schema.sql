-- Volunteer Registration Table
CREATE TABLE volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  description TEXT NOT NULL,
  areas TEXT[] NOT NULL, -- Array of selected volunteer areas (stored in Portuguese)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for phone lookups
CREATE INDEX idx_volunteers_phone ON volunteers(phone);

-- Create index for created_at for sorting
CREATE INDEX idx_volunteers_created_at ON volunteers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (register as volunteer)
CREATE POLICY "Anyone can register as volunteer"
ON volunteers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Only authenticated users can view volunteers
CREATE POLICY "Authenticated users can view volunteers"
ON volunteers FOR SELECT
TO authenticated
USING (true);

-- Policy: Only authenticated users can update volunteers
CREATE POLICY "Authenticated users can update volunteers"
ON volunteers FOR UPDATE
TO authenticated
USING (true);

-- Policy: Only authenticated users can delete volunteers
CREATE POLICY "Authenticated users can delete volunteers"
ON volunteers FOR DELETE
TO authenticated
USING (true);
