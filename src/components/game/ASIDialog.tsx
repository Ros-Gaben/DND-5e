import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Sparkles } from "lucide-react";

type AbilityName = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface ASIDialogProps {
  open: boolean;
  onClose: () => void;
  currentScores: AbilityScores;
  newLevel: number;
  onConfirm: (increases: Partial<AbilityScores>) => void;
}

const ABILITY_NAMES: { key: AbilityName; label: string; short: string }[] = [
  { key: "strength", label: "Strength", short: "STR" },
  { key: "dexterity", label: "Dexterity", short: "DEX" },
  { key: "constitution", label: "Constitution", short: "CON" },
  { key: "intelligence", label: "Intelligence", short: "INT" },
  { key: "wisdom", label: "Wisdom", short: "WIS" },
  { key: "charisma", label: "Charisma", short: "CHA" },
];

const ASIDialog = ({ open, onClose, currentScores, newLevel, onConfirm }: ASIDialogProps) => {
  const [increases, setIncreases] = useState<Partial<Record<AbilityName, number>>>({});
  
  const totalPoints = Object.values(increases).reduce((sum, val) => sum + (val || 0), 0);
  const pointsRemaining = 2 - totalPoints;

  const canIncrease = (ability: AbilityName) => {
    const current = currentScores[ability];
    const increase = increases[ability] || 0;
    // Can't exceed 20, can't use more than 2 points total, can't put more than 2 in one stat
    return current + increase < 20 && pointsRemaining > 0 && increase < 2;
  };

  const canDecrease = (ability: AbilityName) => {
    return (increases[ability] || 0) > 0;
  };

  const handleIncrease = (ability: AbilityName) => {
    if (canIncrease(ability)) {
      setIncreases(prev => ({
        ...prev,
        [ability]: (prev[ability] || 0) + 1
      }));
    }
  };

  const handleDecrease = (ability: AbilityName) => {
    if (canDecrease(ability)) {
      setIncreases(prev => ({
        ...prev,
        [ability]: (prev[ability] || 0) - 1
      }));
    }
  };

  const handleConfirm = () => {
    // Convert to actual score increases
    const scoreIncreases: Partial<AbilityScores> = {};
    for (const [key, value] of Object.entries(increases)) {
      if (value && value > 0) {
        scoreIncreases[key as AbilityName] = currentScores[key as AbilityName] + value;
      }
    }
    onConfirm(scoreIncreases);
    setIncreases({});
  };

  const handleClose = () => {
    setIncreases({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-gold">
        <DialogHeader>
          <DialogTitle className="text-gold font-cinzel flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Ability Score Improvement
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You've reached level {newLevel}! Distribute 2 points among your ability scores.
            You can add +2 to one ability or +1 to two different abilities.
            Abilities cannot exceed 20.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-center mb-4">
            <Badge variant="outline" className="text-gold border-gold px-4 py-1">
              Points Remaining: {pointsRemaining}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ABILITY_NAMES.map(({ key, label, short }) => {
              const current = currentScores[key];
              const increase = increases[key] || 0;
              const newValue = current + increase;
              const atMax = current >= 20;

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    increase > 0 ? "border-gold bg-gold/10" : "border-border bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground w-24">{label}</span>
                    <span className="text-muted-foreground text-sm">({short})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${increase > 0 ? "text-gold" : "text-foreground"}`}>
                      {current}
                      {increase > 0 && (
                        <span className="text-green-500 ml-1">+{increase}</span>
                      )}
                    </span>

                    {atMax ? (
                      <Badge variant="secondary" className="text-xs">MAX</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-border"
                          onClick={() => handleDecrease(key)}
                          disabled={!canDecrease(key)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-gold text-gold hover:bg-gold hover:text-background"
                          onClick={() => handleIncrease(key)}
                          disabled={!canIncrease(key)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Skip (Not Recommended)
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={pointsRemaining !== 0}
            className="bg-gradient-gold hover:opacity-90"
          >
            Confirm Improvements
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ASIDialog;
