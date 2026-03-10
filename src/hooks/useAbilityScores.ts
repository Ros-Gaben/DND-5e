import { useState, useCallback } from "react";

export type AbilityName = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type ScoreMethod = "standard" | "pointbuy" | "roll";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

const rollDice = (): number => {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls.slice(0, 3).reduce((sum, val) => sum + val, 0);
};

export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (mod: number): string => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const useAbilityScores = () => {
  const [method, setMethod] = useState<ScoreMethod>("standard");
  const [baseScores, setBaseScores] = useState<AbilityScores>({
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  });
  const [availableStandardScores, setAvailableStandardScores] = useState<number[]>([]);
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [isRolled, setIsRolled] = useState(false);
  const [pointsRemaining, setPointsRemaining] = useState(27);

  const resetScores = useCallback(() => {
    setBaseScores({
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    });
    setAvailableStandardScores([...STANDARD_ARRAY]);
    setRolledScores([]);
    setIsRolled(false);
    setPointsRemaining(27);
  }, []);

  const changeMethod = useCallback((newMethod: ScoreMethod) => {
    setMethod(newMethod);
    if (newMethod === "standard") {
      setAvailableStandardScores([...STANDARD_ARRAY]);
      setBaseScores({
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      });
    } else if (newMethod === "pointbuy") {
      setBaseScores({
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      });
      setPointsRemaining(27);
    } else {
      setIsRolled(false);
      setRolledScores([]);
      setBaseScores({
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      });
    }
  }, []);

  const rollAllStats = useCallback(() => {
    // Roll 4d6 drop lowest, but cap at 15 for character creation
    const newRolls = Array.from({ length: 6 }, () => {
      const rawRoll = rollDice();
      return Math.min(rawRoll, 15); // Cap at 15
    });
    setRolledScores(newRolls);
    setIsRolled(true);
    setBaseScores({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    });
  }, []);

  const assignScore = useCallback((ability: AbilityName, value: number) => {
    if (method === "standard") {
      // Return current value to available pool if assigned
      const currentValue = baseScores[ability];
      const newAvailable = [...availableStandardScores];
      
      if (currentValue > 0) {
        newAvailable.push(currentValue);
      }
      
      // Remove new value from available
      const idx = newAvailable.indexOf(value);
      if (idx > -1) {
        newAvailable.splice(idx, 1);
      }
      
      newAvailable.sort((a, b) => b - a);
      setAvailableStandardScores(newAvailable);
      setBaseScores(prev => ({ ...prev, [ability]: value }));
    } else if (method === "roll") {
      // Similar logic for rolled scores
      const currentValue = baseScores[ability];
      const newAvailable = [...rolledScores];
      
      if (currentValue > 0) {
        newAvailable.push(currentValue);
      }
      
      const idx = newAvailable.indexOf(value);
      if (idx > -1) {
        newAvailable.splice(idx, 1);
      }
      
      setRolledScores(newAvailable);
      setBaseScores(prev => ({ ...prev, [ability]: value }));
    }
  }, [method, baseScores, availableStandardScores, rolledScores]);

  const adjustPointBuy = useCallback((ability: AbilityName, delta: number) => {
    const currentScore = baseScores[ability];
    const newScore = currentScore + delta;
    
    if (newScore < 8 || newScore > 15) return;
    
    const currentCost = POINT_BUY_COSTS[currentScore];
    const newCost = POINT_BUY_COSTS[newScore];
    const costDiff = newCost - currentCost;
    
    if (costDiff > pointsRemaining) return;
    
    setPointsRemaining(prev => prev - costDiff);
    setBaseScores(prev => ({ ...prev, [ability]: newScore }));
  }, [baseScores, pointsRemaining]);

  const getAvailableScores = useCallback((): number[] => {
    if (method === "standard") return availableStandardScores;
    if (method === "roll") return rolledScores;
    return [];
  }, [method, availableStandardScores, rolledScores]);

  const isComplete = useCallback((): boolean => {
    const allAssigned = Object.values(baseScores).every(v => v > 0);
    if (method === "roll" && !isRolled) return false;
    if (method === "pointbuy" && pointsRemaining > 0) return false;
    return allAssigned;
  }, [baseScores, method, isRolled, pointsRemaining]);

  return {
    method,
    changeMethod,
    baseScores,
    setBaseScores,
    rollAllStats,
    isRolled,
    assignScore,
    adjustPointBuy,
    pointsRemaining,
    getAvailableScores,
    isComplete,
    resetScores,
  };
};
