// 5E XP-based leveling system

// ASI levels (custom: includes level 2 plus standard levels)
export const ASI_LEVELS = [2, 4, 8, 12, 16, 19];

// Check if a level grants ASI
export const isASILevel = (level: number): boolean => ASI_LEVELS.includes(level);

// XP thresholds for levels 1-20
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

// Monster XP by Challenge Rating
export const MONSTER_XP: Record<string, number> = {
  "0": 10,
  "1/8": 25,
  "1/4": 50,
  "1/2": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
};

// Proficiency bonus by level
export const PROFICIENCY_BONUS: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

// Calculate level from XP
export const getLevelFromXP = (xp: number): number => {
  for (let level = 20; level >= 1; level--) {
    if (xp >= XP_THRESHOLDS[level]) {
      return level;
    }
  }
  return 1;
};

// Get XP needed for next level
export const getXPForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= 20) return XP_THRESHOLDS[20];
  return XP_THRESHOLDS[currentLevel + 1];
};

// Get XP progress as percentage toward next level
export const getXPProgress = (xp: number, level: number): number => {
  if (level >= 20) return 100;
  
  const currentThreshold = XP_THRESHOLDS[level];
  const nextThreshold = XP_THRESHOLDS[level + 1];
  const xpIntoLevel = xp - currentThreshold;
  const xpNeededForLevel = nextThreshold - currentThreshold;
  
  return Math.min(100, Math.round((xpIntoLevel / xpNeededForLevel) * 100));
};

// Get proficiency bonus for a level
export const getProficiencyBonus = (level: number): number => {
  return PROFICIENCY_BONUS[Math.min(20, Math.max(1, level))] || 2;
};

// Calculate HP gained on level up (average hit die + con modifier)
export const calculateLevelUpHP = (hitDie: number, conModifier: number): number => {
  // Average hit die value (rounded up) + constitution modifier
  const averageRoll = Math.ceil(hitDie / 2) + 1;
  return Math.max(1, averageRoll + conModifier);
};

// Check if character should level up and return new level if so
export const checkLevelUp = (currentXP: number, currentLevel: number): number | null => {
  const calculatedLevel = getLevelFromXP(currentXP);
  if (calculatedLevel > currentLevel) {
    return calculatedLevel;
  }
  return null;
};

// Calculate all level-up changes
export interface LevelUpResult {
  newLevel: number;
  hpGained: number;
  newMaxHP: number;
  newProficiencyBonus: number;
  oldProficiencyBonus: number;
}

export const calculateLevelUp = (
  currentLevel: number,
  newLevel: number,
  currentMaxHP: number,
  hitDie: number,
  conModifier: number
): LevelUpResult => {
  // Calculate HP gained for each level
  let totalHPGained = 0;
  for (let level = currentLevel + 1; level <= newLevel; level++) {
    totalHPGained += calculateLevelUpHP(hitDie, conModifier);
  }

  return {
    newLevel,
    hpGained: totalHPGained,
    newMaxHP: currentMaxHP + totalHPGained,
    newProficiencyBonus: getProficiencyBonus(newLevel),
    oldProficiencyBonus: getProficiencyBonus(currentLevel),
  };
};

// Parse XP awards from DM messages
export interface XPAward {
  amount: number;
  reason?: string;
}

export const parseXPAwards = (content: string): { text: string; awards: XPAward[] } => {
  const awards: XPAward[] = [];
  const regex = /\[XP_AWARD\](.*?)\[\/XP_AWARD\]/g;
  let text = content;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      awards.push({
        amount: data.amount || 0,
        reason: data.reason || undefined,
      });
    } catch {
      // Try parsing as simple number
      const amount = parseInt(match[1], 10);
      if (!isNaN(amount)) {
        awards.push({ amount });
      }
    }
  }

  // Remove XP award tags from text
  text = content.replace(regex, '').trim();
  return { text, awards };
};
