// 5E Creature/Monster Bestiary

export interface CreatureAbility {
  name: string;
  description: string;
}

export interface CreatureAttack {
  name: string;
  type: "melee" | "ranged";
  toHit: number;
  reach?: string;
  range?: string;
  damage: string;
  damageType: string;
  additionalEffects?: string;
}

export interface CreatureData {
  name: string;
  type: string;
  alignment: string;
  ac: number;
  acType?: string;
  hp: number;
  hitDice: string;
  speed: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: Record<string, number>;
  senses?: string;
  languages?: string;
  cr: string;
  xp: number;
  abilities?: CreatureAbility[];
  attacks: CreatureAttack[];
  tactics: string;
}

// XP by Challenge Rating
export const CR_XP: Record<string, number> = {
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

export const CREATURES: CreatureData[] = [
  // CR 1/8 Creatures
  {
    name: "Kobold",
    type: "Small humanoid",
    alignment: "lawful evil",
    ac: 12,
    hp: 5,
    hitDice: "2d6-2",
    speed: "30 ft.",
    stats: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
    senses: "Darkvision 60 ft., passive Perception 8",
    languages: "Common, Draconic",
    cr: "1/8",
    xp: 25,
    abilities: [
      { name: "Sunlight Sensitivity", description: "Disadvantage on attacks and Perception in sunlight." },
      { name: "Pack Tactics", description: "Advantage on attacks if ally within 5 ft. of target." }
    ],
    attacks: [
      { name: "Dagger", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d4+2", damageType: "piercing" },
      { name: "Sling", type: "ranged", toHit: 4, range: "30/120 ft.", damage: "1d4+2", damageType: "bludgeoning" }
    ],
    tactics: "Kobolds attack in groups, using Pack Tactics. They set traps and ambushes, retreating if outnumbered. They avoid direct sunlight when possible."
  },
  {
    name: "Bandit",
    type: "Medium humanoid",
    alignment: "any non-lawful",
    ac: 12,
    acType: "leather armor",
    hp: 11,
    hitDice: "2d8+2",
    speed: "30 ft.",
    stats: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
    languages: "Common",
    cr: "1/8",
    xp: 25,
    attacks: [
      { name: "Scimitar", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d6+1", damageType: "slashing" },
      { name: "Light Crossbow", type: "ranged", toHit: 3, range: "80/320 ft.", damage: "1d8+1", damageType: "piercing" }
    ],
    tactics: "Bandits prefer ambushes and superior numbers. They demand surrender before fighting and flee if half their number falls."
  },
  {
    name: "Cultist",
    type: "Medium humanoid",
    alignment: "any non-good",
    ac: 12,
    acType: "leather armor",
    hp: 9,
    hitDice: "2d8",
    speed: "30 ft.",
    stats: { str: 11, dex: 12, con: 10, int: 10, wis: 11, cha: 10 },
    skills: { Deception: 2, Religion: 2 },
    languages: "Common",
    cr: "1/8",
    xp: 25,
    abilities: [
      { name: "Dark Devotion", description: "Advantage on saves vs. charmed or frightened." }
    ],
    attacks: [
      { name: "Scimitar", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d6+1", damageType: "slashing" }
    ],
    tactics: "Cultists fight fanatically for their dark patron, rarely retreating. They protect cult leaders and may sacrifice themselves."
  },
  {
    name: "Guard",
    type: "Medium humanoid",
    alignment: "any alignment",
    ac: 16,
    acType: "chain shirt, shield",
    hp: 11,
    hitDice: "2d8+2",
    speed: "30 ft.",
    stats: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
    skills: { Perception: 2 },
    languages: "Common",
    cr: "1/8",
    xp: 25,
    attacks: [
      { name: "Spear", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d6+1", damageType: "piercing" },
      { name: "Spear (thrown)", type: "ranged", toHit: 3, range: "20/60 ft.", damage: "1d6+1", damageType: "piercing" }
    ],
    tactics: "Guards raise alarms and hold positions. They work together to corner enemies and call for reinforcements."
  },

  // CR 1/4 Creatures
  {
    name: "Goblin",
    type: "Small humanoid",
    alignment: "neutral evil",
    ac: 15,
    acType: "leather armor, shield",
    hp: 7,
    hitDice: "2d6",
    speed: "30 ft.",
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    skills: { Stealth: 6 },
    senses: "Darkvision 60 ft., passive Perception 9",
    languages: "Common, Goblin",
    cr: "1/4",
    xp: 50,
    abilities: [
      { name: "Nimble Escape", description: "Can Disengage or Hide as bonus action." }
    ],
    attacks: [
      { name: "Scimitar", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "slashing" },
      { name: "Shortbow", type: "ranged", toHit: 4, range: "80/320 ft.", damage: "1d6+2", damageType: "piercing" }
    ],
    tactics: "Goblins use hit-and-run tactics, taking advantage of Nimble Escape to avoid retaliation. They prefer ambushes and will flee if the fight turns against them."
  },
  {
    name: "Skeleton",
    type: "Medium undead",
    alignment: "lawful evil",
    ac: 13,
    acType: "armor scraps",
    hp: 13,
    hitDice: "2d8+4",
    speed: "30 ft.",
    stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    senses: "Darkvision 60 ft., passive Perception 9",
    languages: "understands languages it knew in life",
    cr: "1/4",
    xp: 50,
    abilities: [
      { name: "Damage Vulnerabilities", description: "Vulnerable to bludgeoning damage." },
      { name: "Damage Immunities", description: "Immune to poison damage." },
      { name: "Condition Immunities", description: "Immune to exhaustion, poisoned." }
    ],
    attacks: [
      { name: "Shortsword", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "piercing" },
      { name: "Shortbow", type: "ranged", toHit: 4, range: "80/320 ft.", damage: "1d6+2", damageType: "piercing" }
    ],
    tactics: "Skeletons follow orders mindlessly, attacking the nearest enemy. They don't retreat unless commanded."
  },
  {
    name: "Zombie",
    type: "Medium undead",
    alignment: "neutral evil",
    ac: 8,
    hp: 22,
    hitDice: "3d8+9",
    speed: "20 ft.",
    stats: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    senses: "Darkvision 60 ft., passive Perception 8",
    languages: "understands languages it knew in life",
    cr: "1/4",
    xp: 50,
    abilities: [
      { name: "Undead Fortitude", description: "When reduced to 0 HP, CON save (DC 5 + damage taken) to drop to 1 HP instead. Doesn't work vs. radiant or critical hits." },
      { name: "Damage Immunities", description: "Immune to poison damage." },
      { name: "Condition Immunities", description: "Immune to poisoned." }
    ],
    attacks: [
      { name: "Slam", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d6+1", damageType: "bludgeoning" }
    ],
    tactics: "Zombies shamble toward the nearest living creature and attack relentlessly. They never retreat and will pursue until destroyed."
  },
  {
    name: "Giant Wolf Spider",
    type: "Medium beast",
    alignment: "unaligned",
    ac: 13,
    hp: 11,
    hitDice: "2d8+2",
    speed: "40 ft., climb 40 ft.",
    stats: { str: 12, dex: 16, con: 13, int: 3, wis: 12, cha: 4 },
    skills: { Perception: 3, Stealth: 7 },
    senses: "Blindsight 10 ft., Darkvision 60 ft., passive Perception 13",
    cr: "1/4",
    xp: 50,
    abilities: [
      { name: "Spider Climb", description: "Can climb difficult surfaces, including upside down on ceilings." },
      { name: "Web Sense", description: "Knows exact location of any creature in contact with the same web." },
      { name: "Web Walker", description: "Ignores movement restrictions from webbing." }
    ],
    attacks: [
      { name: "Bite", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d6+1", damageType: "piercing", additionalEffects: "Target must make DC 11 CON save or take 2d6 poison damage (half on success). If poison reduces target to 0 HP, target is stable but poisoned for 1 hour and paralyzed while poisoned." }
    ],
    tactics: "Giant wolf spiders ambush from above or from hidden burrows. They retreat if badly wounded, using their climbing ability to escape."
  },

  // CR 1/2 Creatures
  {
    name: "Hobgoblin",
    type: "Medium humanoid",
    alignment: "lawful evil",
    ac: 18,
    acType: "chain mail, shield",
    hp: 11,
    hitDice: "2d8+2",
    speed: "30 ft.",
    stats: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 },
    senses: "Darkvision 60 ft., passive Perception 10",
    languages: "Common, Goblin",
    cr: "1/2",
    xp: 100,
    abilities: [
      { name: "Martial Advantage", description: "Once per turn, +2d6 damage if ally within 5 ft. of target." }
    ],
    attacks: [
      { name: "Longsword", type: "melee", toHit: 3, reach: "5 ft.", damage: "1d8+1", damageType: "slashing" },
      { name: "Longbow", type: "ranged", toHit: 3, range: "150/600 ft.", damage: "1d8+1", damageType: "piercing" }
    ],
    tactics: "Hobgoblins fight with military precision, using Martial Advantage by staying near allies. They follow tactical orders and maintain formation."
  },
  {
    name: "Orc",
    type: "Medium humanoid",
    alignment: "chaotic evil",
    ac: 13,
    acType: "hide armor",
    hp: 15,
    hitDice: "2d8+6",
    speed: "30 ft.",
    stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    skills: { Intimidation: 2 },
    senses: "Darkvision 60 ft., passive Perception 10",
    languages: "Common, Orc",
    cr: "1/2",
    xp: 100,
    abilities: [
      { name: "Aggressive", description: "As bonus action, can move up to speed toward hostile creature it can see." }
    ],
    attacks: [
      { name: "Greataxe", type: "melee", toHit: 5, reach: "5 ft.", damage: "1d12+3", damageType: "slashing" },
      { name: "Javelin", type: "ranged", toHit: 5, range: "30/120 ft.", damage: "1d6+3", damageType: "piercing" }
    ],
    tactics: "Orcs charge aggressively, using their Aggressive trait to close distance. They target the weakest-looking enemies first and fight to the death for glory."
  },
  {
    name: "Gnoll",
    type: "Medium humanoid",
    alignment: "chaotic evil",
    ac: 15,
    acType: "hide armor, shield",
    hp: 22,
    hitDice: "5d8",
    speed: "30 ft.",
    stats: { str: 14, dex: 12, con: 11, int: 6, wis: 10, cha: 7 },
    senses: "Darkvision 60 ft., passive Perception 10",
    languages: "Gnoll",
    cr: "1/2",
    xp: 100,
    abilities: [
      { name: "Rampage", description: "When reduces a creature to 0 HP with melee attack, can move up to half speed and make a bite attack as bonus action." }
    ],
    attacks: [
      { name: "Bite", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d4+2", damageType: "piercing" },
      { name: "Spear", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "piercing" },
      { name: "Longbow", type: "ranged", toHit: 3, range: "150/600 ft.", damage: "1d8+1", damageType: "piercing" }
    ],
    tactics: "Gnolls attack in savage packs, focusing on bringing down one enemy to trigger Rampage. They show no mercy and rarely retreat."
  },
  {
    name: "Lizardfolk",
    type: "Medium humanoid",
    alignment: "neutral",
    ac: 15,
    acType: "natural armor, shield",
    hp: 22,
    hitDice: "4d8+4",
    speed: "30 ft., swim 30 ft.",
    stats: { str: 15, dex: 10, con: 13, int: 7, wis: 12, cha: 7 },
    skills: { Perception: 3, Stealth: 4, Survival: 5 },
    senses: "passive Perception 13",
    languages: "Draconic",
    cr: "1/2",
    xp: 100,
    abilities: [
      { name: "Hold Breath", description: "Can hold breath for 15 minutes." }
    ],
    attacks: [
      { name: "Bite", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "piercing" },
      { name: "Heavy Club", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "bludgeoning" },
      { name: "Javelin", type: "ranged", toHit: 4, range: "30/120 ft.", damage: "1d6+2", damageType: "piercing" },
      { name: "Spiked Shield", type: "melee", toHit: 4, reach: "5 ft.", damage: "1d6+2", damageType: "piercing" }
    ],
    tactics: "Lizardfolk are pragmatic combatants, using terrain (especially water) to their advantage. They retreat when outmatched but may return with reinforcements."
  },

  // CR 1 Creatures
  {
    name: "Bugbear",
    type: "Medium humanoid",
    alignment: "chaotic evil",
    ac: 16,
    acType: "hide armor, shield",
    hp: 27,
    hitDice: "5d8+5",
    speed: "30 ft.",
    stats: { str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9 },
    skills: { Stealth: 6, Survival: 2 },
    senses: "Darkvision 60 ft., passive Perception 10",
    languages: "Common, Goblin",
    cr: "1",
    xp: 200,
    abilities: [
      { name: "Brute", description: "Melee weapon deals one extra die of damage (included)." },
      { name: "Surprise Attack", description: "If hits creature that hasn't acted yet, +2d6 extra damage." }
    ],
    attacks: [
      { name: "Morningstar", type: "melee", toHit: 4, reach: "5 ft.", damage: "2d8+2", damageType: "piercing" },
      { name: "Javelin", type: "ranged", toHit: 4, range: "30/120 ft.", damage: "2d6+2", damageType: "piercing" }
    ],
    tactics: "Bugbears are ambush predators, striking from hiding to maximize Surprise Attack damage. They bully weaker creatures into doing their bidding."
  },
  {
    name: "Giant Spider",
    type: "Large beast",
    alignment: "unaligned",
    ac: 14,
    acType: "natural armor",
    hp: 26,
    hitDice: "4d10+4",
    speed: "30 ft., climb 30 ft.",
    stats: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
    skills: { Stealth: 7 },
    senses: "Blindsight 10 ft., Darkvision 60 ft., passive Perception 10",
    cr: "1",
    xp: 200,
    abilities: [
      { name: "Spider Climb", description: "Can climb difficult surfaces, including upside down on ceilings." },
      { name: "Web Sense", description: "Knows exact location of any creature in contact with the same web." },
      { name: "Web Walker", description: "Ignores movement restrictions from webbing." }
    ],
    attacks: [
      { name: "Bite", type: "melee", toHit: 5, reach: "5 ft.", damage: "1d8+3", damageType: "piercing", additionalEffects: "Target must make DC 11 CON save or take 2d8 poison damage (half on success). If poison reduces target to 0 HP, target is stable but poisoned for 1 hour and paralyzed while poisoned." },
      { name: "Web (Recharge 5-6)", type: "ranged", toHit: 5, range: "30/60 ft.", damage: "0", damageType: "none", additionalEffects: "Target is restrained by webbing. Can escape with DC 12 STR check or by dealing 5 damage to the web (AC 10, vulnerable to fire)." }
    ],
    tactics: "Giant spiders use webs to restrain prey, then bite to inject poison. They attack from above when possible and drag paralyzed victims away to feed."
  },
  {
    name: "Ghoul",
    type: "Medium undead",
    alignment: "chaotic evil",
    ac: 12,
    hp: 22,
    hitDice: "5d8",
    speed: "30 ft.",
    stats: { str: 13, dex: 15, con: 10, int: 7, wis: 10, cha: 6 },
    senses: "Darkvision 60 ft., passive Perception 10",
    languages: "Common",
    cr: "1",
    xp: 200,
    abilities: [
      { name: "Damage Immunities", description: "Immune to poison damage." },
      { name: "Condition Immunities", description: "Immune to charmed, exhaustion, poisoned." }
    ],
    attacks: [
      { name: "Bite", type: "melee", toHit: 2, reach: "5 ft.", damage: "2d6+2", damageType: "piercing" },
      { name: "Claws", type: "melee", toHit: 4, reach: "5 ft.", damage: "2d4+2", damageType: "slashing", additionalEffects: "Target must succeed on DC 10 CON save or be paralyzed for 1 minute (elves are immune). Target can repeat save at end of each turn." }
    ],
    tactics: "Ghouls try to paralyze targets with their claws before feasting. They hunt in packs and focus fire on non-elven targets."
  }
];

// Helper functions
export function getCreatureByCR(cr: string): CreatureData[] {
  return CREATURES.filter(c => c.cr === cr);
}

export function getCreatureByName(name: string): CreatureData | undefined {
  return CREATURES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getRandomCreature(maxCR?: string): CreatureData {
  const crOrder = ["0", "1/8", "1/4", "1/2", "1"];
  let filtered = CREATURES;
  
  if (maxCR) {
    const maxIndex = crOrder.indexOf(maxCR);
    if (maxIndex !== -1) {
      filtered = CREATURES.filter(c => crOrder.indexOf(c.cr) <= maxIndex);
    }
  }
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function formatCreatureForDM(creature: CreatureData): string {
  let text = `**${creature.name}** (CR ${creature.cr}, ${creature.xp} XP)\n`;
  text += `*${creature.type}, ${creature.alignment}*\n`;
  text += `AC ${creature.ac}${creature.acType ? ` (${creature.acType})` : ''} | HP ${creature.hp} (${creature.hitDice}) | Speed ${creature.speed}\n`;
  text += `STR ${creature.stats.str} DEX ${creature.stats.dex} CON ${creature.stats.con} INT ${creature.stats.int} WIS ${creature.stats.wis} CHA ${creature.stats.cha}\n`;
  
  if (creature.abilities && creature.abilities.length > 0) {
    text += `\nAbilities:\n`;
    creature.abilities.forEach(a => {
      text += `- ${a.name}: ${a.description}\n`;
    });
  }
  
  text += `\nAttacks:\n`;
  creature.attacks.forEach(a => {
    text += `- ${a.name}: +${a.toHit} to hit, ${a.reach || a.range}, ${a.damage} ${a.damageType}`;
    if (a.additionalEffects) text += `. ${a.additionalEffects}`;
    text += `\n`;
  });
  
  text += `\nTactics: ${creature.tactics}`;
  
  return text;
}
