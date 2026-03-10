import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dices, Plus, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AbilityScores, 
  AbilityName, 
  ScoreMethod, 
  calculateModifier, 
  formatModifier 
} from "@/hooks/useAbilityScores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AbilityScoreStepProps {
  method: ScoreMethod;
  onMethodChange: (method: ScoreMethod) => void;
  baseScores: AbilityScores;
  raceBonuses: Record<string, number>;
  onRollAll: () => void;
  isRolled: boolean;
  onAssignScore: (ability: AbilityName, value: number) => void;
  onAdjustPointBuy: (ability: AbilityName, delta: number) => void;
  pointsRemaining: number;
  availableScores: number[];
  recommendedAbilities?: string[];
}

const ABILITY_NAMES: AbilityName[] = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

const ABILITY_LABELS: Record<AbilityName, { short: string; full: string }> = {
  strength: { short: "STR", full: "Strength" },
  dexterity: { short: "DEX", full: "Dexterity" },
  constitution: { short: "CON", full: "Constitution" },
  intelligence: { short: "INT", full: "Intelligence" },
  wisdom: { short: "WIS", full: "Wisdom" },
  charisma: { short: "CHA", full: "Charisma" },
};

const AbilityScoreStep = ({
  method,
  onMethodChange,
  baseScores,
  raceBonuses,
  onRollAll,
  isRolled,
  onAssignScore,
  onAdjustPointBuy,
  pointsRemaining,
  availableScores,
  recommendedAbilities = [],
}: AbilityScoreStepProps) => {
  const getTotalScore = (ability: AbilityName): number => {
    return baseScores[ability] + (raceBonuses[ability] || 0);
  };
  const { t } = useLanguage();

  const renderScoreInput = (ability: AbilityName) => {
    const baseScore = baseScores[ability];
    const bonus = raceBonuses[ability] || 0;
    const total = getTotalScore(ability);
    const modifier = calculateModifier(total);
    const isRecommended = recommendedAbilities.includes(ability);
    const isLowCon = ability === "constitution" && total <= 9;

    if (method === "pointbuy") {
      return (
        <Card
          className={cn(
            "p-4 bg-background/50 border-border text-center relative transition-all",
            isRecommended && "ring-2 ring-gold/50"
          )}
        >
          {isRecommended && (
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-background text-xs">
              {t.recomended}
            </Badge>
          )}
          <Label className="text-xs text-muted-foreground font-cinzel block mb-2">
            {ABILITY_LABELS[ability].full}
          </Label>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 border-border hover:border-gold"
              onClick={() => onAdjustPointBuy(ability, -1)}
              disabled={baseScore <= 8}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold text-gold w-12">{baseScore}</span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 border-border hover:border-gold"
              onClick={() => onAdjustPointBuy(ability, 1)}
              disabled={baseScore >= 15}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {bonus > 0 && (
            <p className="text-xs text-gold animate-pulse">+{bonus} racial</p>
          )}
          <p className="text-xl font-bold text-foreground">{total}</p>
          <p className="text-sm text-muted-foreground">
            Mod: {formatModifier(modifier)}
          </p>
          {isLowCon && (
            <div className="flex items-center gap-1 text-destructive text-xs mt-1">
              <AlertTriangle className="h-3 w-3" />
              Low HP
            </div>
          )}
        </Card>
      );
    }

    // Standard Array or Roll method
    return (
      <Card
        className={cn(
          "p-4 bg-background/50 border-border text-center relative transition-all",
          isRecommended && "ring-2 ring-gold/50"
        )}
      >
        {isRecommended && (
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-background text-xs">
            {t.recomended}
          </Badge>
        )}
        <Label className="text-xs text-muted-foreground font-cinzel block mb-2">
          {ABILITY_LABELS[ability].full}
        </Label>
        <Select
          value={baseScore > 0 ? baseScore.toString() : ""}
          onValueChange={(val) => onAssignScore(ability, parseInt(val))}
        >
          <SelectTrigger className="w-full mb-2 bg-input border-border">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent>
            {baseScore > 0 && (
              <SelectItem value={baseScore.toString()}>
                {baseScore}
              </SelectItem>
            )}
            {availableScores.map((score, idx) => (
              <SelectItem key={`${score}-${idx}`} value={score.toString()}>
                {score}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bonus > 0 && baseScore > 0 && (
          <p className="text-xs text-gold animate-pulse">+{bonus} racial</p>
        )}
        {baseScore > 0 && (
          <>
            <p className="text-xl font-bold text-foreground">{total}</p>
            <p className="text-sm text-muted-foreground">
              Mod: {formatModifier(modifier)}
            </p>
          </>
        )}
        {isLowCon && baseScore > 0 && (
          <div className="flex items-center justify-center gap-1 text-destructive text-xs mt-1">
            <AlertTriangle className="h-3 w-3" />
            Low HP
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.abilityScores}
        </h2>
        <p className="text-muted-foreground">
          {t.abilityScoresDescription}
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant={method === "standard" ? "default" : "outline"}
          className={cn(
            "h-auto py-3 flex-col gap-1",
            method === "standard" ? "bg-gradient-gold" : "border-border hover:border-gold"
          )}
          onClick={() => onMethodChange("standard")}
        >
          <span className="font-cinzel font-bold">{t.standardArray}</span>
          <span className="text-xs opacity-75">15, 14, 13, 12, 10, 8</span>
        </Button>
        <Button
          type="button"
          variant={method === "pointbuy" ? "default" : "outline"}
          className={cn(
            "h-auto py-3 flex-col gap-1",
            method === "pointbuy" ? "bg-gradient-gold" : "border-border hover:border-gold"
          )}
          onClick={() => onMethodChange("pointbuy")}
        >
          <span className="font-cinzel font-bold">{t.pointBuy}</span>
          <span className="text-xs opacity-75">{t.pointsLeft}</span>
        </Button>
        <Button
          type="button"
          variant={method === "roll" ? "default" : "outline"}
          className={cn(
            "h-auto py-3 flex-col gap-1",
            method === "roll" ? "bg-gradient-gold" : "border-border hover:border-gold"
          )}
          onClick={() => onMethodChange("roll")}
        >
          <span className="font-cinzel font-bold">{t.rollDice}</span>
          <span className="text-xs opacity-75">{t.dropLow}</span>
        </Button>
      </div>

      {/* Method-specific controls */}
      {method === "pointbuy" && (
        <Card className="p-4 bg-card/50 border-gold/50 text-center">
          <p className="font-cinzel text-lg">
            {t.pointsRemaining}:{" "}
            <span className={cn(
              "font-bold",
              pointsRemaining > 0 ? "text-gold" : "text-muted-foreground"
            )}>
              {pointsRemaining}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.costValue}
          </p>
        </Card>
      )}

      {method === "roll" && (
        <div className="text-center">
          <Button
            type="button"
            onClick={onRollAll}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-background"
          >
            <Dices className="w-5 h-5 mr-2" />
            {isRolled ? "Roll Again" : "Roll All Stats"}
          </Button>
          {isRolled && availableScores.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {t.availible}: {availableScores.join(", ")}
            </p>
          )}
        </div>
      )}

      {method === "standard" && availableScores.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {t.availible}: {availableScores.join(", ")}
        </p>
      )}

      {/* Ability Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ABILITY_NAMES.map((ability) => (
          <div key={ability}>
            {renderScoreInput(ability)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbilityScoreStep;
