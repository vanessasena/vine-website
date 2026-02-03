-- Kids Check-In System Schema - Step 2
-- Run this AFTER supabase-checkin-schema-step1.sql completes successfully

-- Create enum for check-in status
CREATE TYPE checkin_status AS ENUM ('checked_in', 'checked_out');

-- Create visitor_children table for non-member children
CREATE TABLE IF NOT EXISTS public.visitor_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  allergies TEXT,
  special_needs TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_permission BOOLEAN DEFAULT false,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create check_ins table to track all check-ins/check-outs
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  service_time TIME NOT NULL,

  -- Child reference (either member child or visitor child)
  member_child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  visitor_child_id UUID REFERENCES public.visitor_children(id) ON DELETE CASCADE,


  -- Check-in details
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  checked_in_by_name TEXT NOT NULL,

  -- Check-out details
  checked_out_at TIMESTAMP WITH TIME ZONE,
  checked_out_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  checked_out_by_name TEXT,

  -- Current status
  status checkin_status NOT NULL DEFAULT 'checked_in',

  -- Notes
  checkin_notes TEXT,
  checkout_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure child is either member or visitor, but not both
  CONSTRAINT check_child_type CHECK (
    (member_child_id IS NOT NULL AND visitor_child_id IS NULL) OR
    (member_child_id IS NULL AND visitor_child_id IS NOT NULL)
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_children_parent_phone ON public.visitor_children(parent_phone);
CREATE INDEX IF NOT EXISTS idx_visitor_children_name ON public.visitor_children(name);
CREATE INDEX IF NOT EXISTS idx_check_ins_service_date ON public.check_ins(service_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_status ON public.check_ins(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_member_child_id ON public.check_ins(member_child_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_visitor_child_id ON public.check_ins(visitor_child_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_service_date_status ON public.check_ins(service_date, status);

CREATE INDEX IF NOT EXISTS idx_visitor_children_visitor_id ON public.visitor_children(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_children_dob ON public.visitor_children(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_visitor_children_parent_phone ON public.visitor_children(parent_phone);

-- Enable Row Level Security
ALTER TABLE public.visitor_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_children table
-- Teachers and admins can read all visitor children
CREATE POLICY "Teachers and admins can read visitor children"
  ON public.visitor_children
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Teachers and admins can insert visitor children
CREATE POLICY "Teachers and admins can create visitor children"
  ON public.visitor_children
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Teachers and admins can update visitor children
CREATE POLICY "Teachers and admins can update visitor children"
  ON public.visitor_children
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- RLS Policies for check_ins table
-- Teachers and admins can read all check-ins
CREATE POLICY "Teachers and admins can read check-ins"
  ON public.check_ins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Teachers and admins can create check-ins
CREATE POLICY "Teachers and admins can create check-ins"
  ON public.check_ins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Teachers and admins can update check-ins (for check-out)
CREATE POLICY "Teachers and admins can update check-ins"
  ON public.check_ins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
  );

-- Parents can view check-ins for their own children
CREATE POLICY "Parents can view own children check-ins"
  ON public.check_ins
  FOR SELECT
  USING (
    member_child_id IN (
      SELECT id FROM public.children
      WHERE parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
         OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_visitor_children_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_check_ins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_visitor_children_updated_at
  BEFORE UPDATE ON public.visitor_children
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_children_updated_at();

CREATE TRIGGER set_check_ins_updated_at
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_check_ins_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.visitor_children TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.check_ins TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.visitor_children IS 'Stores information for visitor (non-member) children for check-in system';
COMMENT ON TABLE public.check_ins IS 'Tracks check-in and check-out records for both member and visitor children';
COMMENT ON COLUMN public.visitor_children.parent_name IS 'Name of the parent/guardian dropping off the child';
COMMENT ON COLUMN public.visitor_children.emergency_contact_name IS 'Emergency contact person if parent is unavailable';
COMMENT ON COLUMN public.visitor_children.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN public.check_ins.member_child_id IS 'Reference to children table for member children';
COMMENT ON COLUMN public.check_ins.visitor_child_id IS 'Reference to visitor_children table for visitor children';
COMMENT ON COLUMN public.check_ins.checked_in_by_name IS 'Name of the teacher who checked in the child';
COMMENT ON COLUMN public.check_ins.checked_out_by_name IS 'Name of the teacher who checked out the child';
COMMENT ON COLUMN public.check_ins.status IS 'Current status: checked_in or checked_out';

-- View to get current checked-in children with full details
CREATE OR REPLACE VIEW public.current_checked_in_children AS
SELECT
  ci.id as checkin_id,
  ci.service_date,
  ci.service_time,
  ci.checked_in_at,
  ci.checked_in_by_name,
  ci.status,
  ci.checkin_notes,
  -- Member child details
  c.id as child_id,
  c.name as child_name,
  c.date_of_birth,
  c.allergies,
  c.special_needs,
  c.photo_permission,
  'member' as child_type,
  mp1.name as parent1_name,
  mp1.phone as parent1_phone,
  mp2.name as parent2_name,
  mp2.phone as parent2_phone,
  NULL as emergency_contact_name,
  NULL as emergency_contact_phone
FROM public.check_ins ci
LEFT JOIN public.children c ON ci.member_child_id = c.id
LEFT JOIN public.member_profiles mp1 ON c.parent1_id = mp1.id
LEFT JOIN public.member_profiles mp2 ON c.parent2_id = mp2.id
WHERE ci.member_child_id IS NOT NULL AND ci.status = 'checked_in'

UNION ALL

SELECT
  ci.id as checkin_id,
  ci.service_date,
  ci.service_time,
  ci.checked_in_at,
  ci.checked_in_by_name,
  ci.status,
  ci.checkin_notes,
  -- Visitor child details
  vc.id as child_id,
  vc.name as child_name,
  vc.date_of_birth,
  vc.allergies,
  vc.special_needs,
  vc.photo_permission,
  'visitor' as child_type,
  vc.parent_name as parent1_name,
  vc.parent_phone as parent1_phone,
  NULL as parent2_name,
  NULL as parent2_phone,
  vc.emergency_contact_name,
  vc.emergency_contact_phone
FROM public.check_ins ci
LEFT JOIN public.visitor_children vc ON ci.visitor_child_id = vc.id
WHERE ci.visitor_child_id IS NOT NULL AND ci.status = 'checked_in';

-- Grant access to the view
GRANT SELECT ON public.current_checked_in_children TO authenticated;

-- Add RLS policy for the view
ALTER VIEW public.current_checked_in_children SET (security_invoker = true);
