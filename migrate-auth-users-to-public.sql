-- Migration Script: Create user records for existing auth users
-- This script creates entries in the public.users table for all auth.users that don't have one yet
-- Run this script in Supabase SQL Editor with elevated permissions

-- Insert all auth users into public.users table if they don't already exist
INSERT INTO public.users (id, email, role)
SELECT
  au.id,
  au.email,
  'member' as role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify the migration
SELECT
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.users) as users_in_public_table,
  (SELECT COUNT(*) FROM auth.users au WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)) as still_missing
FROM auth.users;
