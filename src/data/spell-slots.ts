// 5E Spell slot progression by class and level

export interface SpellSlotProgression {
  [slotLevel: number]: number;
}

// Full caster spell slots (Bard, Cleric, Druid, Sorcerer, Wizard)
const FULL_CASTER_SLOTS: Record<number, SpellSlotProgression> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

// Half caster spell slots (Paladin, Ranger)
const HALF_CASTER_SLOTS: Record<number, SpellSlotProgression> = {
  1: {},
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

// Warlock pact magic (fewer slots but recover on short rest)
const WARLOCK_SLOTS: Record<number, SpellSlotProgression> = {
  1: { 1: 1 },
  2: { 1: 2 },
  3: { 2: 2 },
  4: { 2: 2 },
  5: { 3: 2 },
  6: { 3: 2 },
  7: { 4: 2 },
  8: { 4: 2 },
  9: { 5: 2 },
  10: { 5: 2 },
  11: { 5: 3 },
  12: { 5: 3 },
  13: { 5: 3 },
  14: { 5: 3 },
  15: { 5: 3 },
  16: { 5: 3 },
  17: { 5: 4 },
  18: { 5: 4 },
  19: { 5: 4 },
  20: { 5: 4 },
};

const FULL_CASTERS = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
const HALF_CASTERS = ["Paladin", "Ranger"];
const WARLOCK = ["Warlock"];

export const getSpellSlots = (characterClass: string, level: number): SpellSlotProgression => {
  const clampedLevel = Math.min(20, Math.max(1, level));
  
  if (FULL_CASTERS.includes(characterClass)) {
    return FULL_CASTER_SLOTS[clampedLevel] || {};
  }
  if (HALF_CASTERS.includes(characterClass)) {
    return HALF_CASTER_SLOTS[clampedLevel] || {};
  }
  if (WARLOCK.includes(characterClass)) {
    return WARLOCK_SLOTS[clampedLevel] || {};
  }
  
  // Non-spellcasting classes
  return {};
};

export const isSpellcaster = (characterClass: string): boolean => {
  return [...FULL_CASTERS, ...HALF_CASTERS, ...WARLOCK].includes(characterClass);
};

export const getMaxSlotLevel = (characterClass: string, level: number): number => {
  const slots = getSpellSlots(characterClass, level);
  const levels = Object.keys(slots).map(Number);
  return levels.length > 0 ? Math.max(...levels) : 0;
};

export const getTotalSlots = (characterClass: string, level: number): number => {
  const slots = getSpellSlots(characterClass, level);
  return Object.values(slots).reduce((sum, count) => sum + count, 0);
};
