import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { sendChatMessage, ChatMessage, CharacterContext } from "@/services/chatService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Sword, Heart, User, Shield, Swords, Dices } from "lucide-react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import InventoryPanel from "@/components/game/InventoryPanel";
import ActionPanel from "@/components/game/ActionPanel";
import StatBlock from "@/components/game/StatBlock";
import ItemOffer from "@/components/game/ItemOffer";
import XPProgress from "@/components/game/XPProgress";
import ASIDialog from "@/components/game/ASIDialog";
import DMCombatTracker, { Combatant } from "@/components/game/DMCombatTracker";
import ContextDiceRoller from "@/components/game/ContextDiceRoller";
import ShortRestPanel from "@/components/game/ShortRestPanel";
import DeathSaves from "@/components/game/DeathSaves";
import SpellList from "@/components/game/SpellList";
import { parseXPAwards, checkLevelUp, calculateLevelUp, isASILevel, getProficiencyBonus } from "@/data/leveling-system";
import { getClassByName } from "@/data/dnd-classes";
import { useInventory } from "@/hooks/useInventory";
import EquipmentSlots from "@/components/game/EquipmentSlots";
import { calculateAC } from "@/data/armor";
import { parseCombatCommands, processCombatCommand, CombatState } from "@/utils/combatCommands";
import { parseRollRequests, ParsedRollRequest } from "@/utils/rollRequestParser";
import { parseStoryEvents } from "@/utils/storyEventParser";

// Parse item offers from DM messages
interface ParsedItemOffer {
  name: string;
  type: string;
  description: string;
}
const parseItemOffers = (content: string): {
  text: string;
  offers: ParsedItemOffer[];
} => {
  const offers: ParsedItemOffer[] = [];
  const regex = /\[ITEM_OFFER\](.*?)\[\/ITEM_OFFER\]/g;
  let text = content;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const offerData = JSON.parse(match[1]);
      offers.push({
        name: offerData.name,
        type: offerData.type,
        description: offerData.description || ''
      });
    } catch (e) {
      console.error('Failed to parse item offer:', e);
    }
  }

  // Remove the item offer tags from the text
  text = content.replace(regex, '').trim();
  return {
    text,
    offers
  };
};

// Generate background-specific story intro
const generateBackgroundIntro = (name: string, background: string | null, charClass: string, race: string): string => {
  const intros: Record<string, string> = {
    Acolyte: `Welcome, ${name}. The incense smoke curls upward in the ancient temple as dawn's first light filters through stained glass windows. You have spent years in faithful service here, but this morning feels different. The high priest summoned you before the first prayers, his face grave with concern. Something stirs in the world beyond these sacred walls — something that may require a ${race} ${charClass} of unwavering faith. What do you do?`,
    
    Criminal: `Welcome, ${name}. The cramped safehouse reeks of cheap ale and secrecy. Through the grimy window, you watch the city guard patrol pass by, oblivious to your presence. Your fence mentioned a job last night — something big, something that could set you up for life or get you killed. The note on the table bears only an address and a time: midnight tonight. The shadows have always been your home, ${race} ${charClass}. What do you do?`,
    
    "Folk Hero": `Welcome, ${name}. The village square bustles with morning activity as farmers bring their wares to market. Children run past, pointing at you with excited whispers — the hero who saved them from the bandits last harvest. But today, a messenger arrived at dawn, bearing troubling news from a neighboring village. They need a ${race} ${charClass} of the people. The common folk look to you with hope in their eyes. What do you do?`,
    
    Noble: `Welcome, ${name}. The great hall of your family estate gleams with polished marble and ancestral portraits. Servants move silently, preparing for the day. A letter arrived this morning bearing the royal seal — your presence is requested at court for a matter of "utmost importance." As a ${race} ${charClass} of noble blood, doors open that remain closed to others. Your signet ring feels heavy on your finger. What do you do?`,
    
    Sage: `Welcome, ${name}. Towers of ancient tomes surround you in the great library, their leather spines cracked with age. The candle has burned low during your night of research, but you've finally found it — a reference to the artifact you've been seeking for months. The text is fragmentary, but it points to ruins in the wilderness beyond the city. As a ${race} ${charClass} devoted to knowledge, you know some truths must be sought in dangerous places. What do you do?`,
    
    Soldier: `Welcome, ${name}. The military encampment stirs with the sounds of morning drills and clashing steel. You've served with distinction, earned your rank, and the soldiers here know your name. But war is coming — scouts report enemy movement along the border. The commander has called a meeting of all officers, and the weight of your insignia reminds you of the responsibility you bear. As a ${race} ${charClass} forged in battle, you know what's at stake. What do you do?`,
    
    Outlander: `Welcome, ${name}. The forest awakens around you as sunlight breaks through the canopy. Your campfire has burned to embers, and the wilderness stretches endlessly in every direction. You left civilization behind long ago, but the strange tracks you discovered yesterday lead toward the mountains — tracks unlike any beast you've encountered. As a ${race} ${charClass} who knows the wild places, your instincts tell you something unnatural has entered your territory. What do you do?`,
    
    Entertainer: `Welcome, ${name}. The tavern stage still bears the echo of last night's applause. You performed brilliantly, as always, and the coin purse at your belt proves it. But among the admirers who lingered after the show, one stood out — a mysterious figure who left behind only a golden invitation to perform at a distant lord's masquerade. The road beckons, and a ${race} ${charClass} born for the spotlight never refuses an audience. What do you do?`
  };

  return intros[background || 'Folk Hero'] || `Welcome, ${name}! You find yourself at a crossroads in your journey as a ${race} ${charClass}. The path ahead is uncertain, but adventure awaits. What do you do?`;
};

const messageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message must be less than 2000 characters")
});
const Game = () => {
  const {
    characterId
  } = useParams();
  const {
    user
  } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [character, setCharacter] = useState<CharacterContext | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [pendingASI, setPendingASI] = useState<{ level: number; xp: number; levelUpResult: any } | null>(null);
  const [showCombatTracker, setShowCombatTracker] = useState(false);
  const [sidebarAlignBottom, setSidebarAlignBottom] = useState(() => {
    const saved = localStorage.getItem('sidebarAlignBottom');
    return saved !== null ? saved === 'true' : true;
  });
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  // Roll request queue - stores all pending roll requests from AI
  const [rollRequestQueue, setRollRequestQueue] = useState<ParsedRollRequest[]>([]);
  // Current pending roll is the first item in the queue
  const pendingRollRequest = rollRequestQueue.length > 0 ? rollRequestQueue[0] : null;
  // Track if the current roll has been completed (to prevent premature clearing)
  const [rollCompleted, setRollCompleted] = useState(false);
  // Stores the most recent dice-roller-generated roll message so it can be sent even if
  // pendingRollRequest is cleared accidentally (e.g., UI race), while still blocking manual fakes.
  const [allowedRollMessage, setAllowedRollMessage] = useState<string | null>(null);
  // DM Mode - allows manual rolls without AI permission (opt-in)
  const [dmModeEnabled] = useState(() => {
    const saved = localStorage.getItem('dmModeEnabled');
    return saved === 'true';
  });
  
  // Combat state - controlled by DM/AI
  const [combatState, setCombatState] = useState<CombatState>({
    combatants: [],
    currentTurn: -1,
    round: 1,
    isInCombat: false,
  });

  // Get equipped weapons for dice roller
  const equippedWeapons = inventory
    .filter(item => item.item_type === "weapon" && item.equipped)
    .map(item => item.item_name);

  // Check if player is at 0 HP for death saves
  const isAtZeroHP = character ? character.hit_points <= 0 : false;
  
  // Handle player HP changes from combat tracker AND sync with combat state
  const handlePlayerHPChange = useCallback(async (newHP: number) => {
    if (!characterId || !character) return;
    
    // Clamp HP between 0 and max
    const clampedHP = Math.max(0, Math.min(newHP, character.max_hit_points));
    
    const { error } = await supabase
      .from('characters')
      .update({ hit_points: clampedHP })
      .eq('id', characterId);
    
    if (error) {
      console.error('Error updating HP:', error);
      return;
    }
    
    // Update character state
    setCharacter(prev => prev ? { ...prev, hit_points: clampedHP } : null);
    
    // Also sync with combat tracker if player is in combat
    setCombatState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => 
        c.isPlayer ? { ...c, currentHP: clampedHP } : c
      )
    }));
  }, [characterId, character]);
  
  // Callback for combat commands to sync player HP
  const handleCombatHPSync = useCallback((newHP: number) => {
    handlePlayerHPChange(newHP);
  }, [handlePlayerHPChange]);
  
  // Clear roll from queue when completed
  const completeCurrentRoll = useCallback(() => {
    setRollRequestQueue(prev => prev.slice(1));
    setRollCompleted(true);
  }, []);

  const loadInventory = useCallback(async () => {
    if (!characterId) return;
    try {
      const {
        data,
        error
      } = await supabase.from("inventory").select("*").eq("character_id", characterId).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  }, [characterId]);

  // Inventory management hook
  const { useItem } = useInventory(characterId, loadInventory);

  // Handle XP awards and level ups
  const handleXPAward = useCallback(async (xpAmount: number, reason?: string) => {
    if (!character || !characterId) return;

    const newXP = character.experience + xpAmount;
    const newLevel = checkLevelUp(newXP, character.level);

    if (newLevel) {
      // Character leveled up!
      const classData = getClassByName(character.class);
      const hitDie = classData?.hitDie || 8;
      const conModifier = Math.floor((character.constitution - 10) / 2);
      
      const levelUpResult = calculateLevelUp(
        character.level,
        newLevel,
        character.max_hit_points,
        hitDie,
        conModifier
      );

      // Check if this level grants ASI
      if (isASILevel(newLevel)) {
        // Store pending ASI and update basic stats first
        const { error } = await supabase
          .from('characters')
          .update({
            experience: newXP,
            level: newLevel,
            max_hit_points: levelUpResult.newMaxHP,
            hit_points: levelUpResult.newMaxHP,
          })
          .eq('id', characterId);

        if (error) {
          console.error('Error updating character level:', error);
          return;
        }

        // Update local state
        setCharacter(prev => prev ? {
          ...prev,
          experience: newXP,
          level: newLevel,
          max_hit_points: levelUpResult.newMaxHP,
          hit_points: levelUpResult.newMaxHP,
        } : null);

        // Show level up toast and trigger ASI dialog
        toast({
          title: `🎉 Level Up! Level ${newLevel}!`,
          description: `You gained ${levelUpResult.hpGained} HP! Choose your Ability Score Improvement!`,
          duration: 5000,
        });

        // Open ASI dialog
        setPendingASI({ level: newLevel, xp: newXP, levelUpResult });
      } else {
        // Normal level up without ASI
        const { error } = await supabase
          .from('characters')
          .update({
            experience: newXP,
            level: newLevel,
            max_hit_points: levelUpResult.newMaxHP,
            hit_points: levelUpResult.newMaxHP,
          })
          .eq('id', characterId);

        if (error) {
          console.error('Error updating character level:', error);
          return;
        }

        setCharacter(prev => prev ? {
          ...prev,
          experience: newXP,
          level: newLevel,
          max_hit_points: levelUpResult.newMaxHP,
          hit_points: levelUpResult.newMaxHP,
        } : null);

        toast({
          title: `🎉 Level Up! Level ${newLevel}!`,
          description: `You gained ${levelUpResult.hpGained} HP! Max HP is now ${levelUpResult.newMaxHP}.${
            levelUpResult.newProficiencyBonus > levelUpResult.oldProficiencyBonus 
              ? ` Proficiency bonus increased to +${levelUpResult.newProficiencyBonus}!` 
              : ''
          }`,
          duration: 8000,
        });
      }
    } else {
      // Just XP gain, no level up
      const { error } = await supabase
        .from('characters')
        .update({ experience: newXP })
        .eq('id', characterId);

      if (error) {
        console.error('Error updating character XP:', error);
        return;
      }

      setCharacter(prev => prev ? { ...prev, experience: newXP } : null);

      toast({
        title: `+${xpAmount} XP`,
        description: reason || "Experience gained!",
        duration: 3000,
      });
    }
  }, [character, characterId, toast]);

  // Handle ASI confirmation
  const handleASIConfirm = async (increases: Partial<{
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>) => {
    if (!characterId || !character) return;

    // Build update object with new ability scores
    const updateData: any = { ...increases };

    // If constitution increased, recalculate HP
    if (increases.constitution && increases.constitution > character.constitution) {
      const oldConMod = Math.floor((character.constitution - 10) / 2);
      const newConMod = Math.floor((increases.constitution - 10) / 2);
      const conModIncrease = newConMod - oldConMod;
      
      // Add HP equal to level * con mod increase (retroactive rule)
      const hpBonus = character.level * conModIncrease;
      updateData.max_hit_points = character.max_hit_points + hpBonus;
      updateData.hit_points = character.hit_points + hpBonus;
    }

    const { error } = await supabase
      .from('characters')
      .update(updateData)
      .eq('id', characterId);

    if (error) {
      console.error('Error applying ASI:', error);
      toast({
        title: "Error",
        description: "Failed to apply ability score improvements",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setCharacter(prev => prev ? { ...prev, ...updateData } : null);

    toast({
      title: "Ability Scores Improved!",
      description: Object.entries(increases)
        .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
        .join(", "),
      duration: 5000,
    });

    setPendingASI(null);
  };
  useEffect(() => {
    if (!user || !characterId) {
      navigate('/');
      return;
    }
    loadCharacterAndConversation();
    loadInventory();
  }, [user, characterId, navigate, loadInventory]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const loadCharacterAndConversation = async () => {
    try {
      // Load character
      const {
        data: charData,
        error: charError
      } = await supabase.from('characters').select('*').eq('id', characterId).single();
      if (charError) throw charError;
      setCharacter({
        name: charData.name,
        race: charData.race,
        class: charData.class,
        background: charData.background,
        level: charData.level,
        strength: charData.strength,
        dexterity: charData.dexterity,
        constitution: charData.constitution,
        intelligence: charData.intelligence,
        wisdom: charData.wisdom,
        charisma: charData.charisma,
        hit_points: charData.hit_points,
        max_hit_points: charData.max_hit_points,
        experience: charData.experience,
        avatar_url: charData.avatar_url
      });

      // Load or create conversation
      const {
        data: convData,
        error: convError
      } = await supabase.from('conversations').select('*').eq('character_id', characterId).maybeSingle();
      if (convError && convError.code !== 'PGRST116') throw convError;
      if (convData) {
        setConversationId(convData.id);
        await loadMessages(convData.id);
      } else {
        // Create new conversation
        const {
          data: newConv,
          error: newConvError
        } = await supabase.from('conversations').insert({
          user_id: user!.id,
          character_id: characterId,
          title: `${charData.name}'s Adventure`
        }).select().single();
        if (newConvError) throw newConvError;
        setConversationId(newConv.id);

        // Generate background-specific initial message
        const initialMessage = generateBackgroundIntro(charData.name, charData.background, charData.class, charData.race);
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          role: 'assistant',
          content: initialMessage
        });
        setMessages([{
          role: 'assistant',
          content: initialMessage
        }]);
      }
    } catch (error) {
      console.error('Error loading character/conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load game data",
        variant: "destructive"
      });
      navigate('/characters');
    } finally {
      setLoadingCharacter(false);
    }
  };
  const loadMessages = async (convId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      setMessages(data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  // Check if a message looks like a manual dice roll result (trying to bypass DM control)
  // Death saves are allowed at 0 HP without DM permission
  const isManualRollMessage = useCallback((message: string): boolean => {
    // Death saves are always allowed at 0 HP
    if (isAtZeroHP && /\*\*Death Save\*\*/i.test(message)) {
      return false;
    }
    
    const rollPatterns = [
      /\*\*(?:Attack Roll|Damage Roll|Spell Attack|Spell Damage|Initiative|Saving Throw|Skill Check|Hit Dice|Concentration).*?\*\*/i,
      /\*\*(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Save\*\*/i,
      /\*\*(?:Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival)\s+Check\*\*/i,
      // Non-bold manual fakes like: "Wisdom Save: 15 (12+3)"
      /(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Save\s*:\s*\d+\s*\(\s*\d+(?:\s*[+\-]\s*\d+)?\s*\)/i,
      /(?:Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival)\s+Check\s*:\s*\d+\s*\(\s*\d+(?:\s*[+\-]\s*\d+)?\s*\)/i,
      /^\s*\d+\s*\(\s*\d+(?:\s*[+\-]\s*\d+)?\s*\)\s*$/i, // Matches "15 (12+3)" format
    ];
    return rollPatterns.some(pattern => pattern.test(message));
  }, [isAtZeroHP]);

  const handleSendMessage = async () => {
    if (!character || !conversationId || isLoading) return;
    try {
      const validated = messageSchema.parse({
        content: input
      });
      const userMessage = validated.content;
      
      // Block manual roll result messages when no roll is pending.
      // Allow sending if this exact message was generated by the dice roller.
      const isDiceRollerResult =
        !!allowedRollMessage && userMessage.trim() === allowedRollMessage.trim();

      if (!pendingRollRequest && isManualRollMessage(userMessage) && !isDiceRollerResult) {
        toast({
          title: "Roll not allowed",
          description: "Wait for the DM to request a dice roll before submitting roll results.",
          variant: "destructive",
        });
        return;
      }

      // Consume the allowance / pending request only when the roll result is being sent (not before)
      if (isDiceRollerResult) {
        setAllowedRollMessage(null);
        // Complete the current roll in queue
        completeCurrentRoll();
      }

      
      setInput("");
      setIsLoading(true);

      // Add user message to UI and database
      const newUserMsg: ChatMessage = {
        role: 'user',
        content: userMessage
      };
      setMessages(prev => [...prev, newUserMsg]);
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage
      });

      // Send to ChatGPT with inventory context
      // Keep only last 10 messages as full text to manage context window
      const allMessages = [...messages, newUserMsg];
      const recentMessages = allMessages.slice(-10);
      
      const characterWithInventory = {
        ...character,
        inventory: inventory.map(item => ({
          item_name: item.item_name,
          item_type: item.item_type,
          quantity: item.quantity,
          equipped: item.equipped
        }))
      };
      const response = await sendChatMessage(recentMessages, characterWithInventory, conversationId || undefined);

      // Parse XP awards from response
      const { awards: xpAwards } = parseXPAwards(response);
      
      // Process XP awards
      for (const award of xpAwards) {
        await handleXPAward(award.amount, award.reason);
      }

      // Parse and process combat commands from response
      const { commands: combatCommands, text: combatParsedText } = parseCombatCommands(response);
      if (combatCommands.length > 0) {
        let newCombatState = combatState;
        const playerData = {
          name: character.name,
          hp: character.hit_points,
          maxHP: character.max_hit_points,
          ac: calculateAC(inventory, character.dexterity, character.class, character.wisdom, character.constitution).total,
        };
        
        for (const cmd of combatCommands) {
          newCombatState = processCombatCommand(cmd, newCombatState, playerData, handleCombatHPSync);
        }
        setCombatState(newCombatState);
      }

      // Parse roll requests from response - add ALL to queue (not just last)
      const { requests: rollRequests } = parseRollRequests(response);
      if (rollRequests.length > 0) {
        // Replace queue with new requests from AI (they take precedence)
        setRollRequestQueue(rollRequests);
        setRollCompleted(false);
      }
      // Note: Don't clear queue if no new requests - let player complete pending rolls

      // Parse and save story events
      const { events: storyEvents } = parseStoryEvents(response);
      if (storyEvents.length > 0 && characterId && conversationId) {
        for (const event of storyEvents) {
          try {
            await supabase.from('story_events').insert({
              character_id: characterId,
              conversation_id: conversationId,
              event_type: event.type,
              title: event.title,
              description: event.description,
              importance: event.importance,
            });
          } catch (e) {
            console.error('Failed to save story event:', e);
          }
        }
      }

      // Add assistant response
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMsg]);
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message
        });
      } else {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Direct send function for dice roller - bypasses manual roll validation
  const handleDirectSendRoll = useCallback(async (message: string) => {
    if (!character || !conversationId || isLoading) return;
    
    try {
      setInput("");
      setAllowedRollMessage(null);
      // Complete current roll when sending via direct send
      completeCurrentRoll();
      setIsLoading(true);

      // Add user message to UI and database
      const newUserMsg: ChatMessage = {
        role: 'user',
        content: message
      };
      setMessages(prev => [...prev, newUserMsg]);
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

      // Send to ChatGPT with inventory context
      const allMessages = [...messages, newUserMsg];
      const recentMessages = allMessages.slice(-10);
      
      const characterWithInventory = {
        ...character,
        inventory: inventory.map(item => ({
          item_name: item.item_name,
          item_type: item.item_type,
          quantity: item.quantity,
          equipped: item.equipped
        }))
      };
      const response = await sendChatMessage(recentMessages, characterWithInventory, conversationId || undefined);

      // Parse XP awards from response
      const { awards: xpAwards } = parseXPAwards(response);
      for (const award of xpAwards) {
        await handleXPAward(award.amount, award.reason);
      }

      // Parse and process combat commands from response
      const { commands: combatCommands } = parseCombatCommands(response);
      if (combatCommands.length > 0) {
        let newCombatState = combatState;
        const playerData = {
          name: character.name,
          hp: character.hit_points,
          maxHP: character.max_hit_points,
          ac: calculateAC(inventory, character.dexterity, character.class, character.wisdom, character.constitution).total,
        };
        
        for (const cmd of combatCommands) {
          newCombatState = processCombatCommand(cmd, newCombatState, playerData, handleCombatHPSync);
        }
        setCombatState(newCombatState);
      }

      // Parse roll requests from response - add ALL to queue
      const { requests: rollRequests } = parseRollRequests(response);
      if (rollRequests.length > 0) {
        setRollRequestQueue(rollRequests);
        setRollCompleted(false);
      }

      // Parse and save story events
      const { events: storyEvents } = parseStoryEvents(response);
      if (storyEvents.length > 0 && characterId && conversationId) {
        for (const event of storyEvents) {
          try {
            await supabase.from('story_events').insert({
              character_id: characterId,
              conversation_id: conversationId,
              event_type: event.type,
              title: event.title,
              description: event.description,
              importance: event.importance,
            });
          } catch (e) {
            console.error('Failed to save story event:', e);
          }
        }
      }

      // Add assistant response
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMsg]);
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response
      });
    } catch (error) {
      console.error('Error sending roll message:', error);
      toast({
        title: "Error",
        description: "Failed to send roll result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [character, conversationId, isLoading, messages, inventory, combatState, handleXPAward]);
  if (loadingCharacter) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-cinzel">Loading your adventure...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background bg-tavern bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-background/95 backdrop-blur-sm flex flex-col">
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-7xl">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={() => navigate('/characters')} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-background">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
            
            {/* Mobile Character Sheet Trigger */}
            {character && <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className={`md:hidden border-gold/50 ${showDiceRoller ? 'bg-gold/20 text-gold' : 'text-gold hover:bg-gold hover:text-background'}`}
                  onClick={() => { setShowDiceRoller(!showDiceRoller); setShowCombatTracker(false); }}
                >
                  <Dices className="w-4 h-4 mr-2" />
                  {language === 'pl' ? 'Kości' : 'Dice'}
                </Button>
                <Button 
                  variant="outline" 
                  className={`md:hidden border-gold/50 ${showCombatTracker ? 'bg-gold/20 text-gold' : 'text-gold hover:bg-gold hover:text-background'}`}
                  onClick={() => { setShowCombatTracker(!showCombatTracker); setShowDiceRoller(false); }}
                >
                  <Swords className="w-4 h-4 mr-2" />
                  {t.combat}
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden border-gold text-gold hover:bg-gold hover:text-background">
                    <User className="w-4 h-4 mr-2" />
                    {language === 'pl' ? 'Postać' : 'Character'}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur border-border overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-gold font-cinzel">{language === 'pl' ? 'Postać' : 'Character'}</SheetTitle>
                  </SheetHeader>
                  <div className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                      <Avatar className="w-32 h-32 border-4 border-gold">
                        <AvatarImage src={character.avatar_url || ""} alt={character.name} />
                        <AvatarFallback className="bg-gradient-gold text-4xl font-cinzel">
                          {character.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-cinzel font-bold text-gold mt-4">{character.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {t.level} {character.level} {character.race} {character.class}
                      </p>
                    </div>

                    {/* HP */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-foreground">{t.health}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {character.hit_points} / {character.max_hit_points}
                        </span>
                      </div>
                      <Progress value={character.hit_points / character.max_hit_points * 100} className="h-2" />
                    </div>

                    {/* XP */}
                    <XPProgress experience={character.experience} level={character.level} />

                    {/* Proficiency Bonus */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gold" />
                        <span className="font-semibold text-foreground">{t.proficiency}</span>
                      </div>
                      <span className="text-lg font-bold text-gold">+{getProficiencyBonus(character.level)}</span>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <Sword className="w-4 h-4 text-gold" />
                        <span className="font-semibold text-foreground">{t.stats}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <StatBlock label="STR" value={character.strength} />
                        <StatBlock label="DEX" value={character.dexterity} />
                        <StatBlock label="CON" value={character.constitution} />
                        <StatBlock label="INT" value={character.intelligence} />
                        <StatBlock label="WIS" value={character.wisdom} />
                        <StatBlock label="CHA" value={character.charisma} />
                      </div>
                    </div>

                    {/* Equipment & AC */}
                    <EquipmentSlots
                      inventory={inventory}
                      dexterity={character.dexterity}
                      characterClass={character.class}
                      wisdom={character.wisdom}
                      constitution={character.constitution}
                      onInventoryChange={loadInventory}
                    />

                    {/* Inventory */}
                    <InventoryPanel items={inventory} />

                    {/* Spell List - Only shows for spellcasting classes */}
                    <SpellList
                      characterId={characterId}
                      characterClass={character.class}
                      characterLevel={character.level}
                      onCastSpell={(spellName, slotLevel) => {
                        const slotInfo = slotLevel ? ` using a level ${slotLevel} slot` : "";
                        setInput(prev => prev + (prev ? " " : "") + `I cast ${spellName}${slotInfo}`);
                        setSheetOpen(false);
                      }}
                    />

                    {/* Death Saves - Shows when at 0 HP */}
                    <DeathSaves
                      isVisible={isAtZeroHP}
                      onStabilize={() => {
                        handlePlayerHPChange(1);
                        toast({ title: "Stabilized!", description: "You regain 1 hit point." });
                      }}
                    />

                    {/* Short Rest */}
                    <ShortRestPanel
                      characterId={characterId!}
                      characterClass={character.class}
                      characterLevel={character.level}
                      currentHP={character.hit_points}
                      maxHP={character.max_hit_points}
                      constitution={character.constitution}
                      onHeal={(amount) => handlePlayerHPChange(character.hit_points + amount)}
                    />

                    {/* Dice Roller */}
                    <ContextDiceRoller
                      character={{
                        strength: character.strength,
                        dexterity: character.dexterity,
                        constitution: character.constitution,
                        intelligence: character.intelligence,
                        wisdom: character.wisdom,
                        charisma: character.charisma,
                        level: character.level,
                        class: character.class,
                      }}
                      equippedWeapons={equippedWeapons}
                      pendingRollRequest={pendingRollRequest}
                      isAtZeroHP={isAtZeroHP}
                      onRollComplete={(result, formattedMessage) => {
                        setInput(formattedMessage);
                        setAllowedRollMessage(formattedMessage);
                      }}
                      onSendToChat={handleDirectSendRoll}
                    />

                    {/* Combat Tracker */}
                    <DMCombatTracker
                      playerName={character.name}
                      playerHP={character.hit_points}
                      playerMaxHP={character.max_hit_points}
                      playerAC={calculateAC(inventory, character.dexterity, character.class, character.wisdom, character.constitution).total}
                      onPlayerHPChange={handlePlayerHPChange}
                      combatants={combatState.combatants}
                      currentTurn={combatState.currentTurn}
                      round={combatState.round}
                      isInCombat={combatState.isInCombat}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              </div>}
          </div>

          <div className="flex-1 flex gap-4 items-stretch">
            {/* Mobile Dice Roller Panel */}
            {showDiceRoller && character && (
              <div className="md:hidden fixed inset-x-4 bottom-20 z-50 max-h-[60vh] overflow-y-auto">
                <ContextDiceRoller
                  character={{
                    strength: character.strength,
                    dexterity: character.dexterity,
                    constitution: character.constitution,
                    intelligence: character.intelligence,
                    wisdom: character.wisdom,
                    charisma: character.charisma,
                    level: character.level,
                    class: character.class,
                  }}
                  equippedWeapons={equippedWeapons}
                  pendingRollRequest={pendingRollRequest}
                  isAtZeroHP={isAtZeroHP}
                  onRollComplete={(result, formattedMessage) => {
                    setInput(formattedMessage);
                    setAllowedRollMessage(formattedMessage);
                  }}
                  onSendToChat={handleDirectSendRoll}
                />
              </div>
            )}

            {/* Mobile Combat Tracker Panel */}
            {showCombatTracker && character && (
              <div className="md:hidden fixed inset-x-4 bottom-20 z-50 max-h-[60vh] overflow-y-auto">
                <DMCombatTracker
                  playerName={character.name}
                  playerHP={character.hit_points}
                  playerMaxHP={character.max_hit_points}
                  playerAC={calculateAC(inventory, character.dexterity, character.class, character.wisdom, character.constitution).total}
                  onPlayerHPChange={handlePlayerHPChange}
                  combatants={combatState.combatants}
                  currentTurn={combatState.currentTurn}
                  round={combatState.round}
                  isInCombat={combatState.isInCombat}
                />
              </div>
            )}

            {/* Death Saves - Shows when at 0 HP */}
            {isAtZeroHP && (
              <div className="md:hidden fixed inset-x-4 top-20 z-50">
                <DeathSaves
                  isVisible={isAtZeroHP}
                  onStabilize={() => {
                    handlePlayerHPChange(1);
                    toast({ title: t.stabilized, description: t.youRegainHP });
                  }}
                />
              </div>
            )}

            {/* Chat Section - Left */}
            <Card className="flex-1 flex flex-col bg-card/90 backdrop-blur border-border">
              <div className="p-6 space-y-4">
                {messages.map((msg, idx) => {
                const {
                  text: itemParsedText,
                  offers
                } = msg.role === 'assistant' ? parseItemOffers(msg.content) : {
                  text: msg.content,
                  offers: []
                };
                // Also strip XP award tags, combat commands, roll requests, and story events from display
                const { text: xpParsedText } = msg.role === 'assistant' ? parseXPAwards(itemParsedText) : { text: itemParsedText };
                const { text: combatParsedText } = msg.role === 'assistant' ? parseCombatCommands(xpParsedText) : { text: xpParsedText };
                const { text: rollParsedText } = msg.role === 'assistant' ? parseRollRequests(combatParsedText) : { text: combatParsedText };
                const { text } = msg.role === 'assistant' ? parseStoryEvents(rollParsedText) : { text: rollParsedText };
                return <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg ${msg.role === 'user' ? 'bg-gradient-gold text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        <p className="whitespace-pre-wrap">{text}</p>
                        {offers.map((offer, offerIdx) => <ItemOffer key={offerIdx} itemName={offer.name} itemType={offer.type} description={offer.description} characterId={characterId!} onItemTaken={loadInventory} />)}
                      </div>
                    </div>;
              })}
                {isLoading && <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{
                      animationDelay: '0.2s'
                    }} />
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{
                      animationDelay: '0.4s'
                    }} />
                      </div>
                    </div>
                  </div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border bg-background/50 relative z-[50]">
                <div className="flex gap-2 items-end">
                  <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }} placeholder="Describe your action... (use Items panel to select weapons/items)" className="min-h-[80px] bg-input border-border focus:border-gold resize-none flex-1" disabled={isLoading} />
                  <div className="flex flex-col gap-2">
                    <ActionPanel 
                      items={inventory} 
                      onSelectItem={(itemName, ammoName) => {
                        const text = ammoName 
                          ? `[${itemName}] with [${ammoName}]`
                          : `[${itemName}]`;
                        setInput(prev => prev + (prev ? " " : "") + text);
                      }} 
                      onUseItem={useItem}
                      disabled={isLoading} 
                    />
                    <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-gradient-gold hover:opacity-90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Character Sidebar - Right (Desktop only) - Flows with content */}
            {character && <div className="hidden md:block w-80 flex-shrink-0 self-stretch">
                <Card className="h-full bg-card/90 backdrop-blur border-border flex flex-col">
                {sidebarAlignBottom && <div className="flex-1" />} {/* Spacer pushes content to bottom */}
                <div className="p-6 space-y-6">
                  {/* Alignment toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newValue = !sidebarAlignBottom;
                      setSidebarAlignBottom(newValue);
                      localStorage.setItem('sidebarAlignBottom', String(newValue));
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-gold"
                  >
                    {sidebarAlignBottom ? t.alignToTop : t.alignToBottom}
                  </Button>
                  <div className="flex flex-col items-center">
                    <Avatar className="w-32 h-32 border-4 border-gold">
                      <AvatarImage src={character.avatar_url || ""} alt={character.name} />
                      <AvatarFallback className="bg-gradient-gold text-4xl font-cinzel">
                        {character.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-cinzel font-bold text-gold mt-4">{character.name}</h2>
                    <p className="text-[#ebbe7f] text-base text-center">
                      {t.level} {character.level} {character.race} {character.class}
                    </p>
                  </div>

                  {/* HP */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-foreground">{t.health}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {character.hit_points} / {character.max_hit_points}
                      </span>
                    </div>
                    <Progress value={character.hit_points / character.max_hit_points * 100} className="h-2" />
                  </div>

                  {/* XP */}
                  <XPProgress experience={character.experience} level={character.level} />

                  {/* Proficiency Bonus */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gold" />
                      <span className="font-semibold text-foreground">{t.proficiency}</span>
                    </div>
                    <span className="text-lg font-bold text-gold">+{getProficiencyBonus(character.level)}</span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Sword className="w-4 h-4 text-gold" />
                      <span className="font-semibold text-foreground">{t.stats}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <StatBlock label="STR" value={character.strength} />
                      <StatBlock label="DEX" value={character.dexterity} />
                      <StatBlock label="CON" value={character.constitution} />
                      <StatBlock label="INT" value={character.intelligence} />
                      <StatBlock label="WIS" value={character.wisdom} />
                      <StatBlock label="CHA" value={character.charisma} />
                    </div>
                  </div>

                  {/* Equipment & AC */}
                  <EquipmentSlots
                    inventory={inventory}
                    dexterity={character.dexterity}
                    characterClass={character.class}
                    wisdom={character.wisdom}
                    constitution={character.constitution}
                    onInventoryChange={loadInventory}
                  />

                  {/* Inventory */}
                  <InventoryPanel items={inventory} />

                  {/* Spell List - Only shows for spellcasting classes */}
                  <SpellList
                    characterId={characterId}
                    characterClass={character.class}
                    characterLevel={character.level}
                    onCastSpell={(spellName, slotLevel) => {
                      const slotInfo = slotLevel ? ` using a level ${slotLevel} slot` : "";
                      setInput(prev => prev + (prev ? " " : "") + `I cast ${spellName}${slotInfo}`);
                    }}
                  />

                  {/* Death Saves - Shows when at 0 HP */}
                  <DeathSaves
                    isVisible={isAtZeroHP}
                    onStabilize={() => {
                      handlePlayerHPChange(1);
                      toast({ title: t.stabilized, description: t.youRegainHP });
                    }}
                  />

                  {/* Short Rest */}
                  <ShortRestPanel
                    characterId={characterId!}
                    characterClass={character.class}
                    characterLevel={character.level}
                    currentHP={character.hit_points}
                    maxHP={character.max_hit_points}
                    constitution={character.constitution}
                    onHeal={(amount) => handlePlayerHPChange(character.hit_points + amount)}
                  />

                  {/* Dice Roller */}
                  <ContextDiceRoller
                    character={{
                      strength: character.strength,
                      dexterity: character.dexterity,
                      constitution: character.constitution,
                      intelligence: character.intelligence,
                      wisdom: character.wisdom,
                      charisma: character.charisma,
                      level: character.level,
                      class: character.class,
                    }}
                    equippedWeapons={equippedWeapons}
                    pendingRollRequest={pendingRollRequest}
                    isAtZeroHP={isAtZeroHP}
                    onRollComplete={(result, formattedMessage) => {
                      setInput(formattedMessage);
                      setAllowedRollMessage(formattedMessage);
                    }}
                    onSendToChat={handleDirectSendRoll}
                  />

                  {/* Combat Tracker */}
                  <DMCombatTracker
                    playerName={character.name}
                    playerHP={character.hit_points}
                    playerMaxHP={character.max_hit_points}
                    playerAC={calculateAC(inventory, character.dexterity, character.class, character.wisdom, character.constitution).total}
                    onPlayerHPChange={handlePlayerHPChange}
                    combatants={combatState.combatants}
                    currentTurn={combatState.currentTurn}
                    round={combatState.round}
                    isInCombat={combatState.isInCombat}
                  />
                </div>
              </Card>
            </div>}
          </div>
        </div>
      </div>

      {/* ASI Dialog */}
      {character && pendingASI && (
        <ASIDialog
          open={!!pendingASI}
          onClose={() => setPendingASI(null)}
          currentScores={{
            strength: character.strength,
            dexterity: character.dexterity,
            constitution: character.constitution,
            intelligence: character.intelligence,
            wisdom: character.wisdom,
            charisma: character.charisma,
          }}
          newLevel={pendingASI.level}
          onConfirm={handleASIConfirm}
        />
      )}
    </div>;
};
export default Game;