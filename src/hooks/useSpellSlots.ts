import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSpellSlots, SpellSlotProgression } from "@/data/spell-slots";
import { useToast } from "@/hooks/use-toast";

interface SpellSlotState {
  [slotLevel: number]: {
    total: number;
    used: number;
  };
}

export const useSpellSlots = (characterId: string | undefined, characterClass: string, characterLevel: number) => {
  const [spellSlots, setSpellSlots] = useState<SpellSlotState>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get max slots from class/level
  const maxSlots = getSpellSlots(characterClass, characterLevel);

  // Fetch used slots from database
  const fetchUsedSlots = useCallback(async () => {
    if (!characterId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("spell_slots")
        .select("slot_level, slots_used")
        .eq("character_id", characterId);

      if (error) throw error;

      // Build state combining max slots with used slots
      const state: SpellSlotState = {};
      for (const [level, total] of Object.entries(maxSlots)) {
        const slotLevel = Number(level);
        const usedRecord = data?.find((d) => d.slot_level === slotLevel);
        state[slotLevel] = {
          total,
          used: usedRecord?.slots_used || 0,
        };
      }
      setSpellSlots(state);
    } catch (error) {
      console.error("Error fetching spell slots:", error);
    } finally {
      setLoading(false);
    }
  }, [characterId, maxSlots]);

  useEffect(() => {
    fetchUsedSlots();
  }, [fetchUsedSlots]);

  // Use a spell slot
  const useSlot = useCallback(async (slotLevel: number): Promise<boolean> => {
    if (!characterId) return false;

    const current = spellSlots[slotLevel];
    if (!current || current.used >= current.total) {
      toast({
        title: "No slots available",
        description: `You have no level ${slotLevel} spell slots remaining.`,
        variant: "destructive",
      });
      return false;
    }

    const newUsed = current.used + 1;

    try {
      // Upsert the slot usage
      const { error } = await supabase
        .from("spell_slots")
        .upsert(
          {
            character_id: characterId,
            slot_level: slotLevel,
            slots_used: newUsed,
          },
          { onConflict: "character_id,slot_level" }
        );

      if (error) throw error;

      // Update local state
      setSpellSlots((prev) => ({
        ...prev,
        [slotLevel]: { ...prev[slotLevel], used: newUsed },
      }));

      return true;
    } catch (error) {
      console.error("Error using spell slot:", error);
      toast({
        title: "Error",
        description: "Failed to use spell slot.",
        variant: "destructive",
      });
      return false;
    }
  }, [characterId, spellSlots, toast]);

  // Restore all spell slots (long rest)
  const restoreAllSlots = useCallback(async () => {
    if (!characterId) return;

    try {
      const { error } = await supabase
        .from("spell_slots")
        .delete()
        .eq("character_id", characterId);

      if (error) throw error;

      // Reset local state
      const state: SpellSlotState = {};
      for (const [level, total] of Object.entries(maxSlots)) {
        state[Number(level)] = { total, used: 0 };
      }
      setSpellSlots(state);

      toast({
        title: "Spell slots restored",
        description: "All spell slots have been restored after your rest.",
      });
    } catch (error) {
      console.error("Error restoring spell slots:", error);
      toast({
        title: "Error",
        description: "Failed to restore spell slots.",
        variant: "destructive",
      });
    }
  }, [characterId, maxSlots, toast]);

  // Get available slot for a spell level (can upcast)
  const getAvailableSlotLevels = useCallback((minLevel: number): number[] => {
    const available: number[] = [];
    for (const [level, { total, used }] of Object.entries(spellSlots)) {
      const slotLevel = Number(level);
      if (slotLevel >= minLevel && used < total) {
        available.push(slotLevel);
      }
    }
    return available.sort((a, b) => a - b);
  }, [spellSlots]);

  return {
    spellSlots,
    loading,
    useSlot,
    restoreAllSlots,
    getAvailableSlotLevels,
    hasSlots: Object.keys(maxSlots).length > 0,
  };
};
