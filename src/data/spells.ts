// 5E Spell Compendium

export interface SpellData {
  name: string;
  level: number; // 0 for cantrips
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
  classes: string[];
}

export const SPELLS: SpellData[] = [
  // Cantrips (Level 0)
  {
    name: "Fire Bolt",
    level: 0,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: "Ranged spell attack. On hit: 1d10 fire damage. Ignites unattended flammable objects. Damage increases: 2d10 at 5th level, 3d10 at 11th level, 4d10 at 17th level.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Mage Hand",
    level: 0,
    school: "Conjuration",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S",
    duration: "1 minute",
    description: "Create a spectral floating hand that can manipulate objects, open doors/containers, stow/retrieve items. Cannot attack, activate magic items, or carry more than 10 lbs. Can move 30 ft. per turn.",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Prestidigitation",
    level: 0,
    school: "Transmutation",
    castingTime: "1 action",
    range: "10 feet",
    components: "V, S",
    duration: "Up to 1 hour",
    description: "Minor magical trick. Effects: harmless sensory effect, light/snuff candle, clean/soil small object, chill/warm/flavor 1 cubic foot of material, make small mark or symbol for 1 hour, create trinket or illusory image for 1 round. Up to 3 non-instantaneous effects active at once.",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Sacred Flame",
    level: 0,
    school: "Evocation",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: "Flame-like radiance descends on target. DEX save or 1d8 radiant damage. No benefit from cover. Damage increases: 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level.",
    classes: ["Cleric"]
  },
  {
    name: "Vicious Mockery",
    level: 0,
    school: "Enchantment",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description: "Unleash insults laced with subtle enchantment. Target must hear you. WIS save or 1d4 psychic damage AND disadvantage on next attack before end of its next turn. Damage increases: 2d4 at 5th level, 3d4 at 11th level, 4d4 at 17th level.",
    classes: ["Bard"]
  },

  // 1st Level Spells
  {
    name: "Cure Wounds",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "Touch",
    components: "V, S",
    duration: "Instantaneous",
    description: "Creature you touch regains 1d8 + spellcasting modifier HP. No effect on undead or constructs.",
    higherLevels: "+1d8 healing per spell slot level above 1st.",
    classes: ["Bard", "Cleric", "Druid", "Paladin", "Ranger"]
  },
  {
    name: "Healing Word",
    level: 1,
    school: "Evocation",
    castingTime: "1 bonus action",
    range: "60 feet",
    components: "V",
    duration: "Instantaneous",
    description: "Creature you can see regains 1d4 + spellcasting modifier HP. No effect on undead or constructs.",
    higherLevels: "+1d4 healing per spell slot level above 1st.",
    classes: ["Bard", "Cleric", "Druid"]
  },
  {
    name: "Bless",
    level: 1,
    school: "Enchantment",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S, M (holy water)",
    duration: "Concentration, up to 1 minute",
    description: "Up to 3 creatures gain +1d4 to attack rolls and saving throws for the duration.",
    higherLevels: "+1 additional creature per spell slot level above 1st.",
    classes: ["Cleric", "Paladin"]
  },
  {
    name: "Magic Missile",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: "Create 3 glowing darts. Each dart hits a creature you can see and deals 1d4+1 force damage. Darts strike simultaneously; can target one or multiple creatures.",
    higherLevels: "+1 dart per spell slot level above 1st.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Shield",
    level: 1,
    school: "Abjuration",
    castingTime: "1 reaction (when hit by attack or targeted by magic missile)",
    range: "Self",
    components: "V, S",
    duration: "1 round",
    description: "Gain +5 AC until start of your next turn, including against the triggering attack. Immune to magic missile for the duration.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Thunderwave",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "Self (15-foot cube)",
    components: "V, S",
    duration: "Instantaneous",
    description: "Wave of thunderous force sweeps out. Each creature in 15-ft cube from you: CON save. Failed: 2d8 thunder damage and pushed 10 ft. Success: half damage, no push. Unsecured objects pushed 10 ft. Thunder audible 300 ft away.",
    higherLevels: "+1d8 damage per spell slot level above 1st.",
    classes: ["Bard", "Druid", "Sorcerer", "Wizard"]
  },
  {
    name: "Sleep",
    level: 1,
    school: "Enchantment",
    castingTime: "1 action",
    range: "90 feet",
    components: "V, S, M (sand, rose petals, or cricket)",
    duration: "1 minute",
    description: "Roll 5d8 = HP of creatures this spell affects. Starting with lowest current HP creature within 20 ft of point, creatures fall unconscious. Subtract each creature's HP from total before moving to next. Undead and immune to charmed unaffected. Sleeper wakes if damaged or someone uses action to wake them.",
    higherLevels: "+2d8 HP affected per spell slot level above 1st.",
    classes: ["Bard", "Sorcerer", "Wizard"]
  },
  {
    name: "Faerie Fire",
    level: 1,
    school: "Evocation",
    castingTime: "1 action",
    range: "60 feet",
    components: "V",
    duration: "Concentration, up to 1 minute",
    description: "Objects and creatures in 20-ft cube outlined in blue, green, or violet light. DEX save or outlined. Outlined creatures/objects shed dim light 10 ft and can't benefit from invisibility. Attack rolls against outlined creatures have advantage.",
    classes: ["Bard", "Druid"]
  },

  // 2nd Level Spells
  {
    name: "Misty Step",
    level: 2,
    school: "Conjuration",
    castingTime: "1 bonus action",
    range: "Self",
    components: "V",
    duration: "Instantaneous",
    description: "Teleport up to 30 ft to unoccupied space you can see. Brief silver mist appears at origin and destination.",
    classes: ["Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Spiritual Weapon",
    level: 2,
    school: "Evocation",
    castingTime: "1 bonus action",
    range: "60 feet",
    components: "V, S",
    duration: "1 minute",
    description: "Create floating, spectral weapon. On cast: melee spell attack against creature within 5 ft of weapon, 1d8 + spellcasting modifier force damage on hit. Bonus action on subsequent turns to move weapon 20 ft and attack. Weapon takes form you choose.",
    higherLevels: "+1d8 damage per two spell slot levels above 2nd.",
    classes: ["Cleric"]
  },
  {
    name: "Hold Person",
    level: 2,
    school: "Enchantment",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (small iron piece)",
    duration: "Concentration, up to 1 minute",
    description: "Humanoid you can see: WIS save or paralyzed. Target can repeat save at end of each turn to end effect.",
    higherLevels: "+1 additional humanoid per spell slot level above 2nd. Targets must be within 30 ft of each other.",
    classes: ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Scorching Ray",
    level: 2,
    school: "Evocation",
    castingTime: "1 action",
    range: "120 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: "Create 3 rays of fire. Make ranged spell attack for each. Can target one creature or several. On hit: 2d6 fire damage per ray.",
    higherLevels: "+1 ray per spell slot level above 2nd.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Shatter",
    level: 2,
    school: "Evocation",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S, M (mica chip)",
    duration: "Instantaneous",
    description: "Loud ringing noise erupts from point within range. Each creature in 10-ft radius sphere: CON save. 3d8 thunder damage on fail, half on success. Creatures made of inorganic material (stone, crystal, metal) have disadvantage. Nonmagical objects not worn/carried also take damage.",
    higherLevels: "+1d8 damage per spell slot level above 2nd.",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"]
  },

  // 3rd Level Spells
  {
    name: "Fireball",
    level: 3,
    school: "Evocation",
    castingTime: "1 action",
    range: "150 feet",
    components: "V, S, M (bat guano and sulfur)",
    duration: "Instantaneous",
    description: "Bright streak from finger to point within range, then blossoms into fire. Each creature in 20-ft radius sphere: DEX save. 8d6 fire damage on fail, half on success. Fire spreads around corners. Ignites flammable objects not worn/carried.",
    higherLevels: "+1d6 damage per spell slot level above 3rd.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Counterspell",
    level: 3,
    school: "Abjuration",
    castingTime: "1 reaction (when you see a creature within 60 ft casting a spell)",
    range: "60 feet",
    components: "S",
    duration: "Instantaneous",
    description: "Attempt to interrupt creature casting spell. If spell is 3rd level or lower, it fails and has no effect. If higher level, make ability check using spellcasting ability (DC 10 + spell's level). On success, spell fails.",
    higherLevels: "Automatically interrupts spells of that level or lower.",
    classes: ["Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Lightning Bolt",
    level: 3,
    school: "Evocation",
    castingTime: "1 action",
    range: "Self (100-foot line)",
    components: "V, S, M (fur and glass rod)",
    duration: "Instantaneous",
    description: "Bolt of lightning 100 ft long, 5 ft wide. Each creature in line: DEX save. 8d6 lightning damage on fail, half on success. Ignites flammable objects not worn/carried.",
    higherLevels: "+1d6 damage per spell slot level above 3rd.",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Haste",
    level: 3,
    school: "Transmutation",
    castingTime: "1 action",
    range: "30 feet",
    components: "V, S, M (licorice root shaving)",
    duration: "Concentration, up to 1 minute",
    description: "Willing creature gains: doubled speed, +2 AC, advantage on DEX saves, additional action each turn (Attack [one weapon attack only], Dash, Disengage, Hide, or Use an Object). When spell ends, target can't move or take actions until after its next turn (wave of lethargy).",
    classes: ["Sorcerer", "Wizard"]
  },
  {
    name: "Hypnotic Pattern",
    level: 3,
    school: "Illusion",
    castingTime: "1 action",
    range: "120 feet",
    components: "S, M (glowing incense or crystal vial)",
    duration: "Concentration, up to 1 minute",
    description: "Twisting pattern of colors in 30-ft cube. Creatures that see pattern: WIS save or charmed (incapacitated, speed 0). Lasts until spell ends, creature takes damage, or someone uses action to shake creature awake.",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"]
  },
  {
    name: "Sleet Storm",
    level: 3,
    school: "Conjuration",
    castingTime: "1 action",
    range: "150 feet",
    components: "V, S, M (dust and water)",
    duration: "Concentration, up to 1 minute",
    description: "Freezing rain and sleet in 40-ft-tall, 20-ft-radius cylinder. Ground becomes difficult terrain. Creature entering area or starting turn there: DEX save or fall prone. Creature concentrating in area: CON save or lose concentration. Area is heavily obscured. Open flames extinguished.",
    classes: ["Druid", "Sorcerer", "Wizard"]
  }
];

// Spell Scroll Rules
export const SPELL_SCROLL_RULES = `
## SPELL SCROLL RULES
When a character finds a spell scroll, they can attempt to cast the spell from it.

### Using a Spell Scroll:
- If the spell is on your class's spell list, you can read the scroll and cast the spell without providing material components.
- If the spell is of a higher level than you can normally cast, you must make an ability check (DC 10 + spell's level) using your spellcasting ability. On a failed check, the spell disappears with no effect.
- Once a spell scroll is used, the writing vanishes and the scroll crumbles to dust.

### Spell Scroll DCs and Attack Bonuses:
| Spell Level | Save DC | Attack Bonus |
|-------------|---------|--------------|
| Cantrip     | 13      | +5           |
| 1st         | 13      | +5           |
| 2nd         | 13      | +5           |
| 3rd         | 15      | +7           |

### Scroll Rarity:
- Cantrip/1st level: Common
- 2nd/3rd level: Uncommon
`;

// Helper functions
export function getSpellsByLevel(level: number): SpellData[] {
  return SPELLS.filter(s => s.level === level);
}

export function getSpellsByClass(className: string): SpellData[] {
  return SPELLS.filter(s => s.classes.some(c => c.toLowerCase() === className.toLowerCase()));
}

export function getSpellByName(name: string): SpellData | undefined {
  return SPELLS.find(s => s.name.toLowerCase() === name.toLowerCase());
}

export function getCantrips(): SpellData[] {
  return SPELLS.filter(s => s.level === 0);
}

export function formatSpellForDM(spell: SpellData): string {
  let text = `**${spell.name}** (${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} ${spell.school})\n`;
  text += `*${spell.castingTime} | ${spell.range} | ${spell.components} | ${spell.duration}*\n`;
  text += spell.description;
  if (spell.higherLevels) {
    text += `\n**At Higher Levels:** ${spell.higherLevels}`;
  }
  text += `\n*Classes: ${spell.classes.join(', ')}*`;
  return text;
}
