import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Wrench, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { BACKGROUNDS, BackgroundData } from "@/data/dnd-backgrounds";

interface BackgroundSelectionStepProps {
  selectedBackground: string;
  onSelectBackground: (background: string) => void;
}

const BackgroundSelectionStep = ({
  selectedBackground,
  onSelectBackground,
}: BackgroundSelectionStepProps) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.chooseBackground}
        </h2>
        <p className="text-muted-foreground">
          {t.backgroundDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BACKGROUNDS.map((bg) => {
          const isSelected = selectedBackground === bg.name;
          
          return (
            <Card
              key={bg.name}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-lg",
                isSelected
                  ? "border-gold bg-gold/10 shadow-gold/20"
                  : "border-border hover:border-gold/50 bg-card/80"
              )}
              onClick={() => onSelectBackground(bg.name)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-cinzel font-bold text-foreground">
                  {bg.name}
                </h3>
                {isSelected && (
                  <Badge className="bg-gold text-background">Selected</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {bg.description}
              </p>

              {/* Skills */}
              <div className="flex items-center gap-2 mb-2 text-xs">
                <BookOpen className="h-3 w-3 text-gold" />
                <span>Skills: {bg.skillProficiencies.join(", ")}</span>
              </div>

              {/* Tools */}
              {bg.toolProficiencies.length > 0 && (
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Wrench className="h-3 w-3" />
                  <span>Tools: {bg.toolProficiencies.join(", ")}</span>
                </div>
              )}

              {/* Languages */}
              {bg.languages > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Languages className="h-3 w-3" />
                  <span>{bg.languages} extra language{bg.languages > 1 ? "s" : ""}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Selected Background Details */}
      {selectedBackground && (
        <Card className="p-6 bg-card/90 border-gold/50">
          {(() => {
            const bg = BACKGROUNDS.find(b => b.name === selectedBackground);
            if (!bg) return null;
            
            return (
              <>
                <h3 className="text-xl font-cinzel font-bold text-gold mb-4">
                  {bg.name} Feature
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {bg.feature.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {bg.feature.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-2">Starting Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                      {bg.equipment.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-border">
                          {item}
                        </Badge>
                      ))}
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

export default BackgroundSelectionStep;
