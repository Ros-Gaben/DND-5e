import { Package, Sword, Shield, FlaskConical, Gem, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  description: string | null;
  equipped: boolean;
}

interface InventoryPanelProps {
  items: InventoryItem[];
}

const itemTypeIcons: Record<string, React.ReactNode> = {
  weapon: <Sword className="w-4 h-4" />,
  armor: <Shield className="w-4 h-4" />,
  consumable: <FlaskConical className="w-4 h-4" />,
  treasure: <Gem className="w-4 h-4" />,
  misc: <Package className="w-4 h-4" />,
};

const InventoryPanel = ({ items }: InventoryPanelProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Package className="w-4 h-4 text-gold" />
        <span className="font-semibold text-foreground">Inventory</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No items yet — find them during your adventure!
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                item.equipped
                  ? "bg-gold/10 border-gold/50"
                  : "bg-muted/30 border-border"
              }`}
            >
              <div className="text-muted-foreground">
                {itemTypeIcons[item.item_type] || itemTypeIcons.misc}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.item_name}
                  </span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs h-5">
                      x{item.quantity}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
              </div>
              {item.equipped && (
                <Check className="w-4 h-4 text-gold" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
