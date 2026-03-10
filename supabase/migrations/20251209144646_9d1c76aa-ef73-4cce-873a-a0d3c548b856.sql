-- Create story_events table for permanent plot tracking
CREATE TABLE public.story_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('plot_point', 'npc_encounter', 'decision', 'location', 'item', 'quest_start', 'quest_complete', 'combat', 'discovery', 'relationship')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  importance INTEGER NOT NULL DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_summaries table for progressive message summarization
CREATE TABLE public.conversation_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  messages_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  messages_end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  summary_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_archived flag to messages for cleanup after summarization
ALTER TABLE public.messages ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.story_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for story_events (via character ownership)
CREATE POLICY "Users can view their character story events"
ON public.story_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = story_events.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can create story events for their characters"
ON public.story_events FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = story_events.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can update their character story events"
ON public.story_events FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = story_events.character_id
  AND characters.user_id = auth.uid()
));

CREATE POLICY "Users can delete their character story events"
ON public.story_events FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.characters
  WHERE characters.id = story_events.character_id
  AND characters.user_id = auth.uid()
));

-- RLS policies for conversation_summaries (via conversation ownership)
CREATE POLICY "Users can view their conversation summaries"
ON public.conversation_summaries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = conversation_summaries.conversation_id
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can create summaries for their conversations"
ON public.conversation_summaries FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = conversation_summaries.conversation_id
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can update their conversation summaries"
ON public.conversation_summaries FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = conversation_summaries.conversation_id
  AND conversations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their conversation summaries"
ON public.conversation_summaries FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.conversations
  WHERE conversations.id = conversation_summaries.conversation_id
  AND conversations.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_story_events_character ON public.story_events(character_id);
CREATE INDEX idx_story_events_type ON public.story_events(event_type);
CREATE INDEX idx_story_events_importance ON public.story_events(importance DESC);
CREATE INDEX idx_conversation_summaries_conversation ON public.conversation_summaries(conversation_id);
CREATE INDEX idx_messages_archived ON public.messages(is_archived) WHERE is_archived = false;