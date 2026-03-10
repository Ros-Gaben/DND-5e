import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Swords,
  Minus,
  Plus,
  Heart,
  Shield,
  ChevronUp,
  Skull,
  Eye,
  EyeOff,
} from "lucide-react";

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  isPlayer: boolean;
  isActive: boolean;
  conditions: string[];
}

// Combat command types that can be parsed from AI messages
export interface CombatCommand {
  type: "start" | "end" | "add" | "remove" | "damage" | "heal" | "condition" | "next_turn";
  data?: any;
}

interface DMCombatTrackerProps {
  playerName: string;
  playerHP: number;
  playerMaxHP: number;
  playerAC?: number;
  playerInitiative?: number;
  onPlayerHPChange?: (newHP: number) => void;
  // New: Combat state is controlled externally by the DM/AI
  combatants: Combatant[];
  currentTurn: number;
  round: number;
  isInCombat: boolean;
}

const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

export default function DMCombatTracker({
  playerName,
  playerHP,
  playerMaxHP,
  playerAC = 10,
  playerInitiative,
  onPlayerHPChange,
  combatants,
  currentTurn,
  round,
  isInCombat,
}: DMCombatTrackerProps) {
  const [hpModifier, setHpModifier] = useState<{ [key: string]: string }>({});
  const [expanded, setExpanded] = useState(true);

  // Find player in combatants
  const playerCombatant = combatants.find(c => c.isPlayer);
  const isPlayerTurn = isInCombat && currentTurn >= 0 && combatants[currentTurn]?.isPlayer;

  const getHPColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.5) return "bg-green-500";
    if (ratio > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Player can only modify their own HP for tracking damage taken
  const handlePlayerHPChange = (amount: number) => {
    if (!onPlayerHPChange) return;
    const newHP = Math.max(0, Math.min(playerMaxHP, playerHP + amount));
    onPlayerHPChange(newHP);
    setHpModifier({});
  };

  if (!isInCombat && combatants.length === 0) {
    return (
      <Card className="border-gold/30 bg-card/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-gold font-cinzel text-sm">
            <Swords className="w-4 h-4" />
            Combat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            <Swords className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active combat</p>
            <p className="text-xs mt-1">The DM will start combat when enemies appear</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gold/30 bg-card/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle 
          className="flex items-center justify-between text-gold font-cinzel text-sm cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Combat
            {isInCombat && (
              <Badge variant="outline" className="border-red-500 text-red-500 ml-2 animate-pulse">
                ACTIVE
              </Badge>
            )}
          </div>
          {isInCombat && (
            <Badge variant="outline" className="border-gold text-gold">
              Round {round}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {/* Player Turn Indicator */}
          {isPlayerTurn && (
            <div className="p-2 bg-gold/20 border border-gold rounded-lg text-center">
              <p className="text-gold font-semibold text-sm">⚔️ Your Turn!</p>
              <p className="text-xs text-muted-foreground">Choose your action</p>
            </div>
          )}

          {/* Combatants List - Read Only */}
          <ScrollArea className="h-[250px] pr-2">
            <div className="space-y-2">
              {combatants.map((combatant, index) => (
                <div
                  key={combatant.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isInCombat && index === currentTurn
                      ? "border-gold bg-gold/10 shadow-lg shadow-gold/20"
                      : combatant.currentHP === 0
                      ? "border-red-500/30 bg-red-500/5 opacity-60"
                      : combatant.isPlayer
                      ? "border-gold/30 bg-gold/5"
                      : "border-border bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isInCombat && index === currentTurn && (
                        <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                      )}
                      <span
                        className={`font-semibold ${
                          combatant.isPlayer ? "text-gold" : "text-foreground"
                        } ${combatant.currentHP === 0 ? "line-through" : ""}`}
                      >
                        {combatant.name}
                        {combatant.isPlayer && " (You)"}
                      </span>
                      {combatant.currentHP === 0 && (
                        <Skull className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1" title="Initiative">
                        <ChevronUp className="w-3 h-3" />
                        <span>{combatant.initiative}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Armor Class">
                        <Shield className="w-3 h-3" />
                        <span>{combatant.ac}</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getHPColor(
                            combatant.currentHP,
                            combatant.maxHP
                          )}`}
                          style={{ width: `${(combatant.currentHP / combatant.maxHP) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono min-w-[60px] text-right">
                        {combatant.isPlayer ? (
                          // Show actual HP for player
                          `${combatant.currentHP}/${combatant.maxHP}`
                        ) : (
                          // Show health state for enemies
                          combatant.currentHP === 0 ? "Dead" :
                          combatant.currentHP < combatant.maxHP * 0.25 ? "Critical" :
                          combatant.currentHP < combatant.maxHP * 0.5 ? "Bloodied" :
                          combatant.currentHP < combatant.maxHP ? "Wounded" :
                          "Healthy"
                        )}
                      </span>
                    </div>

                    {/* Player HP Controls */}
                    {combatant.isPlayer && (
                      <div className="flex items-center gap-1 mt-2">
                        <Input
                          type="number"
                          placeholder="±HP"
                          value={hpModifier[combatant.id] || ""}
                          onChange={(e) =>
                            setHpModifier((prev) => ({ ...prev, [combatant.id]: e.target.value }))
                          }
                          className="h-7 w-16 text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 text-red-500 border-red-500/30 hover:bg-red-500/20"
                          onClick={() => handlePlayerHPChange(-(parseInt(hpModifier[combatant.id]) || 0))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 text-green-500 border-green-500/30 hover:bg-green-500/20"
                          onClick={() => handlePlayerHPChange(parseInt(hpModifier[combatant.id]) || 0)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Conditions */}
                  {combatant.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {combatant.conditions.map((condition) => (
                        <Badge
                          key={condition}
                          variant="secondary"
                          className="text-xs"
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* DM Control Notice */}
          <div className="text-xs text-center text-muted-foreground border-t border-border pt-2">
            Combat is controlled by the Dungeon Master
          </div>
        </CardContent>
      )}
    </Card>
  );
}
