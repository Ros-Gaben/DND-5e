-- Create inventory table for character items
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'misc',
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policies - users can only manage inventory for their own characters
CREATE POLICY "Users can view their character inventory"
ON public.inventory
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = inventory.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can add items to their character inventory"
ON public.inventory
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = inventory.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update their character inventory"
ON public.inventory
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = inventory.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their character inventory"
ON public.inventory
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = inventory.character_id
  AND characters.user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_inventory_character_id ON public.inventory(character_id);