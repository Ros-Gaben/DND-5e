export interface RaceTrait {
  name: string;
  description: string;
}

export interface RaceData {
  name: string;
  abilityBonuses: Record<string, number>;
  traits: RaceTrait[];
  languages: string[];
  speed: number;
  darkvision: number | null;
}

export const RACES: RaceData[] = [
  {
    name: "Human",
    abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    traits: [
      { name: "Versatile", description: "+1 to all ability scores" },
      { name: "Extra Language", description: "Learn one additional language of your choice" }
    ],
    languages: ["Common", "One of choice"],
    speed: 30,
    darkvision: null
  },
  {
    name: "Elf",
    abilityBonuses: { dexterity: 2 },
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Keen Senses", description: "Proficiency in the Perception skill" },
      { name: "Fey Ancestry", description: "Advantage on saving throws against being charmed, magic can't put you to sleep" },
      { name: "Trance", description: "Elves don't need to sleep, instead meditating for 4 hours" }
    ],
    languages: ["Common", "Elvish"],
    speed: 30,
    darkvision: 60
  },
  {
    name: "Dwarf",
    abilityBonuses: { constitution: 2 },
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Dwarven Resilience", description: "Advantage on saving throws against poison, resistance against poison damage" },
      { name: "Dwarven Combat Training", description: "Proficiency with battleaxe, handaxe, throwing hammer, and warhammer" },
      { name: "Stonecunning", description: "Double proficiency bonus for History checks related to stonework" }
    ],
    languages: ["Common", "Dwarvish"],
    speed: 25,
    darkvision: 60
  },
  {
    name: "Halfling",
    abilityBonuses: { dexterity: 2 },
    traits: [
      { name: "Lucky", description: "When you roll a 1 on an attack, ability check, or saving throw, you can reroll" },
      { name: "Brave", description: "Advantage on saving throws against being frightened" },
      { name: "Halfling Nimbleness", description: "You can move through the space of any creature larger than you" }
    ],
    languages: ["Common", "Halfling"],
    speed: 25,
    darkvision: null
  },
  {
    name: "Dragonborn",
    abilityBonuses: { strength: 2, charisma: 1 },
    traits: [
      { name: "Draconic Ancestry", description: "Choose a dragon type for your breath weapon and damage resistance" },
      { name: "Breath Weapon", description: "Exhale destructive energy based on your draconic ancestry" },
      { name: "Damage Resistance", description: "Resistance to the damage type associated with your ancestry" }
    ],
    languages: ["Common", "Draconic"],
    speed: 30,
    darkvision: null
  },
  {
    name: "Gnome",
    abilityBonuses: { intelligence: 2 },
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Gnome Cunning", description: "Advantage on Int, Wis, and Cha saving throws against magic" }
    ],
    languages: ["Common", "Gnomish"],
    speed: 25,
    darkvision: 60
  },
  {
    name: "Half-Elf",
    abilityBonuses: { charisma: 2 },
    flexibleBonuses: 2, // +1 to two other abilities of choice
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Fey Ancestry", description: "Advantage on saving throws against being charmed, magic can't put you to sleep" },
      { name: "Skill Versatility", description: "Gain proficiency in two skills of your choice" }
    ],
    languages: ["Common", "Elvish", "One of choice"],
    speed: 30,
    darkvision: 60
  },
  {
    name: "Half-Orc",
    abilityBonuses: { strength: 2, constitution: 1 },
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Relentless Endurance", description: "When reduced to 0 HP, drop to 1 HP instead (once per long rest)" },
      { name: "Savage Attacks", description: "Roll one additional damage die when scoring a critical hit with melee" }
    ],
    languages: ["Common", "Orc"],
    speed: 30,
    darkvision: 60
  },
  {
    name: "Tiefling",
    abilityBonuses: { charisma: 2, intelligence: 1 },
    traits: [
      { name: "Darkvision", description: "See in dim light within 60 feet as if it were bright light" },
      { name: "Hellish Resistance", description: "Resistance to fire damage" },
      { name: "Infernal Legacy", description: "Know the Thaumaturgy cantrip. At higher levels, gain Hellish Rebuke and Darkness" }
    ],
    languages: ["Common", "Infernal"],
    speed: 30,
    darkvision: 60
  }
] as (RaceData & { flexibleBonuses?: number })[];

export const getRaceByName = (name: string): RaceData | undefined => {
  return RACES.find(r => r.name === name);
};
