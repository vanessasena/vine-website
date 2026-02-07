-- Migration script to populate initial schedule events
-- Run this after creating the schedule_events table

-- Weekly Recurring Events
INSERT INTO public.schedule_events (
    title_pt,
    title_en,
    description_pt,
    description_en,
    event_type,
    day_of_week,
    time,
    icon_name,
    display_order,
    is_active
) VALUES
-- Tuesday - Maturity Course and CTL
(
    'Terça-feira',
    'Tuesday',
    'Curso de Maturidade e CTL',
    'Maturity Course and CTL',
    'weekly_recurring',
    2, -- Tuesday
    '19:30',
    'faBook',
    1,
    true
),
-- Friday - Life Groups
(
    'Sexta-feira',
    'Friday',
    'Células nas casas',
    'Life Groups',
    'weekly_recurring',
    5, -- Friday
    '20:00',
    'faHome',
    2,
    true
),
-- Sunday - Celebration Service
(
    'Domingo',
    'Sunday',
    'Culto de Celebração',
    'Celebration Service',
    'weekly_recurring',
    0, -- Sunday
    '10:00',
    'faChurch',
    3,
    true
);

-- Special Events
INSERT INTO public.schedule_events (
    title_pt,
    title_en,
    description_pt,
    description_en,
    event_type,
    day_of_week,
    time,
    icon_name,
    display_order,
    special_date,
    frequency_pt,
    frequency_en,
    is_active
) VALUES
-- Monthly Family Service
(
    'Culto da Família',
    'Family Service',
    'Primeiro domingo de cada mês',
    'First Sunday of each month',
    'special',
    NULL,
    '10:00',
    'faUsers',
    1,
    NULL,
    'Primeiro domingo de cada mês',
    'First Sunday of each month',
    true
),
-- Grand Opening
(
    'Inauguração do Templo',
    'Grand Opening',
    'Celebração especial de inauguração do novo templo',
    'Special celebration for the new temple opening',
    'special',
    NULL,
    '19:00',
    'faChurch',
    2,
    '2026-01-31',
    NULL,
    NULL,
    true
);

-- Verify insertion
SELECT
    title_pt,
    title_en,
    event_type,
    day_of_week,
    time,
    icon_name,
    display_order,
    special_date,
    is_active
FROM public.schedule_events
ORDER BY event_type, day_of_week NULLS LAST, display_order;
