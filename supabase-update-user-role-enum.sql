-- Update or create user_role enum with new roles and align users.role column
-- Idempotent: safe to run multiple times

-- 1) Ensure the enum type exists with all required labels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    -- Create enum with all labels when type doesn't exist yet
    CREATE TYPE user_role AS ENUM ('member', 'teacher', 'leader', 'admin');
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
