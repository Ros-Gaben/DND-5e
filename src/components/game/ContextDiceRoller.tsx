import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dices, 
  Swords, 
  Target, 
  Shield, 
  Heart,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Skull,
  Send,
} from "lucide-react";
import Dice3D from "./Dice3D";
import { useCharacterRolls, RollConfig, CharacterStats, getWeaponData } from "@/hooks/useCharacterRolls";
import { ParsedRollRequest, formatRollResultMessage } from "@/utils/rollRequestParser";
import { RollRequestType } from "@/utils/rollRequestParser";

interface RollResult {
  id: string;
  config: RollConfig;
  rolls: number[];
  total: number;
  isNat20: boolean;
  isNat1: boolean;
  timestamp: Date;
  formattedMessage?: string;
}

interface ContextDiceRollerProps {
  character: CharacterStats | null;
  equippedWeapons: string[];
  pendingRollRequest?: ParsedRollRequest | null;
  onRollComplete?: (result: RollResult, formattedMessage: string) => void;
  onSendToChat?: (message: string) => void;
  isAtZeroHP?: boolean;
  onDeathSave?: (roll: number, isSuccess: boolean, isCritical: boolean) => void;
}

const SKILLS = [
  { name: "Acrobatics", ability: "dexterity" as const },
  { name: "Animal Handling", ability: "wisdom" as const },
  { name: "Arcana", ability: "intelligence" as const },
  { name: "Athletics", ability: "strength" as const },
  { name: "Deception", ability: "charisma" as const },
  { name: "History", ability: "intelligence" as const },
  { name: "Insight", ability: "wisdom" as const },
  { name: "Intimidation", ability: "charisma" as const },
  { name: "Investigation", ability: "intelligence" as const },
  { name: "Medicine", ability: "wisdom" as const },
  { name: "Nature", ability: "intelligence" as const },
  { name: "Perception", ability: "wisdom" as const },
  { name: "Performance", ability: "charisma" as const },
  { name: "Persuasion", ability: "charisma" as const },
  { name: "Religion", ability: "intelligence" as const },
  { name: "Sleight of Hand", ability: "dexterity" as const },
  { name: "Stealth", ability: "dexterity" as const },
  { name: "Survival", ability: "wisdom" as const },
];
type AbilityKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"
const ABILITIES = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
] as const;

export default function ContextDiceRoller({
  character,
  equippedWeapons,
  pendingRollRequest,
  onRollComplete,
  onSendToChat,
  isAtZeroHP = false,
  onDeathSave,
}: ContextDiceRollerProps) {
  const [results, setResults] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<{ dice: number[]; config: RollConfig } | null>(null);
  const [pendingDamage, setPendingDamage] = useState<{ weapon: string; isCritical: boolean } | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [lastRollMessage, setLastRollMessage] = useState<string | null>(null);

  const {
    getAttackRollConfig,
    getDamageRollConfig,
    getInitiativeConfig,
    getSavingThrowConfig,
    getSkillCheckConfig,
    getHitDiceConfig,
    abilityMods,
  } = useCharacterRolls(character);

  // Auto-expand when there's a pending roll request or at 0 HP
  useEffect(() => {
    if (pendingRollRequest || isAtZeroHP) {
      setExpanded(true);
    }
  }, [pendingRollRequest, isAtZeroHP]);

  // Auto-hide Send to Chat button after 30 seconds
  useEffect(() => {
    if (!lastRollMessage) return;
    
    const timeout = setTimeout(() => {
      setLastRollMessage(null);
    }, 30000);
    
    return () => clearTimeout(timeout);
  }, [lastRollMessage]);

  // Death save handler - works independently of DM permission
  const handleDeathSave = useCallback(() => {
    if (isRolling || !isAtZeroHP) return;
    
    setIsRolling(true);
    
    const config: RollConfig = {
      type: "death_save",
      label: "Death Saving Throw",
      dice: { count: 1, sides: 20 },
      modifier: 0,
      modifierBreakdown: [],
    };
    
    // Animation
    const animationDice = [Math.floor(Math.random() * 20) + 1];
    setCurrentRoll({ dice: animationDice, config });
    
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const isNat20 = roll === 20;
      const isNat1 = roll === 1;
      const isSuccess = roll >= 10;
      
      const result: RollResult = {
        id: Math.random().toString(36).substring(2, 9),
        config,
        rolls: [roll],
        total: roll,
        isNat20,
        isNat1,
        timestamp: new Date(),
      };
      
      setResults(prev => [result, ...prev].slice(0, 20));
      setCurrentRoll({ dice: [roll], config });
      setIsRolling(false);
      
      // Notify parent about death save
      onDeathSave?.(roll, isSuccess, isNat20 || isNat1);
      
      // Format message for chat
      let message = `**Death Save:** ${roll}`;
      if (isNat20) {
        message += " - **NATURAL 20!** You regain 1 HP!";
      } else if (isNat1) {
        message += " - *Natural 1!* Two failures!";
      } else if (isSuccess) {
        message += " - Success!";
      } else {
        message += " - Failure!";
      }
      
      onRollComplete?.(result, message);
    }, 800);
  }, [isRolling, isAtZeroHP, onDeathSave, onRollComplete]);

  // Check if a roll type is enabled based on pending request
  const isRollEnabled = useCallback((rollType: string, context?: { weapon?: string; skill?: string; ability?: string }) => {
    // Always allow death saves at 0 HP
    if (rollType === "death_save" && character && character.level > 0) {
      return true; // Death saves handled separately
    }

    if (!pendingRollRequest) return false;

    switch (rollType) {
      case "attack":
        return pendingRollRequest.type === "attack" && 
          (!pendingRollRequest.weapon || !context?.weapon || 
           pendingRollRequest.weapon.toLowerCase().includes(context.weapon.toLowerCase()) ||
           context.weapon.toLowerCase().includes(pendingRollRequest.weapon.toLowerCase()));
      case "damage":
        return pendingRollRequest.type === "damage";
      case "spell_attack":
        return pendingRollRequest.type === "spell_attack";
      case "spell_damage":
        return pendingRollRequest.type === "spell_damage";
      case "initiative":
        return pendingRollRequest.type === "initiative";
      case "saving_throw":
        return pendingRollRequest.type === "saving_throw" && 
          (!pendingRollRequest.ability || !context?.ability || 
           pendingRollRequest.ability.toLowerCase() === context.ability.toLowerCase());
      case "skill_check":
        return pendingRollRequest.type === "skill_check" &&
          (!pendingRollRequest.skill || !context?.skill ||
           pendingRollRequest.skill.toLowerCase() === context.skill.toLowerCase());
      case "hit_dice":
        return pendingRollRequest.type === "hit_dice";
      case "concentration":
        return pendingRollRequest.type === "concentration";
      default:
        return false;
    }
  }, [pendingRollRequest, character]);

  const executeRoll = useCallback((config: RollConfig, rollType?: string, context?: { weapon?: string; spell?: string; skill?: string; ability?: string }) => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    // Generate dice values during animation
    const animationDice = Array(config.dice.count).fill(0).map(() => 
      Math.floor(Math.random() * config.dice.sides) + 1
    );
    setCurrentRoll({ dice: animationDice, config });

    // Complete the roll after animation
    setTimeout(() => {
      const finalRolls = Array(config.dice.count).fill(0).map(() => 
        Math.floor(Math.random() * config.dice.sides) + 1
      );
      
      const rollSum = finalRolls.reduce((a, b) => a + b, 0);
      const total = rollSum + config.modifier;
      const isNat20 = config.dice.sides === 20 && config.dice.count === 1 && finalRolls[0] === 20;
      const isNat1 = config.dice.sides === 20 && config.dice.count === 1 && finalRolls[0] === 1;

      const result: RollResult = {
        id: Math.random().toString(36).substring(2, 9),
        config,
        rolls: finalRolls,
        total,
        isNat20,
        isNat1,
        timestamp: new Date(),
      };

      setResults(prev => [result, ...prev].slice(0, 20));
      setCurrentRoll({ dice: finalRolls, config });
      setIsRolling(false);

      // Format message for chat
      const actualRollType = rollType || pendingRollRequest?.type || "attack";
      const formattedMessage = formatRollResultMessage(
        actualRollType as RollRequestType,
        total,
        finalRolls,
        config.modifier,
        context || {
          weapon: pendingRollRequest?.weapon,
          spell: pendingRollRequest?.spell,
          skill: pendingRollRequest?.skill,
          ability: pendingRollRequest?.ability,
        }
      );

      // Add critical hit info
      let finalMessage = formattedMessage;
      if (isNat20 && (actualRollType === "attack" || actualRollType === "spell_attack")) {
        finalMessage += " **CRITICAL HIT!**";
      } else if (isNat1 && (actualRollType === "attack" || actualRollType === "spell_attack")) {
        finalMessage += " *Critical Miss!*";
      }

      // Store the message for the send button
      setLastRollMessage(finalMessage);
      result.formattedMessage = finalMessage;

      onRollComplete?.(result, finalMessage);
    }, 800);
  }, [isRolling, onRollComplete, pendingRollRequest]);

  const handleAttack = (weaponName: string) => {
    const config = getAttackRollConfig(weaponName);
    if (config) executeRoll(config, "attack", { weapon: weaponName });
  };

  const handleDamage = (weaponName?: string, isCritical?: boolean) => {
    const weapon = weaponName || pendingRollRequest?.weapon || pendingDamage?.weapon;
    const critical = isCritical ?? pendingRollRequest?.critical ?? pendingDamage?.isCritical ?? false;
    if (!weapon) return;
    
    const config = getDamageRollConfig(weapon, critical);
    if (config) {
      executeRoll(config, "damage", { weapon });
      setPendingDamage(null);
    }
  };

  const handleSpellAttack = () => {
    // Use spell attack modifier (INT, WIS, or CHA based on class)
    const spellAbility = getSpellcastingAbility(character?.class || "");
    const mod = abilityMods?.[spellAbility] || 0;
    const profBonus = Math.ceil(1 + (character?.level || 1) / 4);
    
    const config: RollConfig = {
      type: "spell_attack",
      label: `Spell Attack (${pendingRollRequest?.spell || "Spell"})`,
      dice: { count: 1, sides: 20 },
      modifier: mod + profBonus,
      modifierBreakdown: [`${spellAbility.slice(0,3).toUpperCase()} +${mod}`, `Prof +${profBonus}`],
    };
    executeRoll(config, "spell_attack", { spell: pendingRollRequest?.spell });
  };

  const handleSpellDamage = () => {
    // Generic spell damage - the actual dice would come from the spell data
    // For now, use a placeholder that matches common cantrip damage
    const level = character?.level || 1;
    const diceCount = level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
    
    const config: RollConfig = {
      type: "spell_damage",
      label: `Spell Damage (${pendingRollRequest?.spell || "Spell"})`,
      dice: { count: pendingRollRequest?.critical ? diceCount * 2 : diceCount, sides: 10 },
      modifier: 0,
      modifierBreakdown: [],
    };
    executeRoll(config, "spell_damage", { spell: pendingRollRequest?.spell });
  };

  const handleInitiative = () => {
    const config = getInitiativeConfig();
    if (config) executeRoll(config, "initiative");
  };

  const handleSavingThrow = (ability: string) => {
    const config = getSavingThrowConfig(ability as AbilityKey);
    if (config) {
      executeRoll(config, "saving_throw", { ability });
    }
  };

  const handleSkillCheck = (skillName: string) => {
    const skill = SKILLS.find(s => s.name === skillName);
    if (skill) {
      const config = getSkillCheckConfig(skill.name, skill.ability);
      if (config) {
        executeRoll(config, "skill_check", { skill: skill.name, ability: skill.ability });
      }
    }
  };

  const handleHitDice = () => {
    const config = getHitDiceConfig();
    if (config) executeRoll(config, "hit_dice");
  };

  const clearHistory = () => {
    setResults([]);
    setCurrentRoll(null);
    setPendingDamage(null);
  };

  if (!character) {
    return (
      <Card className="border-gold/30 bg-card/95 backdrop-blur">
        <CardContent className="py-8 text-center text-muted-foreground">
          No character loaded
        </CardContent>
      </Card>
    );
  }

  // Get description for pending roll request
  const getRollRequestDescription = () => {
    if (!pendingRollRequest) return null;
    
    switch (pendingRollRequest.type) {
      case "attack":
        return `Roll an attack with ${pendingRollRequest.weapon || "your weapon"}`;
      case "damage":
        return `Roll damage${pendingRollRequest.weapon ? ` for ${pendingRollRequest.weapon}` : ""}${pendingRollRequest.critical ? " (CRITICAL!)" : ""}`;
      case "spell_attack":
        return `Roll a spell attack for ${pendingRollRequest.spell || "your spell"}`;
      case "spell_damage":
        return `Roll spell damage for ${pendingRollRequest.spell || "your spell"}`;
      case "saving_throw":
        return `Make a ${pendingRollRequest.ability || ""} saving throw${pendingRollRequest.dc ? ` (DC ${pendingRollRequest.dc})` : ""}`;
      case "skill_check":
        return `Make a ${pendingRollRequest.skill || ""} check${pendingRollRequest.dc ? ` (DC ${pendingRollRequest.dc})` : ""}`;
      case "initiative":
        return "Roll for initiative!";
      case "concentration":
        return `Make a concentration check${pendingRollRequest.dc ? ` (DC ${pendingRollRequest.dc})` : ""} for ${pendingRollRequest.spell || "your spell"}`;
      case "hit_dice":
        return "Roll hit dice for healing";
      default:
        return "DM requests a roll";
    }
  };

  return (
    <Card className="border-gold/30 bg-card/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle 
          className="flex items-center justify-between text-gold font-cinzel cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Dice Roller
            {pendingRollRequest && (
              <Badge className="bg-gold/20 text-gold animate-pulse ml-2">
                Roll Required!
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {results.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                className="text-muted-foreground h-7"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* DM Roll Request Banner */}
          {pendingRollRequest && (
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/30 animate-pulse">
              <div className="flex items-center gap-2 text-gold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">DM Requests:</span>
              </div>
              <p className="text-foreground text-sm">{getRollRequestDescription()}</p>
            </div>
          )}

          {/* Current Roll Display */}
          {currentRoll && (
            <div className="flex justify-center gap-2 py-4">
              {currentRoll.dice.map((val, idx) => (
                <Dice3D
                  key={idx}
                  sides={currentRoll.config.dice.sides}
                  result={val}
                  isRolling={isRolling}
                  size="lg"
                />
              ))}
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {/* Attack Roll - enabled when DM requests attack */}
              {pendingRollRequest?.type === "attack" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAttack(pendingRollRequest.weapon || equippedWeapons[0] || "Unarmed")}
                  disabled={isRolling}
                  className="border-red-500 text-red-500 hover:bg-red-500/20 text-xs animate-pulse col-span-2"
                >
                  <Swords className="w-3 h-3 mr-1" />
                  Attack Roll ({pendingRollRequest.weapon || equippedWeapons[0] || "Unarmed"})
                </Button>
              )}

              {/* Damage Roll - enabled when DM requests damage */}
              {pendingRollRequest?.type === "damage" && (
                <Button
                  onClick={() => handleDamage(pendingRollRequest.weapon, pendingRollRequest.critical)}
                  className="w-full bg-red-600 hover:bg-red-700 animate-pulse col-span-2"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Roll Damage ({pendingRollRequest.critical ? "CRITICAL!" : pendingRollRequest.weapon || "weapon"})
                </Button>
              )}

              {/* Spell Attack - enabled when DM requests spell attack */}
              {pendingRollRequest?.type === "spell_attack" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSpellAttack}
                  disabled={isRolling}
                  className="border-purple-500 text-purple-500 hover:bg-purple-500/20 text-xs animate-pulse col-span-2"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Spell Attack ({pendingRollRequest.spell || "Spell"})
                </Button>
              )}

              {/* Spell Damage - enabled when DM requests spell damage */}
              {pendingRollRequest?.type === "spell_damage" && (
                <Button
                  onClick={handleSpellDamage}
                  className="w-full bg-purple-600 hover:bg-purple-700 animate-pulse col-span-2"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Spell Damage ({pendingRollRequest.critical ? "CRITICAL!" : pendingRollRequest.spell || "Spell"})
                </Button>
              )}

              {/* Initiative - enabled when DM requests initiative */}
              {pendingRollRequest?.type === "initiative" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitiative}
                  disabled={isRolling}
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/20 text-xs animate-pulse col-span-2"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Roll Initiative!
                </Button>
              )}

              {/* Hit Dice - enabled when DM requests hit dice */}
              {pendingRollRequest?.type === "hit_dice" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHitDice}
                  disabled={isRolling}
                  className="border-green-500 text-green-500 hover:bg-green-500/20 text-xs animate-pulse col-span-2"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  Roll Hit Dice
                </Button>
              )}

              {/* Concentration - enabled when DM requests concentration check */}
              {pendingRollRequest?.type === "concentration" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSavingThrow("constitution")}
                  disabled={isRolling}
                  className="border-blue-500 text-blue-500 hover:bg-blue-500/20 text-xs animate-pulse col-span-2"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Concentration Check (DC {pendingRollRequest.dc || 10})
                </Button>
              )}
            </div>
          </div>

          {/* Saving Throws - show specific button or all options depending on DM request */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">
              Saving Throw
              {pendingRollRequest?.type === "saving_throw" && pendingRollRequest.dc && (
                <span className="text-gold ml-2">(DC {pendingRollRequest.dc})</span>
              )}
            </p>
            {pendingRollRequest?.type === "saving_throw" ? (
              pendingRollRequest.ability ? (
                // Specific save requested
                <Button
                  onClick={() => handleSavingThrow(pendingRollRequest.ability!)}
                  disabled={isRolling}
                  className="w-full bg-blue-600 hover:bg-blue-700 animate-pulse"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {pendingRollRequest.ability.charAt(0).toUpperCase() + pendingRollRequest.ability.slice(1)} Save
                  {pendingRollRequest.dc && ` (DC ${pendingRollRequest.dc})`}
                </Button>
              ) : (
                // Flexible save - show all 6 options
                <div className="grid grid-cols-3 gap-1">
                  {ABILITIES.map((ability) => (
                    <Button
                      key={ability.key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSavingThrow(ability.key)}
                      disabled={isRolling}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/20 text-xs animate-pulse"
                    >
                      {ability.label.slice(0, 3).toUpperCase()}
                    </Button>
                  ))}
                </div>
              )
            ) : (
              <div className="h-8 px-3 flex items-center text-xs text-muted-foreground border border-input rounded-md bg-muted/30 opacity-50 cursor-not-allowed">
                Waiting for DM...
              </div>
            )}
          </div>

          {/* Skill Checks - show specific button or all options depending on DM request */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">
              Skill Check
              {pendingRollRequest?.type === "skill_check" && pendingRollRequest.dc && (
                <span className="text-gold ml-2">(DC {pendingRollRequest.dc})</span>
              )}
            </p>
            {pendingRollRequest?.type === "skill_check" ? (
              pendingRollRequest.skill ? (
                // Specific skill requested
                <Button
                  onClick={() => handleSkillCheck(pendingRollRequest.skill!)}
                  disabled={isRolling}
                  className="w-full bg-green-600 hover:bg-green-700 animate-pulse"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {pendingRollRequest.skill} Check
                  {pendingRollRequest.dc && ` (DC ${pendingRollRequest.dc})`}
                </Button>
              ) : (
                // Flexible skill check - show all skills grouped by ability
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2 pr-2">
                    {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((abilityKey) => {
                      const abilitySkills = SKILLS.filter(s => s.ability === abilityKey);
                      if (abilitySkills.length === 0) return null;
                      return (
                        <div key={abilityKey} className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase">{abilityKey.slice(0, 3)}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {abilitySkills.map((skill) => (
                              <Button
                                key={skill.name}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSkillCheck(skill.name)}
                                disabled={isRolling}
                                className="border-green-500 text-green-400 hover:bg-green-500/20 text-xs animate-pulse justify-start"
                              >
                                {skill.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )
            ) : (
              <div className="h-8 px-3 flex items-center text-xs text-muted-foreground border border-input rounded-md bg-muted/30 opacity-50 cursor-not-allowed">
                Waiting for DM...
              </div>
            )}
          </div>

          {/* Death Saves - ALWAYS available at 0 HP, no DM permission needed */}
          {isAtZeroHP && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-red-400">
                <Skull className="w-5 h-5" />
                <span className="font-semibold text-sm font-cinzel">Death Saving Throw</span>
              </div>
              <p className="text-xs text-red-300">
                You are at 0 HP! Roll a death save - no DM permission needed.
              </p>
              <Button
                onClick={handleDeathSave}
                disabled={isRolling}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Dices className="w-4 h-4 mr-2" />
                {isRolling ? "Rolling..." : "Roll Death Save (d20)"}
              </Button>
              <div className="text-xs text-muted-foreground space-y-1 border-t border-red-500/30 pt-2">
                <p>• <span className="text-green-400">10+</span> = Success | <span className="text-red-400">9 or less</span> = Failure</p>
                <p>• <span className="text-gold">Nat 20</span> = Regain 1 HP | <span className="text-red-400">Nat 1</span> = 2 failures</p>
              </div>
            </div>
          )}

          {/* No pending request message */}
          {!pendingRollRequest && !currentRoll && results.length === 0 && !isAtZeroHP && (
            <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              <Dices className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for DM to request a roll...</p>
              <p className="text-xs mt-1">Describe your action in chat!</p>
            </div>
          )}

          {/* Roll History */}
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-semibold">
                  Roll History ({results.length}/20)
                </p>
                {/* Send to Chat button for latest roll */}
                {lastRollMessage && onSendToChat && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 gap-1 text-xs"
                    onClick={() => {
                      onSendToChat(lastRollMessage);
                      setLastRollMessage(null);
                    }}
                  >
                    <Send className="h-3 w-3" />
                    Send to Chat
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-2">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`p-2 rounded-lg border transition-all ${
                        index === 0
                          ? result.isNat20
                            ? "border-gold bg-gold/20"
                            : result.isNat1
                            ? "border-red-500 bg-red-500/20"
                            : "border-gold/50 bg-gold/10"
                          : "border-border bg-background/50 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {result.config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            [{result.rolls.join(", ")}]
                            {result.config.modifier !== 0 && (
                              <span className="text-gold">
                                {result.config.modifier > 0 ? ` +${result.config.modifier}` : ` ${result.config.modifier}`}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.isNat20 && (
                            <Badge className="bg-gold text-background text-xs">NAT 20!</Badge>
                          )}
                          {result.isNat1 && (
                            <Badge className="bg-red-500 text-white text-xs">NAT 1!</Badge>
                          )}
                          <span className={`text-lg font-bold ${
                            result.isNat20 ? "text-gold" : result.isNat1 ? "text-red-500" : "text-foreground"
                          }`}>
                            {result.total}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.config.modifierBreakdown.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Helper to get spellcasting ability based on class
function getSpellcastingAbility(className: string): "intelligence" | "wisdom" | "charisma" {
  const classLower = className.toLowerCase();
  if (["wizard", "artificer"].includes(classLower)) return "intelligence";
  if (["cleric", "druid", "ranger", "monk"].includes(classLower)) return "wisdom";
  if (["bard", "paladin", "sorcerer", "warlock"].includes(classLower)) return "charisma";
  return "intelligence"; // Default
}
