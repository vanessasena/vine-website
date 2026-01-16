-- Kids Check-In System Schema - Step 1
-- Run this FIRST, by itself

-- Add teacher role to existing user_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'teacher' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'teacher';
  END IF;
END $$;

-- That's it for Step 1! 
-- After this completes, run supabase-checkin-schema-step2.sql
