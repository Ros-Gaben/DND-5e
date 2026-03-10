import { Swords, Check, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getWeaponByName, WeaponData } from "@/data/dnd-equipment";

interface InventoryItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  description: string | null;
  equipped: boolean;
}

interface WeaponSlotsProps {
  inventory: InventoryItem[];
  onInventoryChange: () => void;
}

const WeaponSlots = ({ inventory, onInventoryChange }: WeaponSlotsProps) => {
  const { toast } = useToast();

  // Get all weapon items from inventory
  const weaponItems = inventory.filter(item => item.item_type === "weapon");
  const equippedWeapons = weaponItems.filter(item => item.equipped);

  const getWeaponInfo = (itemName: string): WeaponData | null => {
    const weaponData = getWeaponByName(itemName);
    return weaponData || null;
  };

  const isTwoHanded = (weapon: WeaponData | null): boolean => {
    if (!weapon) return false;
    return weapon.properties.some(p => p.includes("Two-Handed"));
  };

  const handleToggleEquip = async (item: InventoryItem) => {
    try {
      const weaponData = getWeaponInfo(item.item_name);
      const isEquipping = !item.equipped;
      const isTwoHandedWeapon = isTwoHanded(weaponData);

      if (isEquipping) {
        // If equipping a two-handed weapon, unequip all other weapons
        if (isTwoHandedWeapon) {
          for (const otherItem of equippedWeapons) {
            if (otherItem.id !== item.id) {
              await supabase
                .from("inventory")
                .update({ equipped: false })
                .eq("id", otherItem.id);
            }
          }
        } else {
          // For one-handed weapons, check if we already have 2 equipped or a two-handed equipped
          const hasEquippedTwoHander = equippedWeapons.some(w => {
            const data = getWeaponInfo(w.item_name);
            return isTwoHanded(data);
          });

          if (hasEquippedTwoHander) {
            // Unequip the two-handed weapon first
            for (const otherItem of equippedWeapons) {
              await supabase
                .from("inventory")
                .update({ equipped: false })
                .eq("id", otherItem.id);
            }
          } else if (equippedWeapons.length >= 2) {
            // Already have 2 weapons, unequip the oldest one
            const oldestWeapon = equippedWeapons[0];
            await supabase
              .from("inventory")
              .update({ equipped: false })
              .eq("id", oldestWeapon.id);
          }
        }
      }

      // Toggle this item
      const { error } = await supabase
        .from("inventory")
        .update({ equipped: isEquipping })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: isEquipping ? "Weapon Equipped" : "Weapon Unequipped",
        description: item.item_name,
        duration: 2000,
      });

      onInventoryChange();
    } catch (error) {
      console.error("Error toggling weapon:", error);
      toast({
        title: "Error",
        description: "Failed to change weapon",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Swords className="w-4 h-4 text-red-500" />
        <span className="font-semibold text-foreground">Weapons</span>
        {equippedWeapons.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {equippedWeapons.length}/2 equipped
          </Badge>
        )}
      </div>

      {weaponItems.length === 0 ? (
        <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
          No weapons in inventory
        </div>
      ) : (
        <div className="space-y-1">
          {weaponItems.map(item => {
            const weaponData = getWeaponInfo(item.item_name);
            const twoHanded = isTwoHanded(weaponData);
            
            return (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={item.equipped ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleToggleEquip(item)}
                      className={`w-full justify-between h-auto py-2 ${
                        item.equipped ? "bg-red-500/10 border border-red-500/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{item.item_name}</span>
                        {weaponData && (
                          <Badge variant="outline" className="text-xs">
                            {weaponData.damage}
                          </Badge>
                        )}
                        {twoHanded && (
                          <Badge variant="outline" className="text-xs bg-muted">
                            2H
                          </Badge>
                        )}
                        {weaponData?.type === "ranged" && (
                          <Crosshair className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      {item.equipped && <Check className="w-4 h-4 text-red-500" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {weaponData ? (
                      <div className="space-y-1 text-xs">
                        <p><strong>{weaponData.name}</strong></p>
                        <p>Damage: {weaponData.damage} {weaponData.damageType}</p>
                        <p>Type: {weaponData.category} {weaponData.type}</p>
                        {weaponData.properties.length > 0 && (
                          <p>Properties: {weaponData.properties.join(", ")}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs">Custom weapon</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Equipped weapons summary */}
      {equippedWeapons.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Ready for combat:</p>
          <div className="flex flex-wrap gap-1">
            {equippedWeapons.map(item => {
              const weaponData = getWeaponInfo(item.item_name);
              return (
                <Badge key={item.id} className="bg-red-500/20 text-red-500 border-red-500/50">
                  {item.item_name}
                  {weaponData && ` (${weaponData.damage})`}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaponSlots;
