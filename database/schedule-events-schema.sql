-- Schedule Events Table
-- Stores weekly recurring and special one-time events for the church schedule

CREATE TABLE IF NOT EXISTS public.schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_pt TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('weekly_recurring', 'special')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday (NULL for special events)
    time TEXT, -- Format: "19:30" or "10:00" (required for weekly events, optional for special events)
    icon_name TEXT NOT NULL, -- FontAwesome icon name: "faBook", "faChurch", etc.
    display_order INTEGER NOT NULL DEFAULT 0,
    special_date DATE, -- For special events only (format: YYYY-MM-DD, can be NULL if TBD)
    frequency_pt TEXT, -- e.g., "Primeiro domingo de cada mês"
    frequency_en TEXT, -- e.g., "First Sunday of each month"
    is_active BOOLEAN DEFAULT true, -- Toggle events on/off without deleting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT time_required_for_weekly CHECK (
        (event_type = 'weekly_recurring' AND time IS NOT NULL) OR
        (event_type = 'special')
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_type ON public.schedule_events(event_type);
CREATE INDEX IF NOT EXISTS idx_schedule_events_day ON public.schedule_events(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_events_order ON public.schedule_events(display_order);
CREATE INDEX IF NOT EXISTS idx_schedule_events_active ON public.schedule_events(is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_events_special_date ON public.schedule_events(special_date);

-- Enable Row Level Security
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active events
CREATE POLICY "Allow public read access to active events" ON public.schedule_events
    FOR SELECT USING (is_active = true);

-- Policy: Allow authenticated users to manage all events
CREATE POLICY "Allow authenticated users to manage events" ON public.schedule_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_schedule_events_updated_at
    BEFORE UPDATE ON public.schedule_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.schedule_events TO anon;
GRANT ALL ON public.schedule_events TO authenticated;
