export interface WeaponData {
  name: string;
  damage: string;
  damageType: string;
  properties: string[];
  weight: number;
  category: "simple" | "martial";
  type: "melee" | "ranged";
}

export interface ArmorData {
  name: string;
  ac: number;
  dexBonus: "full" | "max2" | "none";
  strengthRequirement: number | null;
  stealthDisadvantage: boolean;
  weight: number;
  category: "light" | "medium" | "heavy" | "shield";
}

// Weapon Properties Reference
export const WEAPON_PROPERTIES = {
  Ammunition: "You can use a weapon with ammunition only if you have ammunition to fire. Drawing ammunition is part of the attack. You need a free hand to load a one-handed weapon.",
  Finesse: "Use your choice of STR or DEX modifier for attack and damage rolls. Use the same modifier for both.",
  Heavy: "Small creatures have disadvantage on attack rolls with this weapon.",
  Light: "When you attack with a light melee weapon in one hand, you can use a bonus action to attack with a different light melee weapon in your other hand (no ability modifier to damage).",
  Loading: "You can fire only one piece of ammunition per action, bonus action, or reaction, regardless of attacks you can normally make.",
  Range: "Shows normal/long range in feet. Attacks beyond normal range have disadvantage. Can't attack beyond long range.",
  Reach: "Adds 5 feet to your reach for attacks and opportunity attacks.",
  Special: "See weapon's special rules.",
  Thrown: "Can be thrown for a ranged attack using the same ability modifier as melee. Range shown as normal/long.",
  "Two-Handed": "Requires two hands to use.",
  Versatile: "Can be used one or two-handed. Damage in parentheses is two-handed damage."
};

export const WEAPONS: WeaponData[] = [
  // Simple Melee Weapons
  { name: "Club", damage: "1d4", damageType: "bludgeoning", properties: ["Light"], weight: 2, category: "simple", type: "melee" },
  { name: "Dagger", damage: "1d4", damageType: "piercing", properties: ["Finesse", "Light", "Thrown (20/60)"], weight: 1, category: "simple", type: "melee" },
  { name: "Greatclub", damage: "1d8", damageType: "bludgeoning", properties: ["Two-Handed"], weight: 10, category: "simple", type: "melee" },
  { name: "Handaxe", damage: "1d6", damageType: "slashing", properties: ["Light", "Thrown (20/60)"], weight: 2, category: "simple", type: "melee" },
  { name: "Javelin", damage: "1d6", damageType: "piercing", properties: ["Thrown (30/120)"], weight: 2, category: "simple", type: "melee" },
  { name: "Light Hammer", damage: "1d4", damageType: "bludgeoning", properties: ["Light", "Thrown (20/60)"], weight: 2, category: "simple", type: "melee" },
  { name: "Mace", damage: "1d6", damageType: "bludgeoning", properties: [], weight: 4, category: "simple", type: "melee" },
  { name: "Quarterstaff", damage: "1d6", damageType: "bludgeoning", properties: ["Versatile (1d8)"], weight: 4, category: "simple", type: "melee" },
  { name: "Sickle", damage: "1d4", damageType: "slashing", properties: ["Light"], weight: 2, category: "simple", type: "melee" },
  { name: "Spear", damage: "1d6", damageType: "piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], weight: 3, category: "simple", type: "melee" },
  
  // Simple Ranged Weapons
  { name: "Light Crossbow", damage: "1d8", damageType: "piercing", properties: ["Ammunition (80/320)", "Loading", "Two-Handed"], weight: 5, category: "simple", type: "ranged" },
  { name: "Dart", damage: "1d4", damageType: "piercing", properties: ["Finesse", "Thrown (20/60)"], weight: 0.25, category: "simple", type: "ranged" },
  { name: "Shortbow", damage: "1d6", damageType: "piercing", properties: ["Ammunition (80/320)", "Two-Handed"], weight: 2, category: "simple", type: "ranged" },
  { name: "Sling", damage: "1d4", damageType: "bludgeoning", properties: ["Ammunition (30/120)"], weight: 0, category: "simple", type: "ranged" },
  
  // Martial Melee Weapons
  { name: "Battleaxe", damage: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], weight: 4, category: "martial", type: "melee" },
  { name: "Flail", damage: "1d8", damageType: "bludgeoning", properties: [], weight: 2, category: "martial", type: "melee" },
  { name: "Glaive", damage: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-Handed"], weight: 6, category: "martial", type: "melee" },
  { name: "Greataxe", damage: "1d12", damageType: "slashing", properties: ["Heavy", "Two-Handed"], weight: 7, category: "martial", type: "melee" },
  { name: "Greatsword", damage: "2d6", damageType: "slashing", properties: ["Heavy", "Two-Handed"], weight: 6, category: "martial", type: "melee" },
  { name: "Halberd", damage: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-Handed"], weight: 6, category: "martial", type: "melee" },
  { name: "Lance", damage: "1d12", damageType: "piercing", properties: ["Reach", "Special"], weight: 6, category: "martial", type: "melee" },
  { name: "Longsword", damage: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], weight: 3, category: "martial", type: "melee" },
  { name: "Maul", damage: "2d6", damageType: "bludgeoning", properties: ["Heavy", "Two-Handed"], weight: 10, category: "martial", type: "melee" },
  { name: "Morningstar", damage: "1d8", damageType: "piercing", properties: [], weight: 4, category: "martial", type: "melee" },
  { name: "Pike", damage: "1d10", damageType: "piercing", properties: ["Heavy", "Reach", "Two-Handed"], weight: 18, category: "martial", type: "melee" },
  { name: "Rapier", damage: "1d8", damageType: "piercing", properties: ["Finesse"], weight: 2, category: "martial", type: "melee" },
  { name: "Scimitar", damage: "1d6", damageType: "slashing", properties: ["Finesse", "Light"], weight: 3, category: "martial", type: "melee" },
  { name: "Shortsword", damage: "1d6", damageType: "piercing", properties: ["Finesse", "Light"], weight: 2, category: "martial", type: "melee" },
  { name: "Trident", damage: "1d6", damageType: "piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], weight: 4, category: "martial", type: "melee" },
  { name: "War Pick", damage: "1d8", damageType: "piercing", properties: [], weight: 2, category: "martial", type: "melee" },
  { name: "Warhammer", damage: "1d8", damageType: "bludgeoning", properties: ["Versatile (1d10)"], weight: 2, category: "martial", type: "melee" },
  { name: "Whip", damage: "1d4", damageType: "slashing", properties: ["Finesse", "Reach"], weight: 3, category: "martial", type: "melee" },
  
  // Martial Ranged Weapons
  { name: "Hand Crossbow", damage: "1d6", damageType: "piercing", properties: ["Ammunition (30/120)", "Light", "Loading"], weight: 3, category: "martial", type: "ranged" },
  { name: "Heavy Crossbow", damage: "1d10", damageType: "piercing", properties: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], weight: 18, category: "martial", type: "ranged" },
  { name: "Longbow", damage: "1d8", damageType: "piercing", properties: ["Ammunition (150/600)", "Heavy", "Two-Handed"], weight: 2, category: "martial", type: "ranged" },
];

export const ARMOR: ArmorData[] = [
  // Light Armor
  { name: "Padded", ac: 11, dexBonus: "full", strengthRequirement: null, stealthDisadvantage: true, weight: 8, category: "light" },
  { name: "Leather", ac: 11, dexBonus: "full", strengthRequirement: null, stealthDisadvantage: false, weight: 10, category: "light" },
  { name: "Leather Armor", ac: 11, dexBonus: "full", strengthRequirement: null, stealthDisadvantage: false, weight: 10, category: "light" },
  { name: "Studded Leather", ac: 12, dexBonus: "full", strengthRequirement: null, stealthDisadvantage: false, weight: 13, category: "light" },
  
  // Medium Armor
  { name: "Hide", ac: 12, dexBonus: "max2", strengthRequirement: null, stealthDisadvantage: false, weight: 12, category: "medium" },
  { name: "Chain Shirt", ac: 13, dexBonus: "max2", strengthRequirement: null, stealthDisadvantage: false, weight: 20, category: "medium" },
  { name: "Scale Mail", ac: 14, dexBonus: "max2", strengthRequirement: null, stealthDisadvantage: true, weight: 45, category: "medium" },
  { name: "Breastplate", ac: 14, dexBonus: "max2", strengthRequirement: null, stealthDisadvantage: false, weight: 20, category: "medium" },
  { name: "Half Plate", ac: 15, dexBonus: "max2", strengthRequirement: null, stealthDisadvantage: true, weight: 40, category: "medium" },
  
  // Heavy Armor
  { name: "Ring Mail", ac: 14, dexBonus: "none", strengthRequirement: null, stealthDisadvantage: true, weight: 40, category: "heavy" },
  { name: "Chain Mail", ac: 16, dexBonus: "none", strengthRequirement: 13, stealthDisadvantage: true, weight: 55, category: "heavy" },
  { name: "Splint", ac: 17, dexBonus: "none", strengthRequirement: 15, stealthDisadvantage: true, weight: 60, category: "heavy" },
  { name: "Plate", ac: 18, dexBonus: "none", strengthRequirement: 15, stealthDisadvantage: true, weight: 65, category: "heavy" },
  
  // Shields
  { name: "Shield", ac: 2, dexBonus: "none", strengthRequirement: null, stealthDisadvantage: false, weight: 6, category: "shield" },
  { name: "Wooden Shield", ac: 2, dexBonus: "none", strengthRequirement: null, stealthDisadvantage: false, weight: 6, category: "shield" },
];

// Misc equipment data for tooltips
export interface MiscItemData {
  name: string;
  description: string;
  weight: number;
  category: string;
}

export const MISC_ITEMS: MiscItemData[] = [
  // Packs
  { name: "Explorer's Pack", description: "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft rope", weight: 59, category: "pack" },
  { name: "Dungeoneer's Pack", description: "Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 ft rope", weight: 61.5, category: "pack" },
  { name: "Diplomat's Pack", description: "Chest, 2 cases for maps/scrolls, fine clothes, ink, pen, lamp, 2 flasks oil, 5 sheets paper, perfume, sealing wax, soap", weight: 36, category: "pack" },
  { name: "Entertainer's Pack", description: "Backpack, bedroll, 2 costumes, 5 candles, 5 days rations, waterskin, disguise kit", weight: 38, category: "pack" },
  { name: "Priest's Pack", description: "Backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks incense, censer, vestments, 2 days rations, waterskin", weight: 24, category: "pack" },
  { name: "Scholar's Pack", description: "Backpack, book of lore, ink, pen, 10 sheets parchment, little bag of sand, small knife", weight: 10, category: "pack" },
  { name: "Burglar's Pack", description: "Backpack, bag of 1000 ball bearings, 10 ft string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks oil, 5 days rations, tinderbox, waterskin", weight: 44.5, category: "pack" },
  
  // Ammunition
  { name: "20 Arrows", description: "Standard arrows for bows", weight: 1, category: "ammunition" },
  { name: "20 Bolts", description: "Standard bolts for crossbows", weight: 1.5, category: "ammunition" },
  { name: "10 Darts", description: "Throwing darts", weight: 2.5, category: "ammunition" },
  { name: "Quiver of 20 Arrows", description: "Quiver containing 20 arrows", weight: 2, category: "ammunition" },
  
  // Focus Items
  { name: "Holy Symbol", description: "Amulet, emblem, or reliquary representing a deity. Required for casting cleric/paladin spells with material components", weight: 0, category: "focus" },
  { name: "Arcane Focus", description: "Crystal, orb, rod, staff, or wand used to channel arcane spells", weight: 1, category: "focus" },
  { name: "Druidic Focus", description: "Sprig of mistletoe, totem, wooden staff, or yew wand used for druid spells", weight: 0, category: "focus" },
  { name: "Component Pouch", description: "Small waterproof leather belt pouch with compartments for spell components", weight: 2, category: "focus" },
  
  // Instruments
  { name: "Lute", description: "Stringed musical instrument", weight: 2, category: "instrument" },
  { name: "Flute", description: "Wind musical instrument", weight: 1, category: "instrument" },
  { name: "Drum", description: "Percussion musical instrument", weight: 3, category: "instrument" },
  
  // Tools
  { name: "Thieves' Tools", description: "Set of picks, files, pliers, and tools for picking locks and disarming traps", weight: 1, category: "tools" },
  
  // Other
  { name: "Spellbook", description: "Leather-bound book with 100 blank vellum pages for recording spells", weight: 3, category: "spellbook" },
];

export interface ClassEquipmentChoice {
  description: string;
  options: string[][];
}

export const CLASS_STARTING_EQUIPMENT: Record<string, ClassEquipmentChoice[]> = {
  Barbarian: [
    { description: "Primary Weapon", options: [["Greataxe"], ["Battleaxe"], ["Longsword"]] },
    { description: "Secondary Weapon", options: [["Two handaxes"], ["Four javelins"]] },
    { description: "Pack", options: [["Explorer's pack", "4 javelins"]] }
  ],
  Bard: [
    { description: "Weapon", options: [["Rapier"], ["Longsword"], ["Shortsword"]] },
    { description: "Pack", options: [["Diplomat's pack"], ["Entertainer's pack"]] },
    { description: "Instrument", options: [["Lute"], ["Flute"], ["Drum"]] },
    { description: "Extra", options: [["Leather armor", "Dagger"]] }
  ],
  Cleric: [
    { description: "Primary Weapon", options: [["Warhammer"], ["Mace"], ["Quarterstaff"]] },
    { description: "Armor", options: [["Scale mail"], ["Leather armor"], ["Chain mail"]] },
    { description: "Secondary", options: [["Light crossbow", "20 bolts"], ["Shield"]] },
    { description: "Pack", options: [["Priest's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["Holy symbol"]] }
  ],
  Druid: [
    { description: "Shield", options: [["Wooden shield"], ["Quarterstaff"]] },
    { description: "Weapon", options: [["Scimitar"], ["Club"], ["Dagger"]] },
    { description: "Pack", options: [["Leather armor", "Explorer's pack", "Druidic focus"]] }
  ],
  Fighter: [
    { description: "Armor", options: [["Chain mail"], ["Leather armor", "Longbow", "20 arrows"]] },
    { description: "Weapons", options: [["Longsword", "Shield"], ["Two longswords"], ["Battleaxe", "Shield"]] },
    { description: "Ranged", options: [["Light crossbow", "20 bolts"], ["Two handaxes"]] },
    { description: "Pack", options: [["Dungeoneer's pack"], ["Explorer's pack"]] }
  ],
  Monk: [
    { description: "Weapon", options: [["Shortsword"], ["Quarterstaff"], ["Spear"]] },
    { description: "Pack", options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["10 darts"]] }
  ],
  Paladin: [
    { description: "Weapons", options: [["Longsword", "Shield"], ["Two longswords"], ["Warhammer", "Shield"]] },
    { description: "Melee", options: [["Five javelins"], ["Warhammer"], ["Morningstar"]] },
    { description: "Pack", options: [["Priest's pack"], ["Explorer's pack"]] },
    { description: "Armor", options: [["Chain mail", "Holy symbol"]] }
  ],
  Ranger: [
    { description: "Armor", options: [["Scale mail"], ["Leather armor"]] },
    { description: "Weapons", options: [["Two shortswords"], ["Shortsword", "Handaxe"], ["Two handaxes"]] },
    { description: "Pack", options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["Longbow", "Quiver of 20 arrows"]] }
  ],
  Rogue: [
    { description: "Weapon", options: [["Rapier"], ["Shortsword"]] },
    { description: "Ranged", options: [["Shortbow", "Quiver of 20 arrows"], ["Shortsword"]] },
    { description: "Pack", options: [["Burglar's pack"], ["Dungeoneer's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["Leather armor", "Two daggers", "Thieves' tools"]] }
  ],
  Sorcerer: [
    { description: "Ranged", options: [["Light crossbow", "20 bolts"], ["Dagger"], ["Quarterstaff"]] },
    { description: "Focus", options: [["Component pouch"], ["Arcane focus"]] },
    { description: "Pack", options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["Two daggers"]] }
  ],
  Warlock: [
    { description: "Ranged", options: [["Light crossbow", "20 bolts"], ["Dagger"], ["Quarterstaff"]] },
    { description: "Focus", options: [["Component pouch"], ["Arcane focus"]] },
    { description: "Pack", options: [["Scholar's pack"], ["Dungeoneer's pack"]] },
    { description: "Extra", options: [["Leather armor", "Dagger", "Dagger"]] }
  ],
  Wizard: [
    { description: "Weapon", options: [["Quarterstaff"], ["Dagger"]] },
    { description: "Focus", options: [["Component pouch"], ["Arcane focus"]] },
    { description: "Pack", options: [["Scholar's pack"], ["Explorer's pack"]] },
    { description: "Extra", options: [["Spellbook"]] }
  ]
};

// Helper to get item type from name
export function getItemType(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Check weapons
  if (WEAPONS.some(w => w.name.toLowerCase() === lowerName)) {
    return "weapon";
  }
  
  // Check armor
  if (ARMOR.some(a => a.name.toLowerCase() === lowerName)) {
    return "armor";
  }
  
  // Common item categories
  if (lowerName.includes("pack")) return "pack";
  if (lowerName.includes("shield")) return "armor";
  if (lowerName.includes("arrows") || lowerName.includes("bolts") || lowerName.includes("darts")) return "ammunition";
  if (lowerName.includes("focus") || lowerName.includes("pouch") || lowerName.includes("symbol")) return "focus";
  if (lowerName.includes("tools")) return "tools";
  if (lowerName.includes("spellbook")) return "spellbook";
  if (lowerName.includes("lute") || lowerName.includes("flute") || lowerName.includes("drum")) return "instrument";
  if (lowerName.includes("quiver")) return "equipment";
  
  return "equipment";
}

// Helper functions
export function getWeaponByName(name: string): WeaponData | undefined {
  return WEAPONS.find(w => w.name.toLowerCase() === name.toLowerCase());
}

export function getWeaponsByCategory(category: "simple" | "martial"): WeaponData[] {
  return WEAPONS.filter(w => w.category === category);
}

export function getWeaponsByType(type: "melee" | "ranged"): WeaponData[] {
  return WEAPONS.filter(w => w.type === type);
}

export function getArmorByCategory(category: "light" | "medium" | "heavy" | "shield"): ArmorData[] {
  return ARMOR.filter(a => a.category === category);
}
