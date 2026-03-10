import { Shield, Shirt, AlertTriangle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateAC, getArmorData, ACCalculationResult } from "@/data/armor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  description: string | null;
  equipped: boolean;
}

interface EquipmentSlotsProps {
  inventory: InventoryItem[];
  dexterity: number;
  characterClass: string;
  wisdom?: number;
  constitution?: number;
  onInventoryChange: () => void;
}

const EquipmentSlots = ({
  inventory,
  dexterity,
  characterClass,
  wisdom,
  constitution,
  onInventoryChange,
}: EquipmentSlotsProps) => {
  const { toast } = useToast();

  // Get all armor items from inventory
  const armorItems = inventory.filter(item => {
    const armorData = getArmorData(item.item_name);
    return armorData && armorData.type !== "shield";
  });

  const shieldItems = inventory.filter(item => {
    const armorData = getArmorData(item.item_name);
    return armorData && armorData.type === "shield";
  });

  // Calculate current AC
  const acResult: ACCalculationResult = calculateAC(
    inventory,
    dexterity,
    characterClass,
    wisdom,
    constitution
  );

  const handleToggleEquip = async (item: InventoryItem) => {
    try {
      // If equipping armor, unequip other armor of the same slot
      const armorData = getArmorData(item.item_name);
      if (armorData && !item.equipped) {
        const isShield = armorData.type === "shield";
        const sameSlotItems = inventory.filter(i => {
          const data = getArmorData(i.item_name);
          if (!data) return false;
          return isShield ? data.type === "shield" : data.type !== "shield";
        });

        // Unequip other items in the same slot
        for (const otherItem of sameSlotItems) {
          if (otherItem.id !== item.id && otherItem.equipped) {
            await supabase
              .from("inventory")
              .update({ equipped: false })
              .eq("id", otherItem.id);
          }
        }
      }

      // Toggle this item
      const { error } = await supabase
        .from("inventory")
        .update({ equipped: !item.equipped })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: item.equipped ? "Unequipped" : "Equipped",
        description: item.item_name,
        duration: 2000,
      });

      onInventoryChange();
    } catch (error) {
      console.error("Error toggling equipment:", error);
      toast({
        title: "Error",
        description: "Failed to change equipment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Shield className="w-4 h-4 text-gold" />
        <span className="font-semibold text-foreground">Equipment & AC</span>
      </div>

      {/* AC Display */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold flex items-center justify-center">
            <span className="text-xl font-bold text-gold">{acResult.total}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Armor Class</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground cursor-help">
                    {acResult.base} base
                    {acResult.dexBonus !== 0 && ` + ${acResult.dexBonus} DEX`}
                    {acResult.shieldBonus > 0 && ` + ${acResult.shieldBonus} shield`}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p><strong>Base AC:</strong> {acResult.base} ({acResult.armorName || "Unarmored"})</p>
                    <p><strong>DEX Bonus:</strong> +{acResult.dexBonus}</p>
                    {acResult.shieldBonus > 0 && (
                      <p><strong>Shield:</strong> +{acResult.shieldBonus} ({acResult.shieldName})</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {acResult.hasStealthDisadvantage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Stealth
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Disadvantage on Stealth checks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Armor Slot */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shirt className="w-4 h-4" />
          <span>Armor</span>
        </div>
        {armorItems.length === 0 ? (
          <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
            No armor in inventory
          </div>
        ) : (
          <div className="space-y-1">
            {armorItems.map(item => {
              const armorData = getArmorData(item.item_name);
              return (
                <Button
                  key={item.id}
                  variant={item.equipped ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleToggleEquip(item)}
                  className={`w-full justify-between h-auto py-2 ${
                    item.equipped ? "bg-gold/10 border border-gold/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.item_name}</span>
                    {armorData && (
                      <Badge variant="outline" className="text-xs">
                        AC {armorData.baseAC}
                      </Badge>
                    )}
                  </div>
                  {item.equipped && <Check className="w-4 h-4 text-gold" />}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Shield Slot */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Shield</span>
        </div>
        {shieldItems.length === 0 ? (
          <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
            No shield in inventory
          </div>
        ) : (
          <div className="space-y-1">
            {shieldItems.map(item => (
              <Button
                key={item.id}
                variant={item.equipped ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleToggleEquip(item)}
                className={`w-full justify-between h-auto py-2 ${
                  item.equipped ? "bg-gold/10 border border-gold/50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.item_name}</span>
                  <Badge variant="outline" className="text-xs">+2 AC</Badge>
                </div>
                {item.equipped && <Check className="w-4 h-4 text-gold" />}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentSlots;
