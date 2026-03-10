import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coffee, 
  Heart, 
  Sparkles,
  Dices,
  Check,
  X,
} from "lucide-react";
import { useHitDice } from "@/hooks/useHitDice";
import { useSpellSlots } from "@/hooks/useSpellSlots";
import { getClassByName } from "@/data/dnd-classes";
import Dice3D from "./Dice3D";

interface ShortRestPanelProps {
  characterId: string;
  characterClass: string;
  characterLevel: number;
  currentHP: number;
  maxHP: number;
  constitution: number;
  onHeal: (amount: number) => void;
  onRestComplete?: () => void;
}

export default function ShortRestPanel({
  characterId,
  characterClass,
  characterLevel,
  currentHP,
  maxHP,
  constitution,
  onHeal,
  onRestComplete,
}: ShortRestPanelProps) {
  const [isResting, setIsResting] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [totalHealed, setTotalHealed] = useState(0);

  const classData = getClassByName(characterClass);
  const hitDie = classData?.hitDie || 8;
  const conMod = Math.floor((constitution - 10) / 2);

  const { hitDiceState, useHitDie, restoreHitDice } = useHitDice(characterId, characterLevel, hitDie);
  const { restoreAllSlots } = useSpellSlots(characterId, characterClass, characterLevel);

  const startRest = () => {
    setIsResting(true);
    setTotalHealed(0);
    setRollResult(null);
  };

  const spendHitDie = useCallback(() => {
    if (currentHP >= maxHP) {
      return; // Already at full HP
    }

    if (!useHitDie()) {
      return; // No hit dice available
    }

    setIsRolling(true);

    // Roll hit die
    setTimeout(() => {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      const healing = Math.max(1, roll + conMod); // Minimum 1 HP healed
      
      // Cap healing at max HP
      const actualHealing = Math.min(healing, maxHP - currentHP);
      
      setRollResult(roll);
      setIsRolling(false);
      
      onHeal(actualHealing);
      setTotalHealed(prev => prev + actualHealing);
    }, 800);
  }, [currentHP, maxHP, hitDie, conMod, useHitDie, onHeal]);

  const finishRest = () => {
    // For Warlocks, restore spell slots on short rest
    if (characterClass === "Warlock") {
      restoreAllSlots();
    }

    setIsResting(false);
    setRollResult(null);
    setTotalHealed(0);
    onRestComplete?.();
  };

  const cancelRest = () => {
    setIsResting(false);
    setRollResult(null);
    setTotalHealed(0);
  };

  const missingHP = maxHP - currentHP;

  if (!isResting) {
    return (
      <Card className="border-gold/30 bg-card/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-gold font-cinzel text-sm">
            <Coffee className="w-4 h-4" />
            Rest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={startRest}
            variant="outline"
            className="w-full border-gold/50 text-gold hover:bg-gold/20"
            disabled={hitDiceState.available === 0 && currentHP >= maxHP}
          >
            <Coffee className="w-4 h-4 mr-2" />
            Take Short Rest
          </Button>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Hit Dice: {hitDiceState.available}/{hitDiceState.total}</span>
            <span>d{hitDie}{conMod >= 0 ? `+${conMod}` : conMod}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gold/30 bg-card/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-gold font-cinzel text-sm">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            Short Rest
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelRest}
            className="h-6 w-6 p-0 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HP Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-foreground">HP</span>
            </div>
            <span className="text-muted-foreground">
              {currentHP}/{maxHP}
              {missingHP > 0 && <span className="text-red-400 ml-1">(-{missingHP})</span>}
            </span>
          </div>
          <Progress value={(currentHP / maxHP) * 100} className="h-2" />
        </div>

        {/* Hit Dice */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Dices className="w-4 h-4 text-gold" />
            <span className="text-sm text-foreground">Hit Dice</span>
          </div>
          <Badge variant="outline" className="text-gold border-gold/50">
            {hitDiceState.available}/{hitDiceState.total} d{hitDie}
          </Badge>
        </div>

        {/* Dice Roll Display */}
        {(isRolling || rollResult !== null) && (
          <div className="flex justify-center py-4">
            <Dice3D
              sides={hitDie}
              result={rollResult ?? undefined}
              isRolling={isRolling}
              size="lg"
            />
          </div>
        )}

        {/* Roll Result */}
        {rollResult !== null && !isRolling && (
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Rolled {rollResult} + {conMod} (CON)
            </p>
            <p className="text-lg font-bold text-green-500">
              +{Math.max(1, rollResult + conMod)} HP
            </p>
          </div>
        )}

        {/* Total Healed */}
        {totalHealed > 0 && (
          <div className="text-center p-2 bg-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">
              Total Healed: <span className="font-bold">+{totalHealed} HP</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={spendHitDie}
            disabled={hitDiceState.available === 0 || currentHP >= maxHP || isRolling}
            className="flex-1 bg-gold hover:bg-gold/80 text-background"
          >
            <Dices className="w-4 h-4 mr-2" />
            Spend Hit Die
          </Button>
          <Button
            onClick={finishRest}
            variant="outline"
            className="border-green-500/50 text-green-500 hover:bg-green-500/20"
            disabled={isRolling}
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>

        {/* Warlock special */}
        {characterClass === "Warlock" && (
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <Sparkles className="w-3 h-3" />
            Pact slots restore on short rest
          </div>
        )}

        {/* Status messages */}
        {currentHP >= maxHP && (
          <p className="text-xs text-center text-green-400">You are at full HP!</p>
        )}
        {hitDiceState.available === 0 && currentHP < maxHP && (
          <p className="text-xs text-center text-muted-foreground">
            No hit dice remaining. Take a long rest to recover.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
