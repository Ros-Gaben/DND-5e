-- Add avatar_url column to characters table
ALTER TABLE public.characters 
ADD COLUMN avatar_url text;