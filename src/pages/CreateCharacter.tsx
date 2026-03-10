import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";

import StepIndicator from "@/components/character-creation/StepIndicator";
import AbilityScoreStep from "@/components/character-creation/AbilityScoreStep";
import RaceSelectionStep from "@/components/character-creation/RaceSelectionStep";
import ClassSelectionStep from "@/components/character-creation/ClassSelectionStep";
import BackgroundSelectionStep from "@/components/character-creation/BackgroundSelectionStep";
import EquipmentStep from "@/components/character-creation/EquipmentStep";
import CharacterSummary from "@/components/character-creation/CharacterSummary";

import { useAbilityScores, AbilityName } from "@/hooks/useAbilityScores";
import { getRaceByName, RACES } from "@/data/dnd-races";
import { getClassByName, CLASSES } from "@/data/dnd-classes";
import { CLASS_STARTING_EQUIPMENT, getItemType } from "@/data/dnd-equipment";

const STEPS = [
  { id: 1, name: "Abilities" },
  { id: 2, name: "Race" },
  { id: 3, name: "Class" },
  { id: 4, name: "Background" },
  { id: 5, name: "Equipment" },
  { id: 6, name: "Summary" },
];

const characterSchema = z.object({
  name: z.string().trim().min(1, "Character name is required").max(50, "Name must be < 50 chars"),
  race: z.string().min(1),
  class: z.string().min(1),
  strength: z.number().int().min(3).max(20),
  dexterity: z.number().int().min(3).max(20),
  constitution: z.number().int().min(3).max(20),
  intelligence: z.number().int().min(3).max(20),
  wisdom: z.number().int().min(3).max(20),
  charisma: z.number().int().min(3).max(20),
});

const CreateCharacter = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Character data
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [background, setBackground] = useState("");
  const [equipmentChoices, setEquipmentChoices] = useState<Record<string, number>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // Ability scores hook
  const abilityScores = useAbilityScores();

  // Calculate racial bonuses
  const getRaceBonuses = (): Record<string, number> => {
    const raceData = getRaceByName(race);
    return raceData?.abilityBonuses || {};
  };

  const raceBonuses = getRaceBonuses();

  // Get recommended abilities for selected class
  const getRecommendedAbilities = (): string[] => {
    const classData = getClassByName(characterClass);
    return classData?.primaryAbilities || [];
  };

  const generateAvatar = async () => {
    if (!race || !characterClass) return;
    setIsGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: { race, characterClass },
      });
      if (error) throw error;
      if (data?.success && data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        toast({ title: t.avatarGenerated, description: t.avatarReady });
      } else {
        throw new Error(data?.error || 'Failed to generate avatar');
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      toast({ variant: "destructive", title: t.error, description: t.failedToGenerateAvatar });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const getTotalScore = (ability: AbilityName): number => {
    return abilityScores.baseScores[ability] + (raceBonuses[ability] || 0);
  };

  const calculateHP = (): number => {
    const classData = getClassByName(characterClass);
    if (!classData) return 8;
    const conMod = Math.floor((getTotalScore("constitution") - 10) / 2);
    return Math.max(1, classData.hitDie + conMod);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return abilityScores.isComplete();
      case 2: return !!race;
      case 3: return !!characterClass;
      case 4: return !!background;
      case 5: return true;
      case 6: return !!name.trim() && !!avatarUrl;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) { navigate('/'); return; }

    try {
      const validated = characterSchema.parse({
        name: name.trim(),
        race,
        class: characterClass,
        strength: getTotalScore("strength"),
        dexterity: getTotalScore("dexterity"),
        constitution: getTotalScore("constitution"),
        intelligence: getTotalScore("intelligence"),
        wisdom: getTotalScore("wisdom"),
        charisma: getTotalScore("charisma"),
      });

      setIsSubmitting(true);
      const maxHP = calculateHP();

      // Create character
      const { data: charData, error: charError } = await supabase.from('characters').insert({
        user_id: user.id,
        name: validated.name,
        race: validated.race,
        class: validated.class,
        background: background,
        strength: validated.strength,
        dexterity: validated.dexterity,
        constitution: validated.constitution,
        intelligence: validated.intelligence,
        wisdom: validated.wisdom,
        charisma: validated.charisma,
        hit_points: maxHP,
        max_hit_points: maxHP,
        avatar_url: avatarUrl,
      }).select('id').single();

      if (charError) throw charError;

      // Get selected equipment and add to inventory
      const classEquipment = CLASS_STARTING_EQUIPMENT[characterClass] || [];
      const inventoryItems: { character_id: string; item_name: string; item_type: string; quantity: number; equipped: boolean }[] = [];

      classEquipment.forEach((choice) => {
        const selectedIndex = equipmentChoices[choice.description] ?? 0;
        const selectedOption = choice.options[selectedIndex] || choice.options[0];
        
        selectedOption.forEach((itemStr) => {
          // Parse quantity from item string (e.g., "20 bolts" -> quantity: 20, name: "bolts")
          const quantityMatch = itemStr.match(/^(\d+)\s+(.+)$/);
          let quantity = 1;
          let itemName = itemStr;
          
          if (quantityMatch) {
            quantity = parseInt(quantityMatch[1]);
            itemName = quantityMatch[2];
          } else if (itemStr.toLowerCase().startsWith("two ")) {
            quantity = 2;
            itemName = itemStr.substring(4);
          } else if (itemStr.toLowerCase().startsWith("four ")) {
            quantity = 4;
            itemName = itemStr.substring(5);
          } else if (itemStr.toLowerCase().startsWith("five ")) {
            quantity = 5;
            itemName = itemStr.substring(5);
          }
          
          // Check if this item already exists in our list (combine quantities)
          const existingItem = inventoryItems.find(i => i.item_name.toLowerCase() === itemName.toLowerCase());
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            inventoryItems.push({
              character_id: charData.id,
              item_name: itemName,
              item_type: getItemType(itemName),
              quantity,
              equipped: false,
            });
          }
        });
      });

      // Insert all inventory items
      if (inventoryItems.length > 0) {
        const { error: invError } = await supabase.from('inventory').insert(inventoryItems);
        if (invError) {
          console.error('Error adding starting equipment:', invError);
          // Don't throw - character was created, just equipment failed
        }
      }

      toast({ title: t.characterCreated, description: `${validated.name} ${t.readyForAdventureDesc}` });
      navigate('/characters');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ variant: "destructive", title: t.validationError, description: error.errors[0].message });
      } else {
        console.error('Error creating character:', error);
        toast({ variant: "destructive", title: t.error, description: t.failedToLoadCharacters });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquipmentChoiceChange = (category: string, optionIndex: number) => {
    setEquipmentChoices(prev => ({ ...prev, [category]: optionIndex }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AbilityScoreStep
            method={abilityScores.method}
            onMethodChange={abilityScores.changeMethod}
            baseScores={abilityScores.baseScores}
            raceBonuses={raceBonuses}
            onRollAll={abilityScores.rollAllStats}
            isRolled={abilityScores.isRolled}
            onAssignScore={abilityScores.assignScore}
            onAdjustPointBuy={abilityScores.adjustPointBuy}
            pointsRemaining={abilityScores.pointsRemaining}
            availableScores={abilityScores.getAvailableScores()}
            recommendedAbilities={getRecommendedAbilities()}
          />
        );
      case 2:
        return <RaceSelectionStep selectedRace={race} onSelectRace={setRace} />;
      case 3:
        return (
          <ClassSelectionStep
            selectedClass={characterClass}
            onSelectClass={setCharacterClass}
            abilityScores={abilityScores.baseScores}
            raceBonuses={raceBonuses}
          />
        );
      case 4:
        return <BackgroundSelectionStep selectedBackground={background} onSelectBackground={setBackground} />;
      case 5:
        return (
          <EquipmentStep
            selectedClass={characterClass}
            equipmentChoices={equipmentChoices}
            onEquipmentChoiceChange={handleEquipmentChoiceChange}
            abilityScores={abilityScores.baseScores}
            raceBonuses={raceBonuses}
          />
        );
      case 6:
        return (
          <CharacterSummary
            name={name}
            onNameChange={setName}
            race={race}
            characterClass={characterClass}
            background={background}
            abilityScores={abilityScores.baseScores}
            raceBonuses={raceBonuses}
            avatarUrl={avatarUrl}
            onGenerateAvatar={generateAvatar}
            isGeneratingAvatar={isGeneratingAvatar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-tavern bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/characters')}
            variant="outline"
            className="mb-6 border-gold text-gold hover:bg-gold hover:text-background"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToCharacters}
          </Button>

          <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-card/90 backdrop-blur border-border">
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-gold mb-6 text-center">
              {t.createYourHero}
            </h1>

            <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

            <div className="min-h-[400px]">{renderStep()}</div>

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                disabled={currentStep === 1}
                className="border-border hover:border-gold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>

              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-gold hover:opacity-90"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="bg-gradient-gold hover:opacity-90 font-cinzel font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.creating}
                    </>
                  ) : (
                    t.createCharacter
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
