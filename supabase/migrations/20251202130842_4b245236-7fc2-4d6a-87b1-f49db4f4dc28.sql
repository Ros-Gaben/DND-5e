-- Create game_rules table for storing D&D rules by section
CREATE TABLE public.game_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rules ENABLE ROW LEVEL SECURITY;

-- Rules are readable by all authenticated users (they're game rules, not user data)
CREATE POLICY "Authenticated users can read game rules"
ON public.game_rules
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_rules_updated_at
BEFORE UPDATE ON public.game_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial rule sections (you'll populate these with your PDF content)
INSERT INTO public.game_rules (section_name, keywords, content, priority) VALUES
('core_identity', ARRAY['always'], 'You are a Dungeons & Dragons 5th Edition Dungeon Master. Guide players through immersive adventures with vivid descriptions. Be fair, creative, and maintain game balance. Always respect player agency.', 100),
('combat', ARRAY['attack', 'fight', 'hit', 'damage', 'weapon', 'sword', 'bow', 'spell attack', 'initiative', 'battle', 'enemy', 'monster', 'kill', 'defend', 'armor', 'shield'], 'Combat rules placeholder - replace with your PDF combat section content.', 50),
('spellcasting', ARRAY['spell', 'cast', 'magic', 'wizard', 'sorcerer', 'cleric', 'druid', 'warlock', 'cantrip', 'ritual', 'concentration', 'slot', 'mana'], 'Spellcasting rules placeholder - replace with your PDF spellcasting section content.', 50),
('exploration', ARRAY['explore', 'search', 'investigate', 'travel', 'rest', 'camp', 'dungeon', 'room', 'door', 'trap', 'perception', 'stealth', 'hide', 'sneak'], 'Exploration rules placeholder - replace with your PDF exploration section content.', 50),
('social', ARRAY['talk', 'persuade', 'convince', 'negotiate', 'merchant', 'shop', 'buy', 'sell', 'npc', 'innkeeper', 'tavern', 'conversation', 'intimidate', 'deception', 'insight'], 'Social encounter rules placeholder - replace with your PDF social section content.', 50),
('skill_checks', ARRAY['check', 'roll', 'ability', 'skill', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'athletics', 'acrobatics', 'dc', 'difficulty'], 'Skill check rules placeholder - replace with your PDF skill check section content.', 40);