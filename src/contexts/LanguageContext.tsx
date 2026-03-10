import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "pl";

interface Translations {
  // Auth Page
  enterTheDarkFantasy: string;
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  enterYourAdventure: string;
  beginAdventure: string;
  forgotSecretKey: string;
  createYourName: string;
  createSecretKey: string;
  confirmSecretKey: string;
  enterSecretKey: string;
  entering: string;
  creatingHero: string;
  loginFailed: string;
  registrationFailed: string;
  validationError: string;
  heroCreated: string;
  welcomeToRealm: string;
  passwordStrength: string;
  veryWeak: string;
  weak: string;
  fair: string;
  good: string;
  strong: string;
  veryStrong: string;
  atLeast8Chars: string;
  upperAndLower: string;
  atLeastOneNumber: string;
  specialCharacter: string;
  agreementText: string;
  footerQuote: string;

  // Characters Page
  yourCharacters: string;
  signOut: string;
  sortBy: string;
  lastPlayed: string;
  levelHighToLow: string;
  levelLowToHigh: string;
  newestFirst: string;
  oldestFirst: string;
  createNewCharacter: string;
  beginYourAdventure: string;
  readyForAdventure: string;
  hitPoints: string;
  continueAdventure: string;
  deleteCharacter: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  cancel: string;
  deleteForever: string;
  characterDeleted: string;
  removedFromRoster: string;
  loadingHeroes: string;
  welcomeBack: string;
  error: string;
  failedToLoadCharacters: string;

  // Create Character Page
  createYourHero: string;
  back: string;
  next: string;
  createCharacter: string;
  creating: string;

  // Character Creation Steps
  chooseYourRace: string;
  raceDescription: string;
  chooseYourClass: string;
  classDescription: string;
  chooseBackground: string;
  backgroundDescription: string;
  abilityScores: string;
  abilityScoresDescription: string;
  equipment: string;
  equipmentDescription: string;
  characterSummary: string;
  reviewCharacter: string;
  costValue: string;
  pointsLeft: string;
  recomended: string;
  availible: string;
  dropLow: string;
  characterName: string;
  characterReady: string;

  // Ability Score Method
  standardArray: string;
  pointBuy: string;
  rollDice: string;
  pointsRemaining: string;

  // Game Page
  describeYourAction: string;
  inventory: string;
  noItemsYet: string;
  items: string;
  level: string;
  experience: string;
  armorClass: string;
  proficiencyBonus: string;
  speed: string;

  // Combat
  combat: string;
  round: string;
  yourTurn: string;
  initiative: string;
  conditions: string;
  hp: string;

  // Story Journal
  storyJournal: string;
  entries: string;
  npcsMet: string;
  locations: string;
  questsStarted: string;
  questsCompleted: string;
  decisions: string;
  discoveries: string;
  battles: string;
  itemsFound: string;
  relationships: string;
  plotPoints: string;

  // Rest
  shortRest: string;
  longRest: string;
  takeShortRest: string;

  // 404 Page
  pageNotFound: string;
  oopsPageNotFound: string;
  returnToHome: string;

  // Forgot Password
  recoverYourKey: string;
  enterEmailForCode: string;
  mysticVerification: string;
  decipherCode: string;
  forgeNewKey: string;
  createNewPassword: string;
  returnToLogin: string;
  emailAddress: string;
  sendVerificationCode: string;
  sending: string;
  verifyCode: string;
  verifying: string;
  resendCode: string;
  codeResent: string;
  codeResentDesc: string;
  timeRemaining: string;
  verificationCodeSent: string;
  checkEmailForCode: string;
  invalidCode: string;
  enterSixDigitCode: string;
  codeVerified: string;
  nowSetNewPassword: string;
  passwordUpdated: string;
  passwordSuccessfullyReset: string;
  updating: string;
  passwordsDoNotMatch: string;
  verifyFailed: string;

  // Reset Password
  resetYourPassword: string;
  enterNewPasswordBelow: string;
  invalidOrExpiredLink: string;
  requestNewResetLink: string;
  newPassword: string;
  confirmNewPassword: string;
  enterNewPassword: string;
  confirmNewPasswordPlaceholder: string;
  updatingPassword: string;
  resetPassword: string;

  // General
  loading: string;
  save: string;
  confirm: string;
  skip: string;
  close: string;
  language: string;
  english: string;
  polish: string;

  // Additional Game UI
  health: string;
  stats: string;
  proficiency: string;
  alignToTop: string;
  alignToBottom: string;
  noStoryEventsYet: string;
  entry: string;
  more: string;
  stabilized: string;
  youRegainHP: string;
  backToCharacters: string;
  
  // Additional Characters UI
  readyForAdventureShort: string;
  
  // Additional Create Character
  generateAvatar: string;
  avatarGenerated: string;
  avatarReady: string;
  failedToGenerateAvatar: string;
  characterCreated: string;
  readyForAdventureDesc: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Auth Page
    enterTheDarkFantasy: "Enter the Dark Fantasy",
    signIn: "Sign in",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    nickname: "Nickname",
    enterYourAdventure: "Enter your adventure",
    beginAdventure: "Begin Adventure",
    forgotSecretKey: "Forgot your secret key?",
    createYourName: "Create your name",
    createSecretKey: "Create a secret key",
    confirmSecretKey: "Confirm your secret key",
    enterSecretKey: "Enter your secret key",
    entering: "Entering...",
    creatingHero: "Creating Hero...",
    loginFailed: "Login Failed",
    registrationFailed: "Registration Failed",
    validationError: "Validation Error",
    heroCreated: "Hero Created!",
    welcomeToRealm: "Welcome to the realm",
    passwordStrength: "Password Strength",
    veryWeak: "Very Weak",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    veryStrong: "Very Strong",
    atLeast8Chars: "At least 8 characters",
    upperAndLower: "Upper and lowercase letters",
    atLeastOneNumber: "At least one number",
    specialCharacter: "Special character (!@#$%^&*)",
    agreementText: "By creating an account, you agree to embark on epic quests and face legendary challenges.",
    footerQuote: "Dungeon & Dragons, every hero starts their journey here...",

    // Characters Page
    yourCharacters: "Your Characters",
    signOut: "Sign Out",
    sortBy: "Sort by:",
    lastPlayed: "Last Played",
    levelHighToLow: "Level (High → Low)",
    levelLowToHigh: "Level (Low → High)",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    createNewCharacter: "Create New Character",
    beginYourAdventure: "Begin your adventure",
    readyForAdventure: "Ready for Adventure",
    hitPoints: "Hit Points",
    continueAdventure: "Continue Adventure",
    deleteCharacter: "Delete Character",
    deleteConfirmTitle: "Delete",
    deleteConfirmDesc: "This action cannot be undone. This will permanently delete your character and all associated data including inventory, story events, and conversations.",
    cancel: "Cancel",
    deleteForever: "Delete Forever",
    characterDeleted: "Character Deleted",
    removedFromRoster: "has been removed from your roster.",
    loadingHeroes: "Loading your heroes...",
    welcomeBack: "Welcome back",
    error: "Error",
    failedToLoadCharacters: "Failed to load characters",

    // Create Character Page
    createYourHero: "Create Your Hero",
    back: "Back",
    next: "Next",
    createCharacter: "Create Character",
    creating: "Creating...",

    // Character Creation Steps
    chooseYourRace: "Choose Your Race",
    raceDescription: "Each race provides unique abilities and stat bonuses",
    chooseYourClass: "Choose Your Class",
    classDescription: "Your class defines your combat style, abilities, and role in the party",
    chooseBackground: "Choose Your Background",
    backgroundDescription: "Your background reveals where you came from and how you became an adventurer",
    abilityScores: "Ability Scores",
    abilityScoresDescription: "Determine your character's core attributes",
    equipment: "Equipment",
    equipmentDescription: "Choose your starting equipment",
    characterSummary: "Character Summary",
    reviewCharacter: "Review your character and give them a name",
    costValue: "Scores cost more at higher values (14→15 costs 2 points)",
    pointsLeft: "27 points to spend",
    recomended: "Recommended",
    availible: "Availible",
    dropLow: "4d6 drop lowest",
    characterName: "Character Name",
    characterReady: "Your character is ready for adventure!",

    // Ability Score Method
    standardArray: "Standard Array",
    pointBuy: "Point Buy",
    rollDice: "Roll",
    pointsRemaining: "Points remaining",

    // Game Page
    describeYourAction: "Describe your action...",
    inventory: "Inventory",
    noItemsYet: "No items yet — find them during your adventure!",
    items: "items",
    level: "Level",
    experience: "Experience",
    armorClass: "Armor Class",
    proficiencyBonus: "Proficiency Bonus",
    speed: "Speed",

    // Combat
    combat: "Combat",
    round: "Round",
    yourTurn: "Your Turn",
    initiative: "Initiative",
    conditions: "Conditions",
    hp: "HP",

    // Story Journal
    storyJournal: "Story Journal",
    entries: "entries",
    npcsMet: "NPCs Met",
    locations: "Locations",
    questsStarted: "Quests Started",
    questsCompleted: "Quests Completed",
    decisions: "Decisions",
    discoveries: "Discoveries",
    battles: "Battles",
    itemsFound: "Items Found",
    relationships: "Relationships",
    plotPoints: "Plot Points",

    // Rest
    shortRest: "Short Rest",
    longRest: "Long Rest",
    takeShortRest: "Take Short Rest",

    // 404 Page
    pageNotFound: "404",
    oopsPageNotFound: "Oops! Page not found",
    returnToHome: "Return to Home",

    // Forgot Password
    recoverYourKey: "Recover Your Key",
    enterEmailForCode: "Enter your email to receive a magical code",
    mysticVerification: "Mystic Verification",
    decipherCode: "Decipher the code sent to your email",
    forgeNewKey: "Forge New Key",
    createNewPassword: "Create a new secret password",
    returnToLogin: "Return to Login",
    emailAddress: "Email Address",
    sendVerificationCode: "Send Verification Code",
    sending: "Sending...",
    verifyCode: "Verify Code",
    verifying: "Verifying...",
    resendCode: "Resend Code",
    codeResent: "Code Resent",
    codeResentDesc: "A new verification code has been sent to your email.",
    timeRemaining: "Time remaining:",
    verificationCodeSent: "Verification Code Sent",
    checkEmailForCode: "Check your email for the 6-digit code.",
    invalidCode: "Invalid Code",
    enterSixDigitCode: "Please enter a 6-digit code.",
    codeVerified: "Code Verified",
    nowSetNewPassword: "Now you can set a new password.",
    passwordUpdated: "Password Updated",
    passwordSuccessfullyReset: "Your password has been successfully reset.",
    updating: "Updating...",
    passwordsDoNotMatch: "Passwords do not match",
    verifyFailed: "Failed to verify code",

    // Reset Password
    resetYourPassword: "Reset Your Password",
    enterNewPasswordBelow: "Enter your new password below",
    invalidOrExpiredLink: "Invalid or Expired Link",
    requestNewResetLink: "Please request a new password reset link.",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    enterNewPassword: "Enter new password",
    confirmNewPasswordPlaceholder: "Confirm new password",
    updatingPassword: "Updating Password...",
    resetPassword: "Reset Password",

    // General
    loading: "Loading...",
    save: "Save",
    confirm: "Confirm",
    skip: "Skip",
    close: "Close",
    language: "Language",
    english: "English",
    polish: "Polski",

    // Additional Game UI
    health: "Health",
    stats: "Stats",
    proficiency: "Proficiency",
    alignToTop: "↑ Align to Top",
    alignToBottom: "↓ Align to Bottom",
    noStoryEventsYet: "No story events yet. Start an adventure to fill your journal!",
    entry: "entry",
    more: "more",
    stabilized: "Stabilized!",
    youRegainHP: "You regain 1 hit point.",
    backToCharacters: "Back to Characters",
    
    // Additional Characters UI
    readyForAdventureShort: "Ready for Adventure",
    
    // Additional Create Character
    generateAvatar: "Generate Avatar",
    avatarGenerated: "Avatar Generated!",
    avatarReady: "Your portrait is ready",
    failedToGenerateAvatar: "Could not generate avatar",
    characterCreated: "Character Created!",
    readyForAdventureDesc: "is ready for adventure",
  },
  pl: {
    // Auth Page
    enterTheDarkFantasy: "Wejdź do Mrocznej Fantazji",
    signIn: "Zaloguj się",
    signUp: "Zarejestruj się",
    email: "E-mail",
    password: "Hasło",
    confirmPassword: "Potwierdź hasło",
    nickname: "Pseudonim",
    enterYourAdventure: "Rozpocznij przygodę",
    beginAdventure: "Rozpocznij przygodę",
    forgotSecretKey: "Zapomniałeś tajnego klucza?",
    createYourName: "Stwórz swoją nazwę",
    createSecretKey: "Stwórz tajny klucz",
    confirmSecretKey: "Potwierdź tajny klucz",
    enterSecretKey: "Wprowadź tajny klucz",
    entering: "Wchodzę...",
    creatingHero: "Tworzenie bohatera...",
    loginFailed: "Logowanie nieudane",
    registrationFailed: "Rejestracja nieudana",
    validationError: "Błąd walidacji",
    heroCreated: "Bohater stworzony!",
    welcomeToRealm: "Witaj w królestwie",
    passwordStrength: "Siła hasła",
    veryWeak: "Bardzo słabe",
    weak: "Słabe",
    fair: "Średnie",
    good: "Dobre",
    strong: "Silne",
    veryStrong: "Bardzo silne",
    atLeast8Chars: "Co najmniej 8 znaków",
    upperAndLower: "Wielkie i małe litery",
    atLeastOneNumber: "Co najmniej jedna cyfra",
    specialCharacter: "Znak specjalny (!@#$%^&*)",
    agreementText: "Tworząc konto, zgadzasz się na epiczne wyprawy i legendarne wyzwania.",
    footerQuote: "Dungeon & Dragons, każdy bohater zaczyna tu swoją podróż...",

    // Characters Page
    yourCharacters: "Twoje Postacie",
    signOut: "Wyloguj się",
    sortBy: "Sortuj według:",
    lastPlayed: "Ostatnio grane",
    levelHighToLow: "Poziom (wysoki → niski)",
    levelLowToHigh: "Poziom (niski → wysoki)",
    newestFirst: "Najnowsze",
    oldestFirst: "Najstarsze",
    createNewCharacter: "Stwórz nową postać",
    beginYourAdventure: "Rozpocznij przygodę",
    readyForAdventure: "Gotowy na przygodę",
    hitPoints: "Punkty życia",
    continueAdventure: "Kontynuuj przygodę",
    deleteCharacter: "Usuń postać",
    deleteConfirmTitle: "Usuń",
    deleteConfirmDesc: "Tej akcji nie można cofnąć. Spowoduje to trwałe usunięcie postaci i wszystkich powiązanych danych, w tym ekwipunku, wydarzeń fabularnych i rozmów.",
    cancel: "Anuluj",
    deleteForever: "Usuń na zawsze",
    characterDeleted: "Postać usunięta",
    removedFromRoster: "został usunięty z twojej listy.",
    loadingHeroes: "Ładowanie bohaterów...",
    welcomeBack: "Witaj ponownie",
    error: "Błąd",
    failedToLoadCharacters: "Nie udało się załadować postaci",

    // Create Character Page
    createYourHero: "Stwórz swojego bohatera",
    back: "Wstecz",
    next: "Dalej",
    createCharacter: "Stwórz postać",
    creating: "Tworzenie...",

    // Character Creation Steps
    chooseYourRace: "Wybierz swoją rasę",
    raceDescription: "Każda rasa zapewnia unikalne zdolności i bonusy do statystyk",
    chooseYourClass: "Wybierz swoją klasę",
    classDescription: "Twoja klasa określa styl walki, zdolności i rolę w drużynie",
    chooseBackground: "Wybierz swoje pochodzenie",
    backgroundDescription: "Twoje pochodzenie ujawnia, skąd pochodzisz i jak zostałeś poszukiwaczem przygód",
    abilityScores: "Atrybuty",
    abilityScoresDescription: "Określ podstawowe cechy swojej postaci",
    equipment: "Ekwipunek",
    equipmentDescription: "Wybierz początkowy ekwipunek",
    characterSummary: "Podsumowanie postaci",
    reviewCharacter: "Przejrzyj postać i nadaj jej imię",
    costValue: "Wyniki kosztują więcej przy wyższych wartościach (14→15 kosztuje 2 punkty)",
    pointsLeft: "27 punktów do wydania",
    recomended: "Zalecane",
    availible: "Dostępne",
    dropLow: "4d6, najniższa wartość",
    characterName: "Nazwa postaci",
    characterReady: "Twoja postać jest gotowa na przygodę!",

    // Ability Score Method
    standardArray: "Standardowa tablica",
    pointBuy: "Kupowanie punktów",
    rollDice: "Rzuć",
    pointsRemaining: "Pozostałe punkty",

    // Game Page
    describeYourAction: "Opisz swoją akcję...",
    inventory: "Ekwipunek",
    noItemsYet: "Brak przedmiotów — znajdź je podczas przygody!",
    items: "przedmioty",
    level: "Poziom",
    experience: "Doświadczenie",
    armorClass: "Klasa pancerza",
    proficiencyBonus: "Bonus biegłości",
    speed: "Szybkość",

    // Combat
    combat: "Walka",
    round: "Runda",
    yourTurn: "Twoja tura",
    initiative: "Inicjatywa",
    conditions: "Stany",
    hp: "PŻ",

    // Story Journal
    storyJournal: "Dziennik opowieści",
    entries: "wpisów",
    npcsMet: "Spotkane NPC",
    locations: "Lokacje",
    questsStarted: "Rozpoczęte misje",
    questsCompleted: "Ukończone misje",
    decisions: "Decyzje",
    discoveries: "Odkrycia",
    battles: "Bitwy",
    itemsFound: "Znalezione przedmioty",
    relationships: "Relacje",
    plotPoints: "Punkty fabularne",

    // Rest
    shortRest: "Krótki odpoczynek",
    longRest: "Długi odpoczynek",
    takeShortRest: "Rozpocznij krótki odpoczynek",

    // 404 Page
    pageNotFound: "404",
    oopsPageNotFound: "Ups! Strona nie znaleziona",
    returnToHome: "Powrót do strony głównej",

    // Forgot Password
    recoverYourKey: "Odzyskaj swój klucz",
    enterEmailForCode: "Wprowadź e-mail, aby otrzymać magiczny kod",
    mysticVerification: "Mistyczna weryfikacja",
    decipherCode: "Rozszyfruj kod wysłany na twój e-mail",
    forgeNewKey: "Wykuj nowy klucz",
    createNewPassword: "Stwórz nowe tajne hasło",
    returnToLogin: "Powrót do logowania",
    emailAddress: "Adres e-mail",
    sendVerificationCode: "Wyślij kod weryfikacyjny",
    sending: "Wysyłanie...",
    verifyCode: "Zweryfikuj kod",
    verifying: "Weryfikacja...",
    resendCode: "Wyślij ponownie kod",
    codeResent: "Kod wysłany ponownie",
    codeResentDesc: "Nowy kod weryfikacyjny został wysłany na twój e-mail.",
    timeRemaining: "Pozostały czas:",
    verificationCodeSent: "Kod weryfikacyjny wysłany",
    checkEmailForCode: "Sprawdź e-mail, aby znaleźć 6-cyfrowy kod.",
    invalidCode: "Nieprawidłowy kod",
    enterSixDigitCode: "Wprowadź 6-cyfrowy kod.",
    codeVerified: "Kod zweryfikowany",
    nowSetNewPassword: "Teraz możesz ustawić nowe hasło.",
    passwordUpdated: "Hasło zaktualizowane",
    passwordSuccessfullyReset: "Twoje hasło zostało pomyślnie zresetowane.",
    updating: "Aktualizowanie...",
    passwordsDoNotMatch: "Hasła nie pasują do siebie",
    verifyFailed: "Nie udało się zweryfikować kodu",

    // Reset Password
    resetYourPassword: "Zresetuj swoje hasło",
    enterNewPasswordBelow: "Wprowadź nowe hasło poniżej",
    invalidOrExpiredLink: "Nieprawidłowy lub wygasły link",
    requestNewResetLink: "Poproś o nowy link do resetowania hasła.",
    newPassword: "Nowe hasło",
    confirmNewPassword: "Potwierdź nowe hasło",
    enterNewPassword: "Wprowadź nowe hasło",
    confirmNewPasswordPlaceholder: "Potwierdź nowe hasło",
    updatingPassword: "Aktualizowanie hasła...",
    resetPassword: "Zresetuj hasło",

    // General
    loading: "Ładowanie...",
    save: "Zapisz",
    confirm: "Potwierdź",
    skip: "Pomiń",
    close: "Zamknij",
    language: "Język",
    english: "English",
    polish: "Polski",

    // Additional Game UI
    health: "Zdrowie",
    stats: "Statystyki",
    proficiency: "Biegłość",
    alignToTop: "↑ Wyrównaj do góry",
    alignToBottom: "↓ Wyrównaj do dołu",
    noStoryEventsYet: "Brak wydarzeń fabularnych. Rozpocznij przygodę, aby wypełnić dziennik!",
    entry: "wpis",
    more: "więcej",
    stabilized: "Ustabilizowany!",
    youRegainHP: "Odzyskujesz 1 punkt życia.",
    backToCharacters: "Powrót do postaci",
    
    // Additional Characters UI
    readyForAdventureShort: "Gotowy na przygodę",
    
    // Additional Create Character
    generateAvatar: "Generuj awatar",
    avatarGenerated: "Awatar wygenerowany!",
    avatarReady: "Twój portret jest gotowy",
    failedToGenerateAvatar: "Nie udało się wygenerować awatara",
    characterCreated: "Postać stworzona!",
    readyForAdventureDesc: "jest gotowy na przygodę",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "pl" || saved === "en") ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export { translations };
