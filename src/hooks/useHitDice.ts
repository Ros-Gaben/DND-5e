import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HitDiceState {
  total: number;
  used: number;
  available: number;
}

export function useHitDice(characterId: string | undefined, characterLevel: number, hitDie: number) {
  const [hitDiceState, setHitDiceState] = useState<HitDiceState>({
    total: characterLevel,
    used: 0,
    available: characterLevel,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // For now, we'll store hit dice usage in a simple way
  // In a full implementation, this would be a database table
  // Using local storage as a simple solution for now
  const storageKey = `hit_dice_used_${characterId}`;

  useEffect(() => {
    if (!characterId) return;
    
    const loadHitDice = () => {
      const storedUsed = localStorage.getItem(storageKey);
      const used = storedUsed ? parseInt(storedUsed, 10) : 0;
      
      setHitDiceState({
        total: characterLevel,
        used: Math.min(used, characterLevel), // Can't use more than you have
        available: Math.max(0, characterLevel - used),
      });
      setLoading(false);
    };

    loadHitDice();
  }, [characterId, characterLevel, storageKey]);

  const useHitDie = useCallback((): boolean => {
    if (hitDiceState.available <= 0) {
      toast({
        title: "No Hit Dice",
        description: "You have no hit dice remaining",
        variant: "destructive",
      });
      return false;
    }

    const newUsed = hitDiceState.used + 1;
    localStorage.setItem(storageKey, newUsed.toString());
    
    setHitDiceState(prev => ({
      ...prev,
      used: newUsed,
      available: prev.total - newUsed,
    }));

    return true;
  }, [hitDiceState.available, hitDiceState.used, storageKey, toast]);

  // Restore half hit dice on long rest (rounded down, minimum 1)
  const restoreHitDice = useCallback((isLongRest: boolean = false) => {
    if (isLongRest) {
      // Long rest: restore half (rounded down, min 1)
      const restored = Math.max(1, Math.floor(hitDiceState.total / 2));
      const newUsed = Math.max(0, hitDiceState.used - restored);
      
      localStorage.setItem(storageKey, newUsed.toString());
      
      setHitDiceState(prev => ({
        ...prev,
        used: newUsed,
        available: prev.total - newUsed,
      }));

      toast({
        title: "Hit Dice Restored",
        description: `Restored ${restored} hit dice during long rest`,
      });
    }
    // Short rest doesn't restore hit dice, only allows spending them
  }, [hitDiceState.total, hitDiceState.used, storageKey, toast]);

  // Full reset for debugging or special cases
  const resetHitDice = useCallback(() => {
    localStorage.setItem(storageKey, "0");
    setHitDiceState({
      total: characterLevel,
      used: 0,
      available: characterLevel,
    });
  }, [characterLevel, storageKey]);

  return {
    hitDiceState,
    loading,
    hitDie,
    useHitDie,
    restoreHitDice,
    resetHitDice,
  };
}
