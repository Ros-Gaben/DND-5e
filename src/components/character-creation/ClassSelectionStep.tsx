import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Shield, Sparkles, Sword, Wand } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASSES, ClassData } from "@/data/dnd-classes";
import { AbilityScores, calculateModifier } from "@/hooks/useAbilityScores";

interface ClassSelectionStepProps {
  selectedClass: string;
  onSelectClass: (className: string) => void;
  abilityScores: AbilityScores;
  raceBonuses: Record<string, number>;
}

const ABILITY_LABELS: Record<string, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

const getTypeIcon = (type: ClassData["type"]) => {
  switch (type) {
    case "martial": return <Sword className="h-4 w-4" />;
    case "spellcaster": return <Wand className="h-4 w-4" />;
    case "hybrid": return <Shield className="h-4 w-4" />;
  }
};

const getTypeColor = (type: ClassData["type"]) => {
  switch (type) {
    case "martial": return "bg-destructive/20 text-destructive border-destructive/50";
    case "spellcaster": return "bg-primary/20 text-primary border-primary/50";
    case "hybrid": return "bg-accent/20 text-accent-foreground border-accent/50";
  }
};

const ClassSelectionStep = ({
  selectedClass,
  onSelectClass,
  abilityScores,
  raceBonuses,
}: ClassSelectionStepProps) => {
  const { t } = useLanguage();
  const getTotalScore = (ability: string): number => {
    const key = ability as keyof AbilityScores;
    return (abilityScores[key] || 0) + (raceBonuses[ability] || 0);
  };

  const calculateHP = (classData: ClassData): number => {
    const conMod = calculateModifier(getTotalScore("constitution"));
    return Math.max(1, classData.hitDie + conMod);
  };

  const calculateSpellDC = (classData: ClassData): number | null => {
    if (!classData.spellcastingAbility) return null;
    const mod = calculateModifier(getTotalScore(classData.spellcastingAbility));
    return 8 + 2 + mod; // 8 + proficiency (2 at level 1) + modifier
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.chooseYourClass}
        </h2>
        <p className="text-muted-foreground">
          {t.classDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLASSES.map((cls) => {
          const isSelected = selectedClass === cls.name;
          const hp = calculateHP(cls);
          const spellDC = calculateSpellDC(cls);
          
          return (
            <Card
              key={cls.name}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-lg",
                isSelected
                  ? "border-gold bg-gold/10 shadow-gold/20"
                  : "border-border hover:border-gold/50 bg-card/80"
              )}
              onClick={() => onSelectClass(cls.name)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-cinzel font-bold text-foreground">
                  {cls.name}
                </h3>
                <Badge className={cn("flex items-center gap-1", getTypeColor(cls.type))}>
                  {getTypeIcon(cls.type)}
                  {cls.type}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {cls.description}
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-destructive" />
                  <span>HP: {hp}</span>
                </div>
                <div>
                  <span className="text-gold">d{cls.hitDie}</span> Hit Die
                </div>
              </div>

              {/* Primary Abilities */}
              <div className="flex flex-wrap gap-1 mb-2">
                {cls.primaryAbilities.map((ability) => (
                  <Badge
                    key={ability}
                    variant="outline"
                    className="text-xs border-gold/50 text-gold"
                  >
                    {ABILITY_LABELS[ability]}
                  </Badge>
                ))}
                {cls.isSpellcaster && (
                  <Badge className="text-xs bg-primary/20 text-primary border border-primary/50">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Spellcaster
                  </Badge>
                )}
              </div>

              {isSelected && (
                <Badge className="w-full justify-center bg-gold text-background mt-2">
                  Selected
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      {/* Selected Class Details */}
      {selectedClass && (
        <Card className="p-6 bg-card/90 border-gold/50">
          {(() => {
            const cls = CLASSES.find(c => c.name === selectedClass);
            if (!cls) return null;
            
            const hp = calculateHP(cls);
            const spellDC = calculateSpellDC(cls);
            
            return (
              <>
                <h3 className="text-xl font-cinzel font-bold text-gold mb-4">
                  {cls.name} Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Combat Stats */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Combat</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hit Points at 1st Level</span>
                        <span className="text-gold font-bold">{hp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hit Die</span>
                        <span className="font-semibold">d{cls.hitDie}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Proficiency Bonus</span>
                        <span className="font-semibold">+2</span>
                      </div>
                      {spellDC && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spell Save DC</span>
                          <span className="text-primary font-bold">{spellDC}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proficiencies */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Proficiencies</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Saving Throws: </span>
                        <span>{cls.savingThrows.map(s => ABILITY_LABELS[s]).join(", ")}</span>
                      </div>
                      {cls.armorProficiencies.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Armor: </span>
                          <span>{cls.armorProficiencies.join(", ")}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Weapons: </span>
                        <span>{cls.weaponProficiencies.join(", ")}</span>
                      </div>
                      {cls.spellcastingAbility && (
                        <div>
                          <span className="text-muted-foreground">Spellcasting Ability: </span>
                          <span className="text-primary">{ABILITY_LABELS[cls.spellcastingAbility]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default ClassSelectionStep;
