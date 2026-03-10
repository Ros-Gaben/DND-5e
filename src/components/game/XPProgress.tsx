import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getXPProgress, getXPForNextLevel, XP_THRESHOLDS } from "@/data/leveling-system";

interface XPProgressProps {
  experience: number;
  level: number;
}

const XPProgress = ({ experience, level }: XPProgressProps) => {
  const progress = getXPProgress(experience, level);
  const nextLevelXP = getXPForNextLevel(level);
  const currentThreshold = XP_THRESHOLDS[level];
  const isMaxLevel = level >= 20;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-gold" />
          <span className="font-semibold text-foreground">Experience</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {experience.toLocaleString()} XP
        </span>
      </div>
      
      {!isMaxLevel && (
        <>
          <Progress 
            value={progress} 
            className="h-2 bg-muted [&>div]:bg-gold" 
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lvl {level}: {currentThreshold.toLocaleString()}</span>
            <span>Lvl {level + 1}: {nextLevelXP.toLocaleString()}</span>
          </div>
        </>
      )}
      
      {isMaxLevel && (
        <p className="text-xs text-gold">Maximum Level Reached!</p>
      )}
    </div>
  );
};

export default XPProgress;
