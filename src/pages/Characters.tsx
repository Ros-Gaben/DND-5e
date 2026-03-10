import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  LogOut, 
  Trash2, 
  Swords, 
  Heart,
  Mail,
  User,
  ArrowUpDown,
  Clock,
  TrendingUp
} from "lucide-react";
import AvatarImage from "@/components/AvatarImage";
import StoryJournal from "@/components/StoryJournal";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = 'newest' | 'oldest' | 'level-high' | 'level-low' | 'last-played';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hit_points: number;
  max_hit_points: number;
  avatar_url?: string;
  updated_at: string;
  created_at: string;
}

interface Profile {
  character_name: string | null;
}

const Characters = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('last-played');

  const sortedCharacters = useMemo(() => {
    const sorted = [...characters];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'level-high':
        return sorted.sort((a, b) => b.level - a.level);
      case 'level-low':
        return sorted.sort((a, b) => a.level - b.level);
      case 'last-played':
      default:
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
  }, [characters, sortBy]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadCharacters();
    loadProfile();
    
    // Show welcome message on first load
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
      setTimeout(() => setShowWelcome(false), 4000);
    }
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('character_name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCharacters(data || []);
    } catch (error) {
      console.error('Error loading characters:', error);
      toast({
        title: t.error,
        description: t.failedToLoadCharacters,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string, characterName: string) => {
    setDeletingId(characterId);
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      setCharacters(prev => prev.filter(c => c.id !== characterId));
      toast({
        title: t.characterDeleted,
        description: `${characterName} ${t.removedFromRoster}`,
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: t.error,
        description: t.failedToLoadCharacters,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem('hasSeenWelcome');
    await signOut();
    navigate('/');
  };

  const nickname = profile?.character_name || user?.email?.split('@')[0] || 'Adventurer';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-cinzel">{t.loadingHeroes}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-tavern bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        {/* Welcome Toast */}
        {showWelcome && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 border border-gold/50 rounded-lg px-6 py-3 backdrop-blur-md shadow-lg shadow-gold/10">
              <p className="font-cinzel text-lg text-gold">
                {t.welcomeBack}, <span className="font-bold">{nickname}</span>!
              </p>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Header with User Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-cinzel font-bold text-gold">{t.yourCharacters}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gold/70" />
                  <span>{nickname}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gold/70" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-gold/50 text-gold hover:bg-gold hover:text-background"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.signOut}
              </Button>
            </div>
          </div>

          {/* Sorting Controls */}
          {characters.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpDown className="w-4 h-4" />
                <span>{t.sortBy}</span>
              </div>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-played">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t.lastPlayed}
                    </div>
                  </SelectItem>
                  <SelectItem value="level-high">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {t.levelHighToLow}
                    </div>
                  </SelectItem>
                  <SelectItem value="level-low">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      {t.levelLowToHigh}
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t.newestFirst}
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t.oldestFirst}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Character Card */}
            <Card
              onClick={() => navigate('/create-character')}
              className="group p-8 border-2 border-dashed border-gold/30 hover:border-gold cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 bg-card/30 backdrop-blur flex flex-col items-center justify-center min-h-[280px]"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <Plus className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-cinzel text-gold">{t.createNewCharacter}</h3>
              <p className="text-muted-foreground text-center mt-2">{t.beginYourAdventure}</p>
            </Card>

            {/* Character Cards */}
            {sortedCharacters.map((character) => (
              <Card
                key={character.id}
                className="group relative border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 bg-card/80 backdrop-blur overflow-hidden"
              >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                
                <div className="p-6">
                  {/* Header with Avatar and Info */}
                  <div 
                    className="flex items-start gap-4 mb-4 cursor-pointer"
                    onClick={() => navigate(`/game/${character.id}`)}
                  >
                    <div className="relative">
                      <AvatarImage
                        src={character.avatar_url}
                        alt={`${character.name}'s avatar`}
                        className="w-20 h-20 rounded-lg border-2 border-gold/30 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-background border border-gold/50 rounded-full px-2 py-0.5">
                        <span className="text-xs font-bold text-gold">Lv.{character.level}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-cinzel font-bold text-gold truncate group-hover:text-gold/80 transition-colors">
                        {character.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {character.race} {character.class}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Swords className="w-4 h-4 text-gold/60" />
                        <span className="text-xs text-muted-foreground">{t.readyForAdventureShort}</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div 
                    className="space-y-2 cursor-pointer"
                    onClick={() => navigate(`/game/${character.id}`)}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-muted-foreground">{t.hitPoints}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {character.hit_points} / {character.max_hit_points}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-600 via-red-500 to-red-400"
                        style={{
                          width: `${(character.hit_points / character.max_hit_points) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Story Journal */}
                  <StoryJournal characterId={character.id} />

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gold hover:text-gold hover:bg-gold/10"
                      onClick={() => navigate(`/game/${character.id}`)}
                    >
                      {t.continueAdventure}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === character.id}
                        >
                          {deletingId === character.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-destructive/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive">
                            {t.deleteConfirmTitle} {character.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteConfirmDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteCharacter(character.id, character.name)}
                          >
                            {t.deleteForever}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Characters;
