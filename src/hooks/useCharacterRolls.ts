import { useMemo } from "react";
import { getClassByName } from "@/data/dnd-classes";
import { getProficiencyBonus } from "@/data/leveling-system";

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  level: number;
  class: string;
}

export interface WeaponData {
  name: string;
  damageDice: string; // e.g., "1d8", "2d6"
  damageType: string;
  isFinesse: boolean;
  isRanged: boolean;
  properties: string[];
}

// Common D&D 5e weapons with their damage dice
export const WEAPON_DATABASE: Record<string, WeaponData> = {
  // Simple Melee
  "club": { name: "Club", damageDice: "1d4", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["light"] },
  "dagger": { name: "Dagger", damageDice: "1d4", damageType: "piercing", isFinesse: true, isRanged: false, properties: ["finesse", "light", "thrown"] },
  "greatclub": { name: "Greatclub", damageDice: "1d8", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["two-handed"] },
  "handaxe": { name: "Handaxe", damageDice: "1d6", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["light", "thrown"] },
  "javelin": { name: "Javelin", damageDice: "1d6", damageType: "piercing", isFinesse: false, isRanged: false, properties: ["thrown"] },
  "light hammer": { name: "Light Hammer", damageDice: "1d4", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["light", "thrown"] },
  "mace": { name: "Mace", damageDice: "1d6", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: [] },
  "quarterstaff": { name: "Quarterstaff", damageDice: "1d6", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["versatile"] },
  "sickle": { name: "Sickle", damageDice: "1d4", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["light"] },
  "spear": { name: "Spear", damageDice: "1d6", damageType: "piercing", isFinesse: false, isRanged: false, properties: ["thrown", "versatile"] },
  
  // Simple Ranged
  "light crossbow": { name: "Light Crossbow", damageDice: "1d8", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "loading", "two-handed"] },
  "dart": { name: "Dart", damageDice: "1d4", damageType: "piercing", isFinesse: true, isRanged: true, properties: ["finesse", "thrown"] },
  "shortbow": { name: "Shortbow", damageDice: "1d6", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "two-handed"] },
  "sling": { name: "Sling", damageDice: "1d4", damageType: "bludgeoning", isFinesse: false, isRanged: true, properties: ["ammunition"] },
  
  // Martial Melee
  "battleaxe": { name: "Battleaxe", damageDice: "1d8", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["versatile"] },
  "flail": { name: "Flail", damageDice: "1d8", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: [] },
  "glaive": { name: "Glaive", damageDice: "1d10", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["heavy", "reach", "two-handed"] },
  "greataxe": { name: "Greataxe", damageDice: "1d12", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["heavy", "two-handed"] },
  "greatsword": { name: "Greatsword", damageDice: "2d6", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["heavy", "two-handed"] },
  "halberd": { name: "Halberd", damageDice: "1d10", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["heavy", "reach", "two-handed"] },
  "lance": { name: "Lance", damageDice: "1d12", damageType: "piercing", isFinesse: false, isRanged: false, properties: ["reach", "special"] },
  "longsword": { name: "Longsword", damageDice: "1d8", damageType: "slashing", isFinesse: false, isRanged: false, properties: ["versatile"] },
  "maul": { name: "Maul", damageDice: "2d6", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["heavy", "two-handed"] },
  "morningstar": { name: "Morningstar", damageDice: "1d8", damageType: "piercing", isFinesse: false, isRanged: false, properties: [] },
  "pike": { name: "Pike", damageDice: "1d10", damageType: "piercing", isFinesse: false, isRanged: false, properties: ["heavy", "reach", "two-handed"] },
  "rapier": { name: "Rapier", damageDice: "1d8", damageType: "piercing", isFinesse: true, isRanged: false, properties: ["finesse"] },
  "scimitar": { name: "Scimitar", damageDice: "1d6", damageType: "slashing", isFinesse: true, isRanged: false, properties: ["finesse", "light"] },
  "shortsword": { name: "Shortsword", damageDice: "1d6", damageType: "piercing", isFinesse: true, isRanged: false, properties: ["finesse", "light"] },
  "trident": { name: "Trident", damageDice: "1d6", damageType: "piercing", isFinesse: false, isRanged: false, properties: ["thrown", "versatile"] },
  "war pick": { name: "War Pick", damageDice: "1d8", damageType: "piercing", isFinesse: false, isRanged: false, properties: [] },
  "warhammer": { name: "Warhammer", damageDice: "1d8", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: ["versatile"] },
  "whip": { name: "Whip", damageDice: "1d4", damageType: "slashing", isFinesse: true, isRanged: false, properties: ["finesse", "reach"] },
  
  // Martial Ranged
  "blowgun": { name: "Blowgun", damageDice: "1", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "loading"] },
  "hand crossbow": { name: "Hand Crossbow", damageDice: "1d6", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "light", "loading"] },
  "heavy crossbow": { name: "Heavy Crossbow", damageDice: "1d10", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "heavy", "loading", "two-handed"] },
  "longbow": { name: "Longbow", damageDice: "1d8", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "heavy", "two-handed"] },
  "crossbow": { name: "Crossbow", damageDice: "1d8", damageType: "piercing", isFinesse: false, isRanged: true, properties: ["ammunition", "loading", "two-handed"] },
  
  // Unarmed fallback
  "unarmed": { name: "Unarmed Strike", damageDice: "1d1", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: [] },
  "fist": { name: "Unarmed Strike", damageDice: "1d1", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: [] },
  "fists": { name: "Unarmed Strike", damageDice: "1d1", damageType: "bludgeoning", isFinesse: false, isRanged: false, properties: [] },
};

// Common prefixes to strip from weapon names for matching
const WEAPON_PREFIXES = [
  "iron", "steel", "wooden", "rusty", "old", "ancient", "magical", "enchanted",
  "silver", "golden", "bronze", "copper", "cold iron", "adamantine", "mithral",
  "+1", "+2", "+3", "masterwork", "fine", "crude", "broken"
];

// Normalize weapon name for matching
function normalizeWeaponName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove common prefixes
  for (const prefix of WEAPON_PREFIXES) {
    if (normalized.startsWith(prefix + " ")) {
      normalized = normalized.slice(prefix.length + 1).trim();
    }
  }
  
  return normalized;
}

// Improved weapon matching with fuzzy search and fallbacks
export const getWeaponData = (weaponName: string): WeaponData | undefined => {
  const lowerName = weaponName.toLowerCase().trim();
  const normalizedName = normalizeWeaponName(weaponName);
  
  // 1. Direct match
  if (WEAPON_DATABASE[lowerName]) return WEAPON_DATABASE[lowerName];
  if (WEAPON_DATABASE[normalizedName]) return WEAPON_DATABASE[normalizedName];
  
  // 2. Partial match - weapon name contains database key
  for (const [key, data] of Object.entries(WEAPON_DATABASE)) {
    if (lowerName.includes(key) || normalizedName.includes(key)) {
      return data;
    }
  }
  
  // 3. Partial match - database key contains weapon name
  for (const [key, data] of Object.entries(WEAPON_DATABASE)) {
    if (key.includes(normalizedName) && normalizedName.length >= 3) {
      return data;
    }
  }
  
  // 4. Word-by-word match - any word matches a weapon
  const words = normalizedName.split(/\s+/);
  for (const word of words) {
    if (word.length >= 4 && WEAPON_DATABASE[word]) {
      return WEAPON_DATABASE[word];
    }
  }
  
  // 5. Fuzzy match - check if any word is similar to a weapon name
  for (const word of words) {
    for (const [key, data] of Object.entries(WEAPON_DATABASE)) {
      // Simple similarity: starts with same 4+ chars
      if (word.length >= 4 && key.length >= 4 && 
          (word.startsWith(key.slice(0, 4)) || key.startsWith(word.slice(0, 4)))) {
        return data;
      }
    }
  }
  
  console.warn(`Unknown weapon: "${weaponName}", using generic fallback`);
  return undefined;
};

// Get a generic fallback weapon config for unknown weapons
export const getGenericWeaponData = (weaponName: string): WeaponData => {
  return {
    name: weaponName,
    damageDice: "1d6", // Default to 1d6 for unknown weapons
    damageType: "slashing",
    isFinesse: false,
    isRanged: false,
    properties: [],
  };
};

export const parseDamageDice = (dice: string): { count: number; sides: number } => {
  const match = dice.match(/(\d+)d(\d+)/);
  if (match) {
    return { count: parseInt(match[1]), sides: parseInt(match[2]) };
  }
  // Handle "1" for blowgun
  if (/^\d+$/.test(dice)) {
    return { count: 1, sides: parseInt(dice) || 4 };
  }
  return { count: 1, sides: 4 }; // Default
};

export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export interface RollConfig {
  type: "attack" | "damage" | "initiative" | "skill" | "save" | "hitDice" | "custom" | "spell_attack" | "spell_damage" | "concentration" | "death_save";
  label: string;
  dice: { count: number; sides: number };
  modifier: number;
  modifierBreakdown: string[];
  weapon?: WeaponData;
  criticalMultiplier?: number;
}

export function useCharacterRolls(character: CharacterStats | null) {
  const proficiencyBonus = character ? getProficiencyBonus(character.level) : 2;
  const classData = character ? getClassByName(character.class) : null;
  const hitDie = classData?.hitDie || 8;

  const abilityMods = useMemo(() => {
    if (!character) return null;
    return {
      strength: getAbilityModifier(character.strength),
      dexterity: getAbilityModifier(character.dexterity),
      constitution: getAbilityModifier(character.constitution),
      intelligence: getAbilityModifier(character.intelligence),
      wisdom: getAbilityModifier(character.wisdom),
      charisma: getAbilityModifier(character.charisma),
    };
  }, [character]);

  // Get attack roll config for a weapon - now with fallback for unknown weapons
  const getAttackRollConfig = (weaponName: string): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    let weapon = getWeaponData(weaponName);
    
    // Fallback to generic weapon if not found
    if (!weapon) {
      weapon = getGenericWeaponData(weaponName);
    }

    // Determine ability modifier (Dex for ranged/finesse, Str otherwise)
    let abilityMod = abilityMods.strength;
    let abilityName = "STR";
    
    if (weapon.isRanged) {
      abilityMod = abilityMods.dexterity;
      abilityName = "DEX";
    } else if (weapon.isFinesse) {
      // Use higher of STR or DEX
      if (abilityMods.dexterity > abilityMods.strength) {
        abilityMod = abilityMods.dexterity;
        abilityName = "DEX";
      }
    }

    const modifier = abilityMod + proficiencyBonus;
    const modifierBreakdown = [
      `${abilityName} ${abilityMod >= 0 ? "+" : ""}${abilityMod}`,
      `Prof +${proficiencyBonus}`
    ];

    return {
      type: "attack",
      label: `Attack with ${weapon.name}`,
      dice: { count: 1, sides: 20 },
      modifier,
      modifierBreakdown,
      weapon,
    };
  };

  // Get damage roll config for a weapon - now with fallback for unknown weapons
  const getDamageRollConfig = (weaponName: string, isCritical: boolean = false): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    let weapon = getWeaponData(weaponName);
    
    // Fallback to generic weapon if not found
    if (!weapon) {
      weapon = getGenericWeaponData(weaponName);
    }

    const { count, sides } = parseDamageDice(weapon.damageDice);
    
    // Determine ability modifier
    let abilityMod = abilityMods.strength;
    let abilityName = "STR";
    
    if (weapon.isRanged) {
      abilityMod = abilityMods.dexterity;
      abilityName = "DEX";
    } else if (weapon.isFinesse) {
      if (abilityMods.dexterity > abilityMods.strength) {
        abilityMod = abilityMods.dexterity;
        abilityName = "DEX";
      }
    }

    return {
      type: "damage",
      label: `Damage (${weapon.name})`,
      dice: { count: isCritical ? count * 2 : count, sides },
      modifier: abilityMod,
      modifierBreakdown: [`${abilityName} ${abilityMod >= 0 ? "+" : ""}${abilityMod}`],
      weapon,
      criticalMultiplier: isCritical ? 2 : 1,
    };
  };

  // Initiative roll config
  const getInitiativeConfig = (): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    return {
      type: "initiative",
      label: "Initiative",
      dice: { count: 1, sides: 20 },
      modifier: abilityMods.dexterity,
      modifierBreakdown: [`DEX ${abilityMods.dexterity >= 0 ? "+" : ""}${abilityMods.dexterity}`],
    };
  };

  // Saving throw config
  const getSavingThrowConfig = (ability: keyof typeof abilityMods): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    const isProficient = classData?.savingThrows.includes(ability) || false;
    const mod = abilityMods[ability];
    const totalMod = isProficient ? mod + proficiencyBonus : mod;

    const breakdown = [`${ability.toUpperCase().slice(0, 3)} ${mod >= 0 ? "+" : ""}${mod}`];
    if (isProficient) breakdown.push(`Prof +${proficiencyBonus}`);

    return {
      type: "save",
      label: `${ability.charAt(0).toUpperCase() + ability.slice(1)} Save`,
      dice: { count: 1, sides: 20 },
      modifier: totalMod,
      modifierBreakdown: breakdown,
    };
  };

  // Skill check config
  const getSkillCheckConfig = (skillName: string, ability: keyof typeof abilityMods): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    // For now, assume no proficiency (would need skill proficiencies in character data)
    const mod = abilityMods[ability];

    return {
      type: "skill",
      label: `${skillName} Check`,
      dice: { count: 1, sides: 20 },
      modifier: mod,
      modifierBreakdown: [`${ability.toUpperCase().slice(0, 3)} ${mod >= 0 ? "+" : ""}${mod}`],
    };
  };

  // Hit dice for short rest
  const getHitDiceConfig = (): RollConfig | null => {
    if (!character || !abilityMods) return null;
    
    return {
      type: "hitDice",
      label: `Hit Dice (d${hitDie})`,
      dice: { count: 1, sides: hitDie },
      modifier: abilityMods.constitution,
      modifierBreakdown: [`CON ${abilityMods.constitution >= 0 ? "+" : ""}${abilityMods.constitution}`],
    };
  };

  return {
    proficiencyBonus,
    abilityMods,
    hitDie,
    classData,
    getAttackRollConfig,
    getDamageRollConfig,
    getInitiativeConfig,
    getSavingThrowConfig,
    getSkillCheckConfig,
    getHitDiceConfig,
  };
}
