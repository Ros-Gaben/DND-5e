import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getWeaponByName } from "@/data/dnd-equipment";

interface InventoryItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  description: string | null;
  equipped: boolean;
}

// Item types that are consumable and should be decremented/removed when used
const CONSUMABLE_TYPES = ["consumable", "scroll", "ammunition"];

// Specific items that are always consumable regardless of type
const CONSUMABLE_ITEMS = [
  "arrow", "arrows", "bolt", "bolts", "crossbow bolt", "crossbow bolts",
  "potion", "health potion", "healing potion", "mana potion",
  "torch", "ration", "rations", "oil", "flask of oil",
  "holy water", "alchemist's fire", "acid", "antitoxin",
  "caltrops", "ball bearings", "rope", "piton", "pitons"
];

export function useInventory(characterId: string | undefined, onInventoryChange: () => void) {
  const { toast } = useToast();

  const isConsumable = useCallback((item: InventoryItem): boolean => {
    // Check by type first
    if (CONSUMABLE_TYPES.includes(item.item_type)) {
      return true;
    }

    // Throwing weapons are expended when used (e.g., thrown handaxe/dagger/javelin)
    const weapon = getWeaponByName(item.item_name);
    if (weapon?.properties?.some(p => p.toLowerCase().includes("thrown"))) {
      return true;
    }

    // Also check plural forms
    const singularName = item.item_name.toLowerCase().endsWith("s") && !item.item_name.toLowerCase().endsWith("ss")
      ? item.item_name.slice(0, -1)
      : item.item_name;
    const weaponSingular = getWeaponByName(singularName);
    if (weaponSingular?.properties?.some(p => p.toLowerCase().includes("thrown"))) {
      return true;
    }

    // Check by name (case insensitive partial match)
    const lowerName = item.item_name.toLowerCase();
    return CONSUMABLE_ITEMS.some(consumable => 
      lowerName.includes(consumable) || consumable.includes(lowerName)
    );
  }, []);

  const useItem = useCallback(async (item: InventoryItem): Promise<boolean> => {
    if (!characterId) return false;

    // Only consume if it's a consumable type
    if (!isConsumable(item)) {
      return true; // Non-consumable items can still be "used" without being consumed
    }

    try {
      if (item.quantity <= 1) {
        // Remove item entirely
        const { error } = await supabase
          .from("inventory")
          .delete()
          .eq("id", item.id);

        if (error) throw error;

        toast({
          title: `Used ${item.item_name}`,
          description: "Item consumed and removed from inventory",
          duration: 2000,
        });
      } else {
        // Decrement quantity
        const { error } = await supabase
          .from("inventory")
          .update({ quantity: item.quantity - 1 })
          .eq("id", item.id);

        if (error) throw error;

        toast({
          title: `Used ${item.item_name}`,
          description: `${item.quantity - 1} remaining`,
          duration: 2000,
        });
      }

      onInventoryChange();
      return true;
    } catch (error) {
      console.error("Error consuming item:", error);
      toast({
        title: "Error",
        description: "Failed to use item",
        variant: "destructive",
      });
      return false;
    }
  }, [characterId, isConsumable, onInventoryChange, toast]);

  const useItemByName = useCallback(async (
    itemName: string, 
    inventory: InventoryItem[]
  ): Promise<boolean> => {
    const item = inventory.find(
      i => i.item_name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!item) {
      toast({
        title: "Item not found",
        description: `You don't have ${itemName} in your inventory`,
        variant: "destructive",
      });
      return false;
    }

    return useItem(item);
  }, [useItem, toast]);

  return {
    isConsumable,
    useItem,
    useItemByName,
  };
}
