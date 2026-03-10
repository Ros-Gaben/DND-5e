import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Dice3DProps {
  sides: number;
  result?: number;
  isRolling: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const DICE_COLORS: Record<number, string> = {
  4: "from-purple-500 to-purple-700",
  6: "from-blue-500 to-blue-700",
  8: "from-green-500 to-green-700",
  10: "from-yellow-500 to-yellow-700",
  12: "from-orange-500 to-orange-700",
  20: "from-red-500 to-red-700",
};

const DICE_SIZES = {
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-xl",
  lg: "w-20 h-20 text-2xl",
};

export default function Dice3D({ sides, result, isRolling, size = "md", color }: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState<number | string>("?");
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [rotateZ, setRotateZ] = useState(0);

  useEffect(() => {
    if (isRolling) {
      // Animate random numbers during roll
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * sides) + 1);
        setRotateX(prev => prev + 90 + Math.random() * 180);
        setRotateY(prev => prev + 90 + Math.random() * 180);
        setRotateZ(prev => prev + 45 + Math.random() * 90);
      }, 100);

      return () => clearInterval(interval);
    } else if (result !== undefined) {
      setDisplayValue(result);
      // Final rotation to "land"
      setRotateX(prev => Math.round(prev / 360) * 360);
      setRotateY(prev => Math.round(prev / 360) * 360);
      setRotateZ(0);
    }
  }, [isRolling, result, sides]);

  const gradientColor = color || DICE_COLORS[sides] || "from-gray-500 to-gray-700";
  const sizeClass = DICE_SIZES[size];

  return (
    <div 
      className="perspective-500"
      style={{ perspective: "500px" }}
    >
      <div
        className={cn(
          sizeClass,
          "relative transition-transform duration-300 ease-out",
          "flex items-center justify-center",
          "rounded-lg shadow-lg",
          `bg-gradient-to-br ${gradientColor}`,
          "border-2 border-white/20",
          "font-bold text-white",
          isRolling && "animate-bounce"
        )}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
          transformStyle: "preserve-3d",
          boxShadow: isRolling 
            ? "0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.2)"
            : "0 10px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.1)",
        }}
      >
        {/* Die face with the number */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <span className="drop-shadow-lg">{displayValue}</span>
        </div>
        
        {/* Glow effect for crits */}
        {result === 20 && sides === 20 && !isRolling && (
          <div className="absolute inset-0 rounded-lg animate-pulse bg-gold/30" />
        )}
        {result === 1 && sides === 20 && !isRolling && (
          <div className="absolute inset-0 rounded-lg animate-pulse bg-red-500/30" />
        )}
        
        {/* Die type indicator */}
        <div className="absolute -bottom-1 -right-1 text-[10px] bg-black/50 rounded px-1 text-white/80">
          d{sides}
        </div>
      </div>
    </div>
  );
}
