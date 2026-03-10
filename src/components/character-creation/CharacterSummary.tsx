import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Shield, 
  Sword, 
  Sparkles, 
  Eye,
  Loader2
} from "lucide-react";
import { AbilityScores, calculateModifier, formatModifier } from "@/hooks/useAbilityScores";
import { getClassByName } from "@/data/dnd-classes";
import { getRaceByName } from "@/data/dnd-races";
import { getBackgroundByName } from "@/data/dnd-backgrounds";
import AvatarImage from "@/components/AvatarImage";

interface CharacterSummaryProps {
  name: string;
  onNameChange: (name: string) => void;
  race: string;
  characterClass: string;
  background: string;
  abilityScores: AbilityScores;
  raceBonuses: Record<string, number>;
  avatarUrl: string | null;
  onGenerateAvatar: () => void;
  isGeneratingAvatar: boolean;
}

const ABILITY_LABELS: Record<string, { short: string; full: string }> = {
  strength: { short: "STR", full: "Strength" },
  dexterity: { short: "DEX", full: "Dexterity" },
  constitution: { short: "CON", full: "Constitution" },
  intelligence: { short: "INT", full: "Intelligence" },
  wisdom: { short: "WIS", full: "Wisdom" },
  charisma: { short: "CHA", full: "Charisma" },
};

const CharacterSummary = ({
  name,
  onNameChange,
  race,
  characterClass,
  background,
  abilityScores,
  raceBonuses,
  avatarUrl,
  onGenerateAvatar,
  isGeneratingAvatar,
}: CharacterSummaryProps) => {
  const { t } = useLanguage();
  const classData = getClassByName(characterClass);
  const raceData = getRaceByName(race);
  const backgroundData = getBackgroundByName(background);

  const getTotalScore = (ability: string): number => {
    const key = ability as keyof AbilityScores;
    return (abilityScores[key] || 0) + (raceBonuses[ability] || 0);
  };

  const calculateHP = (): number => {
    if (!classData) return 0;
    const conMod = calculateModifier(getTotalScore("constitution"));
    return Math.max(1, classData.hitDie + conMod);
  };

  const calculateAC = (): number => {
    const dexMod = calculateModifier(getTotalScore("dexterity"));
    if (!classData) return 10 + dexMod;

    if (classData.name === "Monk") {
      const wisMod = calculateModifier(getTotalScore("wisdom"));
      return 10 + dexMod + wisMod;
    } else if (classData.name === "Barbarian") {
      const conMod = calculateModifier(getTotalScore("constitution"));
      return 10 + dexMod + conMod;
    } else if (classData.armorProficiencies.includes("All armor")) {
      return 16; // Chain mail
    } else if (classData.armorProficiencies.includes("Medium")) {
      return Math.min(14 + 2, 14 + dexMod); // Scale mail
    } else if (classData.armorProficiencies.includes("Light")) {
      return 11 + dexMod; // Leather
    }
    
    return 10 + dexMod;
  };

  const hp = calculateHP();
  const ac = calculateAC();
  const profBonus = 2;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-cinzel font-bold text-gold mb-2">
          {t.characterSummary}
        </h2>
        <p className="text-muted-foreground">
          {t.reviewCharacter}
        </p>
      </div>

      {/* Character Name */}
      <Card className="p-6 bg-card/90 border-gold/50 animate-border-glow-gold">
        <Label htmlFor="character-name" className="font-cinzel text-lg text-foreground">
          {t.characterName}
        </Label>
        <Input
          id="character-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-2 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50"
          placeholder="Enter your hero's name"
          maxLength={50}
        />
      </Card>

      {/* Main Summary Card */}
      <Card className="p-6 bg-card/90 border-gold/50 animate-border-glow-gold">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <AvatarImage
              src={avatarUrl || undefined}
              alt={name || "Character"}
              className="w-32 h-32"
            />
            <Button
              type="button"
              onClick={onGenerateAvatar}
              disabled={isGeneratingAvatar}
              variant="outline"
              size="sm"
              className="border-gold text-gold hover:bg-gold hover:text-background"
            >
              {isGeneratingAvatar ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {avatarUrl ? "Regenerate" : "Generate Avatar"}
                </>
              )}
            </Button>
          </div>

          {/* Core Info */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gold/20 text-gold border border-gold/50">
                {race}
              </Badge>
              <Badge className="bg-primary/20 text-primary border border-primary/50">
                {characterClass}
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                {background}
              </Badge>
              <Badge variant="outline" className="border-border">
                Level 1
              </Badge>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Heart className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <p className="text-2xl font-bold text-foreground">{hp}</p>
                <p className="text-xs text-muted-foreground">Hit Points</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Shield className="h-5 w-5 mx-auto mb-1 text-gold" />
                <p className="text-2xl font-bold text-foreground">{ac}</p>
                <p className="text-xs text-muted-foreground">Armor Class</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <Sword className="h-5 w-5 mx-auto mb-1 text-accent" />
                <p className="text-2xl font-bold text-foreground">+{profBonus}</p>
                <p className="text-xs text-muted-foreground">Proficiency</p>
              </div>
            </div>

            {/* Speed & Darkvision */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Speed: {raceData?.speed || 30} ft</span>
              {raceData?.darkvision && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Darkvision {raceData.darkvision}ft
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Ability Scores */}
      <Card className="p-6 bg-card/90 border-border">
        <h3 className="font-cinzel font-bold text-foreground mb-4">Ability Scores</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(ABILITY_LABELS).map(([key, labels]) => {
            const total = getTotalScore(key);
            const mod = calculateModifier(total);
            const bonus = raceBonuses[key] || 0;
            
            return (
              <div key={key} className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  {labels.short}
                </p>
                <p className="text-2xl font-bold text-gold">{total}</p>
                <p className="text-sm text-foreground">{formatModifier(mod)}</p>
                {bonus > 0 && (
                  <p className="text-xs text-gold">+{bonus} {race}</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Proficiencies & Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/90 border-border">
          <h4 className="font-cinzel font-bold text-foreground mb-3">Saving Throws</h4>
          <div className="flex flex-wrap gap-1">
            {classData?.savingThrows.map((save) => (
              <Badge key={save} className="bg-gold/20 text-gold border border-gold/50">
                {ABILITY_LABELS[save]?.short || save}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/90 border-border">
          <h4 className="font-cinzel font-bold text-foreground mb-3">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {backgroundData?.skillProficiencies.map((skill) => (
              <Badge key={skill} variant="outline" className="border-border">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Racial Traits */}
      {raceData && (
        <Card className="p-4 bg-card/90 border-border">
          <h4 className="font-cinzel font-bold text-foreground mb-3">Racial Traits</h4>
          <div className="flex flex-wrap gap-1">
            {raceData.traits.map((trait) => (
              <Badge key={trait.name} variant="outline" className="border-gold/50 text-gold">
                {trait.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Ready Message */}
      <Card className="p-6 bg-gold/10 border-gold text-center animate-border-glow-gold">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-gold" />
        <p className="font-cinzel text-lg text-gold">
          {t.characterReady}
        </p>
      </Card>
    </div>
  );
};

export default CharacterSummary;
