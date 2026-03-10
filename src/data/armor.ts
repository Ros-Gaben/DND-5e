// D&D 5e Armor Data
export interface ArmorData {
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  baseAC: number;
  maxDexBonus: number | null; // null = no limit, 0 = no dex bonus
  stealthDisadvantage: boolean;
  strengthRequired?: number;
}

export const ARMOR_DATABASE: ArmorData[] = [
  // Light Armor
  { name: "Padded", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: true },
  { name: "Leather", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Leather Armor", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Studded Leather", type: "light", baseAC: 12, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Studded Leather Armor", type: "light", baseAC: 12, maxDexBonus: null, stealthDisadvantage: false },
  
  // Medium Armor
  { name: "Hide", type: "medium", baseAC: 12, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Hide Armor", type: "medium", baseAC: 12, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Chain Shirt", type: "medium", baseAC: 13, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Scale Mail", type: "medium", baseAC: 14, maxDexBonus: 2, stealthDisadvantage: true },
  { name: "Breastplate", type: "medium", baseAC: 14, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Half Plate", type: "medium", baseAC: 15, maxDexBonus: 2, stealthDisadvantage: true },
  
  // Heavy Armor
  { name: "Ring Mail", type: "heavy", baseAC: 14, maxDexBonus: 0, stealthDisadvantage: true },
  { name: "Chain Mail", type: "heavy", baseAC: 16, maxDexBonus: 0, stealthDisadvantage: true, strengthRequired: 13 },
  { name: "Splint", type: "heavy", baseAC: 17, maxDexBonus: 0, stealthDisadvantage: true, strengthRequired: 15 },
  { name: "Splint Armor", type: "heavy", baseAC: 17, maxDexBonus: 0, stealthDisadvantage: true, strengthRequired: 15 },
  { name: "Plate", type: "heavy", baseAC: 18, maxDexBonus: 0, stealthDisadvantage: true, strengthRequired: 15 },
  { name: "Plate Armor", type: "heavy", baseAC: 18, maxDexBonus: 0, stealthDisadvantage: true, strengthRequired: 15 },
  
  // Shields
  { name: "Shield", type: "shield", baseAC: 2, maxDexBonus: 0, stealthDisadvantage: false },
];

export function getArmorData(itemName: string): ArmorData | undefined {
  const lowerName = itemName.toLowerCase();
  return ARMOR_DATABASE.find(armor => 
    armor.name.toLowerCase() === lowerName ||
    lowerName.includes(armor.name.toLowerCase())
  );
}

export function isArmor(itemName: string): boolean {
  return getArmorData(itemName) !== undefined;
}

export function isShield(itemName: string): boolean {
  const armor = getArmorData(itemName);
  return armor?.type === "shield";
}

export interface ACCalculationResult {
  total: number;
  base: number;
  dexBonus: number;
  shieldBonus: number;
  armorName: string | null;
  shieldName: string | null;
  hasStealthDisadvantage: boolean;
}

export function calculateAC(
  equippedItems: { item_name: string; equipped: boolean }[],
  dexterity: number,
  characterClass?: string,
  wisdom?: number,
  constitution?: number
): ACCalculationResult {
  const dexMod = Math.floor((dexterity - 10) / 2);
  const wisMod = wisdom ? Math.floor((wisdom - 10) / 2) : 0;
  const conMod = constitution ? Math.floor((constitution - 10) / 2) : 0;
  
  const equipped = equippedItems.filter(i => i.equipped);
  
  // Find equipped armor and shield
  let equippedArmor: ArmorData | undefined;
  let equippedShield: ArmorData | undefined;
  let armorName: string | null = null;
  let shieldName: string | null = null;
  
  for (const item of equipped) {
    const armorData = getArmorData(item.item_name);
    if (armorData) {
      if (armorData.type === "shield") {
        equippedShield = armorData;
        shieldName = item.item_name;
      } else if (!equippedArmor) {
        equippedArmor = armorData;
        armorName = item.item_name;
      }
    }
  }
  
  let base = 10;
  let dexBonus = dexMod;
  let hasStealthDisadvantage = false;
  
  // Check for unarmored defense (Monk/Barbarian)
  if (!equippedArmor) {
    if (characterClass?.toLowerCase() === "monk") {
      base = 10 + wisMod;
      dexBonus = dexMod;
    } else if (characterClass?.toLowerCase() === "barbarian") {
      base = 10 + conMod;
      dexBonus = dexMod;
    }
  } else {
    base = equippedArmor.baseAC;
    hasStealthDisadvantage = equippedArmor.stealthDisadvantage;
    
    if (equippedArmor.maxDexBonus === 0) {
      dexBonus = 0;
    } else if (equippedArmor.maxDexBonus !== null) {
      dexBonus = Math.min(dexMod, equippedArmor.maxDexBonus);
    }
  }
  
  const shieldBonus = equippedShield ? equippedShield.baseAC : 0;
  
  return {
    total: base + dexBonus + shieldBonus,
    base,
    dexBonus,
    shieldBonus,
    armorName,
    shieldName,
    hasStealthDisadvantage,
  };
}
