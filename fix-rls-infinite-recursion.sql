-- Fix for Infinite Recursion in RLS Policies
-- Run this script in your Supabase SQL Editor to fix the infinite recursion error

-- Step 1: Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.member_profiles;

-- Step 2: Create helper function to check admin status (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate policies using the security definer function
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all profiles"
  ON public.member_profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON public.member_profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Verify the policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'member_profiles')
ORDER BY tablename, policyname;
