import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowLeft, Send, Lock, Sparkles, Shield, Scroll } from "lucide-react";
import { z } from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import tavernBg from "@/assets/tavern-background.jpg";

const emailSchema = z.object({
  email: z.string().email("Invalid email address").max(255)
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: "Too weak", color: "text-destructive" });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (password) {
      calculatePasswordStrength(password);
    } else {
      setPasswordStrength({ score: 0, label: "Too weak", color: "text-destructive" });
    }
  }, [password]);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    
    let label = "Too weak";
    let color = "text-destructive";
    
    if (score >= 5) {
      label = "Strong";
      color = "text-green-500";
    } else if (score >= 4) {
      label = "Good";
      color = "text-gold";
    } else if (score >= 3) {
      label = "Fair";
      color = "text-amber-500";
    }
    
    setPasswordStrength({ score: Math.min(score, 6), label, color });
  };

  const transitionToStep = (newStep: 1 | 2 | 3) => {
    setIsTransitioning(true);
    setSlideDirection(newStep > step ? 'right' : 'left');
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = emailSchema.parse({ email });
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        validated.email
      );

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: "destructive",
        });
      } else {
        transitionToStep(2);
        setTimeLeft(300);
        setCanResend(false);
        toast({
          title: t.verificationCodeSent,
          description: t.checkEmailForCode,
        });
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: t.invalidCode,
        description: t.enterSixDigitCode,
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: "destructive",
        });
      } else {
        transitionToStep(3);
        toast({
          title: t.codeVerified,
          description: t.nowSetNewPassword,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.error,
        description: error.message || "Failed to verify code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = passwordSchema.parse({ password, confirmPassword });
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset.",
        });
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTimeLeft(300);
        setCanResend(false);
        setOtp("");
        toast({
          title: t.codeResent,
          description: t.codeResentDesc,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t.error,
        description: error.message || t.verifyFailed,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${tavernBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
      </div>

      {/* Fog Layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/10 to-transparent animate-[slide-in-right_40s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-r from-muted/5 via-transparent to-muted/5 animate-[slide-out-right_60s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-shadow/10 to-transparent animate-[slide-in-right_50s_linear_infinite]" />
      </div>

      {/* Particle System - Embers */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`ember-${i}`}
          className="absolute w-1 h-1 bg-ember rounded-full opacity-40 pointer-events-none blur-[1px]"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
            animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 4px hsl(var(--ember))',
          }}
        />
      ))}

      {/* Particle System - Sparkles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-0.5 h-0.5 bg-gold rounded-full opacity-60 pointer-events-none animate-flicker"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 0 3px hsl(var(--gold))',
          }}
        />
      ))}

      {/* Interactive Dust Particles */}
      {Array.from({ length: 25 }).map((_, i) => {
        const baseX = (i * 4) % 100;
        const baseY = ((i * 7) % 100);
        const distX = mousePos.x - (window.innerWidth * baseX / 100);
        const distY = mousePos.y - (window.innerHeight * baseY / 100);
        const distance = Math.sqrt(distX * distX + distY * distY);
        const maxDistance = 200;
        const influence = Math.max(0, 1 - distance / maxDistance);
        const pushX = influence * (distX / distance) * -30;
        const pushY = influence * (distY / distance) * -30;

        return (
          <div
            key={`interactive-dust-${i}`}
            className="absolute w-1 h-1 bg-gold/40 rounded-full pointer-events-none blur-[2px] transition-transform duration-1000 ease-out"
            style={{
              left: `${baseX}%`,
              top: `${baseY}%`,
              transform: `translate(${pushX}px, ${pushY}px)`,
              boxShadow: '0 0 4px hsl(var(--gold) / 0.3)',
              opacity: 0.3 + influence * 0.4,
            }}
          />
        );
      })}

      {/* Mystical Glowing Spots */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute w-32 h-32 rounded-full pointer-events-none blur-3xl animate-glow-pulse"
          style={{
            left: i % 2 === 0 ? `${5 + (i * 15)}%` : 'auto',
            right: i % 2 === 1 ? `${5 + (i * 15)}%` : 'auto',
            top: `${10 + (i * 15)}%`,
            background: i % 3 === 0 
              ? 'radial-gradient(circle, hsl(var(--gold) / 0.08) 0%, transparent 70%)' 
              : i % 3 === 1
              ? 'radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--ember) / 0.05) 0%, transparent 70%)',
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Floating Magical Orbs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute w-2 h-2 rounded-full pointer-events-none animate-float"
          style={{
            left: `${15 + i * 20}%`,
            top: `${20 + Math.random() * 60}%`,
            background: `radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)`,
            opacity: 0.3,
            animationDelay: `${i * 1.2}s`,
            boxShadow: '0 0 20px hsl(var(--gold) / 0.5)',
          }}
        />
      ))}

      {/* Rotating Light Beams */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(var(--gold)) 90deg, transparent 180deg)',
          animation: 'spin 30s linear infinite',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, hsl(var(--ember)) 90deg, transparent 180deg)',
          animation: 'spin 40s linear infinite reverse',
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-20 animate-float z-10">
        <Scroll className="w-16 h-16 text-gold" />
      </div>
      <div className="absolute top-20 right-20 opacity-20 animate-float z-10" style={{ animationDelay: "1s" }}>
        <Shield className="w-20 h-20 text-gold" />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-20 animate-float z-10" style={{ animationDelay: "2s" }}>
        <Sparkles className="w-12 h-12 text-accent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md md:max-w-lg">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-parchment hover:text-gold transition-magical mb-6 font-crimson group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t.returnToLogin}
          </button>

          {/* Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold to-gold" />
              <Lock className="w-5 h-5 text-gold animate-pulse" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-gold to-gold" />
            </div>
            
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-3 relative">
              <span className="absolute inset-0 text-gold blur-md opacity-50 animate-glow-pulse">
                {step === 1 && t.recoverYourKey}
                {step === 2 && t.mysticVerification}
                {step === 3 && t.forgeNewKey}
              </span>
              <span className="relative bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                {step === 1 && t.recoverYourKey}
                {step === 2 && t.mysticVerification}
                {step === 3 && t.forgeNewKey}
              </span>
            </h1>
            
            <p className="text-parchment text-lg font-crimson italic">
              {step === 1 && t.enterEmailForCode}
              {step === 2 && t.decipherCode}
              {step === 3 && t.createNewPassword}
            </p>
          </div>

          {/* Form Container */}
          <div className="relative">
            {/* Decorative Border */}
            <div className="absolute -inset-1 bg-gradient-gold rounded-lg opacity-10 blur-xl" />
            
            {/* Form Card */}
            <div className="relative bg-card/80 backdrop-blur-md border-2 border-border/50 rounded-lg p-8 shadow-deep transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(251,191,36,0.25)] overflow-hidden">
              {/* Aged Paper Edge Effect */}
              <div className="absolute inset-0 pointer-events-none z-0 rounded-lg"
                style={{
                  background: `
                    linear-gradient(to right, hsl(var(--shadow)) 0%, transparent 4%, transparent 96%, hsl(var(--shadow)) 100%),
                    linear-gradient(to bottom, hsl(var(--shadow)) 0%, transparent 4%, transparent 96%, hsl(var(--shadow)) 100%)
                  `,
                  boxShadow: `
                    inset 0 0 20px rgba(0,0,0,0.3),
                    inset 0 0 40px rgba(101,67,33,0.2)
                  `,
                }}
              />
              
              {/* Burnt/Aged Border Spots */}
              <div className="absolute top-0 left-1/4 w-16 h-8 bg-gradient-to-b from-amber-950/30 to-transparent blur-sm pointer-events-none z-0" />
              <div className="absolute top-0 right-1/3 w-20 h-6 bg-gradient-to-b from-amber-900/20 to-transparent blur-sm pointer-events-none z-0" />
              <div className="absolute bottom-0 left-1/3 w-12 h-10 bg-gradient-to-t from-amber-950/30 to-transparent blur-sm pointer-events-none z-0" />
              <div className="absolute bottom-0 right-1/4 w-16 h-8 bg-gradient-to-t from-amber-900/25 to-transparent blur-sm pointer-events-none z-0" />
              <div className="absolute left-0 top-1/3 w-6 h-16 bg-gradient-to-r from-amber-950/25 to-transparent blur-sm pointer-events-none z-0" />
              <div className="absolute right-0 top-1/2 w-8 h-20 bg-gradient-to-l from-amber-900/20 to-transparent blur-sm pointer-events-none z-0" />
              
              {/* Parchment Texture Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, hsl(var(--parchment)) 0px, transparent 1px, transparent 2px, hsl(var(--parchment)) 3px),
                    repeating-linear-gradient(90deg, hsl(var(--parchment)) 0px, transparent 1px, transparent 2px, hsl(var(--parchment)) 3px),
                    repeating-linear-gradient(45deg, hsl(var(--parchment-dark)) 0px, transparent 1px, transparent 2px, hsl(var(--parchment)) 3px),
                    repeating-radial-gradient(circle at 20% 30%, hsl(var(--parchment)) 0px, transparent 1px, transparent 2px),
                    repeating-radial-gradient(circle at 80% 70%, hsl(var(--parchment-dark)) 0px, transparent 1px, transparent 2px),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")
                  `,
                  backgroundSize: '3px 3px, 3px 3px, 4px 4px, 50px 50px, 60px 60px, cover',
                  mixBlendMode: 'overlay',
                }}
              />
              
              {/* Vintage Paper Fold Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px pointer-events-none z-0 -translate-x-1/2">
                {/* Main fold line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/10 to-transparent" />
                {/* Shadow on left side of fold */}
                <div className="absolute inset-0 -left-1 w-3 bg-gradient-to-r from-transparent via-shadow/5 to-transparent blur-[1px]" />
                {/* Highlight on right side of fold */}
                <div className="absolute inset-0 -right-1 w-3 bg-gradient-to-l from-transparent via-parchment-dark/8 to-transparent blur-[1px]" />
              </div>
              
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-lg z-10" />

              {/* Form Content */}
              <div className="relative overflow-hidden z-10">
                <div 
                  className={`transition-all duration-300 ${
                    isTransitioning 
                      ? slideDirection === 'left' 
                        ? '-translate-x-full opacity-0' 
                        : 'translate-x-full opacity-0'
                      : 'translate-x-0 opacity-100'
                  }`}
                >
{step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-cinzel text-sm">
                  {t.emailAddress}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hero@realm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-cinzel font-semibold shadow-md hover:shadow-lg transition-magical group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t.sending}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    {t.sendVerificationCode}
                  </span>
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    pattern="^[0-9]+$"
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="animate-fade-in" style={{ animationDelay: '0ms' }} />
                      <InputOTPSlot index={1} className="animate-fade-in" style={{ animationDelay: '50ms' }} />
                      <InputOTPSlot index={2} className="animate-fade-in" style={{ animationDelay: '100ms' }} />
                      <InputOTPSlot index={3} className="animate-fade-in" style={{ animationDelay: '150ms' }} />
                      <InputOTPSlot index={4} className="animate-fade-in" style={{ animationDelay: '200ms' }} />
                      <InputOTPSlot index={5} className="animate-fade-in" style={{ animationDelay: '250ms' }} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground font-crimson">
                     {t.timeRemaining} <span className="font-semibold text-gold">{formatTime(timeLeft)}</span>
                  </p>
                  {canResend && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-gold hover:text-gold/80 font-crimson"
                    >
                      {t.resendCode}
                    </Button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-cinzel font-semibold shadow-md hover:shadow-lg transition-magical"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t.verifying}
                  </span>
                ) : (
                  t.verifyCode
                )}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-cinzel text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-crimson">
                        Password strength:
                      </span>
                      <span className={`text-xs font-semibold font-cinzel ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score
                              ? passwordStrength.score >= 5
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                : passwordStrength.score >= 4
                                ? 'bg-gold shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : passwordStrength.score >= 3
                                ? 'bg-amber-500'
                                : 'bg-destructive'
                              : 'bg-muted/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-crimson space-y-1">
                      <p className={password.length >= 8 ? "text-green-500" : ""}>
                        {password.length >= 8 ? "✓" : "○"} At least 8 characters
                      </p>
                      <p className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-green-500" : ""}>
                        {/[A-Z]/.test(password) && /[a-z]/.test(password) ? "✓" : "○"} Upper & lowercase letters
                      </p>
                      <p className={/[0-9]/.test(password) ? "text-green-500" : ""}>
                        {/[0-9]/.test(password) ? "✓" : "○"} At least one number
                      </p>
                      <p className={/[^a-zA-Z0-9]/.test(password) ? "text-green-500" : ""}>
                        {/[^a-zA-Z0-9]/.test(password) ? "✓" : "○"} Special character
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-cinzel text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 text-lg bg-input border-border focus:border-gold text-gold placeholder:text-gold/50 transition-magical"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive font-crimson animate-fade-in">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-cinzel font-semibold shadow-md hover:shadow-lg transition-magical"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}</div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-ember/10 rounded-full blur-3xl animate-flicker" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-flicker" style={{ animationDelay: "1.5s" }} />
    </div>
  );
};

export default ForgotPassword;