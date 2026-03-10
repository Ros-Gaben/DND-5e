import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { LanguageToggle } from "./LanguageToggle";
import { Swords, Shield, Sparkles } from "lucide-react";
import tavernBg from "@/assets/tavern-background.jpg";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/characters');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFormSwitch = (loginMode: boolean) => {
    if (loginMode !== isLogin) {
      setIsTransitioning(true);
      setSlideDirection(loginMode ? 'left' : 'right');
      setTimeout(() => {
        setIsLogin(loginMode);
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

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
        <Swords className="w-16 h-16 text-gold" />
      </div>
      <div className="absolute top-20 right-20 opacity-20 animate-float z-10" style={{ animationDelay: "1s" }}>
        <Shield className="w-20 h-20 text-gold" />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-20 animate-float z-10" style={{ animationDelay: "2s" }}>
        <Sparkles className="w-12 h-12 text-accent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl">
          {/* Logo/Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block">
              {/* Ornamental Top */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold to-gold" />
                <Swords className="w-5 h-5 text-gold animate-pulse" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent via-gold to-gold" />
              </div>
              
              {/* Main Title with gradient and shadow */}
              <h1 className="font-cinzel text-5xl md:text-7xl font-bold mb-3 relative">
                <span className="absolute inset-0 text-gold blur-md opacity-50 animate-glow-pulse">
                  Dungeon & Dragons
                </span>
                <span className="relative bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                  Dungeon & Dragons
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-parchment text-xl md:text-2xl font-crimson italic mb-3 tracking-wide">
                {t.enterTheDarkFantasy}
              </p>
              
              {/* Ornamental Bottom */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
            </div>
          </div>

          {/* Auth Container */}
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/10 to-transparent" />
                <div className="absolute inset-0 -left-1 w-3 bg-gradient-to-r from-transparent via-shadow/5 to-transparent blur-[1px]" />
                <div className="absolute inset-0 -right-1 w-3 bg-gradient-to-l from-transparent via-parchment-dark/8 to-transparent blur-[1px]" />
              </div>
              
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-lg z-10" />

              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-md relative z-10">
                <button
                  onClick={() => handleFormSwitch(true)}
                  className={`flex-1 py-2 px-4 rounded font-cinzel text-sm font-semibold transition-magical ${
                    isLogin
                      ? "bg-gradient-gold text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => handleFormSwitch(false)}
                  className={`flex-1 py-2 px-4 rounded font-cinzel text-sm font-semibold transition-magical ${
                    !isLogin
                      ? "bg-gradient-gold text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.signUp}
                </button>
              </div>

              {/* Forms */}
              <div className="relative overflow-hidden transition-all duration-300 z-10">
                <div 
                  className={`transition-all duration-300 ${
                    isTransitioning 
                      ? slideDirection === 'left' 
                        ? '-translate-x-full opacity-0' 
                        : 'translate-x-full opacity-0'
                      : 'translate-x-0 opacity-100'
                  }`}
                >
                  {isLogin ? <LoginForm /> : <RegisterForm />}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-muted-foreground text-sm mt-6 font-crimson">
            "{t.footerQuote}"
          </p>
        </div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-ember/10 rounded-full blur-3xl animate-flicker" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-flicker" style={{ animationDelay: "1.5s" }} />
    </div>
  );
};
