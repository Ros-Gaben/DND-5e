import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { RACES, RaceData } from "@/data/dnd-races";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RaceSelectionStepProps {
  selectedRace: string;
  onSelectRace: (race: string) => void;
  flexibleBonuses?: Record<string, number>;
  onFlexibleBonusChange?: (bonuses: Record<string, number>) => void;
}

const ABILITY_LABELS: Record<string, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

const RaceSelectionStep = ({
  selectedRace,
  onSelectRace,
}: RaceSelectionStepProps) => {
  const renderBonuses = (race: RaceData & { flexibleBonuses?: number }) => {
    const bonuses = Object.entries(race.abilityBonuses)
      .filter(([_, val]) => val > 0)
      .map(([ability, val]) => `+${val} ${ABILITY_LABELS[ability]}`);
    
    if (race.flexibleBonuses) {
      bonuses.push(`+1 to ${race.flexibleBonuses} others`);
    }
    
    return bonuses.join(", ");
  };

  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.chooseYourRace}
        </h2>
        <p className="text-muted-foreground">
          {t.raceDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RACES.map((race) => {
          const isSelected = selectedRace === race.name;
          
          return (
            <Card
              key={race.name}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-lg",
                isSelected
                  ? "border-gold bg-gold/10 shadow-gold/20"
                  : "border-border hover:border-gold/50 bg-card/80"
              )}
              onClick={() => onSelectRace(race.name)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-cinzel font-bold text-foreground">
                  {race.name}
                </h3>
                {isSelected && (
                  <Badge className="bg-gold text-background">Selected</Badge>
                )}
              </div>

              {/* Ability Bonuses */}
              <div className="mb-3">
                <p className="text-sm text-gold font-semibold">
                  {renderBonuses(race as RaceData & { flexibleBonuses?: number })}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3 mb-3 text-xs text-muted-foreground">
                <span>Speed: {race.speed} ft</span>
                {race.darkvision && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Darkvision {race.darkvision}ft
                  </span>
                )}
              </div>

              {/* Traits */}
              <TooltipProvider>
                <div className="flex flex-wrap gap-1">
                  {race.traits.slice(0, 3).map((trait) => (
                    <Tooltip key={trait.name}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs border-border hover:border-gold cursor-help"
                        >
                          {trait.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{trait.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {race.traits.length > 3 && (
                    <Badge variant="outline" className="text-xs border-border">
                      +{race.traits.length - 3} more
                    </Badge>
                  )}
                </div>
              </TooltipProvider>
            </Card>
          );
        })}
      </div>

      {/* Selected Race Details */}
      {selectedRace && (
        <Card className="p-6 bg-card/90 border-gold/50">
          {(() => {
            const race = RACES.find(r => r.name === selectedRace);
            if (!race) return null;
            
            return (
              <>
                <h3 className="text-xl font-cinzel font-bold text-gold mb-4">
                  {race.name} Traits
                </h3>
                <div className="grid gap-3">
                  {race.traits.map((trait) => (
                    <div key={trait.name} className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">{trait.name}</p>
                        <p className="text-sm text-muted-foreground">{trait.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Languages:</strong> {race.languages.join(", ")}
                  </p>
                </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default RaceSelectionStep;
