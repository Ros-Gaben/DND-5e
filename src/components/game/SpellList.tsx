import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, ChevronDown, ChevronUp, Flame, Shield, Zap, Heart, Wind, Eye, Clock, Target, Timer, BookOpen, Moon } from "lucide-react";
import { getSpellsByClass, SpellData } from "@/data/spells";
import { useSpellSlots } from "@/hooks/useSpellSlots";

const SpellTooltip = ({ spell }: { spell: SpellData }) => (
  <div className="max-w-xs space-y-2 p-1">
    <div className="flex items-center gap-2">
      <span className="font-semibold text-foreground">{spell.name}</span>
      <Badge variant="outline" className="text-[10px]">
        {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
      </Badge>
    </div>
    <Badge className={`text-[10px] ${getSchoolColor(spell.school)}`}>
      {getSchoolIcon(spell.school)}
      <span className="ml-1">{spell.school}</span>
    </Badge>
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{spell.castingTime}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Target className="w-3 h-3" />
        <span>{spell.range}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Timer className="w-3 h-3" />
        <span>{spell.duration}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <BookOpen className="w-3 h-3" />
        <span>{spell.components}</span>
      </div>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
      {spell.description}
    </p>
    {spell.higherLevels && (
      <p className="text-[10px] text-purple-400/80 italic line-clamp-2">
        <span className="font-medium">At Higher Levels:</span> {spell.higherLevels}
      </p>
    )}
  </div>
);

interface SpellListProps {
  characterId?: string;
  characterClass: string;
  characterLevel: number;
  onCastSpell?: (spellName: string, slotLevel?: number) => void;
}

const getSchoolIcon = (school: string) => {
  switch (school.toLowerCase()) {
    case "evocation": return <Flame className="w-3 h-3" />;
    case "abjuration": return <Shield className="w-3 h-3" />;
    case "conjuration": return <Zap className="w-3 h-3" />;
    case "enchantment": return <Heart className="w-3 h-3" />;
    case "transmutation": return <Wind className="w-3 h-3" />;
    case "illusion": return <Eye className="w-3 h-3" />;
    default: return <Sparkles className="w-3 h-3" />;
  }
};

const getSchoolColor = (school: string) => {
  switch (school.toLowerCase()) {
    case "evocation": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "abjuration": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "conjuration": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "enchantment": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    case "transmutation": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "illusion": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

// Get max spell level based on character level (simplified 5E progression)
const getMaxSpellLevel = (level: number, classType: string): number => {
  // Full casters (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard)
  const fullCasterLevels = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9];
  // Half casters (Paladin, Ranger) - get spells at level 2
  const halfCasterLevels = [0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5];
  
  const halfCasters = ["Paladin", "Ranger"];
  const levels = halfCasters.includes(classType) ? halfCasterLevels : fullCasterLevels;
  return levels[Math.min(level, 19)] || 0;
};

// Spell Slot Display Component
const SpellSlotTracker = ({ 
  spellSlots, 
  onRestoreSlots 
}: { 
  spellSlots: Record<number, { total: number; used: number }>;
  onRestoreSlots: () => void;
}) => {
  const slotLevels = Object.entries(spellSlots)
    .map(([level, data]) => ({ level: Number(level), ...data }))
    .sort((a, b) => a.level - b.level);

  if (slotLevels.length === 0) return null;

  return (
    <div className="p-3 border-b border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Spell Slots
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRestoreSlots}
              className="h-6 px-2 text-xs text-purple-400 hover:text-purple-300"
            >
              <Moon className="w-3 h-3 mr-1" />
              Rest
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Restore all spell slots (Long Rest)</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap gap-2">
        {slotLevels.map(({ level, total, used }) => (
          <div key={level} className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground w-4">{level}:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full border ${
                    i < total - used
                      ? "bg-purple-500 border-purple-400"
                      : "bg-muted border-border"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Slot Level Picker for casting spells
const SlotLevelPicker = ({
  spell,
  availableSlots,
  onSelect,
  onCancel,
}: {
  spell: SpellData;
  availableSlots: number[];
  onSelect: (level: number) => void;
  onCancel: () => void;
}) => {
  if (availableSlots.length === 0) {
    return (
      <div className="p-2 space-y-2">
        <p className="text-xs text-destructive">No available spell slots for this spell.</p>
        <Button size="sm" variant="outline" onClick={onCancel} className="w-full text-xs">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      <p className="text-xs text-muted-foreground">Choose slot level:</p>
      <div className="flex flex-wrap gap-1">
        {availableSlots.map((level) => (
          <Button
            key={level}
            size="sm"
            variant={level === spell.level ? "default" : "outline"}
            onClick={() => onSelect(level)}
            className="h-7 px-3 text-xs"
          >
            {level === spell.level ? `Level ${level}` : `Level ${level} (Upcast)`}
          </Button>
        ))}
      </div>
      <Button size="sm" variant="ghost" onClick={onCancel} className="w-full text-xs">
        Cancel
      </Button>
    </div>
  );
};

const SpellList = ({ characterId, characterClass, characterLevel, onCastSpell }: SpellListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [castingSpell, setCastingSpell] = useState<SpellData | null>(null);
  
  const { spellSlots, useSlot, restoreAllSlots, getAvailableSlotLevels, hasSlots } = useSpellSlots(
    characterId,
    characterClass,
    characterLevel
  );
  
  const availableSpells = getSpellsByClass(characterClass);
  const maxSpellLevel = getMaxSpellLevel(characterLevel, characterClass);
  
  // Filter spells by what the character can cast at their level
  const accessibleSpells = availableSpells.filter(spell => spell.level <= maxSpellLevel);
  
  // Group spells by level
  const spellsByLevel = accessibleSpells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, SpellData[]>);
  
  if (availableSpells.length === 0) {
    return null; // Non-spellcasting class
  }

  const getLevelLabel = (level: number) => {
    if (level === 0) return "Cantrips";
    return `${level}${level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th"} Level`;
  };

  const handleCastSpell = async (spell: SpellData) => {
    if (spell.level === 0) {
      // Cantrips don't use slots
      onCastSpell?.(spell.name);
      return;
    }
    
    // Show slot picker for leveled spells
    setCastingSpell(spell);
  };

  const handleSelectSlot = async (slotLevel: number) => {
    if (!castingSpell) return;
    
    const success = await useSlot(slotLevel);
    if (success) {
      onCastSpell?.(castingSpell.name, slotLevel);
      setCastingSpell(null);
      setExpandedSpell(null);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-foreground">Spells</span>
              <Badge variant="secondary" className="text-xs">
                {accessibleSpells.length}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Spell Slot Tracker */}
          {hasSlots && (
            <SpellSlotTracker 
              spellSlots={spellSlots} 
              onRestoreSlots={restoreAllSlots} 
            />
          )}
          
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-4 p-2">
              {Object.entries(spellsByLevel)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, spells]) => (
                  <div key={level} className="space-y-2">
                    <h4 className="text-xs font-semibold text-gold uppercase tracking-wide">
                      {getLevelLabel(Number(level))}
                    </h4>
                    <div className="space-y-1">
                      {spells.map((spell) => (
                        <Collapsible 
                          key={spell.name}
                          open={expandedSpell === spell.name}
                          onOpenChange={(open) => {
                            setExpandedSpell(open ? spell.name : null);
                            if (!open) setCastingSpell(null);
                          }}
                        >
                          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-2 h-auto hover:bg-muted/30 rounded-none"
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1 rounded ${getSchoolColor(spell.school)}`}>
                                        {getSchoolIcon(spell.school)}
                                      </div>
                                      <span className="text-sm font-medium text-foreground">
                                        {spell.name}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-2">
                                    <SpellTooltip spell={spell} />
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-xs text-muted-foreground">
                                  {spell.castingTime}
                                </span>
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-2 border-t border-border/30">
                                <div className="flex flex-wrap gap-1 pt-2">
                                  <Badge variant="outline" className="text-[10px]">
                                    {spell.school}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {spell.range}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {spell.duration}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {spell.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground/70">
                                  <span className="font-medium">Components:</span> {spell.components}
                                </p>
                                {spell.higherLevels && (
                                  <p className="text-[10px] text-purple-400/80 italic">
                                    <span className="font-medium">At Higher Levels:</span> {spell.higherLevels}
                                  </p>
                                )}
                                {onCastSpell && (
                                  <>
                                    {castingSpell?.name === spell.name ? (
                                      <SlotLevelPicker
                                        spell={spell}
                                        availableSlots={getAvailableSlotLevels(spell.level)}
                                        onSelect={handleSelectSlot}
                                        onCancel={() => setCastingSpell(null)}
                                      />
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleCastSpell(spell)}
                                        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs"
                                      >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Cast {spell.name}
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
};

export default SpellList;
