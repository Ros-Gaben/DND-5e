import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Swords,
  Plus,
  Minus,
  Trash2,
  Play,
  SkipForward,
  RotateCcw,
  Heart,
  Shield,
  ChevronUp,
  ChevronDown,
  Skull,
  User,
  X,
} from "lucide-react";
import { CREATURES, CreatureData } from "@/data/creatures";

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentHP: number;
  maxHP: number;
  ac: number;
  isPlayer: boolean;
  isActive: boolean;
  conditions: string[];
}

interface CombatTrackerProps {
  playerName: string;
  playerHP: number;
  playerMaxHP: number;
  playerAC?: number;
  onPlayerHPChange?: (newHP: number) => void;
}

const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

export default function CombatTracker({
  playerName,
  playerHP,
  playerMaxHP,
  playerAC = 10,
  onPlayerHPChange,
}: CombatTrackerProps) {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(-1);
  const [round, setRound] = useState(1);
  const [isInCombat, setIsInCombat] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // New combatant form state
  const [newName, setNewName] = useState("");
  const [newInitiative, setNewInitiative] = useState("");
  const [newHP, setNewHP] = useState("");
  const [newAC, setNewAC] = useState("");
  const [selectedCreature, setSelectedCreature] = useState<string>("");
  
  // HP modification state
  const [hpModifier, setHpModifier] = useState<{ [key: string]: string }>({});

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sortByInitiative = (list: Combatant[]) => {
    return [...list].sort((a, b) => b.initiative - a.initiative);
  };

  const addCombatant = (combatant: Omit<Combatant, "id" | "isActive" | "conditions">) => {
    const newCombatant: Combatant = {
      ...combatant,
      id: generateId(),
      isActive: true,
      conditions: [],
    };
    setCombatants((prev) => sortByInitiative([...prev, newCombatant]));
    resetForm();
    setAddDialogOpen(false);
  };

  const addFromCreature = (creature: CreatureData) => {
    const initiative = Math.floor(Math.random() * 20) + 1 + Math.floor((creature.stats.dex - 10) / 2);
    addCombatant({
      name: creature.name,
      initiative,
      currentHP: creature.hp,
      maxHP: creature.hp,
      ac: creature.ac,
      isPlayer: false,
    });
  };

  const addPlayer = () => {
    const initiative = parseInt(newInitiative) || Math.floor(Math.random() * 20) + 1;
    addCombatant({
      name: playerName,
      initiative,
      currentHP: playerHP,
      maxHP: playerMaxHP,
      ac: playerAC,
      isPlayer: true,
    });
  };

  const removeCombatant = (id: string) => {
    setCombatants((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // Adjust current turn if needed
      if (currentTurn >= filtered.length) {
        setCurrentTurn(filtered.length > 0 ? 0 : -1);
      }
      return filtered;
    });
  };

  const modifyHP = (id: string, amount: number) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHP = Math.max(0, Math.min(c.maxHP, c.currentHP + amount));
          // If player, also update parent
          if (c.isPlayer && onPlayerHPChange) {
            onPlayerHPChange(newHP);
          }
          return { ...c, currentHP: newHP };
        }
        return c;
      })
    );
    setHpModifier((prev) => ({ ...prev, [id]: "" }));
  };

  const toggleCondition = (id: string, condition: string) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasCondition = c.conditions.includes(condition);
          return {
            ...c,
            conditions: hasCondition
              ? c.conditions.filter((cond) => cond !== condition)
              : [...c.conditions, condition],
          };
        }
        return c;
      })
    );
  };

  const startCombat = () => {
    if (combatants.length === 0) return;
    setIsInCombat(true);
    setCurrentTurn(0);
    setRound(1);
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    const activeCombatants = combatants.filter((c) => c.isActive && c.currentHP > 0);
    if (activeCombatants.length === 0) return;
    
    let nextIndex = currentTurn + 1;
    if (nextIndex >= combatants.length) {
      nextIndex = 0;
      setRound((r) => r + 1);
    }
    // Skip dead combatants
    while (combatants[nextIndex]?.currentHP === 0 && nextIndex < combatants.length) {
      nextIndex++;
      if (nextIndex >= combatants.length) {
        nextIndex = 0;
        setRound((r) => r + 1);
      }
    }
    setCurrentTurn(nextIndex);
  };

  const endCombat = () => {
    setIsInCombat(false);
    setCurrentTurn(-1);
    setRound(1);
  };

  const resetCombat = () => {
    setCombatants([]);
    setIsInCombat(false);
    setCurrentTurn(-1);
    setRound(1);
  };

  const resetForm = () => {
    setNewName("");
    setNewInitiative("");
    setNewHP("");
    setNewAC("");
    setSelectedCreature("");
  };

  const getHPColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.5) return "bg-green-500";
    if (ratio > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-gold/30 bg-card/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-gold font-cinzel">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Combat Tracker
          </div>
          {isInCombat && (
            <Badge variant="outline" className="border-gold text-gold">
              Round {round}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Combat Controls */}
        <div className="flex gap-2 flex-wrap">
          {!isInCombat ? (
            <>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-gold/50 hover:bg-gold/20">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-gold/30">
                  <DialogHeader>
                    <DialogTitle className="text-gold font-cinzel">Add Combatant</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Quick Add Player */}
                    <div className="p-3 border border-gold/30 rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-foreground">Add Your Character</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Initiative"
                          type="number"
                          value={newInitiative}
                          onChange={(e) => setNewInitiative(e.target.value)}
                          className="w-24"
                        />
                        <Button onClick={addPlayer} className="flex-1 bg-gold hover:bg-gold/80 text-background">
                          <User className="w-4 h-4 mr-1" />
                          Add {playerName}
                        </Button>
                      </div>
                    </div>

                    {/* Add from Bestiary */}
                    <div className="p-3 border border-border rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-foreground">Add from Bestiary</p>
                      <Select value={selectedCreature} onValueChange={setSelectedCreature}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select creature..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CREATURES.map((creature) => (
                            <SelectItem key={creature.name} value={creature.name}>
                              {creature.name} (CR {creature.cr})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          const creature = CREATURES.find((c) => c.name === selectedCreature);
                          if (creature) addFromCreature(creature);
                        }}
                        disabled={!selectedCreature}
                        className="w-full"
                        variant="secondary"
                      >
                        <Skull className="w-4 h-4 mr-1" />
                        Add Creature
                      </Button>
                    </div>

                    {/* Custom Combatant */}
                    <div className="p-3 border border-border rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-foreground">Custom Combatant</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="col-span-2"
                        />
                        <Input
                          placeholder="Initiative"
                          type="number"
                          value={newInitiative}
                          onChange={(e) => setNewInitiative(e.target.value)}
                        />
                        <Input
                          placeholder="AC"
                          type="number"
                          value={newAC}
                          onChange={(e) => setNewAC(e.target.value)}
                        />
                        <Input
                          placeholder="HP"
                          type="number"
                          value={newHP}
                          onChange={(e) => setNewHP(e.target.value)}
                          className="col-span-2"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (newName && newHP) {
                            addCombatant({
                              name: newName,
                              initiative: parseInt(newInitiative) || 0,
                              currentHP: parseInt(newHP),
                              maxHP: parseInt(newHP),
                              ac: parseInt(newAC) || 10,
                              isPlayer: false,
                            });
                          }
                        }}
                        disabled={!newName || !newHP}
                        className="w-full"
                        variant="secondary"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Custom
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                onClick={startCombat}
                disabled={combatants.length === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={nextTurn} className="bg-gold hover:bg-gold/80 text-background">
                <SkipForward className="w-4 h-4 mr-1" />
                Next Turn
              </Button>
              <Button size="sm" variant="outline" onClick={endCombat} className="border-red-500/50 text-red-500 hover:bg-red-500/20">
                <X className="w-4 h-4 mr-1" />
                End Combat
              </Button>
            </>
          )}
          {combatants.length > 0 && !isInCombat && (
            <Button size="sm" variant="ghost" onClick={resetCombat} className="text-muted-foreground">
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Combatants List */}
        {combatants.length > 0 ? (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {combatants.map((combatant, index) => (
                <div
                  key={combatant.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isInCombat && index === currentTurn
                      ? "border-gold bg-gold/10 shadow-lg shadow-gold/20"
                      : combatant.currentHP === 0
                      ? "border-red-500/30 bg-red-500/5 opacity-60"
                      : "border-border bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isInCombat && index === currentTurn && (
                        <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                      )}
                      <span
                        className={`font-semibold ${
                          combatant.isPlayer ? "text-gold" : "text-foreground"
                        } ${combatant.currentHP === 0 ? "line-through" : ""}`}
                      >
                        {combatant.name}
                      </span>
                      {combatant.currentHP === 0 && (
                        <Skull className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ChevronUp className="w-3 h-3" />
                        <span>{combatant.initiative}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{combatant.ac}</span>
                      </div>
                      {!isInCombat && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-500 hover:text-red-400"
                          onClick={() => removeCombatant(combatant.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getHPColor(
                            combatant.currentHP,
                            combatant.maxHP
                          )}`}
                          style={{ width: `${(combatant.currentHP / combatant.maxHP) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono min-w-[60px] text-right">
                        {combatant.currentHP}/{combatant.maxHP}
                      </span>
                    </div>

                    {/* HP Modification */}
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="±HP"
                        value={hpModifier[combatant.id] || ""}
                        onChange={(e) =>
                          setHpModifier((prev) => ({ ...prev, [combatant.id]: e.target.value }))
                        }
                        className="h-7 w-16 text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 text-red-500 border-red-500/30 hover:bg-red-500/20"
                        onClick={() => modifyHP(combatant.id, -(parseInt(hpModifier[combatant.id]) || 0))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 text-green-500 border-green-500/30 hover:bg-green-500/20"
                        onClick={() => modifyHP(combatant.id, parseInt(hpModifier[combatant.id]) || 0)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Conditions */}
                  {combatant.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {combatant.conditions.map((condition) => (
                        <Badge
                          key={condition}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive"
                          onClick={() => toggleCondition(combatant.id, condition)}
                        >
                          {condition} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Condition Button */}
                  <Select
                    value=""
                    onValueChange={(value) => toggleCondition(combatant.id, value)}
                  >
                    <SelectTrigger className="h-6 w-full mt-2 text-xs">
                      <SelectValue placeholder="+ Add condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.filter((c) => !combatant.conditions.includes(c)).map(
                        (condition) => (
                          <SelectItem key={condition} value={condition} className="text-xs">
                            {condition}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No combatants yet</p>
            <p className="text-xs">Click "Add" to start tracking combat</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
