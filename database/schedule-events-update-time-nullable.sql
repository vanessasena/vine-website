-- Migration: Make time field nullable for special events
-- This allows special events to be created without a specific time (e.g., "To be decided")

-- Remove NOT NULL constraint from time column
ALTER TABLE public.schedule_events
ALTER COLUMN time DROP NOT NULL;

-- Add a check constraint to ensure time is required for weekly_recurring events
ALTER TABLE public.schedule_events
ADD CONSTRAINT time_required_for_weekly CHECK (
    (event_type = 'weekly_recurring' AND time IS NOT NULL) OR
    (event_type = 'special')
);
