-- Create spell_slots table to track used spell slots per character
CREATE TABLE public.spell_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  slot_level INTEGER NOT NULL CHECK (slot_level >= 1 AND slot_level <= 9),
  slots_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(character_id, slot_level)
);

-- Enable Row Level Security
ALTER TABLE public.spell_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their character spell slots"
ON public.spell_slots
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM characters
  WHERE characters.id = spell_slots.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can create spell slots for their characters"
ON public.spell_slots
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM characters
  WHERE characters.id = spell_slots.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update their character spell slots"
ON public.spell_slots
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM characters
  WHERE characters.id = spell_slots.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete their character spell slots"
ON public.spell_slots
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM characters
  WHERE characters.id = spell_slots.character_id
  AND characters.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_spell_slots_updated_at
BEFORE UPDATE ON public.spell_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();