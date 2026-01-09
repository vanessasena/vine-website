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
