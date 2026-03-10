import { Combatant } from "@/components/game/DMCombatTracker";
import { CREATURES, CreatureData } from "@/data/creatures";

// Combat command types
export interface CombatCommand {
  type: "start_combat" | "end_combat" | "add_combatant" | "remove_combatant" | 
        "damage" | "heal" | "add_condition" | "remove_condition" | "next_turn" |
        "set_initiative" | "add_player";
  data: any;
}

// Parse combat-related commands from AI messages
// Format: [COMBAT:command_type]json_data[/COMBAT]
export function parseCombatCommands(content: string): {
  text: string;
  commands: CombatCommand[];
} {
  const commands: CombatCommand[] = [];
  const regex = /\[COMBAT:(\w+)\](.*?)\[\/COMBAT\]/g;
  let text = content;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const commandType = match[1];
      const commandData = match[2] ? JSON.parse(match[2]) : {};
      
      commands.push({
        type: commandType as CombatCommand["type"],
        data: commandData,
      });
    } catch (e) {
      console.error("Failed to parse combat command:", e);
    }
  }

  // Remove combat tags from displayed text
  text = content.replace(regex, "").trim();
  
  return { text, commands };
}

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Create a combatant from command data
export function createCombatantFromCommand(data: any, isPlayer: boolean = false): Combatant {
  return {
    id: generateId(),
    name: data.name || "Unknown",
    initiative: data.initiative ?? Math.floor(Math.random() * 20) + 1,
    currentHP: data.hp || data.currentHP || 10,
    maxHP: data.maxHP || data.hp || 10,
    ac: data.ac || 10,
    isPlayer,
    isActive: true,
    conditions: data.conditions || [],
  };
}

// Create a combatant from creature database
export function createCombatantFromCreature(creatureName: string): Combatant | null {
  const creature = CREATURES.find(
    c => c.name.toLowerCase() === creatureName.toLowerCase()
  );
  
  if (!creature) return null;
  
  const dexMod = Math.floor((creature.stats.dex - 10) / 2);
  const initiative = Math.floor(Math.random() * 20) + 1 + dexMod;
  
  return {
    id: generateId(),
    name: creature.name,
    initiative,
    currentHP: creature.hp,
    maxHP: creature.hp,
    ac: creature.ac,
    isPlayer: false,
    isActive: true,
    conditions: [],
  };
}

// Sort combatants by initiative
export function sortByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => b.initiative - a.initiative);
}

// Process a combat command and return updated state
export interface CombatState {
  combatants: Combatant[];
  currentTurn: number;
  round: number;
  isInCombat: boolean;
}

// Callback for syncing player HP with character state
export type PlayerHPSyncCallback = (newHP: number) => void;

export function processCombatCommand(
  command: CombatCommand,
  currentState: CombatState,
  playerData?: { name: string; hp: number; maxHP: number; ac: number; initiative?: number },
  onPlayerHPSync?: PlayerHPSyncCallback
): CombatState {
  let { combatants, currentTurn, round, isInCombat } = currentState;

  switch (command.type) {
    case "start_combat": {
      isInCombat = true;
      currentTurn = 0;
      round = 1;
      
      // Don't auto-add player anymore - wait for add_player command with real initiative
      // This prevents random initiative being assigned before player rolls
      combatants = sortByInitiative(combatants);
      break;
    }

    case "add_player": {
      // Explicit command to add player with their rolled initiative
      const hasPlayer = combatants.some(c => c.isPlayer);
      if (!hasPlayer && playerData) {
        const initiative = command.data.initiative ?? playerData.initiative ?? Math.floor(Math.random() * 20) + 1;
        const playerCombatant = createCombatantFromCommand({
          name: playerData.name,
          hp: playerData.hp,
          maxHP: playerData.maxHP,
          ac: playerData.ac,
          initiative,
        }, true);
        combatants = sortByInitiative([...combatants, playerCombatant]);
      }
      break;
    }

    case "end_combat": {
      isInCombat = false;
      currentTurn = -1;
      round = 1;
      // Remove dead enemies, keep player
      combatants = combatants.filter(c => c.isPlayer || c.currentHP > 0);
      break;
    }

    case "add_combatant": {
      const { name, count = 1, ...rest } = command.data;
      
      // Try to find in creature database first
      const creature = CREATURES.find(c => c.name.toLowerCase() === name?.toLowerCase());
      
      for (let i = 0; i < count; i++) {
        let newCombatant: Combatant;
        
        if (creature) {
          newCombatant = createCombatantFromCreature(creature.name)!;
          if (count > 1) {
            newCombatant.name = `${creature.name} ${i + 1}`;
          }
        } else {
          newCombatant = createCombatantFromCommand({ name: count > 1 ? `${name} ${i + 1}` : name, ...rest });
        }
        
        combatants = [...combatants, newCombatant];
      }
      
      if (isInCombat) {
        combatants = sortByInitiative(combatants);
      }
      break;
    }

    case "remove_combatant": {
      const targetName = command.data.name?.toLowerCase();
      combatants = combatants.filter(c => 
        !c.name.toLowerCase().includes(targetName) || c.isPlayer
      );
      
      // Adjust current turn if needed
      if (currentTurn >= combatants.length) {
        currentTurn = Math.max(0, combatants.length - 1);
      }
      break;
    }

    case "damage": {
      const { target, amount } = command.data;
      const targetLower = target?.toLowerCase();
      
      combatants = combatants.map(c => {
        if (c.name.toLowerCase().includes(targetLower)) {
          const newHP = Math.max(0, c.currentHP - amount);
          
          // Sync player HP with character state
          if (c.isPlayer && onPlayerHPSync) {
            onPlayerHPSync(newHP);
          }
          
          return { ...c, currentHP: newHP };
        }
        return c;
      });
      break;
    }

    case "heal": {
      const { target, amount } = command.data;
      const targetLower = target?.toLowerCase();
      
      combatants = combatants.map(c => {
        if (c.name.toLowerCase().includes(targetLower)) {
          const newHP = Math.min(c.maxHP, c.currentHP + amount);
          
          // Sync player HP with character state
          if (c.isPlayer && onPlayerHPSync) {
            onPlayerHPSync(newHP);
          }
          
          return { ...c, currentHP: newHP };
        }
        return c;
      });
      break;
    }

    case "add_condition": {
      const { target, condition } = command.data;
      combatants = combatants.map(c => {
        if (c.name.toLowerCase().includes(target?.toLowerCase())) {
          if (!c.conditions.includes(condition)) {
            return { ...c, conditions: [...c.conditions, condition] };
          }
        }
        return c;
      });
      break;
    }

    case "remove_condition": {
      const { target, condition } = command.data;
      combatants = combatants.map(c => {
        if (c.name.toLowerCase().includes(target?.toLowerCase())) {
          return { ...c, conditions: c.conditions.filter(cond => cond !== condition) };
        }
        return c;
      });
      break;
    }

    case "next_turn": {
      if (combatants.length === 0) break;
      
      const activeCombatants = combatants.filter(c => c.isActive && c.currentHP > 0);
      if (activeCombatants.length === 0) break;
      
      let nextIndex = currentTurn + 1;
      if (nextIndex >= combatants.length) {
        nextIndex = 0;
        round++;
      }
      
      // Skip dead combatants
      while (combatants[nextIndex]?.currentHP === 0 && nextIndex < combatants.length) {
        nextIndex++;
        if (nextIndex >= combatants.length) {
          nextIndex = 0;
          round++;
        }
      }
      
      currentTurn = nextIndex;
      break;
    }

    case "set_initiative": {
      const { target, initiative } = command.data;
      combatants = combatants.map(c => {
        if (c.name.toLowerCase().includes(target?.toLowerCase())) {
          return { ...c, initiative };
        }
        return c;
      });
      
      if (isInCombat) {
        combatants = sortByInitiative(combatants);
      }
      break;
    }
  }

  return { combatants, currentTurn, round, isInCombat };
}

// Helper to create example combat commands for the AI prompt
export const COMBAT_COMMAND_EXAMPLES = `
Combat Commands (embed these in your responses to control combat):

Start combat (do NOT add player automatically - request initiative first):
[COMBAT:start_combat]{}[/COMBAT]

After receiving player's initiative roll, add them with their actual initiative:
[COMBAT:add_player]{"initiative": 15}[/COMBAT]

Add enemies (use creature names from bestiary or custom stats):
[COMBAT:add_combatant]{"name": "Goblin", "count": 3}[/COMBAT]
[COMBAT:add_combatant]{"name": "Orc Warrior", "hp": 30, "ac": 14, "initiative": 15}[/COMBAT]

Damage a target (this ALSO updates player's HP if they're the target):
[COMBAT:damage]{"target": "Goblin 1", "amount": 8}[/COMBAT]

Heal a target (this ALSO updates player's HP if they're the target):
[COMBAT:heal]{"target": "PlayerName", "amount": 10}[/COMBAT]

Add/remove conditions:
[COMBAT:add_condition]{"target": "Orc", "condition": "Poisoned"}[/COMBAT]
[COMBAT:remove_condition]{"target": "Orc", "condition": "Poisoned"}[/COMBAT]

Advance turn:
[COMBAT:next_turn]{}[/COMBAT]

End combat:
[COMBAT:end_combat]{}[/COMBAT]
`;
