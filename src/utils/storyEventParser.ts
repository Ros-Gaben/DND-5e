export interface StoryEventData {
  type: string;
  title: string;
  description: string;
  importance: number;
}

const VALID_EVENT_TYPES = [
  'plot_point',
  'npc_encounter', 
  'decision',
  'location',
  'item',
  'quest_start',
  'quest_complete',
  'combat',
  'discovery',
  'relationship'
];

export const parseStoryEvents = (content: string): { text: string; events: StoryEventData[] } => {
  const events: StoryEventData[] = [];
  const regex = /\[STORY_EVENT\](.*?)\[\/STORY_EVENT\]/g;
  let text = content;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      
      // Validate event type
      const eventType = VALID_EVENT_TYPES.includes(data.type) ? data.type : 'discovery';
      
      // Validate importance (1-5)
      const importance = Math.min(5, Math.max(1, parseInt(data.importance) || 3));
      
      events.push({
        type: eventType,
        title: String(data.title || 'Untitled Event').slice(0, 100),
        description: String(data.description || '').slice(0, 500),
        importance,
      });
    } catch (e) {
      console.error('Failed to parse story event:', e);
    }
  }

  // Remove story event tags from text
  text = content.replace(regex, '').trim();
  return { text, events };
};
