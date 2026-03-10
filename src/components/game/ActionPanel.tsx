import { useEffect, useRef, useState, useMemo } from "react";
import {
  Sword,
  Shield,
  FlaskConical,
  Scroll,
  Sparkles,
  Package,
  ChevronLeft,
  ChevronRight,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { WEAPONS, getWeaponByName } from "@/data/dnd-equipment";

interface InventoryItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  description: string | null;
  equipped: boolean;
}

interface ActionPanelProps {
  items: InventoryItem[];
  onSelectItem: (itemName: string, ammoName?: string) => void;
  onUseItem?: (item: InventoryItem) => Promise<boolean>;
  disabled?: boolean;
}

const itemTypeIcons: Record<string, React.ReactNode> = {
  weapon: <Sword className="w-4 h-4" />,
  armor: <Shield className="w-4 h-4" />,
  consumable: <FlaskConical className="w-4 h-4" />,
  scroll: <Scroll className="w-4 h-4" />,
  spell: <Sparkles className="w-4 h-4" />,
  ammunition: <Target className="w-4 h-4" />,
  treasure: <Package className="w-4 h-4" />,
  misc: <Package className="w-4 h-4" />,
};

// Ranged weapons that require ammunition
const RANGED_WEAPONS = [
  "longbow", "shortbow", "bow", "crossbow", "light crossbow", "heavy crossbow",
  "hand crossbow", "sling", "blowgun"
];

// Map weapon types to compatible ammunition types
const AMMO_COMPATIBILITY: Record<string, string[]> = {
  "longbow": ["arrow", "arrows"],
  "shortbow": ["arrow", "arrows"],
  "bow": ["arrow", "arrows"],
  "light crossbow": ["bolt", "bolts", "crossbow bolt", "crossbow bolts"],
  "heavy crossbow": ["bolt", "bolts", "crossbow bolt", "crossbow bolts"],
  "hand crossbow": ["bolt", "bolts", "crossbow bolt", "crossbow bolts"],
  "crossbow": ["bolt", "bolts", "crossbow bolt", "crossbow bolts"],
  "sling": ["sling bullet", "sling bullets", "bullet", "bullets", "stone", "stones"],
  "blowgun": ["blowgun needle", "blowgun needles", "needle", "needles"],
};

const isRangedWeapon = (itemName: string): boolean => {
  const lowerName = itemName.toLowerCase();
  return RANGED_WEAPONS.some(weapon => lowerName.includes(weapon));
};

const getCompatibleAmmo = (weaponName: string, inventory: InventoryItem[]): InventoryItem[] => {
  const lowerName = weaponName.toLowerCase();
  
  // Find which weapon type matches
  for (const [weapon, ammoTypes] of Object.entries(AMMO_COMPATIBILITY)) {
    if (lowerName.includes(weapon)) {
      return inventory.filter(item => 
        item.item_type === "ammunition" && 
        ammoTypes.some(ammo => item.item_name.toLowerCase().includes(ammo))
      );
    }
  }
  
  // Fallback: return all ammunition
  return inventory.filter(item => item.item_type === "ammunition");
};

// Helper to check if an item is actually a weapon based on D&D equipment data
const isActualWeapon = (itemName: string): boolean => {
  // Normalize the name for matching
  const normalizedName = itemName.toLowerCase().trim();
  
  // Check if the base name matches any weapon (handle plurals like "handaxes" -> "handaxe")
  const singularName = normalizedName.endsWith('s') && !normalizedName.endsWith('ss') 
    ? normalizedName.slice(0, -1) 
    : normalizedName;
  
  return WEAPONS.some(w => {
    const weaponName = w.name.toLowerCase();
    return weaponName === normalizedName || 
           weaponName === singularName ||
           normalizedName.includes(weaponName) ||
           singularName.includes(weaponName);
  });
};

// Helper to check if item is a throwing weapon
const isThrowingWeapon = (itemName: string): boolean => {
  const weapon = getWeaponByName(itemName);
  if (weapon) {
    return weapon.properties.some(p => p.toLowerCase().includes('thrown'));
  }
  // Also check plural forms
  const singularName = itemName.toLowerCase().endsWith('s') && !itemName.toLowerCase().endsWith('ss')
    ? itemName.slice(0, -1)
    : itemName;
  const weaponSingular = getWeaponByName(singularName);
  return weaponSingular?.properties.some(p => p.toLowerCase().includes('thrown')) || false;
};

const ActionPanel = ({ items, onSelectItem, onUseItem, disabled }: ActionPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pendingWeapon, setPendingWeapon] = useState<InventoryItem | null>(null);
  const [popoverSide, setPopoverSide] = useState<"top" | "left" | "right">("top");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const spaceAbove = rect.top;

    // Prefer opening above, but on smaller screens / cramped space, flip to a side.
    if (spaceAbove >= 260) {
      setPopoverSide("top");
      return;
    }

    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;
    setPopoverSide(spaceLeft >= spaceRight ? "left" : "right");
  }, [isOpen]);

  // Normalize item types - items that are actually weapons should be treated as weapons
  const normalizedItems = useMemo(() => {
    return items.map(item => {
      // If item_type is equipment/misc but it's actually a weapon, treat it as a weapon
      if ((item.item_type === 'equipment' || item.item_type === 'misc') && isActualWeapon(item.item_name)) {
        return { ...item, item_type: 'weapon' };
      }
      return item;
    });
  }, [items]);

  // Filter items that can be used in actions (weapons, consumables, scrolls, spells)
  const actionableItems = normalizedItems.filter(item => 
    ["weapon", "consumable", "scroll", "spell", "ammunition"].includes(item.item_type)
  );

  const categories = [
    { key: "weapon", label: "Weapons", icon: <Sword className="w-4 h-4" /> },
    { key: "consumable", label: "Consumables", icon: <FlaskConical className="w-4 h-4" /> },
    { key: "ammunition", label: "Ammo", icon: <Target className="w-4 h-4" /> },
    { key: "scroll", label: "Scrolls", icon: <Scroll className="w-4 h-4" /> },
    { key: "spell", label: "Spells", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const filteredItems = activeCategory
    ? actionableItems.filter(item => item.item_type === activeCategory)
    : actionableItems;

  const compatibleAmmo = pendingWeapon ? getCompatibleAmmo(pendingWeapon.item_name, normalizedItems) : [];

  const handleSelectItem = async (item: InventoryItem) => {
    // Check if it's a ranged weapon that needs ammo (but not throwing weapons)
    if (item.item_type === "weapon" && isRangedWeapon(item.item_name) && !isThrowingWeapon(item.item_name)) {
      const ammo = getCompatibleAmmo(item.item_name, normalizedItems);
      if (ammo.length > 0) {
        setPendingWeapon(item);
        return;
      }
      // No compatible ammo found, proceed without
    }

    // Throwing weapons are expended when used (e.g., a thrown handaxe is consumed)
    if (item.item_type === "weapon" && isThrowingWeapon(item.item_name) && onUseItem) {
      const success = await onUseItem(item);
      if (!success) return;
    }

    // If it's a consumable type, use it first
    const consumableTypes = ["consumable", "scroll", "ammunition"];
    if (consumableTypes.includes(item.item_type) && onUseItem) {
      const success = await onUseItem(item);
      if (!success) return;
    }

    onSelectItem(item.item_name);
    setIsOpen(false);
    setActiveCategory(null);
    setPendingWeapon(null);
  };

  const handleSelectAmmo = async (ammo: InventoryItem) => {
    if (!pendingWeapon) return;

    // Consume the ammunition
    if (onUseItem) {
      const success = await onUseItem(ammo);
      if (!success) return;
    }

    // Select both weapon and ammo
    onSelectItem(pendingWeapon.item_name, ammo.item_name);
    setIsOpen(false);
    setActiveCategory(null);
    setPendingWeapon(null);
  };

  const handleSkipAmmo = () => {
    if (!pendingWeapon) return;
    onSelectItem(pendingWeapon.item_name);
    setIsOpen(false);
    setActiveCategory(null);
    setPendingWeapon(null);
  };

  const handleCancelAmmo = () => {
    setPendingWeapon(null);
  };

  const hasItems = actionableItems.length > 0;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!hasItems && open) return;
        setIsOpen(open);
        if (!open) {
          setActiveCategory(null);
          setPendingWeapon(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button ref={triggerRef}
          variant="outline"
          size="sm"
          disabled={disabled || !hasItems}
          className={cn(
            "border-gold/50 text-gold transition-all",
            hasItems ? "hover:bg-gold/10" : "opacity-50 cursor-not-allowed",
            isOpen && "bg-gold/10 border-gold",
          )}
          title={!hasItems ? "No items yet - find them during your adventure!" : "Select an item for your action"}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          Items
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side={popoverSide}
        sideOffset={8}
        className="w-80 max-w-[90vw] bg-card border border-border shadow-xl p-3 z-[200]"
      >
        {/* Ammo Selection Mode */}
        {pendingWeapon ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                Select ammunition for {pendingWeapon.item_name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelAmmo}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {compatibleAmmo.map((ammo) => (
                <button
                  key={ammo.id}
                  onClick={() => handleSelectAmmo(ammo)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-gold">
                    <Target className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate">{ammo.item_name}</span>
                  <span className="text-xs text-muted-foreground">x{ammo.quantity}</span>
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAmmo}
              className="w-full text-xs text-muted-foreground"
            >
              Use without ammunition
            </Button>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground mb-2">Select an item to insert into your action</div>

            {/* Category filters */}
            <div className="flex gap-1 mb-3 flex-wrap">
              <Button
                variant={activeCategory === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {categories.map((cat) => {
                const count = actionableItems.filter((i) => i.item_type === cat.key).length;
                if (count === 0) return null;
                return (
                  <Button
                    key={cat.key}
                    variant={activeCategory === cat.key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.key)}
                    className="h-7 text-xs"
                  >
                    {cat.icon}
                    <span className="ml-1">{count}</span>
                  </Button>
                );
              })}
            </div>

            {/* Items list */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2">No items in this category</div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-gold">{itemTypeIcons[item.item_type] || itemTypeIcons.misc}</span>
                    <span className="flex-1 text-sm text-foreground truncate">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                    )}
                    {item.equipped && <span className="text-xs text-gold">Equipped</span>}
                    {item.item_type === "weapon" && isThrowingWeapon(item.item_name) && (
                      <span className="text-xs text-muted-foreground italic">thrown</span>
                    )}
                    {item.item_type === "weapon" && isRangedWeapon(item.item_name) && !isThrowingWeapon(item.item_name) && (
                      <Target className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ActionPanel;
