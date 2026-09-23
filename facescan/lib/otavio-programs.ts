export type OtavioMealType =
  | "petit_dejeuner"
  | "dejeuner"
  | "diner"
  | "collation";

export type OtavioIngredient = {
  name: string;
  quantity?: number;
  unit?: string;
};

export type OtavioRecipe = {
  image?: string;
  id: string;
  name: string;
  mealType: OtavioMealType;
  ingredients: OtavioIngredient[];
  instructions: string[];
  prepTime: number;
  servings: number;
  tags: string[];
  dietary: string[];
  allergens: string[];
  budget: "economique" | "standard" | "confort";
  goals: string[];
  preferences: string[];
  proteinLevel: "faible" | "modere" | "eleve";
};

export type OtavioMealPlanDay = {
  day: number;
  date?: string;
  meals: {
    type: OtavioMealType;
    recipe: OtavioRecipe;
    portion?: string;
  }[];
};

export type OtavioMealStatus =
  | "prevu"
  | "realise"
  | "remplace"
  | "ignore";

export type OtavioMealFeedback = {
  day: number;
  mealType: OtavioMealType;
  recipeId: string;
  status: OtavioMealStatus;
  replacementRecipeId?: string;
  satisfaction?: number;
  comment?: string;
};

export type OtavioNutritionAdaptation = {
  type:
    | "variete"
    | "budget"
    | "temps"
    | "preferences"
    | "adherence"
    | "satisfaction";
  message: string;
  priority: "faible" | "moderee" | "haute";
};

export type OtavioNutritionPlan = {
  id: string;
  durationDays: number;
  objective: string;
  personalization: string[];
  days: OtavioMealPlanDay[];
};

export type OtavioProgramProfile = {
  age?: number | null;
  activity_level?: string | null;
  goals?: string[] | null;
  eating_style?: string | null;
  meals_per_day?: number | null;
  budget_level?: string | null;
  food_preferences?: string[] | null;
  dietary_constraints?: string[] | null;
  allergies?: string[] | null;
  intolerances?: string[] | null;
  available_time?: string | null;
};

export type OtavioNutritionScan = {
  peau?: number | null;
  equilibre?: number | null;
  hydratation?: number | null;
  fatigue?: number | null;
};

const RECIPES: OtavioRecipe[] = [
  {
    id: "porridge-pomme",
    name: "Porridge pomme et cannelle",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Flocons d’avoine", quantity: 50, unit: "g" },
      { name: "Lait ou boisson végétale", quantity: 200, unit: "ml" },
      { name: "Pomme", quantity: 1, unit: "unité" },
      { name: "Cannelle", quantity: 1, unit: "pincée" },
    ],
    instructions: [
      "Faire chauffer les flocons d’avoine avec le lait.",
      "Ajouter la pomme coupée en dés.",
      "Cuire quelques minutes puis ajouter la cannelle.",
    ],
    prepTime: 10,
    servings: 1,
    tags: ["simple", "rapide", "fibre"],
    dietary: ["vegetarien"],
    allergens: [],
    budget: "economique",
    goals: ["equilibre", "energie", "digestion"],
    preferences: ["vegetarien", "simple", "rapide"],
    proteinLevel: "modere",
  },
  {
    id: "omelette-legumes",
    name: "Omelette aux légumes",
    image: "/recipes/omelette-legumes.jpg",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Œufs", quantity: 2, unit: "unités" },
      { name: "Courgette", quantity: 150, unit: "g" },
      { name: "Tomate", quantity: 120, unit: "g" },
      { name: "Herbes", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Couper les légumes.",
      "Les faire revenir quelques minutes.",
      "Ajouter les œufs battus et cuire jusqu’à obtenir la texture souhaitée.",
    ],
    prepTime: 12,
    servings: 1,
    tags: ["proteines", "simple", "rapide"],
    dietary: ["vegetarien"],
    allergens: [],
    budget: "economique",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["vegetarien", "simple", "rapide"],
    proteinLevel: "eleve",
  },
  {
    id: "poulet-riz-legumes",
    name: "Poulet, riz et légumes",
    image: "/recipes/poulet-riz-legumes.jpg",
    mealType: "dejeuner",
    ingredients: [
      { name: "Blanc de poulet", quantity: 150, unit: "g" },
      { name: "Riz", quantity: 70, unit: "g" },
      { name: "Carottes", quantity: 100, unit: "g" },
      { name: "Brocoli", quantity: 150, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Cuire le riz.",
      "Faire cuire le poulet.",
      "Cuire les légumes puis assembler avec un filet d’huile d’olive.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["proteines", "complet", "equilibre"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["complet", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "lentilles-legumes",
    name: "Lentilles aux légumes",
    image: "/recipes/lentilles-legumes.jpg",
    mealType: "dejeuner",
    ingredients: [
      { name: "Lentilles", quantity: 80, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Oignon", quantity: 60, unit: "g" },
      { name: "Tomate", quantity: 120, unit: "g" },
      { name: "Herbes", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Faire revenir l’oignon et la carotte.",
      "Ajouter les lentilles et les tomates.",
      "Couvrir d’eau et cuire jusqu’à ce que les lentilles soient tendres.",
    ],
    prepTime: 30,
    servings: 2,
    tags: ["economique", "fibre", "vegetal"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["fibres", "equilibre", "digestion"],
    preferences: ["vegetarien", "vegan", "economique"],
    proteinLevel: "modere",
  },
  {
    id: "saumon-legumes",
    name: "Saumon et légumes rôtis",
    image: "/recipes/saumon-legumes-rotis.jpg",
    mealType: "diner",
    ingredients: [
      { name: "Pavé de saumon", quantity: 150, unit: "g" },
      { name: "Courgette", quantity: 150, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
      { name: "Herbes", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Préchauffer le four.",
      "Déposer le saumon et les légumes dans un plat.",
      "Ajouter un filet d’huile et les herbes.",
      "Cuire jusqu’à ce que le saumon soit correctement cuit.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["proteines", "omega3", "simple"],
    dietary: [],
    allergens: ["poisson"],
    budget: "confort",
    goals: ["proteines", "omega3", "equilibre"],
    preferences: ["poisson", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "yaourt-fruits-avoine",
    name: "Yaourt, fruits et avoine",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Yaourt nature", quantity: 150, unit: "g" },
      { name: "Flocons d’avoine", quantity: 35, unit: "g" },
      { name: "Fruits rouges", quantity: 100, unit: "g" },
      { name: "Amandes", quantity: 15, unit: "g" },
    ],
    instructions: [
      "Verser le yaourt dans un bol.",
      "Ajouter les flocons d’avoine et les fruits.",
      "Terminer avec les amandes concassées.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["rapide", "fibre", "proteines"],
    dietary: ["vegetarien"],
    allergens: ["fruits à coque", "lait"],
    budget: "standard",
    goals: ["equilibre", "energie", "proteines"],
    preferences: ["vegetarien", "rapide"],
    proteinLevel: "modere",
  },
  {
    id: "tartine-avocat-oeuf",
    name: "Tartine avocat et œuf",
    image: "/recipes/tartine-avocat-oeuf.jpg",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Pain complet", quantity: 80, unit: "g" },
      { name: "Avocat", quantity: 80, unit: "g" },
      { name: "Œuf", quantity: 1, unit: "unité" },
      { name: "Tomate", quantity: 80, unit: "g" },
    ],
    instructions: [
      "Faire griller le pain.",
      "Écraser l’avocat sur les tartines.",
      "Ajouter l’œuf cuit et les rondelles de tomate.",
    ],
    prepTime: 10,
    servings: 1,
    tags: ["proteines", "complet", "simple"],
    dietary: [],
    allergens: ["œuf"],
    budget: "standard",
    goals: ["equilibre", "proteines", "energie"],
    preferences: ["complet", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "dinde-quinoa-legumes",
    name: "Dinde, quinoa et légumes",
    image: "/recipes/dinde-quinoa-legumes.jpg",
    mealType: "dejeuner",
    ingredients: [
      { name: "Escalope de dinde", quantity: 150, unit: "g" },
      { name: "Quinoa", quantity: 70, unit: "g" },
      { name: "Courgette", quantity: 120, unit: "g" },
      { name: "Poivron", quantity: 100, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Cuire le quinoa selon les indications du paquet.",
      "Faire cuire la dinde à la poêle.",
      "Faire revenir les légumes puis assembler avec le quinoa.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["proteines", "complet", "equilibre"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["complet", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "pates-thon-tomate",
    name: "Pâtes complètes au thon et tomate",
    mealType: "dejeuner",
    ingredients: [
      { name: "Pâtes complètes", quantity: 75, unit: "g" },
      { name: "Thon au naturel", quantity: 120, unit: "g" },
      { name: "Tomate", quantity: 150, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
      { name: "Herbes", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Cuire les pâtes.",
      "Faire revenir les tomates avec les herbes.",
      "Ajouter le thon égoutté puis mélanger avec les pâtes.",
    ],
    prepTime: 15,
    servings: 1,
    tags: ["rapide", "proteines", "complet"],
    dietary: [],
    allergens: ["poisson"],
    budget: "economique",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["rapide", "simple", "poisson"],
    proteinLevel: "eleve",
  },
  {
    id: "curry-pois-chiches",
    name: "Curry de pois chiches et légumes",
    mealType: "diner",
    ingredients: [
      { name: "Pois chiches", quantity: 150, unit: "g" },
      { name: "Lait de coco", quantity: 100, unit: "ml" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Courgette", quantity: 120, unit: "g" },
      { name: "Riz", quantity: 60, unit: "g" },
    ],
    instructions: [
      "Faire revenir les légumes.",
      "Ajouter les pois chiches et le lait de coco.",
      "Laisser mijoter puis servir avec le riz.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["vegetal", "fibre", "complet"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["fibres", "equilibre", "digestion"],
    preferences: ["vegetarien", "vegan", "economique"],
    proteinLevel: "modere",
  },
  {
    id: "cabillaud-pommes-terre",
    name: "Cabillaud, pommes de terre et légumes",
    mealType: "diner",
    ingredients: [
      { name: "Filet de cabillaud", quantity: 160, unit: "g" },
      { name: "Pommes de terre", quantity: 180, unit: "g" },
      { name: "Haricots verts", quantity: 150, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Cuire les pommes de terre.",
      "Cuire le cabillaud au four ou à la poêle.",
      "Cuire les haricots verts puis servir avec un filet d’huile d’olive.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["proteines", "simple", "equilibre"],
    dietary: [],
    allergens: ["poisson"],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["poisson", "simple"],
    proteinLevel: "eleve",
  },

  {
    id: "salade-pois-chiches",
    name: "Salade de pois chiches et légumes",
    mealType: "diner",
    ingredients: [
      { name: "Pois chiches", quantity: 120, unit: "g" },
      { name: "Tomate", quantity: 120, unit: "g" },
      { name: "Concombre", quantity: 100, unit: "g" },
      { name: "Salade verte", quantity: 60, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Rincer les pois chiches.",
      "Couper les légumes.",
      "Mélanger l’ensemble et assaisonner simplement.",
    ],
    prepTime: 10,
    servings: 1,
    tags: ["rapide", "vegetal", "fibre"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["fibres", "equilibre", "digestion"],
    preferences: ["vegetarien", "vegan", "rapide", "economique"],
    proteinLevel: "modere",
  },

  {
    id: "collation-yaourt-fruits",
    name: "Yaourt végétal, banane et cannelle",
    mealType: "collation",
    ingredients: [
      { name: "Yaourt végétal sans sucre", quantity: 125, unit: "g" },
      { name: "Banane", quantity: 1, unit: "unité" },
      { name: "Cannelle", quantity: 1, unit: "pincée" },
    ],
    instructions: [
      "Verser le yaourt dans un bol.",
      "Ajouter la banane coupée en rondelles.",
      "Ajouter une pincée de cannelle.",
    ],
    prepTime: 3,
    servings: 1,
    tags: ["rapide", "fibre", "energie"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["equilibre", "energie", "digestion"],
    preferences: ["rapide", "vegan", "vegetarien"],
    proteinLevel: "faible",
  },
  {
    id: "collation-houmous-crudites",
    name: "Houmous et crudités",
    mealType: "collation",
    ingredients: [
      { name: "Houmous", quantity: 60, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Concombre", quantity: 100, unit: "g" },
    ],
    instructions: [
      "Couper la carotte et le concombre en bâtonnets.",
      "Servir avec le houmous.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["rapide", "fibre", "vegetal"],
    dietary: ["vegetarien", "vegan"],
    allergens: ["sésame"],
    budget: "standard",
    goals: ["fibres", "equilibre", "digestion"],
    preferences: ["vegan", "vegetarien", "rapide"],
    proteinLevel: "modere",
  },
  {
    id: "collation-pomme-amandes",
    name: "Pomme et amandes",
    mealType: "collation",
    ingredients: [
      { name: "Pomme", quantity: 1, unit: "unité" },
      { name: "Amandes", quantity: 20, unit: "g" },
    ],
    instructions: [
      "Laver la pomme.",
      "Servir avec les amandes.",
    ],
    prepTime: 2,
    servings: 1,
    tags: ["rapide", "fibre", "simple"],
    dietary: ["vegetarien", "vegan"],
    allergens: ["fruits à coque"],
    budget: "standard",
    goals: ["equilibre", "energie", "digestion"],
    preferences: ["rapide", "simple"],
    proteinLevel: "modere",
  },
  {
    id: "collation-compote-graines",
    name: "Compote et graines de courge",
    mealType: "collation",
    ingredients: [
      { name: "Compote sans sucre ajouté", quantity: 100, unit: "g" },
      { name: "Graines de courge", quantity: 15, unit: "g" },
    ],
    instructions: [
      "Verser la compote dans un bol.",
      "Ajouter les graines de courge.",
    ],
    prepTime: 2,
    servings: 1,
    tags: ["rapide", "simple", "fibre"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["equilibre", "energie"],
    preferences: ["rapide", "simple", "economique"],
    proteinLevel: "modere",
  },
  {
    id: "collation-tartine-houmous",
    name: "Tartine complète et houmous",
    mealType: "collation",
    ingredients: [
      { name: "Pain complet", quantity: 50, unit: "g" },
      { name: "Houmous", quantity: 50, unit: "g" },
      { name: "Tomate", quantity: 80, unit: "g" },
    ],
    instructions: [
      "Faire griller le pain si souhaité.",
      "Étaler le houmous.",
      "Ajouter les rondelles de tomate.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["rapide", "fibre", "vegetal"],
    dietary: ["vegetarien", "vegan"],
    allergens: ["sésame"],
    budget: "economique",
    goals: ["equilibre", "energie", "fibres"],
    preferences: ["rapide", "vegan", "vegetarien"],
    proteinLevel: "modere",
  },
  {
    id: "overnight-avoine-banane",
    name: "Overnight oats banane et graines de chia",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Flocons d’avoine", quantity: 50, unit: "g" },
      { name: "Boisson végétale sans sucre", quantity: 150, unit: "ml" },
      { name: "Banane", quantity: 1, unit: "unité" },
      { name: "Graines de chia", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Mélanger les flocons d’avoine, la boisson végétale et les graines de chia.",
      "Laisser reposer au réfrigérateur pendant la nuit.",
      "Ajouter la banane coupée au moment de servir.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["rapide", "fibre", "sans-cuisson"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["equilibre", "energie", "digestion"],
    preferences: ["rapide", "vegan", "vegetarien"],
    proteinLevel: "modere",
  },
  {
    id: "oeufs-pain-tomate",
    name: "Œufs brouillés, pain complet et tomate",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Œufs", quantity: 2, unit: "unités" },
      { name: "Pain complet", quantity: 60, unit: "g" },
      { name: "Tomate", quantity: 120, unit: "g" },
      { name: "Herbes", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Faire griller le pain.",
      "Cuire les œufs brouillés à feu doux.",
      "Servir avec la tomate et les herbes.",
    ],
    prepTime: 10,
    servings: 1,
    tags: ["proteines", "rapide", "complet"],
    dietary: ["vegetarien"],
    allergens: ["œuf"],
    budget: "economique",
    goals: ["proteines", "energie", "equilibre"],
    preferences: ["rapide", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "fromage-blanc-fruits-noix",
    name: "Fromage blanc, poire et noix",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Fromage blanc", quantity: 150, unit: "g" },
      { name: "Poire", quantity: 1, unit: "unité" },
      { name: "Noix", quantity: 15, unit: "g" },
      { name: "Flocons d’avoine", quantity: 30, unit: "g" },
    ],
    instructions: [
      "Verser le fromage blanc dans un bol.",
      "Ajouter la poire coupée.",
      "Ajouter les flocons d’avoine et les noix concassées.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["rapide", "fibre", "proteines"],
    dietary: ["vegetarien"],
    allergens: ["lait", "fruits à coque"],
    budget: "standard",
    goals: ["equilibre", "proteines", "digestion"],
    preferences: ["rapide", "simple"],
    proteinLevel: "modere",
  },
  {
    id: "chia-fruits-rouges",
    name: "Pudding de chia aux fruits rouges",
    mealType: "petit_dejeuner",
    ingredients: [
      { name: "Graines de chia", quantity: 25, unit: "g" },
      { name: "Boisson végétale sans sucre", quantity: 200, unit: "ml" },
      { name: "Fruits rouges", quantity: 100, unit: "g" },
      { name: "Flocons d’avoine", quantity: 25, unit: "g" },
    ],
    instructions: [
      "Mélanger les graines de chia et la boisson végétale.",
      "Laisser épaissir au réfrigérateur pendant au moins 2 heures.",
      "Ajouter les fruits rouges et les flocons d’avoine.",
    ],
    prepTime: 5,
    servings: 1,
    tags: ["fibre", "sans-cuisson", "rapide"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "standard",
    goals: ["equilibre", "digestion", "energie"],
    preferences: ["vegan", "rapide"],
    proteinLevel: "modere",
  },
  {
    id: "poulet-semoule-legumes",
    name: "Poulet, semoule complète et légumes",
    mealType: "dejeuner",
    ingredients: [
      { name: "Blanc de poulet", quantity: 150, unit: "g" },
      { name: "Semoule complète", quantity: 70, unit: "g" },
      { name: "Courgette", quantity: 120, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Préparer la semoule selon les indications du paquet.",
      "Faire cuire le poulet à la poêle.",
      "Cuire les légumes puis assembler le tout avec un filet d’huile.",
    ],
    prepTime: 20,
    servings: 1,
    tags: ["proteines", "complet", "equilibre"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["complet", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "riz-dinde-poivrons",
    name: "Riz complet, dinde et poivrons",
    mealType: "dejeuner",
    ingredients: [
      { name: "Escalope de dinde", quantity: 150, unit: "g" },
      { name: "Riz complet", quantity: 70, unit: "g" },
      { name: "Poivron", quantity: 120, unit: "g" },
      { name: "Courgette", quantity: 100, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Cuire le riz complet.",
      "Faire revenir la dinde avec les poivrons.",
      "Ajouter la courgette puis servir avec le riz.",
    ],
    prepTime: 20,
    servings: 1,
    tags: ["proteines", "complet", "equilibre"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "energie", "equilibre"],
    preferences: ["simple", "complet"],
    proteinLevel: "eleve",
  },
  {
    id: "tofu-nouilles-legumes",
    name: "Tofu, nouilles de riz et légumes",
    mealType: "dejeuner",
    ingredients: [
      { name: "Tofu ferme", quantity: 150, unit: "g" },
      { name: "Nouilles de riz", quantity: 70, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Courgette", quantity: 120, unit: "g" },
      { name: "Sauce soja", quantity: 10, unit: "ml" },
    ],
    instructions: [
      "Cuire les nouilles de riz.",
      "Faire dorer le tofu à la poêle.",
      "Ajouter les légumes puis mélanger avec les nouilles et la sauce soja.",
    ],
    prepTime: 15,
    servings: 1,
    tags: ["rapide", "vegetal", "proteines"],
    dietary: ["vegetarien", "vegan"],
    allergens: ["soja"],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["vegan", "vegetarien", "rapide"],
    proteinLevel: "eleve",
  },
  {
    id: "salade-poulet-avocat",
    name: "Salade de poulet, avocat et crudités",
    mealType: "dejeuner",
    ingredients: [
      { name: "Blanc de poulet", quantity: 140, unit: "g" },
      { name: "Avocat", quantity: 70, unit: "g" },
      { name: "Concombre", quantity: 100, unit: "g" },
      { name: "Tomate", quantity: 120, unit: "g" },
      { name: "Salade verte", quantity: 60, unit: "g" },
    ],
    instructions: [
      "Faire cuire le poulet puis le couper en morceaux.",
      "Couper les crudités et l’avocat.",
      "Mélanger l’ensemble et assaisonner selon vos goûts.",
    ],
    prepTime: 15,
    servings: 1,
    tags: ["rapide", "frais", "proteines"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "equilibre", "hydratation"],
    preferences: ["rapide", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "saumon-quinoa-epinards",
    name: "Saumon, quinoa et épinards",
    mealType: "dejeuner",
    ingredients: [
      { name: "Pavé de saumon", quantity: 150, unit: "g" },
      { name: "Quinoa", quantity: 65, unit: "g" },
      { name: "Épinards", quantity: 150, unit: "g" },
      { name: "Citron", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Cuire le quinoa.",
      "Cuire le saumon au four ou à la poêle.",
      "Faire tomber les épinards puis servir avec le citron.",
    ],
    prepTime: 20,
    servings: 1,
    tags: ["omega3", "proteines", "equilibre"],
    dietary: [],
    allergens: ["poisson"],
    budget: "confort",
    goals: ["proteines", "omega3", "equilibre"],
    preferences: ["poisson", "simple"],
    proteinLevel: "eleve",
  },
  {
    id: "poulet-patate-douce-brocoli",
    name: "Poulet, patate douce et brocoli",
    mealType: "diner",
    ingredients: [
      { name: "Blanc de poulet", quantity: 150, unit: "g" },
      { name: "Patate douce", quantity: 180, unit: "g" },
      { name: "Brocoli", quantity: 150, unit: "g" },
      { name: "Huile d’olive", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Couper la patate douce et la cuire au four.",
      "Faire cuire le poulet à la poêle ou au four.",
      "Cuire le brocoli puis servir avec un filet d’huile d’olive.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["proteines", "complet", "equilibre"],
    dietary: [],
    allergens: [],
    budget: "standard",
    goals: ["proteines", "energie", "equilibre"],
    preferences: ["simple", "complet"],
    proteinLevel: "eleve",
  },
  {
    id: "tofu-curry-legumes",
    name: "Curry de tofu et légumes",
    mealType: "diner",
    ingredients: [
      { name: "Tofu ferme", quantity: 150, unit: "g" },
      { name: "Lait de coco", quantity: 100, unit: "ml" },
      { name: "Brocoli", quantity: 120, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Riz", quantity: 60, unit: "g" },
    ],
    instructions: [
      "Faire revenir le tofu et les légumes.",
      "Ajouter le lait de coco et laisser mijoter.",
      "Servir avec le riz cuit.",
    ],
    prepTime: 20,
    servings: 1,
    tags: ["vegetal", "proteines", "complet"],
    dietary: ["vegetarien", "vegan"],
    allergens: ["soja"],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["vegan", "vegetarien"],
    proteinLevel: "eleve",
  },
  {
    id: "omelette-salade-diner",
    name: "Omelette aux champignons et salade",
    mealType: "diner",
    ingredients: [
      { name: "Œufs", quantity: 2, unit: "unités" },
      { name: "Champignons", quantity: 150, unit: "g" },
      { name: "Salade verte", quantity: 80, unit: "g" },
      { name: "Pain complet", quantity: 50, unit: "g" },
    ],
    instructions: [
      "Faire revenir les champignons.",
      "Ajouter les œufs battus et cuire l’omelette.",
      "Servir avec la salade et le pain complet.",
    ],
    prepTime: 15,
    servings: 1,
    tags: ["rapide", "proteines", "simple"],
    dietary: ["vegetarien"],
    allergens: ["œuf"],
    budget: "economique",
    goals: ["proteines", "equilibre"],
    preferences: ["rapide", "simple", "vegetarien"],
    proteinLevel: "eleve",
  },
  {
    id: "dahl-lentilles-coco",
    name: "Dahl de lentilles corail et légumes",
    mealType: "diner",
    ingredients: [
      { name: "Lentilles corail", quantity: 80, unit: "g" },
      { name: "Carotte", quantity: 100, unit: "g" },
      { name: "Tomate", quantity: 150, unit: "g" },
      { name: "Lait de coco", quantity: 80, unit: "ml" },
      { name: "Riz", quantity: 50, unit: "g" },
    ],
    instructions: [
      "Faire revenir la carotte et la tomate.",
      "Ajouter les lentilles et le lait de coco avec un peu d’eau.",
      "Laisser mijoter puis servir avec le riz.",
    ],
    prepTime: 25,
    servings: 1,
    tags: ["vegetal", "fibre", "economique"],
    dietary: ["vegetarien", "vegan"],
    allergens: [],
    budget: "economique",
    goals: ["fibres", "equilibre", "digestion"],
    preferences: ["vegan", "vegetarien", "economique"],
    proteinLevel: "modere",
  },
  {
    id: "cabillaud-courgettes-quinoa",
    name: "Cabillaud, courgettes et quinoa",
    mealType: "diner",
    ingredients: [
      { name: "Filet de cabillaud", quantity: 160, unit: "g" },
      { name: "Quinoa", quantity: 60, unit: "g" },
      { name: "Courgette", quantity: 180, unit: "g" },
      { name: "Citron", quantity: 1, unit: "portion" },
    ],
    instructions: [
      "Cuire le quinoa.",
      "Cuire le cabillaud au four ou à la poêle.",
      "Faire revenir les courgettes puis servir avec le citron.",
    ],
    prepTime: 20,
    servings: 1,
    tags: ["proteines", "poisson", "equilibre"],
    dietary: [],
    allergens: ["poisson"],
    budget: "standard",
    goals: ["proteines", "equilibre", "energie"],
    preferences: ["poisson", "simple"],
    proteinLevel: "eleve",
  },

];

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[()]/g, "")
    .trim();
}

function hasAny(values: string[], terms: string[]) {
  return terms.some((term) =>
    values.some(
      (value) =>
        value.includes(term) ||
        term.includes(value)
    )
  );
}

function recipeMatchesProfile(
  recipe: OtavioRecipe,
  profile: OtavioProgramProfile
) {
  /*
   * Les allergies et intolérances sont les seules données
   * qui doivent bloquer directement une recette.
   *
   * Les dietary_constraints de l'onboarding sont des contraintes
   * de mode de vie ("Peu de temps", "Budget limité", etc.).
   */
  const forbidden = [
    ...(profile.allergies ?? []),
    ...(profile.intolerances ?? []),
  ].map(normalize);

  if (
    recipe.allergens.some((allergen) => {
      const normalizedAllergen = normalize(allergen);

      return forbidden.some(
        (item) =>
          normalizedAllergen.includes(item) ||
          item.includes(normalizedAllergen)
      );
    })
  ) {
    return false;
  }

  const style = normalize(profile.eating_style);

  // Style végétalien
  if (style.includes("vegetalien") || style.includes("vegan")) {
    if (!recipe.dietary.includes("vegan")) {
      return false;
    }
  }

  // Style végétarien
  if (
    style.includes("vegetarien") ||
    style.includes("vegetarienne")
  ) {
    if (
      !recipe.dietary.includes("vegetarien") &&
      !recipe.dietary.includes("vegan")
    ) {
      return false;
    }
  }

  // Style pescétarien :
  // on accepte les recettes végétariennes/vegan ainsi que poisson/fruits de mer.
  if (style.includes("pescetarien")) {
    const pescetarianAllowed =
      recipe.dietary.includes("vegetarien") ||
      recipe.dietary.includes("vegan") ||
      recipe.tags.some((tag) =>
        ["poisson", "pescetarien"].includes(normalize(tag))
      ) ||
      recipe.ingredients.some((ingredient) =>
        ["saumon", "cabillaud", "thon"].some((term) =>
          normalize(ingredient.name).includes(term)
        )
      );

    if (!pescetarianAllowed) {
      return false;
    }
  }

  // Flexitarien : aucune exclusion supplémentaire.
  // Omnivore : aucune exclusion supplémentaire.

  /*
   * Le budget économique peut exclure les recettes "confort".
   * Les contraintes "Budget limité" sont également prises en compte
   * ici, même si budget_level reste la source principale.
   */
  const constraints = (profile.dietary_constraints ?? []).map(normalize);

  const limitedBudget =
    normalize(profile.budget_level) === "economique" ||
    constraints.some((constraint) =>
      constraint.includes("budget limite")
    );

  if (limitedBudget && recipe.budget === "confort") {
    return false;
  }

  return true;
}

function recipesFor(
  mealType: OtavioMealType,
  profile: OtavioProgramProfile
) {
  return RECIPES.filter(
    (recipe) =>
      recipe.mealType === mealType &&
      recipeMatchesProfile(recipe, profile)
  );
}

function scoreRecipe(
  recipe: OtavioRecipe,
  profile: OtavioProgramProfile,
  scan?: OtavioNutritionScan | null
) {
  let score = 0;

  const goals = (profile.goals ?? []).map(normalize);
  const preferences = (profile.food_preferences ?? []).map(normalize);
  const constraints = (profile.dietary_constraints ?? []).map(normalize);
  const style = normalize(profile.eating_style);
  const budget = normalize(profile.budget_level);

  /*
   * ---------------------------------------------------------
   * OBJECTIFS
   * ---------------------------------------------------------
   */

  for (const goal of goals) {
    if (
      recipe.goals.some((item) => {
        const normalized = normalize(item);
        return (
          normalized.includes(goal) ||
          goal.includes(normalized)
        );
      })
    ) {
      score += 5;
    }
  }

  /*
   * ---------------------------------------------------------
   * STYLE ALIMENTAIRE
   * ---------------------------------------------------------
   */

  if (
    style.includes("vegetalien") ||
    style.includes("vegan")
  ) {
    if (recipe.dietary.includes("vegan")) {
      score += 5;
    }
  } else if (
    style.includes("vegetarien") ||
    style.includes("vegetarienne")
  ) {
    if (
      recipe.dietary.includes("vegetarien") ||
      recipe.dietary.includes("vegan")
    ) {
      score += 5;
    }
  } else if (style.includes("pescetarien")) {
    if (
      recipe.ingredients.some((ingredient) =>
        ["saumon", "cabillaud", "thon"].some((term) =>
          normalize(ingredient.name).includes(term)
        )
      )
    ) {
      score += 4;
    }
  } else if (style.includes("flexitarien")) {
    // Favorise légèrement la diversité végétale.
    if (
      recipe.dietary.includes("vegetarien") ||
      recipe.dietary.includes("vegan")
    ) {
      score += 2;
    }
  }

  /*
   * ---------------------------------------------------------
   * PRÉFÉRENCES DE L'ONBOARDING
   * ---------------------------------------------------------
   */

  for (const preference of preferences) {
    if (
      preference.includes("cuisiner") &&
      recipe.prepTime >= 15
    ) {
      score += 3;
    }

    if (
      preference.includes("repas rapides") ||
      preference.includes("rapide")
    ) {
      if (recipe.prepTime <= 10) {
        score += 6;
      } else if (recipe.prepTime <= 15) {
        score += 4;
      } else if (recipe.prepTime <= 20) {
        score += 1;
      } else {
        score -= 3;
      }
    }

    if (
      preference.includes("exterieur") &&
      recipe.prepTime <= 15
    ) {
      score += 2;
    }

    if (
      preference.includes("fait maison") &&
      recipe.instructions.length >= 2
    ) {
      score += 3;
    }

    if (
      preference.includes("fruits et legumes")
    ) {
      const plantFoods = recipe.ingredients.filter((ingredient) =>
        [
          "fruit",
          "pomme",
          "banane",
          "tomate",
          "courgette",
          "carotte",
          "legume",
          "epinard",
          "brocoli",
          "concombre",
          "poivron",
          "avocat",
          "salade",
        ].some((term) =>
          normalize(ingredient.name).includes(term)
        )
      ).length;

      score += Math.min(plantFoods, 3) * 2;
    }

    if (preference.includes("reduire le sucre")) {
      if (
        recipe.tags.some((tag) =>
          ["sucre", "dessert"].includes(normalize(tag))
        )
      ) {
        score -= 4;
      } else {
        score += 1;
      }
    }

    if (
      preference.includes("produits ultra-transformes")
    ) {
      if (
        recipe.tags.some((tag) =>
          ["ultra-transforme", "transforme"].includes(
            normalize(tag)
          )
        )
      ) {
        score -= 5;
      } else {
        score += 2;
      }
    }

    // Correspondance avec les tags / préférences structurées
    if (
      recipe.preferences.some((item) => {
        const normalized = normalize(item);

        return (
          normalized.includes(preference) ||
          preference.includes(normalized)
        );
      })
    ) {
      score += 3;
    }
  }

  /*
   * ---------------------------------------------------------
   * CONTRAINTES PRATIQUES
   * ---------------------------------------------------------
   */

  const shortTime =
    constraints.some((constraint) =>
      constraint.includes("peu de temps")
    ) ||
    preferences.some((preference) =>
      preference.includes("repas rapides")
    );

  if (shortTime) {
    if (recipe.prepTime <= 10) {
      score += 7;
    } else if (recipe.prepTime <= 15) {
      score += 4;
    } else if (recipe.prepTime <= 25) {
      score += 1;
    } else {
      score -= 4;
    }
  }

  if (
    constraints.some((constraint) =>
      constraint.includes("peu de materiel")
    )
  ) {
    if (recipe.prepTime <= 15) {
      score += 3;
    }
  }

  if (
    constraints.some((constraint) =>
      constraint.includes("deplacements frequents")
    )
  ) {
    if (recipe.prepTime <= 15) {
      score += 3;
    }
  }

  /*
   * ---------------------------------------------------------
   * BUDGET
   * ---------------------------------------------------------
   */

  if (
    budget === "economique" ||
    constraints.some((constraint) =>
      constraint.includes("budget limite")
    )
  ) {
    if (recipe.budget === "economique") {
      score += 6;
    } else if (recipe.budget === "standard") {
      score += 2;
    }
  }

  if (budget === "standard") {
    if (recipe.budget !== "confort") {
      score += 2;
    }
  }

  if (budget === "confort" && recipe.budget === "confort") {
    score += 2;
  }

  /*
   * ---------------------------------------------------------
   * SCAN FACIAL
   * ---------------------------------------------------------
   */

  // Peau faible : le scan devient un facteur important dans
  // le choix des recettes, tout en conservant les contraintes du profil.
  if (
    typeof scan?.peau === "number" &&
    scan.peau < 75
  ) {
    const skinNeed =
      Math.min(8, Math.max(0, (75 - scan.peau) / 8));

    const skinSupportGoals = recipe.goals.filter((goal) =>
      [
        "peau",
        "qualite_peau",
        "hydratation",
        "equilibre",
        "eclat",
        "antioxydants",
      ].some((term) => normalize(goal).includes(term))
    ).length;

    const skinSupportTags = recipe.tags.filter((tag) =>
      [
        "fruit",
        "legume",
        "fibres",
        "fibre",
        "omega3",
        "poisson",
        "antioxydant",
        "complet",
        "equilibre",
      ].some((term) => normalize(tag).includes(term))
    ).length;

    const skinSupportIngredients = recipe.ingredients.filter(
      (ingredient) =>
        [
          "tomate",
          "carotte",
          "epinard",
          "brocoli",
          "poivron",
          "concombre",
          "courgette",
          "avocat",
          "salade",
          "haricot",
          "lentille",
          "pois chiche",
          "fruits",
          "pomme",
          "banane",
          "orange",
          "citron",
          "baies",
          "framboise",
          "myrtille",
          "noix",
          "amande",
          "graines",
          "saumon",
          "sardine",
          "maquereau",
        ].some((term) =>
          normalize(ingredient.name).includes(term)
        )
    ).length;

    const plantDiversity = recipe.ingredients.filter(
      (ingredient) =>
        [
          "tomate",
          "carotte",
          "epinard",
          "brocoli",
          "poivron",
          "concombre",
          "courgette",
          "avocat",
          "salade",
          "haricot",
          "lentille",
          "pois chiche",
          "pomme",
          "banane",
          "orange",
          "citron",
          "baies",
          "framboise",
          "myrtille",
        ].some((term) =>
          normalize(ingredient.name).includes(term)
        )
    ).length;

    const sugarLike =
      recipe.tags.some((tag) =>
        ["sucre", "dessert"].some((term) =>
          normalize(tag).includes(term)
        )
      );

    const ultraProcessed =
      recipe.tags.some((tag) =>
        ["ultra-transforme", "transforme"].some((term) =>
          normalize(tag).includes(term)
        )
      );

    const supportScore =
      Math.min(skinSupportGoals, 3) * 4 +
      Math.min(skinSupportTags, 4) * 3 +
      Math.min(skinSupportIngredients, 5) * 2 +
      Math.min(plantDiversity, 4) * 2;

    score += Math.round(supportScore * skinNeed / 3);

    if (scan.peau < 60) {
      score += Math.min(12, skinSupportIngredients * 2);
    }

    if (scan.peau < 40) {
      score += Math.min(10, plantDiversity * 2);
    }

    if (sugarLike) {
      score -= Math.round(skinNeed * 2);
    }

    if (ultraProcessed) {
      score -= Math.round(skinNeed * 1.5);
    }
  }

  // Équilibre faible : repas complets et structurés.
  if (
    typeof scan?.equilibre === "number" &&
    scan.equilibre < 70
  ) {
    if (
      recipe.goals.some((goal) =>
        normalize(goal).includes("equilibre")
      )
    ) {
      score += 5;
    }
  }

  // Hydratation faible : aliments riches en eau.
  if (
    typeof scan?.hydratation === "number" &&
    scan.hydratation < 70
  ) {
    const hydratingIngredients = recipe.ingredients.filter(
      (ingredient) =>
        [
          "tomate",
          "concombre",
          "courgette",
          "fruits",
          "pomme",
          "banane",
          "yaourt",
          "salade",
        ].some((term) =>
          normalize(ingredient.name).includes(term)
        )
    ).length;

    score += Math.min(hydratingIngredients, 3) * 2;
  }

  // Fatigue élevée : repas simples + protéines.
  if (
    typeof scan?.fatigue === "number" &&
    scan.fatigue < 65
  ) {
    if (
      recipe.goals.some((goal) =>
        ["energie", "proteines", "equilibre"].some((term) =>
          normalize(goal).includes(term)
        )
      )
    ) {
      score += 4;
    }

    if (recipe.proteinLevel === "eleve") {
      score += 3;
    } else if (recipe.proteinLevel === "modere") {
      score += 1;
    }

    if (recipe.prepTime <= 15) {
      score += 2;
    }
  }

  return score;
}


export type OtavioSubstitution = {
  original: string;
  replacement: string;
  reason: string;
};

const SUBSTITUTIONS: Record<string, OtavioSubstitution[]> = {
  "lait ou boisson vegetale": [
    {
      original: "Lait ou boisson végétale",
      replacement: "Boisson végétale sans sucre",
      reason: "Alternative sans lactose",
    },
  ],
  "poulet": [
    {
      original: "Blanc de poulet",
      replacement: "Escalope de dinde",
      reason: "Alternative riche en protéines",
    },
    {
      original: "Blanc de poulet",
      replacement: "Tofu ferme",
      reason: "Alternative végétale",
    },
  ],
  "blanc de poulet": [
    {
      original: "Blanc de poulet",
      replacement: "Escalope de dinde",
      reason: "Alternative riche en protéines",
    },
    {
      original: "Blanc de poulet",
      replacement: "Tofu ferme",
      reason: "Alternative végétale",
    },
  ],
  "saumon": [
    {
      original: "Pavé de saumon",
      replacement: "Cabillaud",
      reason: "Alternative poisson plus maigre",
    },
    {
      original: "Pavé de saumon",
      replacement: "Tofu ferme",
      reason: "Alternative végétale",
    },
  ],
  "pave de saumon": [
    {
      original: "Pavé de saumon",
      replacement: "Cabillaud",
      reason: "Alternative poisson plus maigre",
    },
    {
      original: "Pavé de saumon",
      replacement: "Tofu ferme",
      reason: "Alternative végétale",
    },
  ],
  "thon": [
    {
      original: "Thon au naturel",
      replacement: "Poulet",
      reason: "Alternative riche en protéines",
    },
    {
      original: "Thon au naturel",
      replacement: "Pois chiches",
      reason: "Alternative végétale riche en fibres",
    },
  ],
  "oeuf": [
    {
      original: "Œuf",
      replacement: "Tofu brouillé",
      reason: "Alternative végétale",
    },
  ],
  "oeufs": [
    {
      original: "Œufs",
      replacement: "Tofu brouillé",
      reason: "Alternative végétale",
    },
  ],
  "yaourt": [
    {
      original: "Yaourt nature",
      replacement: "Yaourt végétal sans sucre",
      reason: "Alternative sans lactose",
    },
  ],
  "yaourt nature": [
    {
      original: "Yaourt nature",
      replacement: "Yaourt végétal sans sucre",
      reason: "Alternative sans lactose",
    },
  ],
  "riz": [
    {
      original: "Riz",
      replacement: "Quinoa",
      reason: "Alternative céréalière plus riche en protéines",
    },
    {
      original: "Riz",
      replacement: "Pommes de terre",
      reason: "Alternative simple et économique",
    },
  ],
  "pates completes": [
    {
      original: "Pâtes complètes",
      replacement: "Quinoa",
      reason: "Alternative sans gluten",
    },
    {
      original: "Pâtes complètes",
      replacement: "Riz complet",
      reason: "Alternative céréalière",
    },
  ],
  "pain complet": [
    {
      original: "Pain complet",
      replacement: "Pain sans gluten",
      reason: "Alternative sans gluten",
    },
  ],
  "amandes": [
    {
      original: "Amandes",
      replacement: "Graines de courge",
      reason: "Alternative sans fruits à coque",
    },
    {
      original: "Amandes",
      replacement: "Graines de tournesol",
      reason: "Alternative sans fruits à coque",
    },
  ],
};

export function getOtavioSubstitutions(
  ingredientName: string
): OtavioSubstitution[] {
  const key = normalize(ingredientName);
  return SUBSTITUTIONS[key] ?? [];
}

export function getRecipeSubstitutions(
  recipe: OtavioRecipe
): OtavioSubstitution[] {
  const substitutions: OtavioSubstitution[] = [];

  for (const ingredient of recipe.ingredients) {
    const matches = getOtavioSubstitutions(ingredient.name);

    for (const substitution of matches) {
      if (
        !substitutions.some(
          (item) =>
            item.original === substitution.original &&
            item.replacement === substitution.replacement
        )
      ) {
        substitutions.push(substitution);
      }
    }
  }

  return substitutions;
}

function chooseRecipe(
  mealType: OtavioMealType,
  profile: OtavioProgramProfile,
  dayIndex: number,
  usedRecipeIds: Set<string>,
  scan?: OtavioNutritionScan | null
) {
  const candidates = recipesFor(mealType, profile);

  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates.map((recipe) => {
    let score = scoreRecipe(recipe, profile, scan);

    /*
     * On évite fortement de resservir immédiatement
     * une recette déjà utilisée.
     */
    if (usedRecipeIds.has(recipe.id)) {
      score -= 18;
    }

    /*
     * Rotation déterministe :
     * lorsque plusieurs recettes sont proches en score,
     * on fait varier naturellement le choix selon le jour.
     */
    const rotationIndex =
      (dayIndex + mealType.length) % candidates.length;

    const candidateIndex = candidates.findIndex(
      (candidate) => candidate.id === recipe.id
    );

    if (candidateIndex === rotationIndex) {
      score += 4;
    }

    /*
     * Petite pénalité supplémentaire pour les répétitions.
     * Elle permet d'exploiter au maximum le catalogue avant
     * de recommencer une recette.
     */
    if (usedRecipeIds.has(recipe.id)) {
      score -= 8;
    }

    return {
      recipe,
      score,
      candidateIndex,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.candidateIndex - b.candidateIndex;
  });

  /*
   * On regarde les meilleures recettes.
   * Si plusieurs sont suffisamment proches, on utilise la
   * rotation du jour plutôt que de reprendre systématiquement
   * la même recette.
   */
  const bestScore = scored[0].score;

  const shortlist = scored.filter(
    (item) => item.score >= bestScore - 3
  );

  const preferred =
    shortlist.find(
      (item) =>
        item.candidateIndex ===
        ((dayIndex + mealType.length) % candidates.length)
    ) ?? shortlist[0];

  const selected = preferred.recipe;

  usedRecipeIds.add(selected.id);

  return selected;
}

function buildPortion(
  mealType: OtavioMealType,
  recipe: OtavioRecipe,
  profile: OtavioProgramProfile
) {
  const mealsPerDay =
    profile.meals_per_day && profile.meals_per_day >= 3
      ? Math.min(profile.meals_per_day, 4)
      : 3;

  const goals = (profile.goals ?? []).map(normalize);
  const activity = normalize(profile.activity_level);
  const age = profile.age ?? null;
  const isProteinFocused = goals.some((goal) =>
    ["prote", "muscle", "sport", "activite"].some((term) =>
      goal.includes(term)
    )
  );
  const isLightGoal = goals.some((goal) =>
    ["digestion", "equilibre", "sommeil"].some((term) =>
      goal.includes(term)
    )
  );

  if (mealType === "petit_dejeuner") {
    if (isProteinFocused) {
      return activity.includes("tres") || activity.includes("actif")
        ? "Portion complète : 2 sources protéinées ou équivalent + fruit"
        : "Portion complète avec une source de protéines + fruit";
    }

    if (mealsPerDay >= 4) {
      return "Portion légère à modérée, adaptée à la faim";
    }

    return age && age >= 60
      ? "Portion modérée, complète et facile à digérer"
      : "Portion complète et équilibrée";
  }

  if (mealType === "dejeuner") {
    if (isProteinFocused) {
      return activity.includes("tres") || activity.includes("actif")
        ? "Portion généreuse avec priorité aux protéines, féculents et légumes"
        : "Portion complète avec priorité aux protéines et légumes";
    }

    if (isLightGoal) {
      return "Portion modérée avec priorité aux légumes et aux aliments rassasiants";
    }

    return recipe.servings > 1
      ? "1 portion de la préparation, à ajuster selon faim et activité"
      : "Portion complète avec protéines, féculents et légumes";
  }

  if (mealType === "diner") {
    if (isProteinFocused) {
      return "Portion complète, avec priorité aux protéines et légumes";
    }

    if (isLightGoal || mealsPerDay >= 4) {
      return "Portion modérée, avec légumes en priorité et féculents selon faim";
    }

    return "Portion complète mais modérée, avec priorité aux légumes";
  }

  return "Petite portion selon la faim, idéalement associée à une source de protéines ou de fibres";
}
export function buildOtavioNutritionPlan(
  profile: OtavioProgramProfile,
  durationDays = 7,
  scan?: OtavioNutritionScan | null
): OtavioNutritionPlan {
  const days: OtavioMealPlanDay[] = [];

  const mealsPerDay =
    profile.meals_per_day && profile.meals_per_day >= 3
      ? Math.min(profile.meals_per_day, 4)
      : 3;

  /*
   * Mémoire globale pour limiter les répétitions.
   */
  const usedRecipeIds = new Set<string>();

  /*
   * Mémoire par catégorie de repas.
   * Cela permet notamment d'éviter deux fois de suite
   * le même petit-déjeuner ou le même dîner.
   */
  const lastRecipeByMealType = new Map<
    OtavioMealType,
    string
  >();

  for (let day = 0; day < durationDays; day++) {
    const meals: OtavioMealPlanDay["meals"] = [];

    const selectMeal = (mealType: OtavioMealType) => {
      const candidates = recipesFor(mealType, profile);

      if (candidates.length === 0) {
        return null;
      }

      const lastRecipeId = lastRecipeByMealType.get(mealType);

      const availableCandidates = candidates.filter(
        (recipe) =>
          recipe.id !== lastRecipeId &&
          !usedRecipeIds.has(recipe.id)
      );

      /*
       * Si toutes les recettes ont déjà été utilisées,
       * on autorise la réutilisation mais on interdit
       * celle du jour précédent.
       */
      const pool =
        availableCandidates.length > 0
          ? availableCandidates
          : candidates.filter(
              (recipe) => recipe.id !== lastRecipeId
            );

      const finalPool =
        pool.length > 0 ? pool : candidates;

      const scored = finalPool
        .map((recipe) => ({
          recipe,
          score: scoreRecipe(recipe, profile, scan),
        }))
        .sort((a, b) => b.score - a.score);

      /*
       * On conserve les recettes proches du meilleur score.
       * Cela laisse au moteur une marge pour créer de la variété
       * sans sacrifier la personnalisation.
       */
      const bestScore = scored[0].score;

      const scanValues = [
        scan?.peau,
        scan?.hydratation,
        scan?.fatigue,
        scan?.equilibre,
      ].filter((value): value is number => typeof value === "number");

      const criticalScanNeed = scanValues.some(
        (value) => value < 60
      );

      const strongScanNeed = scanValues.some(
        (value) => value < 70
      );

      const shortlistGap = criticalScanNeed
        ? 2
        : strongScanNeed
          ? 3
          : 4;

      const shortlist = scored.filter(
        (item) => item.score >= bestScore - shortlistGap
      );

      const selected =
        shortlist[day % shortlist.length]?.recipe ??
        scored[0].recipe;

      usedRecipeIds.add(selected.id);
      lastRecipeByMealType.set(mealType, selected.id);

      return selected;
    };

    const breakfast = selectMeal("petit_dejeuner");
    const lunch = selectMeal("dejeuner");
    const dinner = selectMeal("diner");

    if (breakfast) {
      meals.push({
        type: "petit_dejeuner",
        recipe: breakfast,
        portion: buildPortion(
          "petit_dejeuner",
          breakfast,
          profile
        ),
      });
    }

    if (lunch) {
      meals.push({
        type: "dejeuner",
        recipe: lunch,
        portion: buildPortion(
          "dejeuner",
          lunch,
          profile
        ),
      });
    }

    if (mealsPerDay >= 4) {
      const snack = selectMeal("collation");

      if (snack) {
        meals.push({
          type: "collation",
          recipe: snack,
          portion: buildPortion(
            "collation",
            snack,
            profile
          ),
        });
      }
    }

    if (dinner) {
      meals.push({
        type: "diner",
        recipe: dinner,
        portion: buildPortion(
          "diner",
          dinner,
          profile
        ),
      });
    }

    days.push({
      day: day + 1,
      meals,
    });
  }

  const goals = (profile.goals ?? []).map(normalize);

  let objective =
    "Construire une alimentation plus régulière et équilibrée.";

  if (goals.includes("nutrition")) {
    objective =
      "Améliorer votre alimentation selon vos objectifs et contraintes.";
  } else if (
    goals.some((goal) =>
      ["energie", "fatigue", "recuperation"].includes(goal)
    )
  ) {
    objective =
      "Soutenir votre énergie et votre récupération avec des repas réguliers et adaptés.";
  } else if (
    goals.some((goal) =>
      ["peau", "qualite_peau", "hydratation"].includes(goal)
    )
  ) {
    objective =
      "Favoriser une alimentation équilibrée cohérente avec vos objectifs de peau et d’hydratation.";
  } else if (goals.includes("equilibre")) {
    objective =
      "Construire une alimentation variée, régulière et équilibrée.";
  }

  return {
    id: `nutrition_${Date.now()}`,
    durationDays,
    objective,
    personalization: [
      profile.eating_style
        ? `Style alimentaire : ${profile.eating_style}`
        : "Style alimentaire non renseigné",

      profile.meals_per_day
        ? `${profile.meals_per_day} repas par jour`
        : "3 repas par défaut",

      profile.budget_level
        ? `Budget : ${profile.budget_level}`
        : "Budget non renseigné",

      profile.available_time
        ? `Temps disponible : ${profile.available_time}`
        : "Temps disponible non renseigné",

      ...(profile.food_preferences ?? []).map(
        (preference) =>
          `Préférence : ${preference}`
      ),

      ...(profile.dietary_constraints ?? []).map(
        (constraint) =>
          `Contrainte : ${constraint}`
      ),

      ...(profile.allergies ?? []).map(
        (allergy) =>
          `Allergie : ${allergy}`
      ),

      ...(profile.intolerances ?? []).map(
        (intolerance) =>
          `Intolérance : ${intolerance}`
      ),

      ...(scan?.peau !== null &&
      scan?.peau !== undefined
        ? [
            `Score visuel de peau pris en compte pour l’orientation alimentaire : ${scan.peau}/100`,
          ]
        : []),

      ...(scan?.equilibre !== null &&
      scan?.equilibre !== undefined
        ? [
            `Score visuel d’équilibre pris en compte : ${scan.equilibre}/100`,
          ]
        : []),

      ...(scan?.hydratation !== null &&
      scan?.hydratation !== undefined
        ? [
            `Score visuel d’hydratation pris en compte : ${scan.hydratation}/100`,
          ]
        : []),

      ...(scan?.fatigue !== null &&
      scan?.fatigue !== undefined
        ? [
            `Indicateur visuel de fatigue pris en compte : ${scan.fatigue}/100`,
          ]
        : []),
    ],
    days,
  };
}


export type OtavioShoppingItem = {
  name: string;
  quantity: number;
  unit: string;
};

export type OtavioShoppingCategory = {
  name: string;
  items: OtavioShoppingItem[];
};

export function buildOtavioNutritionAdaptations(
  feedback: OtavioMealFeedback[]
): OtavioNutritionAdaptation[] {
  const adaptations: OtavioNutritionAdaptation[] = [];

  if (!feedback.length) {
    return adaptations;
  }

  const ignoredMeals = feedback.filter(
    (item) => item.status === "ignore"
  );

  const replacedMeals = feedback.filter(
    (item) => item.status === "remplace"
  );

  const completedMeals = feedback.filter(
    (item) => item.status === "realise"
  );

  const satisfactionScores = feedback
    .map((item) => item.satisfaction)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  if (ignoredMeals.length >= 2) {
    adaptations.push({
      type: "adherence",
      message:
        "Plusieurs repas ont été ignorés. Otavio peut privilégier des recettes plus simples et rapides à préparer.",
      priority: "haute",
    });
  }

  if (replacedMeals.length >= 2) {
    adaptations.push({
      type: "preferences",
      message:
        "Plusieurs repas ont été remplacés. Otavio peut ajuster progressivement les recettes proposées selon vos préférences.",
      priority: "moderee",
    });
  }

  if (completedMeals.length >= 4) {
    adaptations.push({
      type: "adherence",
      message:
        "Votre régularité est bonne. Otavio peut conserver cette structure tout en introduisant davantage de variété.",
      priority: "faible",
    });
  }

  if (satisfactionScores.length > 0) {
    const average =
      satisfactionScores.reduce(
        (sum, value) => sum + value,
        0
      ) / satisfactionScores.length;

    if (average <= 2) {
      adaptations.push({
        type: "satisfaction",
        message:
          "Les dernières recettes ont généré une satisfaction faible. Otavio peut adapter davantage les prochaines propositions.",
        priority: "haute",
      });
    } else if (average >= 4) {
      adaptations.push({
        type: "satisfaction",
        message:
          "Les dernières recettes sont bien appréciées. Otavio peut conserver les profils de repas qui fonctionnent le mieux.",
        priority: "faible",
      });
    }
  }

  return adaptations;
}

export function buildOtavioShoppingList(
  plan: OtavioNutritionPlan
): OtavioShoppingCategory[] {
  const aggregated = new Map<string, OtavioShoppingItem>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const servings = meal.recipe.servings || 1;

      for (const ingredient of meal.recipe.ingredients) {
        if (ingredient.quantity === undefined) continue;

        const key = `${normalize(ingredient.name)}|${normalize(
          ingredient.unit
        )}`;

        const existing = aggregated.get(key);

        if (existing) {
          existing.quantity += ingredient.quantity / servings;
        } else {
          aggregated.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity / servings,
            unit: ingredient.unit ?? "",
          });
        }
      }
    }
  }

  const categories: Record<string, OtavioShoppingItem[]> = {
    "Fruits et légumes": [],
    "Viandes, poissons et œufs": [],
    "Épicerie": [],
    "Produits laitiers et alternatives": [],
    "Autres": [],
  };

  for (const item of aggregated.values()) {
    const name = normalize(item.name);

    if (
      /pomme|tomate|courgette|carotte|brocoli|concombre|salade|oignon|fruit/.test(
        name
      )
    ) {
      categories["Fruits et légumes"].push(item);
    } else if (
      /poulet|saumon|poisson|oeuf|œuf/.test(name)
    ) {
      categories["Viandes, poissons et œufs"].push(item);
    } else if (
      /lait|boisson vegetale|fromage|yaourt/.test(name)
    ) {
      categories["Produits laitiers et alternatives"].push(item);
    } else if (
      /avoine|riz|lentille|pois chiche|huile|cannelle|herbe/.test(name)
    ) {
      categories["Épicerie"].push(item);
    } else {
      categories["Autres"].push(item);
    }
  }

  return Object.entries(categories)
    .filter(([, items]) => items.length > 0)
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.name.localeCompare(b.name, "fr")),
    }));
}
