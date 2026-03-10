export interface ClassData {
  name: string;
  hitDie: number;
  primaryAbilities: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  isSpellcaster: boolean;
  spellcastingAbility: string | null;
  description: string;
  type: "martial" | "spellcaster" | "hybrid";
}

export const CLASSES: ClassData[] = [
  {
    name: "Barbarian",
    hitDie: 12,
    primaryAbilities: ["strength", "constitution"],
    savingThrows: ["strength", "constitution"],
    armorProficiencies: ["Light", "Medium", "Shields"],
    weaponProficiencies: ["Simple", "Martial"],
    isSpellcaster: false,
    spellcastingAbility: null,
    description: "A fierce warrior fueled by primal rage",
    type: "martial"
  },
  {
    name: "Bard",
    hitDie: 8,
    primaryAbilities: ["charisma"],
    savingThrows: ["dexterity", "charisma"],
    armorProficiencies: ["Light"],
    weaponProficiencies: ["Simple", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    isSpellcaster: true,
    spellcastingAbility: "charisma",
    description: "An inspiring magician wielding music and magic",
    type: "spellcaster"
  },
  {
    name: "Cleric",
    hitDie: 8,
    primaryAbilities: ["wisdom"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["Light", "Medium", "Shields"],
    weaponProficiencies: ["Simple"],
    isSpellcaster: true,
    spellcastingAbility: "wisdom",
    description: "A priestly champion wielding divine magic",
    type: "spellcaster"
  },
  {
    name: "Druid",
    hitDie: 8,
    primaryAbilities: ["wisdom"],
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: ["Light", "Medium (non-metal)", "Shields (non-metal)"],
    weaponProficiencies: ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
    isSpellcaster: true,
    spellcastingAbility: "wisdom",
    description: "A priest of the Old Faith, wielding the powers of nature",
    type: "spellcaster"
  },
  {
    name: "Fighter",
    hitDie: 10,
    primaryAbilities: ["strength", "dexterity"],
    savingThrows: ["strength", "constitution"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple", "Martial"],
    isSpellcaster: false,
    spellcastingAbility: null,
    description: "A master of martial combat, skilled with weapons and armor",
    type: "martial"
  },
  {
    name: "Monk",
    hitDie: 8,
    primaryAbilities: ["dexterity", "wisdom"],
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple", "Shortswords"],
    isSpellcaster: false,
    spellcastingAbility: null,
    description: "A martial arts master harnessing body and mind",
    type: "martial"
  },
  {
    name: "Paladin",
    hitDie: 10,
    primaryAbilities: ["strength", "charisma"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple", "Martial"],
    isSpellcaster: true,
    spellcastingAbility: "charisma",
    description: "A holy warrior bound to a sacred oath",
    type: "hybrid"
  },
  {
    name: "Ranger",
    hitDie: 10,
    primaryAbilities: ["dexterity", "wisdom"],
    savingThrows: ["strength", "dexterity"],
    armorProficiencies: ["Light", "Medium", "Shields"],
    weaponProficiencies: ["Simple", "Martial"],
    isSpellcaster: true,
    spellcastingAbility: "wisdom",
    description: "A warrior who combats threats on the edges of civilization",
    type: "hybrid"
  },
  {
    name: "Rogue",
    hitDie: 8,
    primaryAbilities: ["dexterity"],
    savingThrows: ["dexterity", "intelligence"],
    armorProficiencies: ["Light"],
    weaponProficiencies: ["Simple", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    isSpellcaster: false,
    spellcastingAbility: null,
    description: "A scoundrel using stealth and trickery to overcome obstacles",
    type: "martial"
  },
  {
    name: "Sorcerer",
    hitDie: 6,
    primaryAbilities: ["charisma"],
    savingThrows: ["constitution", "charisma"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
    isSpellcaster: true,
    spellcastingAbility: "charisma",
    description: "A spellcaster drawing magic from innate power",
    type: "spellcaster"
  },
  {
    name: "Warlock",
    hitDie: 8,
    primaryAbilities: ["charisma"],
    savingThrows: ["wisdom", "charisma"],
    armorProficiencies: ["Light"],
    weaponProficiencies: ["Simple"],
    isSpellcaster: true,
    spellcastingAbility: "charisma",
    description: "A wielder of magic derived from a bargain with an extraplanar entity",
    type: "spellcaster"
  },
  {
    name: "Wizard",
    hitDie: 6,
    primaryAbilities: ["intelligence"],
    savingThrows: ["intelligence", "wisdom"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
    isSpellcaster: true,
    spellcastingAbility: "intelligence",
    description: "A scholarly magic-user capable of manipulating the fabric of reality",
    type: "spellcaster"
  }
];

export const getClassByName = (name: string): ClassData | undefined => {
  return CLASSES.find(c => c.name === name);
};
