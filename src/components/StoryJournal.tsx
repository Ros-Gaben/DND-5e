import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronDown, 
  Users, 
  MapPin, 
  Scroll, 
  Scale,
  Sparkles,
  Swords
} from "lucide-react";

interface StoryEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  importance: number;
  created_at: string;
}

interface StoryJournalProps {
  characterId: string;
}

const eventTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  npc_encounter: { icon: Users, label: "NPCs Met", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  location: { icon: MapPin, label: "Locations", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  quest_start: { icon: Scroll, label: "Quests Started", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  quest_complete: { icon: Scroll, label: "Quests Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  decision: { icon: Scale, label: "Decisions", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  discovery: { icon: Sparkles, label: "Discoveries", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  combat: { icon: Swords, label: "Battles", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  item: { icon: Sparkles, label: "Items Found", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  relationship: { icon: Users, label: "Relationships", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  plot_point: { icon: Scroll, label: "Plot Points", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
};

const StoryJournal = ({ characterId }: StoryJournalProps) => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && events.length === 0) {
      loadEvents();
    }
  }, [isOpen, characterId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('story_events')
        .select('*')
        .eq('character_id', characterId)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading story events:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const type = event.event_type || 'discovery';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<string, StoryEvent[]>);

  const totalEvents = events.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50">
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-gold" />
          <span className="font-cinzel text-sm text-gold">{t.storyJournal}</span>
          {totalEvents > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalEvents} {totalEvents === 1 ? t.entry : t.entries}
            </Badge>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : totalEvents === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              {t.noStoryEventsYet}
            </p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-3">
                {Object.entries(groupedEvents).map(([type, typeEvents]) => {
                  const config = eventTypeConfig[type] || eventTypeConfig.discovery;
                  const Icon = config.icon;
                  
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {config.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-5">
                        {typeEvents.slice(0, 5).map((event) => (
                          <Badge 
                            key={event.id} 
                            variant="outline"
                            className={`text-xs ${config.color}`}
                            title={event.description}
                          >
                            {event.title}
                          </Badge>
                        ))}
                        {typeEvents.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{typeEvents.length - 5} {t.more}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default StoryJournal;
