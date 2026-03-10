-- Add background column to characters table
ALTER TABLE public.characters 
ADD COLUMN background text DEFAULT 'Folk Hero';

-- Update existing characters to have a default background
UPDATE public.characters 
SET background = 'Folk Hero' 
WHERE background IS NULL;