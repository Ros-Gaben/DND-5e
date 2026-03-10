import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Heart, RotateCcw, Dices, Check, X } from "lucide-react";

interface DeathSavesProps {
  isVisible: boolean;
  onStabilize?: () => void;
  onDeath?: () => void;
  onReset?: () => void;
}

export default function DeathSaves({
  isVisible,
  onStabilize,
  onDeath,
  onReset,
}: DeathSavesProps) {
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [status, setStatus] = useState<"rolling" | "stable" | "dead" | null>(null);

  useEffect(() => {
    if (successes >= 3) {
      setStatus("stable");
      onStabilize?.();
    } else if (failures >= 3) {
      setStatus("dead");
      onDeath?.();
    }
  }, [successes, failures, onStabilize, onDeath]);

  const rollDeathSave = () => {
    if (status) return;
    
    setIsRolling(true);
    setLastRoll(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setLastRoll(roll);
      setIsRolling(false);

      if (roll === 20) {
        // Nat 20: Regain 1 HP, stabilize
        setSuccesses(3);
      } else if (roll === 1) {
        // Nat 1: Two failures
        setFailures((prev) => Math.min(3, prev + 2));
      } else if (roll >= 10) {
        // Success
        setSuccesses((prev) => prev + 1);
      } else {
        // Failure
        setFailures((prev) => prev + 1);
      }
    }, 800);
  };

  const reset = () => {
    setSuccesses(0);
    setFailures(0);
    setLastRoll(null);
    setStatus(null);
    onReset?.();
  };

  const manualSuccess = () => {
    if (status || successes >= 3) return;
    setSuccesses((prev) => prev + 1);
  };

  const manualFailure = () => {
    if (status || failures >= 3) return;
    setFailures((prev) => prev + 1);
  };

  if (!isVisible) return null;

  return (
    <Card className="border-red-500/50 bg-red-950/30 backdrop-blur animate-scale-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-red-400 font-cinzel">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5" />
            Death Saving Throws
          </div>
          {status && (
            <Button
              size="sm"
              variant="ghost"
              onClick={reset}
              className="text-muted-foreground h-7"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Banner */}
        {status === "stable" && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center animate-scale-in">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Heart className="w-5 h-5" />
              <span className="font-cinzel font-bold">STABILIZED!</span>
            </div>
            {lastRoll === 20 && (
              <p className="text-xs text-green-300 mt-1">
                Natural 20! You regain 1 hit point!
              </p>
            )}
          </div>
        )}

        {status === "dead" && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center animate-scale-in">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <Skull className="w-5 h-5" />
              <span className="font-cinzel font-bold">DEATH</span>
            </div>
            <p className="text-xs text-red-300 mt-1">
              Your character has fallen...
            </p>
          </div>
        )}

        {/* Saves Display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Successes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Successes
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-green-400 hover:bg-green-500/20"
                onClick={manualSuccess}
                disabled={!!status}
              >
                <Check className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={`success-${i}`}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    i < successes
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-green-500/30"
                  }`}
                >
                  {i < successes && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Failures */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-red-400 flex items-center gap-1">
                <X className="w-4 h-4" />
                Failures
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-red-400 hover:bg-red-500/20"
                onClick={manualFailure}
                disabled={!!status}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={`failure-${i}`}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    i < failures
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-red-500/30"
                  }`}
                >
                  {i < failures && <Skull className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Roll Display */}
        {lastRoll !== null && !isRolling && (
          <div className="text-center">
            <Badge
              variant="outline"
              className={`text-lg px-4 py-1 ${
                lastRoll === 20
                  ? "border-gold text-gold bg-gold/20"
                  : lastRoll === 1
                  ? "border-red-500 text-red-400 bg-red-500/20"
                  : lastRoll >= 10
                  ? "border-green-500 text-green-400 bg-green-500/20"
                  : "border-red-400 text-red-400 bg-red-500/20"
              }`}
            >
              Rolled: {lastRoll}
              {lastRoll === 20 && " (Critical!)"}
              {lastRoll === 1 && " (Critical Fail!)"}
            </Badge>
          </div>
        )}

        {/* Roll Button */}
        {!status && (
          <Button
            onClick={rollDeathSave}
            disabled={isRolling}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isRolling ? (
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 animate-spin" />
                Rolling...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4" />
                Roll Death Save (d20)
              </div>
            )}
          </Button>
        )}

        {/* Rules Reference */}
        <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-2">
          <p>• <span className="text-green-400">10+</span> = Success | <span className="text-red-400">9 or less</span> = Failure</p>
          <p>• <span className="text-gold">Natural 20</span> = Regain 1 HP</p>
          <p>• <span className="text-red-400">Natural 1</span> = Two failures</p>
          <p>• Taking damage at 0 HP = 1 failure (crit = 2)</p>
        </div>
      </CardContent>
    </Card>
  );
}
