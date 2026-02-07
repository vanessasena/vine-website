-- Member System Schema for Vine Church KWC
-- This schema creates tables for user roles and member profiles

-- Update or create user_role enum with new roles and align users.role column
-- Idempotent: safe to run multiple times

-- 1) Ensure the enum type exists with all required labels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    -- Create enum with all labels when type doesn't exist yet
    CREATE TYPE user_role AS ENUM ('member', 'teacher', 'leader', 'admin', 'trainee');
  END IF;
END $$;

-- 2) Add missing enum values if the type already existed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'teacher'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'teacher';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'leader'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'leader';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'trainee'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'trainee';
  END IF;
END $$;

-- 3) Ensure users.role column uses the enum type and has a sensible default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    -- If column is not of type user_role, convert it
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role' AND udt_name <> 'user_role'
    ) THEN
      -- Make sure existing NULLs are set to a valid value before altering type
      EXECUTE 'UPDATE public.users SET role = ''member'' WHERE role IS NULL';

      -- Convert column to enum and set default
      EXECUTE 'ALTER TABLE public.users\n\n        ALTER COLUMN role DROP DEFAULT,\n        ALTER COLUMN role TYPE user_role USING role::user_role,\n        ALTER COLUMN role SET DEFAULT ''member''::user_role';
    ELSE
      -- Column already enum: just ensure default exists
      EXECUTE 'ALTER TABLE public.users ALTER COLUMN role SET DEFAULT ''member''::user_role';
    END IF;
  END IF;
END $$;


-- Create users table with role information
-- This extends Supabase auth.users with our custom role data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  orders_permission BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member profiles table
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_baptized BOOLEAN DEFAULT false,
  pays_tithe BOOLEAN DEFAULT false,
  spiritual_courses TEXT[] DEFAULT '{}',
  encounter_with_god BOOLEAN DEFAULT false,
  church_role TEXT NOT NULL DEFAULT 'membro',
  volunteer_areas TEXT[] DEFAULT '{}',
  volunteer_outros_details TEXT,
  life_group TEXT,
  is_married BOOLEAN DEFAULT false,
  spouse_id UUID REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  spouse_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent1_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  parent2_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  allergies TEXT,
  medical_notes TEXT,
  special_needs TEXT,
  photo_permission BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT at_least_one_parent CHECK (parent1_id IS NOT NULL OR parent2_id IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON public.member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_children_parent1_id ON public.children(parent1_id);
CREATE INDEX IF NOT EXISTS idx_children_parent2_id ON public.children(parent2_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

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

-- Allow system to insert new user records during signup
-- This allows both direct user signup and the trigger function to create records
CREATE POLICY "Allow user creation on signup"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

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

-- RLS Policies for children table
-- Parents can read their own children
CREATE POLICY "Parents can read own children"
  ON public.children
  FOR SELECT
  USING (
    parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
  );

-- Admins can read all children
CREATE POLICY "Admins can read all children"
  ON public.children
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Parents can insert children for themselves
CREATE POLICY "Parents can create children"
  ON public.children
  FOR INSERT
  WITH CHECK (
    parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
  );

  -- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for children table
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Parents can update their own children
CREATE POLICY "Parents can update own children"
  ON public.children
  FOR UPDATE
  USING (
    parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
  );

-- Parents can delete their own children
CREATE POLICY "Parents can delete own children"
  ON public.children
  FOR DELETE
  USING (
    parent1_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
    OR parent2_id IN (SELECT id FROM public.member_profiles WHERE user_id = auth.uid())
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;

-- Admins can manage all children
CREATE POLICY "Admins can update any child"
  ON public.children
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any child"
  ON public.children
  FOR DELETE
  USING (public.is_admin(auth.uid()));




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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;

-- Add helpful comments to document the schema
COMMENT ON TABLE public.children IS 'Stores children information with support for two parents for check-in system';
COMMENT ON COLUMN public.member_profiles.volunteer_areas IS 'Array of volunteer area keys (e.g., louvor, tecnologia, recepcao, etc.)';
COMMENT ON COLUMN public.member_profiles.volunteer_outros_details IS 'Details about how the member can help when "outros" (other) volunteer area is selected';
COMMENT ON COLUMN public.member_profiles.life_group IS 'Name or identifier of the life group (célula) the member belongs to';
COMMENT ON COLUMN public.member_profiles.pays_tithe IS 'Indicates if member pays dízimo (tithe)';
COMMENT ON COLUMN public.member_profiles.is_married IS 'Indicates if member is married';
COMMENT ON COLUMN public.member_profiles.spouse_name IS 'Full name of member spouse if married';
COMMENT ON COLUMN public.children.parent1_id IS 'Primary parent member profile ID';
COMMENT ON COLUMN public.children.parent2_id IS 'Secondary parent member profile ID (optional)';
COMMENT ON COLUMN public.children.allergies IS 'Known allergies for emergency situations';
COMMENT ON COLUMN public.children.medical_notes IS 'Important medical information';
COMMENT ON COLUMN public.children.special_needs IS 'Special needs or accommodations required';
COMMENT ON COLUMN public.children.photo_permission IS 'Permission to take and use photos of the child';


-- Migration script to add new children table and update member_profiles
-- Run this script in your Supabase SQL Editor

-- Create children table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent1_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  parent2_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  allergies TEXT,
  medical_notes TEXT,
  special_needs TEXT,
  photo_permission BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT at_least_one_parent CHECK (parent1_id IS NOT NULL OR parent2_id IS NOT NULL)
);

-- Add indexes for children table
CREATE INDEX IF NOT EXISTS idx_children_parent1_id ON public.children(parent1_id);
CREATE INDEX IF NOT EXISTS idx_children_parent2_id ON public.children(parent2_id);

-- Enable RLS for children table
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for children (see main schema for details)

-- Add volunteer_outros_details column if it doesn't exist
ALTER TABLE public.member_profiles
ADD COLUMN IF NOT EXISTS volunteer_outros_details TEXT;

-- Add family information columns if they don't exist
ALTER TABLE public.member_profiles
ADD COLUMN IF NOT EXISTS is_married BOOLEAN DEFAULT false;

ALTER TABLE public.member_profiles
ADD COLUMN IF NOT EXISTS spouse_name TEXT;

-- Remove children JSONB column if it exists (migrate data first if needed)
-- ALTER TABLE public.member_profiles DROP COLUMN IF EXISTS children;



-- Migration: Add has_allergies and has_special_needs boolean flags to children table
-- This allows tracking whether parent selected "Yes" or "No" separately from the content

ALTER TABLE public.children
ADD COLUMN has_allergies BOOLEAN,
ADD COLUMN has_special_needs BOOLEAN;

-- Add index for these new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_children_has_allergies ON public.children(has_allergies);
CREATE INDEX IF NOT EXISTS idx_children_has_special_needs ON public.children(has_special_needs);

-- Update trigger to handle new columns
CREATE OR REPLACE FUNCTION public.handle_children_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_children_updated_at
    BEFORE UPDATE ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_children_updated_at();
