-- Member System Schema for Vine Church KWC
-- This schema creates tables for user roles and member profiles

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('member', 'admin');

-- Create users table with role information
-- This extends Supabase auth.users with our custom role data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member profiles table
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_baptized BOOLEAN DEFAULT false,
  pays_tithe BOOLEAN DEFAULT false,
  volunteer_areas TEXT[] DEFAULT '{}',
  life_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON public.member_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users table
-- Users can read their own record
CREATE POLICY "Users can read own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all user records (uses security definer function to avoid recursion)
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Users can update their own record (but not change role)
CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- RLS Policies for member_profiles table
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.member_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all profiles (uses security definer function)
CREATE POLICY "Admins can read all profiles"
  ON public.member_profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.member_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.member_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile (uses security definer function)
CREATE POLICY "Admins can update any profile"
  ON public.member_profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for member_profiles table
CREATE TRIGGER update_member_profiles_updated_at
  BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'member')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on signup
-- Note: This trigger must be created on auth.users table
-- Run this in Supabase SQL Editor with elevated permissions:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- Alternative: If you cannot create trigger on auth.users, use Supabase Dashboard
-- to create a Database Webhook or manually call the handle_new_user function

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.member_profiles TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Stores user role information extending Supabase auth.users';
COMMENT ON TABLE public.member_profiles IS 'Stores detailed member profile information';
COMMENT ON COLUMN public.member_profiles.volunteer_areas IS 'Array of volunteer area keys (e.g., louvor, tecnologia, recepcao, etc.)';
COMMENT ON COLUMN public.member_profiles.life_group IS 'Name or identifier of the life group (célula) the member belongs to';
COMMENT ON COLUMN public.member_profiles.pays_tithe IS 'Indicates if member pays dízimo (tithe)';


-- Add volunteer_outros_details column to member_profiles table
-- Run this script in your Supabase SQL Editor to add the new field

ALTER TABLE public.member_profiles
ADD COLUMN IF NOT EXISTS volunteer_outros_details TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.member_profiles.volunteer_outros_details IS 'Details about how the member can help when "outros" (other) volunteer area is selected';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'member_profiles'
AND column_name = 'volunteer_outros_details';
