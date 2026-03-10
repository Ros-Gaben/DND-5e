import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Package, Sword, Shield as ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASS_STARTING_EQUIPMENT, WEAPONS, ARMOR, MISC_ITEMS, getWeaponByName, WeaponData, ArmorData, MiscItemData } from "@/data/dnd-equipment";
import { getClassByName } from "@/data/dnd-classes";
import { AbilityScores, calculateModifier } from "@/hooks/useAbilityScores";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Get armor data by name
function getArmorByName(name: string): ArmorData | undefined {
  return ARMOR.find(a => a.name.toLowerCase() === name.toLowerCase());
}

// Get misc item data by name
function getMiscItemByName(name: string): MiscItemData | undefined {
  const lowerName = name.toLowerCase();
  return MISC_ITEMS.find(item => {
    const itemLower = item.name.toLowerCase();
    // Exact match or partial match for numbered items
    return itemLower === lowerName || 
           lowerName.includes(itemLower) || 
           itemLower.includes(lowerName) ||
           // Handle variations like "4 javelins" matching nothing but "javelins" pattern
           (lowerName.match(/^\d+\s+/) && itemLower.includes(lowerName.replace(/^\d+\s+/, '')));
  });
}

// Component to render item with tooltip
const ItemWithTooltip = ({ itemName }: { itemName: string }) => {
  // Extract quantity prefix if present (e.g., "Two handaxes" -> "handaxe", "4 javelins" -> "javelin")
  const quantityPatterns = [
    { pattern: /^two\s+(.+?)s?$/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /^four\s+(.+?)s?$/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /^five\s+(.+?)s?$/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /^ten\s+(.+?)s?$/i, extract: (m: RegExpMatchArray) => m[1] },
    { pattern: /^(\d+)\s+(.+?)s?$/i, extract: (m: RegExpMatchArray) => m[2] },
  ];

  let baseItemName = itemName;
  for (const { pattern, extract } of quantityPatterns) {
    const match = itemName.match(pattern);
    if (match) {
      baseItemName = extract(match);
      break;
    }
  }

  const weapon = getWeaponByName(baseItemName) || getWeaponByName(itemName);
  const armor = getArmorByName(baseItemName) || getArmorByName(itemName);
  const miscItem = getMiscItemByName(itemName) || getMiscItemByName(baseItemName);
  
  if (weapon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-gold/50 cursor-help hover:text-gold transition-colors">
            {itemName}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card border-gold/50">
          <div className="space-y-1">
            <p className="font-cinzel font-bold text-gold">{weapon.name}</p>
            <p className="text-sm">
              <span className="text-destructive font-semibold">{weapon.damage}</span>
              <span className="text-muted-foreground"> {weapon.damageType}</span>
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {weapon.category} {weapon.type} weapon
            </p>
            {weapon.properties.length > 0 && (
              <p className="text-xs text-primary">
                {weapon.properties.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{weapon.weight} lb.</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  if (armor) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-gold/50 cursor-help hover:text-gold transition-colors">
            {itemName}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card border-gold/50">
          <div className="space-y-1">
            <p className="font-cinzel font-bold text-gold">{armor.name}</p>
            <p className="text-sm">
              <span className="text-primary font-semibold">AC {armor.category === "shield" ? `+${armor.ac}` : armor.ac}</span>
              {armor.dexBonus === "full" && <span className="text-muted-foreground"> + DEX</span>}
              {armor.dexBonus === "max2" && <span className="text-muted-foreground"> + DEX (max 2)</span>}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{armor.category} armor</p>
            {armor.strengthRequirement && (
              <p className="text-xs text-destructive">Requires STR {armor.strengthRequirement}</p>
            )}
            {armor.stealthDisadvantage && (
              <p className="text-xs text-destructive">Stealth disadvantage</p>
            )}
            <p className="text-xs text-muted-foreground">{armor.weight} lb.</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  if (miscItem) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-gold/50 cursor-help hover:text-gold transition-colors">
            {itemName}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card border-gold/50">
          <div className="space-y-1">
            <p className="font-cinzel font-bold text-gold">{miscItem.name}</p>
            <p className="text-xs text-muted-foreground">{miscItem.description}</p>
            <p className="text-xs text-muted-foreground capitalize">{miscItem.category}</p>
            {miscItem.weight > 0 && (
              <p className="text-xs text-muted-foreground">{miscItem.weight} lb.</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return <span>{itemName}</span>;
};

// Render equipment list with tooltips
const EquipmentList = ({ items }: { items: string[] }) => {
  return (
    <>
      {items.map((item, idx) => (
        <span key={idx}>
          <ItemWithTooltip itemName={item} />
          {idx < items.length - 1 && ", "}
        </span>
      ))}
    </>
  );
};

interface EquipmentStepProps {
  selectedClass: string;
  equipmentChoices: Record<string, number>;
  onEquipmentChoiceChange: (category: string, optionIndex: number) => void;
  abilityScores: AbilityScores;
  raceBonuses: Record<string, number>;
}

const EquipmentStep = ({
  selectedClass,
  equipmentChoices,
  onEquipmentChoiceChange,
  abilityScores,
  raceBonuses,
}: EquipmentStepProps) => {
  const [useRecommended, setUseRecommended] = useState(true);
  const { t } = useLanguage();

  const classEquipment = CLASS_STARTING_EQUIPMENT[selectedClass] || [];
  const classData = getClassByName(selectedClass);

  const getTotalScore = (ability: string): number => {
    const key = ability as keyof AbilityScores;
    return (abilityScores[key] || 0) + (raceBonuses[ability] || 0);
  };

  const dexMod = calculateModifier(getTotalScore("dexterity"));

  // Calculate AC based on class and common starting armor
  const calculateStartingAC = (): number => {
    if (!classData) return 10 + dexMod;

    // Different classes get different starting armor
    if (classData.armorProficiencies.includes("All armor")) {
      // Fighter, Paladin - assume chain mail
      return 16;
    } else if (classData.armorProficiencies.includes("Medium")) {
      // Cleric, Ranger, etc - assume scale mail
      return Math.min(14 + 2, 14 + dexMod);
    } else if (classData.armorProficiencies.includes("Light")) {
      // Rogue, Bard, etc - assume leather
      return 11 + dexMod;
    } else if (classData.name === "Monk") {
      // Monk unarmored defense
      const wisMod = calculateModifier(getTotalScore("wisdom"));
      return 10 + dexMod + wisMod;
    } else if (classData.name === "Barbarian") {
      // Barbarian unarmored defense
      const conMod = calculateModifier(getTotalScore("constitution"));
      return 10 + dexMod + conMod;
    }
    
    return 10 + dexMod;
  };

  const ac = calculateStartingAC();

  // Calculate attack bonus
  const calculateAttackBonus = (): { melee: number; ranged: number; spell: number | null } => {
    const strMod = calculateModifier(getTotalScore("strength"));
    const profBonus = 2;
    
    let spellBonus = null;
    if (classData?.spellcastingAbility) {
      const castMod = calculateModifier(getTotalScore(classData.spellcastingAbility));
      spellBonus = profBonus + castMod;
    }

    return {
      melee: profBonus + strMod,
      ranged: profBonus + dexMod,
      spell: spellBonus,
    };
  };

  const attackBonuses = calculateAttackBonus();

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.equipment}
        </h2>
        <p className="text-muted-foreground">
          {t.equipmentDescription}
        </p>
      </div>

      {/* Derived Stats */}
      <Card className="p-4 bg-card/90 border-gold/50">
        <h3 className="font-cinzel font-bold text-gold mb-3">Derived Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-background/50 rounded-lg">
            <ShieldIcon className="h-5 w-5 mx-auto mb-1 text-gold" />
            <p className="text-2xl font-bold text-foreground">{ac}</p>
            <p className="text-xs text-muted-foreground">Armor Class</p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <Sword className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-foreground">
              {attackBonuses.melee >= 0 ? "+" : ""}{attackBonuses.melee}
            </p>
            <p className="text-xs text-muted-foreground">Melee Attack</p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <Sword className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {attackBonuses.ranged >= 0 ? "+" : ""}{attackBonuses.ranged}
            </p>
            <p className="text-xs text-muted-foreground">Ranged Attack</p>
          </div>
          {attackBonuses.spell !== null && (
            <div className="p-3 bg-background/50 rounded-lg">
              <Package className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-2xl font-bold text-foreground">
                {attackBonuses.spell >= 0 ? "+" : ""}{attackBonuses.spell}
              </p>
              <p className="text-xs text-muted-foreground">Spell Attack</p>
            </div>
          )}
        </div>
      </Card>

      {/* Equipment Mode Toggle */}
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant={useRecommended ? "default" : "outline"}
          className={useRecommended ? "bg-gradient-gold" : "border-border hover:border-gold"}
          onClick={() => setUseRecommended(true)}
        >
          <Package className="h-4 w-4 mr-2" />
          Recommended Loadout
        </Button>
        <Button
          type="button"
          variant={!useRecommended ? "default" : "outline"}
          className={!useRecommended ? "bg-gradient-gold" : "border-border hover:border-gold"}
          onClick={() => setUseRecommended(false)}
        >
          <Sword className="h-4 w-4 mr-2" />
          Choose Equipment
        </Button>
      </div>

      {useRecommended ? (
        <Card className="p-6 bg-card/90 border-border">
          <h3 className="font-cinzel font-bold text-foreground mb-4">
            Standard {selectedClass} Starting Equipment
          </h3>
          <div className="space-y-2">
            {classEquipment.map((choice, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Package className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">{choice.description}: </span>
                  <span className="text-sm text-foreground">
                    <EquipmentList items={choice.options[0]} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {classEquipment.map((choice, categoryIdx) => {
            const hasSingleOption = choice.options.length === 1;
            
            return (
              <Card key={categoryIdx} className="p-4 bg-card/90 border-border">
                <Label className="font-cinzel font-bold text-foreground mb-3 block">
                  {choice.description}
                </Label>
                {hasSingleOption ? (
                  // Single option - show as fixed, non-editable
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Package className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      <EquipmentList items={choice.options[0]} />
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">Fixed</Badge>
                  </div>
                ) : (
                  // Multiple options - show radio group
                  <RadioGroup
                    value={(equipmentChoices[choice.description] ?? 0).toString()}
                    onValueChange={(val) => onEquipmentChoiceChange(choice.description, parseInt(val))}
                  >
                    {choice.options.map((option, optionIdx) => (
                      <div key={optionIdx} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={optionIdx.toString()}
                          id={`${categoryIdx}-${optionIdx}`}
                        />
                        <Label
                          htmlFor={`${categoryIdx}-${optionIdx}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          <EquipmentList items={option} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default EquipmentStep;
