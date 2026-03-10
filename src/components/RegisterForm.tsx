import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  characterName: z.string().trim().min(1, "Character name is required").max(30, "Character name must be less than 30 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const RegisterForm = () => {
  const [characterName, setCharacterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    const strengthMap = [
      { label: t.veryWeak, color: "text-red-500" },
      { label: t.weak, color: "text-orange-500" },
      { label: t.fair, color: "text-yellow-500" },
      { label: t.good, color: "text-blue-500" },
      { label: t.strong, color: "text-green-500" },
      { label: t.veryStrong, color: "text-emerald-500" },
    ];

    return { score, ...strengthMap[score] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = registerSchema.parse({
        characterName,
        email,
        password,
        confirmPassword
      });

      setIsLoading(true);
      
      const { error } = await signUp(validated.email, validated.password, validated.characterName);
      
      if (error) {
        toast({
          title: t.registrationFailed,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.heroCreated,
          description: `${t.welcomeToRealm}, ${validated.characterName}!`,
        });
        navigate('/characters');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: t.validationError,
          description: error.errors[0].message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="characterName" className="text-foreground font-cinzel text-sm">
          {t.nickname}
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="characterName"
            type="text"
            placeholder={t.createYourName}
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            required
            className="pl-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-foreground font-cinzel text-sm">
          {t.email}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="hero@realm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-foreground font-cinzel text-sm">
          {t.password}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder={t.createSecretKey}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(calculatePasswordStrength(e.target.value));
            }}
            required
            className="pl-10 pr-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-magical"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {password && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-cinzel">{t.passwordStrength}:</span>
              <span className={`font-semibold font-cinzel ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full transition-all duration-500 ${
                  passwordStrength.score <= 1
                    ? "bg-red-500"
                    : passwordStrength.score <= 2
                    ? "bg-orange-500"
                    : passwordStrength.score <= 3
                    ? "bg-yellow-500"
                    : passwordStrength.score <= 4
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-muted-foreground/50"}`} />
                <span className="font-crimson">{t.atLeast8Chars}</span>
              </div>
              <div className={`flex items-center gap-2 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`w-1 h-1 rounded-full ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? "bg-green-500" : "bg-muted-foreground/50"}`} />
                <span className="font-crimson">{t.upperAndLower}</span>
              </div>
              <div className={`flex items-center gap-2 ${/\d/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`w-1 h-1 rounded-full ${/\d/.test(password) ? "bg-green-500" : "bg-muted-foreground/50"}`} />
                <span className="font-crimson">{t.atLeastOneNumber}</span>
              </div>
              <div className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`w-1 h-1 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? "bg-green-500" : "bg-muted-foreground/50"}`} />
                <span className="font-crimson">{t.specialCharacter}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-foreground font-cinzel text-sm">
          {t.confirmPassword}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t.confirmSecretKey}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-10 pr-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-magical"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!!isLoading}
        className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-cinzel font-semibold shadow-md hover:shadow-lg transition-magical group"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            {t.creatingHero}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {t.beginAdventure}
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center font-crimson italic">
        {t.agreementText}
      </p>
    </form>
  );
};
