import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000)
});

const inventoryItemSchema = z.object({
  item_name: z.string(),
  item_type: z.string(),
  quantity: z.number(),
  equipped: z.boolean()
});

const characterContextSchema = z.object({
  name: z.string().max(50),
  race: z.string().max(50),
  class: z.string().max(50),
  background: z.string().max(50).optional(),
  level: z.number().int().min(1).max(20),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
  hit_points: z.number().int().min(0),
  max_hit_points: z.number().int().min(1),
  experience: z.number().int().min(0).optional(),
  inventory: z.array(inventoryItemSchema).optional()
}).optional();

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  characterContext: characterContextSchema,
  conversationId: z.string().uuid().optional()
});

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to detect which rule sections are relevant based on user message
function detectRelevantSections(userMessage: string): string[] {
  const messageLower = userMessage.toLowerCase();
  const detectedSections: string[] = ['core_identity'];
  
  const sectionKeywords: Record<string, string[]> = {
    combat: ['combat', 'fight', 'battle', 'initiative', 'attack', 'enemy', 'turn', 'damage', 'ac', 'armor', 'hit', 'miss', 'weapon', 'strike', 'slash', 'round', 'action', 'sword', 'bow', 'monster', 'kill', 'defend', 'shield'],
    spellcasting: ['spell', 'magic', 'cast', 'cantrip', 'incantation', 'concentration', 'spell slot', 'fireball', 'wizard', 'sorcerer', 'warlock', 'cleric', 'druid', 'ritual', 'arcane', 'divine', 'mana', 'heal', 'cure', 'scroll'],
    exploration: ['explore', 'search', 'investigate', 'travel', 'dungeon', 'room', 'door', 'trap', 'perception', 'stealth', 'hide', 'sneak', 'look', 'examine', 'open', 'dark', 'light', 'torch', 'passageway', 'corridor'],
    social: ['persuade', 'intimidate', 'deceive', 'negotiate', 'dialogue', 'gossip', 'bribe', 'roleplay', 'charm', 'talk', 'barter', 'merchant', 'npc', 'innkeeper', 'tavern', 'conversation', 'insight', 'speak', 'ask', 'tell', 'shop', 'buy', 'sell'],
    skill_checks: ['check', 'skill check', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'perception', 'athletics', 'intimidation', 'investigation', 'persuasion', 'history', 'roll', 'ability', 'dc', 'difficulty', 'advantage', 'disadvantage', 'try to', 'attempt'],
    conditions: ['condition', 'prone', 'grappled', 'restrained', 'stunned', 'poisoned', 'unconscious', 'incapacitated', 'paralyzed', 'blinded', 'frightened', 'charmed', 'frozen', 'immune'],
    resting: ['rest', 'short rest', 'long rest', 'sleep', 'recover', 'heal', 'hit dice', 'nap', 'camp', 'refresh', 'recuperate'],
    death_dying: ['death', 'dying', 'death save', 'stable', 'stabilize', 'unconscious', 'die', 'revive', 'mortally wounded', 'bleeding out', 'fallen', 'zero hp', '0 hp'],
    injuries: ['injury', 'wounded', 'scar', 'broken bone', 'crippled', 'bleeding', 'amputation', 'hurt', 'medicine', 'hemorrhage', 'maimed', 'limp'],
    morale: ['morale', 'flee', 'surrender', 'retreat', 'panic', 'cowardice', 'bravery', 'desperate', 'rout', 'run away', 'escape'],
    downtime: ['downtime', 'craft', 'train', 'research', 'workshop', 'foraging', 'lifestyle', 'school', 'profession', 'working', 'between adventures'],
    environmental: ['weather', 'trap', 'terrain', 'hazard', 'lava', 'storm', 'poison gas', 'avalanche', 'quicksand', 'flood', 'cold', 'heat', 'fall', 'climb', 'swim', 'difficult terrain'],
    creatures_monsters: ['goblin', 'kobold', 'orc', 'skeleton', 'zombie', 'ghoul', 'spider', 'bandit', 'cultist', 'guard', 'hobgoblin', 'gnoll', 'bugbear', 'lizardfolk', 'monster', 'creature', 'beast', 'undead'],
    weapons_equipment: ['weapon', 'sword', 'axe', 'bow', 'dagger', 'crossbow', 'armor', 'shield', 'finesse', 'versatile', 'two-handed', 'thrown', 'ammunition', 'equipment', 'gear'],
    spells_magic: ['fire bolt', 'magic missile', 'cure wounds', 'healing word', 'fireball', 'lightning bolt', 'shield', 'misty step', 'hold person', 'counterspell', 'haste', 'bless', 'sleep'],
    encounter_guidelines: ['encounter', 'random encounter', 'ambush', 'group', 'multiple enemies', 'reinforcements'],
    dice_rolling: ['roll', 'dice', 'check', 'd20', 'natural 20', 'critical', 'automatic', 'no roll', 'skip roll']
  };
  
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedSections.push(section);
    }
  }
  
  return [...new Set(detectedSections)];
}

// Fetch relevant rules from database
async function fetchRelevantRules(sections: string[]): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: rules, error } = await supabase
    .from('game_rules')
    .select('section_name, content, priority')
    .in('section_name', sections)
    .order('priority', { ascending: false });
  
  if (error) {
    console.error('Error fetching rules:', error);
    return 'You are a Dungeons & Dragons 5th Edition Dungeon Master.';
  }
  
  if (!rules || rules.length === 0) {
    return 'You are a Dungeons & Dragons 5th Edition Dungeon Master.';
  }
  
  const rulesContent = rules.map(rule => `## ${rule.section_name.toUpperCase()}\n${rule.content}`).join('\n\n');
  console.log(`Loaded ${rules.length} rule sections: ${sections.join(', ')}`);
  
  return rulesContent;
}

// Fetch existing conversation summary
async function fetchConversationSummary(conversationId: string): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('conversation_summaries')
    .select('summary_text')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching summary:', error);
    return null;
  }
  
  return data?.summary_text || null;
}

// Fetch story events for character
async function fetchStoryEvents(conversationId: string): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get character_id from conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('character_id')
    .eq('id', conversationId)
    .single();
  
  if (!conv?.character_id) return null;
  
  const { data: events, error } = await supabase
    .from('story_events')
    .select('title, description, event_type, importance')
    .eq('character_id', conv.character_id)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error || !events || events.length === 0) return null;
  
  const eventsText = events.map(e => `- [${e.event_type}] ${e.title}: ${e.description}`).join('\n');
  return `## STORY EVENTS & HISTORY\n${eventsText}`;
}

// Generate summary of older messages using AI
async function generateAndStoreSummary(
  conversationId: string,
  oldMessages: Array<{ role: string; content: string; created_at: string; id: string }>,
  existingSummary: string | null
): Promise<string> {
  if (oldMessages.length < 5) return existingSummary || '';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Create a summary prompt, including existing summary if available
  const messagesText = oldMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  
  let promptContent = '';
  if (existingSummary) {
    promptContent = `Previous adventure summary:\n${existingSummary}\n\nNew adventure segment to incorporate:\n${messagesText}`;
  } else {
    promptContent = `Summarize this adventure segment:\n\n${messagesText}`;
  }
  
  const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: existingSummary 
            ? 'You are summarizing a D&D adventure. Merge the previous summary with new events into a cohesive summary (max 600 words). Keep key plot points, NPC interactions, combat outcomes, items found, locations, and decisions. Use past tense.'
            : 'You are summarizing a D&D adventure conversation. Create a concise summary (max 500 words) capturing: key plot points, NPC interactions, combat outcomes, items found, locations visited, and player decisions. Use past tense. Focus on story-relevant details only.' 
        },
        { role: 'user', content: promptContent }
      ],
      max_tokens: 700,
    }),
  });
  
  const summaryData = await summaryResponse.json();
  const summaryText = summaryData.choices?.[0]?.message?.content || '';
  
  if (summaryText && oldMessages.length > 0) {
    // Delete old summary if exists, then store new one
    await supabase
      .from('conversation_summaries')
      .delete()
      .eq('conversation_id', conversationId);
    
    const { error } = await supabase
      .from('conversation_summaries')
      .insert({
        conversation_id: conversationId,
        summary_text: summaryText,
        messages_start_at: oldMessages[0].created_at,
        messages_end_at: oldMessages[oldMessages.length - 1].created_at,
        message_count: oldMessages.length
      });
    
    if (error) {
      console.error('Error storing summary:', error);
    } else {
      console.log(`Created/updated summary for ${oldMessages.length} messages`);
      
      // Mark old messages as archived
      const messageIds = oldMessages.map(m => m.id);
      await supabase
        .from('messages')
        .update({ is_archived: true })
        .in('id', messageIds);
    }
  }
  
  return summaryText;
}

// Check and trigger automatic summarization
async function checkAndSummarize(conversationId: string): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Fetch all non-archived messages
  const { data: allMessages, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });
  
  if (error || !allMessages) {
    console.error('Error fetching messages for summarization:', error);
    return null;
  }
  
  const totalMessages = allMessages.length;
  console.log(`Total non-archived messages: ${totalMessages}`);
  
  // Only summarize if we have more than 20 messages
  if (totalMessages <= 20) {
    // Just return existing summary if any
    return await fetchConversationSummary(conversationId);
  }
  
  // Keep the last 10 messages, summarize the rest
  const messagesToSummarize = allMessages.slice(0, totalMessages - 10);
  
  if (messagesToSummarize.length < 5) {
    return await fetchConversationSummary(conversationId);
  }
  
  console.log(`Triggering summarization for ${messagesToSummarize.length} messages`);
  
  // Get existing summary to merge with
  const existingSummary = await fetchConversationSummary(conversationId);
  
  // Generate and store summary
  const newSummary = await generateAndStoreSummary(
    conversationId, 
    messagesToSummarize,
    existingSummary
  );
  
  return newSummary;
}

// Build inventory rules for the system message
function buildInventoryRules(inventory: Array<{ item_name: string; item_type: string; quantity: number; equipped: boolean }> | undefined): string {
  if (!inventory || inventory.length === 0) {
    return `
## INVENTORY RULES
The player currently has NO items in their inventory.
- The player CANNOT use any weapons, items, scrolls, or spells because they have none.
- Unarmed attacks (fists, kicks, basic physical actions) are ALWAYS allowed.
- If the player tries to use an item they don't have, you MUST stop the action and inform them they don't possess that item.
- Items can ONLY be obtained through story events, discoveries, NPC interactions, rewards, or finding them during adventures.
`;
  }

  const weapons = inventory.filter(i => i.item_type === 'weapon');
  const consumables = inventory.filter(i => i.item_type === 'consumable');
  const scrolls = inventory.filter(i => i.item_type === 'scroll');
  const spells = inventory.filter(i => i.item_type === 'spell');
  const other = inventory.filter(i => !['weapon', 'consumable', 'scroll', 'spell'].includes(i.item_type));

  let inventoryText = `
## INVENTORY RULES & VALIDATION
CRITICAL: You MUST validate ALL player actions against their actual inventory.

### Current Inventory:
`;

  if (weapons.length > 0) {
    inventoryText += `\n**Weapons:** ${weapons.map(w => `${w.item_name}${w.equipped ? ' (equipped)' : ''}${w.quantity > 1 ? ` x${w.quantity}` : ''}`).join(', ')}`;
  }
  if (consumables.length > 0) {
    inventoryText += `\n**Consumables:** ${consumables.map(c => `${c.item_name}${c.quantity > 1 ? ` x${c.quantity}` : ''}`).join(', ')}`;
  }
  if (scrolls.length > 0) {
    inventoryText += `\n**Scrolls:** ${scrolls.map(s => `${s.item_name}${s.quantity > 1 ? ` x${s.quantity}` : ''}`).join(', ')}`;
  }
  if (spells.length > 0) {
    inventoryText += `\n**Spells:** ${spells.map(s => `${s.item_name}${s.quantity > 1 ? ` x${s.quantity}` : ''}`).join(', ')}`;
  }
  if (other.length > 0) {
    inventoryText += `\n**Other Items:** ${other.map(o => `${o.item_name}${o.quantity > 1 ? ` x${o.quantity}` : ''}`).join(', ')}`;
  }

  inventoryText += `

### Validation Rules:
1. If the player attempts to use a weapon, item, scroll, or spell NOT listed above, you MUST:
   - STOP the action immediately
   - Clearly state: "You do not have [item name] in your inventory. This action cannot be performed."
   - Suggest valid alternatives from their actual inventory or unarmed actions

2. Unarmed attacks (fists, kicks, headbutts, grappling) are ALWAYS allowed - they don't require inventory items.

3. Players CANNOT add items to their own inventory. Items only appear through:
   - Story events and discoveries
   - Finding them in chests, corpses, or locations
   - Receiving them from NPCs
   - Rewards from quests or battles

4. **IMPORTANT - GIVING ITEMS TO PLAYERS**: When the player discovers an item, finds loot, or receives a gift from an NPC, you MUST use this EXACT format to offer the item:
   
   [ITEM_OFFER]{"name":"Item Name","type":"weapon|consumable|scroll|spell|misc","description":"Brief description of the item"}[/ITEM_OFFER]
   
   Examples:
   - [ITEM_OFFER]{"name":"Iron Shortsword","type":"weapon","description":"A well-balanced blade suitable for close combat. Deals 1d6 slashing damage."}[/ITEM_OFFER]
   - [ITEM_OFFER]{"name":"Healing Potion","type":"consumable","description":"Restores 2d4+2 hit points when consumed."}[/ITEM_OFFER]
   - [ITEM_OFFER]{"name":"Scroll of Fireball","type":"scroll","description":"A single-use scroll containing the Fireball spell."}[/ITEM_OFFER]
   
   This format creates an interactive button that lets the player choose to take or leave the item.

5. The player may reference items by partial names - use your judgment to match to actual inventory items.
`;

  return inventoryText;
}

// Build creature reference for combat
function buildCreatureReference(): string {
  return `
## CREATURE REFERENCE (Use for encounters)
**CR 1/8 (25 XP each):** Kobold (AC 12, HP 5, Pack Tactics), Bandit (AC 12, HP 11), Cultist (AC 12, HP 9, Dark Devotion), Guard (AC 16, HP 11)
**CR 1/4 (50 XP each):** Goblin (AC 15, HP 7, Nimble Escape), Skeleton (AC 13, HP 13, vulnerable bludgeoning), Zombie (AC 8, HP 22, Undead Fortitude), Giant Wolf Spider (AC 13, HP 11, poison bite)
**CR 1/2 (100 XP each):** Hobgoblin (AC 18, HP 11, Martial Advantage), Orc (AC 13, HP 15, Aggressive), Gnoll (AC 15, HP 22, Rampage), Lizardfolk (AC 15, HP 22, swim 30ft)
**CR 1 (200 XP each):** Bugbear (AC 16, HP 27, Brute + Surprise Attack), Giant Spider (AC 14, HP 26, Web), Ghoul (AC 12, HP 22, paralyzing claws)

### Combat Tactics by Creature:
- **Goblins/Kobolds:** Hit-and-run, use terrain, flee if outnumbered
- **Orcs/Gnolls:** Aggressive charges, fight to the death for glory
- **Hobgoblins:** Military tactics, maintain formation, use Martial Advantage
- **Undead:** Mindless pursuit, no retreat, target living
- **Spiders:** Ambush from above, web to restrain, drag paralyzed prey away
`;
}

// Build spell reference
function buildSpellReference(): string {
  return `
## SPELL REFERENCE
**Cantrips:** Fire Bolt (1d10 fire, 120ft), Sacred Flame (1d8 radiant, DEX save), Vicious Mockery (1d4 psychic + disadvantage, WIS save)
**1st Level:** Magic Missile (3 darts, 1d4+1 each, auto-hit), Shield (+5 AC reaction), Cure Wounds (1d8+mod), Healing Word (1d4+mod bonus action), Sleep (5d8 HP affected), Thunderwave (2d8 + push, 15ft cube)
**2nd Level:** Misty Step (30ft teleport bonus action), Hold Person (WIS save or paralyzed), Scorching Ray (3 rays, 2d6 fire each), Spiritual Weapon (1d8+mod bonus action attack)
**3rd Level:** Fireball (8d6 fire, 20ft radius, DEX half), Lightning Bolt (8d6 lightning, 100ft line), Counterspell (reaction, stops spells), Haste (double speed, +2 AC, extra action)

### Spell Scroll Rules:
- If spell is on your class list: cast without material components
- If higher level than you can cast: ability check DC 10 + spell level
- Scroll crumbles after use
- Scroll Save DC: Cantrip-1st: 13, 2nd-3rd: 15
`;
}

// Build encounter and dice rolling guidelines
function buildDMGuidelines(): string {
  return `
## ENCOUNTER COMPOSITION GUIDELINES
**Party Level 1:** 2-4 CR 1/8 OR 1-2 CR 1/4 creatures
**Party Level 2-3:** 3-5 CR 1/4 OR 2-3 CR 1/2 creatures  
**Party Level 4-5:** 2-4 CR 1/2 OR 1-2 CR 1 creatures
- Mix creature types for variety (e.g., 1 hobgoblin leader + 3 goblins)
- Use terrain and tactics to make encounters dynamic
- Award XP immediately after defeating creatures

## CRITICAL: WHEN TO REQUEST DICE ROLLS
**ALWAYS REQUEST A ROLL when:**
1. **CREATURES ARE PRESENT** - ANY action near creatures (stealth, perception, deception, persuasion, intimidation) ALWAYS requires a roll
2. **Sneaking/Hiding** - Stealth checks are ALWAYS required when trying to avoid detection by creatures
3. **Observing/Searching** - Perception/Investigation checks when looking for hidden things, counting enemies, spotting traps
4. **Physical challenges** - Climbing walls, jumping gaps, swimming in currents, breaking down doors under pressure
5. **Social manipulation** - Lying, persuading, intimidating, or charming NPCs with stakes
6. **Combat actions** - Attacks, saving throws, contested checks
7. **Uncertain outcomes** - When success is not guaranteed and failure would change the situation

**Example situations that ALWAYS need rolls:**
- "I sneak closer to the goblins" → [ROLL_REQUEST:skill_check]{"skill":"Stealth","dc":12}[/ROLL_REQUEST]
- "I try to count how many enemies there are" → [ROLL_REQUEST:skill_check]{"skill":"Perception","dc":10}[/ROLL_REQUEST]
- "I listen for sounds ahead" → [ROLL_REQUEST:skill_check]{"skill":"Perception","dc":12}[/ROLL_REQUEST]
- "I try to blend into the crowd" → [ROLL_REQUEST:skill_check]{"skill":"Stealth","dc":14}[/ROLL_REQUEST]
- "I convince the guard to let me pass" → [ROLL_REQUEST:skill_check]{"skill":"Persuasion","dc":15}[/ROLL_REQUEST]

**ONLY skip rolls when:**
- The action is completely routine with zero stakes (walking, talking casually, opening unlocked doors)
- Success is automatic given the character's abilities AND there's no opposition
- There's no time pressure, no enemies, and no consequences for failure

**IMPORTANT: When in doubt, REQUEST THE ROLL. It's better to roll when unnecessary than to skip a roll that should have happened. The player's dice buttons are disabled until you request!**

## WEAPON PROPERTIES REFERENCE
- **Finesse:** Use STR or DEX for attack/damage
- **Light:** Allows two-weapon fighting (bonus action attack, no modifier to damage)
- **Heavy:** Small creatures have disadvantage
- **Reach:** +5 ft attack range
- **Thrown:** Can throw for ranged attack using same modifier
- **Versatile:** Use one or two hands (damage in parentheses is two-handed)
- **Loading:** One shot per action regardless of Extra Attack
- **Ammunition:** Requires ammo, drawing is part of attack
`;
}

// Build combat control commands for DM
function buildCombatCommands(): string {
  return `
## COMBAT CONTROL SYSTEM
You control all combat as the Dungeon Master. The player CANNOT add combatants - only you can.

**PROPER COMBAT FLOW:**
1. When combat starts, first use [COMBAT:start_combat] and request initiative
2. WAIT for the player's initiative roll result before adding them
3. After receiving their roll, use [COMBAT:add_player] with their actual initiative
4. Add all enemies with their rolled/assigned initiatives

**Starting Combat (Step 1):**
[COMBAT:start_combat]{}[/COMBAT]
[ROLL_REQUEST:initiative]{}[/ROLL_REQUEST]

**Adding Player AFTER They Roll Initiative (Step 2):**
When the player reports "Initiative: 15", use:
[COMBAT:add_player]{"initiative": 15}[/COMBAT]

**Adding Enemies:** Add enemies when they appear in the narrative. Use creature names from the bestiary when possible:
[COMBAT:add_combatant]{"name": "Goblin", "count": 3}[/COMBAT]
[COMBAT:add_combatant]{"name": "Orc Warrior", "hp": 30, "ac": 14}[/COMBAT]

**Damage and Healing:** When you describe damage to enemies or the player:
[COMBAT:damage]{"target": "Goblin 1", "amount": 8}[/COMBAT]
[COMBAT:heal]{"target": "Player Name", "amount": 10}[/COMBAT]

**IMPORTANT - DAMAGE SYNC:** When using [COMBAT:damage] or [COMBAT:heal] on the player, their character HP is automatically synced. You don't need to track it separately.

**Conditions:** When applying or removing conditions:
[COMBAT:add_condition]{"target": "Orc", "condition": "Poisoned"}[/COMBAT]
[COMBAT:remove_condition]{"target": "Orc", "condition": "Poisoned"}[/COMBAT]

**Turn Progression:** After resolving an action, advance to next turn:
[COMBAT:next_turn]{}[/COMBAT]

**Ending Combat:** When all enemies are defeated or combat ends:
[COMBAT:end_combat]{}[/COMBAT]

**IMPORTANT RULES:**
1. YOU decide when combat starts, not the player
2. ALWAYS request initiative BEFORE adding the player to combat
3. YOU add all combatants (enemies, allies) - the player only controls their character
4. Roll initiative for enemies and describe the turn order
5. The player can ONLY: choose their actions, select targets from your list, and use approved dice rolls
6. When an enemy dies, describe it narratively but also use [COMBAT:damage] to track it
7. Always describe combat cinematically while using the tags to track state
`;
}

// Build roll request commands for DM-controlled dice rolling
function buildRollRequestCommands(): string {
  return `
## ROLL REQUEST SYSTEM (CRITICAL - MANDATORY FOR ALL ROLLS)
**THE PLAYER CANNOT ROLL DICE UNTIL YOU REQUEST IT.** Their dice buttons are DISABLED by default.

You MUST use [ROLL_REQUEST] tags whenever the player needs to roll. Without these tags, the player literally cannot roll.

**NEVER SKIP ROLLS. ALWAYS REQUEST.**

**Weapon Attacks (2-step process):**
Step 1 - Request attack roll:
[ROLL_REQUEST:attack]{"weapon":"Longsword"}[/ROLL_REQUEST]

Step 2 - WAIT for result, then if hit, request damage:
[ROLL_REQUEST:damage]{"weapon":"Longsword","critical":false}[/ROLL_REQUEST]

For critical hits (nat 20), set critical to true:
[ROLL_REQUEST:damage]{"weapon":"Longsword","critical":true}[/ROLL_REQUEST]

**Spell Attacks (same 2-step process):**
[ROLL_REQUEST:spell_attack]{"spell":"Fire Bolt"}[/ROLL_REQUEST]
[ROLL_REQUEST:spell_damage]{"spell":"Fire Bolt","critical":false}[/ROLL_REQUEST]

**Saving Throws:**
[ROLL_REQUEST:saving_throw]{"ability":"dexterity","dc":15,"reason":"dodging the fireball"}[/ROLL_REQUEST]
[ROLL_REQUEST:saving_throw]{"ability":"constitution","dc":12,"reason":"resisting the poison"}[/ROLL_REQUEST]

**Skill Checks:**
[ROLL_REQUEST:skill_check]{"skill":"Perception","dc":12}[/ROLL_REQUEST]
[ROLL_REQUEST:skill_check]{"skill":"Stealth","dc":14}[/ROLL_REQUEST]
[ROLL_REQUEST:skill_check]{"skill":"Athletics","dc":15}[/ROLL_REQUEST]

**Initiative (when combat starts):**
[ROLL_REQUEST:initiative]{}[/ROLL_REQUEST]

**Concentration (when taking damage while concentrating):**
[ROLL_REQUEST:concentration]{"spell":"Bless","dc":10}[/ROLL_REQUEST]

**ABSOLUTE RULES - NEVER BREAK THESE:**
1. NEVER assume what the player rolls - you don't know until they tell you
2. NEVER narrate the outcome of a roll before receiving the result
3. NEVER skip requesting a roll for combat actions, skill checks near enemies, or contested actions
4. ALWAYS wait for the player to respond with their roll result before continuing
5. For attacks: Request attack → Wait for result → If hit, request damage → Wait for result → Narrate
6. For saves: Request save → Wait for result → Compare to DC → Narrate consequences
7. Match weapon/spell names to what the player actually has in their inventory
8. If you're about to write "you succeed" or "you hit" without seeing a roll result, STOP and request the roll first

**COMMON MISTAKES TO AVOID:**
- DON'T write: "You sneak past the guards successfully" (without requesting Stealth)
- DON'T write: "Your arrow hits the goblin for 8 damage" (without requesting attack AND damage rolls)
- DON'T write: "You dodge the fireball" (without requesting the DEX save)

**CORRECT APPROACH:**
- "Make a Stealth check to sneak past the guards. [ROLL_REQUEST:skill_check]{"skill":"Stealth","dc":14}[/ROLL_REQUEST]"
- Then WAIT for their response before narrating success or failure
`;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const { messages, characterContext, conversationId } = validated;

    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    const userMessageContent = latestUserMessage?.content || '';
    
    const relevantSections = detectRelevantSections(userMessageContent);
    console.log('Detected sections:', relevantSections);
    
    const rulesContent = await fetchRelevantRules(relevantSections);

    let systemMessage = rulesContent;
    
    // Add creature, spell, DM guidelines, combat commands, and roll request commands
    systemMessage += buildCreatureReference();
    systemMessage += buildSpellReference();
    systemMessage += buildDMGuidelines();
    systemMessage += buildCombatCommands();
    systemMessage += buildRollRequestCommands();
    
    // Check for automatic summarization and get summary
    if (conversationId) {
      // This checks message count and auto-summarizes if > 20 messages
      const summary = await checkAndSummarize(conversationId);
      if (summary) {
        systemMessage += `\n\n## PREVIOUS ADVENTURE SUMMARY\n${summary}`;
        console.log('Added conversation summary to context');
      }
      
      // Add story events
      const storyEvents = await fetchStoryEvents(conversationId);
      if (storyEvents) {
        systemMessage += `\n\n${storyEvents}`;
        console.log('Added story events to context');
      }
    }
    
    // Add inventory rules
    if (characterContext) {
      systemMessage += buildInventoryRules(characterContext.inventory);
    }
    
    // Add Story Event logging rules
    systemMessage += `
## STORY EVENT LOGGING (IMPORTANT - LOG KEY EVENTS)
You MUST log important story events using this EXACT format:
[STORY_EVENT]{"type":"npc_encounter","title":"Met Thordak","description":"A gruff dwarven blacksmith who offered information about the mines","importance":3}[/STORY_EVENT]

**Event Types:**
- npc_encounter: Meeting a new NPC (use for named characters the player interacts with)
- location: Discovering or arriving at a significant location
- quest_start: Beginning a new quest or mission
- quest_complete: Completing a quest or major objective
- decision: A significant choice the player made with consequences
- discovery: Finding important information, lore, or secrets
- combat: Significant combat encounters (boss fights, ambushes)
- item: Acquiring important items (magical items, quest items)
- relationship: Changes in relationship with an NPC (ally, enemy, romance)
- plot_point: Major story developments

**Importance Levels (1-5):**
- 1: Minor detail (casual NPC, common item)
- 2: Somewhat notable (helpful merchant, minor clue)
- 3: Significant (quest giver, important location)
- 4: Major (boss encounter, major plot reveal)
- 5: Critical (world-changing event, main quest milestone)

**WHEN TO LOG:**
- First meeting with a NAMED NPC
- Arriving at a new significant location
- Starting or completing quests
- Major player decisions
- Discovering important lore or secrets
- Acquiring magical or quest-important items
- Completing significant combat encounters

**DO NOT LOG:**
- Trivial conversations
- Common items (rations, torches)
- Every combat turn - only the conclusion of significant fights
- Locations the player just passes through

**Example Usage:**
[STORY_EVENT]{"type":"quest_start","title":"The Missing Miners","description":"Tasked by Mayor Stoneheart to investigate disappearances in the old mines","importance":4}[/STORY_EVENT]
[STORY_EVENT]{"type":"location","title":"Arrived at Silverpeak Village","description":"A remote mining town nestled in the mountains, known for its silver exports","importance":3}[/STORY_EVENT]
`;

    // Add XP award rules
    systemMessage += `
## XP AWARD RULES
You MUST award XP for meaningful accomplishments using this EXACT format:
[XP_AWARD]{"amount":100,"reason":"Defeated the goblin scouts"}[/XP_AWARD]

### XP Award Guidelines (based on character level ${characterContext?.level || 1}):
**Monster XP (by Challenge Rating):**
- CR 0: 10 XP | CR 1/8: 25 XP | CR 1/4: 50 XP | CR 1/2: 100 XP
- CR 1: 200 XP | CR 2: 450 XP | CR 3: 700 XP | CR 4: 1100 XP | CR 5: 1800 XP

**Quest Completion (multiply by character level ${characterContext?.level || 1}):**
- Small quest (deliver message, minor fetch): 100 × level = ${100 * (characterContext?.level || 1)} XP
- Medium quest (clear bandits, rescue NPC): 300 × level = ${300 * (characterContext?.level || 1)} XP  
- Major quest (clear dungeon, slay boss): 1000 × level = ${1000 * (characterContext?.level || 1)} XP

**Skill Challenges:**
- Easy (1-2 checks): 50 × level = ${50 * (characterContext?.level || 1)} XP
- Moderate (3-4 checks): 200 × level = ${200 * (characterContext?.level || 1)} XP
- Difficult (5+ checks): 500 × level = ${500 * (characterContext?.level || 1)} XP

**Roleplay/Social Success:** 50-100 × level
**Discoveries:** Major secret: 300 × level | Minor lore: 50 × level
**Traps:** Standard: 50 × level | Complex/deadly: 200 × level

**IMPORTANT:** 
- Award XP immediately after accomplishments
- Only award for meaningful progress, NOT trivial actions
- Include the reason in your XP_AWARD tag
- The system will automatically handle level-ups when XP thresholds are reached
`;
    
    if (characterContext) {
      systemMessage += `\n\n## CURRENT CHARACTER\n`;
      systemMessage += `Name: ${characterContext.name}\n`;
      systemMessage += `Level ${characterContext.level} ${characterContext.race} ${characterContext.class}\n`;
      systemMessage += `HP: ${characterContext.hit_points}/${characterContext.max_hit_points}\n`;
      systemMessage += `XP: ${characterContext.experience || 0}\n`;
      systemMessage += `Stats: STR ${characterContext.strength}, DEX ${characterContext.dexterity}, CON ${characterContext.constitution}, INT ${characterContext.intelligence}, WIS ${characterContext.wisdom}, CHA ${characterContext.charisma}`;
    }

    console.log('System message length:', systemMessage.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
