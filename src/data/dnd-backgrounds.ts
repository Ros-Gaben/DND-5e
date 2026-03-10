export interface BackgroundData {
  name: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number; // Number of additional languages
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
  description: string;
}

export const BACKGROUNDS: BackgroundData[] = [
  {
    name: "Acolyte",
    skillProficiencies: ["Insight", "Religion"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["Holy symbol", "Prayer book", "5 sticks of incense", "Vestments", "Common clothes", "15 gp"],
    feature: {
      name: "Shelter of the Faithful",
      description: "You can receive free healing at temples of your faith"
    },
    description: "You have spent your life in service to a temple"
  },
  {
    name: "Criminal",
    skillProficiencies: ["Deception", "Stealth"],
    toolProficiencies: ["Thieves' tools", "One gaming set"],
    languages: 0,
    equipment: ["Crowbar", "Dark common clothes with hood", "15 gp"],
    feature: {
      name: "Criminal Contact",
      description: "You have a reliable contact in the criminal underworld"
    },
    description: "You are an experienced criminal with a history of breaking the law"
  },
  {
    name: "Folk Hero",
    skillProficiencies: ["Animal Handling", "Survival"],
    toolProficiencies: ["One artisan's tools", "Vehicles (land)"],
    languages: 0,
    equipment: ["Artisan's tools", "Shovel", "Iron pot", "Common clothes", "10 gp"],
    feature: {
      name: "Rustic Hospitality",
      description: "Common folk will shelter you from the law and provide food"
    },
    description: "You come from humble origins and are a champion of the common people"
  },
  {
    name: "Noble",
    skillProficiencies: ["History", "Persuasion"],
    toolProficiencies: ["One gaming set"],
    languages: 1,
    equipment: ["Fine clothes", "Signet ring", "Scroll of pedigree", "25 gp"],
    feature: {
      name: "Position of Privilege",
      description: "You are welcome in high society and common folk defer to you"
    },
    description: "You were born into a family of wealth, power, and privilege"
  },
  {
    name: "Sage",
    skillProficiencies: ["Arcana", "History"],
    toolProficiencies: [],
    languages: 2,
    equipment: ["Bottle of black ink", "Quill", "Small knife", "Letter from colleague", "Common clothes", "10 gp"],
    feature: {
      name: "Researcher",
      description: "When you don't know information, you often know where to find it"
    },
    description: "You spent years learning the lore of the multiverse"
  },
  {
    name: "Soldier",
    skillProficiencies: ["Athletics", "Intimidation"],
    toolProficiencies: ["One gaming set", "Vehicles (land)"],
    languages: 0,
    equipment: ["Insignia of rank", "Trophy from fallen enemy", "Dice or cards", "Common clothes", "10 gp"],
    feature: {
      name: "Military Rank",
      description: "You have authority over soldiers of lower rank and can requisition supplies"
    },
    description: "War has been your life for as long as you care to remember"
  },
  {
    name: "Outlander",
    skillProficiencies: ["Athletics", "Survival"],
    toolProficiencies: ["One musical instrument"],
    languages: 1,
    equipment: ["Staff", "Hunting trap", "Trophy from animal", "Traveler's clothes", "10 gp"],
    feature: {
      name: "Wanderer",
      description: "You have excellent memory for maps and can always find food and water"
    },
    description: "You grew up in the wilds, far from civilization"
  },
  {
    name: "Entertainer",
    skillProficiencies: ["Acrobatics", "Performance"],
    toolProficiencies: ["Disguise kit", "One musical instrument"],
    languages: 0,
    equipment: ["Musical instrument", "Costume", "Love letter from admirer", "15 gp"],
    feature: {
      name: "By Popular Demand",
      description: "You can always find a place to perform and receive free lodging"
    },
    description: "You thrive in front of an audience"
  }
];

export const getBackgroundByName = (name: string): BackgroundData | undefined => {
  return BACKGROUNDS.find(b => b.name === name);
};
