import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  isCompleted && "cursor-pointer hover:bg-gold/20",
                  isCurrent && "bg-gold/20 border border-gold",
                  !isCompleted && !isCurrent && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all",
                    isCompleted && "bg-gold text-background",
                    isCurrent && "bg-gold/20 border-2 border-gold text-gold",
                    !isCompleted && !isCurrent && "bg-muted border border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "hidden md:block text-sm font-cinzel",
                    isCurrent && "text-gold",
                    isCompleted && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </button>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block w-8 h-0.5 mx-2",
                    currentStep > step.id ? "bg-gold" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
