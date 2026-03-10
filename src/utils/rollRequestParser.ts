// Roll request types the AI DM can request
export type RollRequestType = 
  | "attack" 
  | "damage" 
  | "spell_attack" 
  | "spell_damage" 
  | "saving_throw" 
  | "skill_check" 
  | "initiative" 
  | "concentration" 
  | "death_save"
  | "hit_dice";

// Valid roll types set for quick lookup
const VALID_ROLL_TYPES = new Set<RollRequestType>([
  "attack", "damage", "spell_attack", "spell_damage", 
  "saving_throw", "skill_check", "initiative", 
  "concentration", "death_save", "hit_dice"
]);

// Normalize common variations of roll type names
function normalizeRollType(rawType: string): RollRequestType | null {
  const normalized = rawType.toLowerCase().trim();
  
  // Direct match
  if (VALID_ROLL_TYPES.has(normalized as RollRequestType)) {
    return normalized as RollRequestType;
  }
  
  // Common variations mapping
  const typeMap: Record<string, RollRequestType> = {
    "damage_roll": "damage",
    "damageroll": "damage",
    "attack_roll": "attack",
    "attackroll": "attack",
    "spell_attack_roll": "spell_attack",
    "spelldamage": "spell_damage",
    "spellattack": "spell_attack",
    "save": "saving_throw",
    "savingthrow": "saving_throw",
    "saving": "saving_throw",
    "skill": "skill_check",
    "skillcheck": "skill_check",
    "check": "skill_check",
    "init": "initiative",
    "deathsave": "death_save",
    "death_saving_throw": "death_save",
    "hitdice": "hit_dice",
    "hit_die": "hit_dice",
    "concentration_check": "concentration",
  };
  
  if (typeMap[normalized]) {
    return typeMap[normalized];
  }
  
  console.warn(`Unknown roll request type: "${rawType}"`);
  return null;
}

export interface ParsedRollRequest {
  type: RollRequestType;
  weapon?: string;
  spell?: string;
  ability?: string;
  skill?: string;
  dc?: number;
  reason?: string;
  critical?: boolean;
}

// Parse [ROLL_REQUEST:type]{...}[/ROLL_REQUEST] tags from AI messages
export function parseRollRequests(content: string): {
  text: string;
  requests: ParsedRollRequest[];
} {
  const requests: ParsedRollRequest[] = [];
  const regex = /\[ROLL_REQUEST:(\w+)\](.*?)\[\/ROLL_REQUEST\]/g;
  let text = content;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const rawType = match[1];
      const normalizedType = normalizeRollType(rawType);
      
      // Skip invalid/unknown roll types
      if (!normalizedType) {
        continue;
      }
      
      const rollData = match[2] ? JSON.parse(match[2]) : {};
      
      requests.push({
        type: normalizedType,
        weapon: rollData.weapon,
        spell: rollData.spell,
        ability: rollData.ability,
        skill: rollData.skill,
        dc: rollData.dc,
        reason: rollData.reason,
        critical: rollData.critical,
      });
    } catch (e) {
      console.error("Failed to parse roll request:", e);
    }
  }

  // Remove roll request tags from displayed text
  text = content.replace(regex, "").trim();
  
  return { text, requests };
}

// Format a roll result for chat message
export function formatRollResultMessage(
  rollType: RollRequestType,
  total: number,
  rolls: number[],
  modifier: number,
  context?: { weapon?: string; spell?: string; skill?: string; ability?: string }
): string {
  const rollsStr = rolls.length === 1 ? rolls[0] : `[${rolls.join("+")}]`;
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const breakdownStr = modifier !== 0 ? `(${rollsStr}${modStr})` : `(${rollsStr})`;
  
  switch (rollType) {
    case "attack":
      return `**Attack Roll:** ${total} ${breakdownStr}${context?.weapon ? ` with ${context.weapon}` : ""}`;
    case "damage":
      return `**Damage:** ${total} ${breakdownStr}${context?.weapon ? ` from ${context.weapon}` : ""}`;
    case "spell_attack":
      return `**Spell Attack:** ${total} ${breakdownStr}${context?.spell ? ` for ${context.spell}` : ""}`;
    case "spell_damage":
      return `**Spell Damage:** ${total} ${breakdownStr}${context?.spell ? ` from ${context.spell}` : ""}`;
    case "saving_throw":
      return `**${context?.ability?.charAt(0).toUpperCase()}${context?.ability?.slice(1) || ""} Save:** ${total} ${breakdownStr}`;
    case "skill_check":
      return `**${context?.skill || "Skill"} Check:** ${total} ${breakdownStr}`;
    case "initiative":
      return `**Initiative:** ${total} ${breakdownStr}`;
    case "concentration":
      return `**Concentration Check:** ${total} ${breakdownStr}`;
    case "death_save":
      const isSuccess = total >= 10;
      return `**Death Save:** ${total} ${breakdownStr} - ${isSuccess ? "Success!" : "Failure!"}`;
    case "hit_dice":
      return `**Hit Dice:** Healed ${total} HP ${breakdownStr}`;
    default:
      return `**Roll:** ${total} ${breakdownStr}`;
  }
}

// Example roll request commands for the AI system prompt
export const ROLL_REQUEST_EXAMPLES = `
## ROLL REQUEST SYSTEM
When the player needs to roll dice, use [ROLL_REQUEST] tags to request specific rolls:

**Weapon Attacks:**
[ROLL_REQUEST:attack]{"weapon":"Longsword"}[/ROLL_REQUEST]
[ROLL_REQUEST:damage]{"weapon":"Longsword","critical":false}[/ROLL_REQUEST]

**Spell Attacks:**
[ROLL_REQUEST:spell_attack]{"spell":"Fire Bolt"}[/ROLL_REQUEST]
[ROLL_REQUEST:spell_damage]{"spell":"Fire Bolt","critical":false}[/ROLL_REQUEST]

**Saving Throws:**
[ROLL_REQUEST:saving_throw]{"ability":"dexterity","dc":15,"reason":"dodging the fireball"}[/ROLL_REQUEST]

**Skill Checks:**
[ROLL_REQUEST:skill_check]{"skill":"Perception","dc":12}[/ROLL_REQUEST]
[ROLL_REQUEST:skill_check]{"skill":"Stealth","dc":14}[/ROLL_REQUEST]

**Initiative (when combat starts):**
[ROLL_REQUEST:initiative]{}[/ROLL_REQUEST]

**Concentration (when taking damage while concentrating):**
[ROLL_REQUEST:concentration]{"spell":"Bless","dc":10}[/ROLL_REQUEST]

**Hit Dice (during short rest healing):**
[ROLL_REQUEST:hit_dice]{}[/ROLL_REQUEST]

**IMPORTANT RULES:**
1. ALWAYS use [ROLL_REQUEST] tags when a roll is needed - the player's UI will enable the correct button
2. WAIT for the player's roll result before continuing the narrative
3. Never assume what the player rolls - always ask for the roll first
4. After receiving a roll result, narrate the outcome based on the actual number
5. For attack rolls, if the player hits, follow up with a damage request
6. The player CANNOT roll until you request it - you control the pacing
`;
