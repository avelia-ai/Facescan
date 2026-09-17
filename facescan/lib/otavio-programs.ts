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
];

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function recipeMatchesProfile(
  recipe: OtavioRecipe,
  profile: OtavioProgramProfile
) {
  const forbidden = [
    ...(profile.allergies ?? []),
    ...(profile.intolerances ?? []),
    ...(profile.dietary_constraints ?? []),
  ].map(normalize);

  if (
    recipe.allergens.some((allergen) =>
      forbidden.some((item) => normalize(allergen).includes(item))
    )
  ) {
    return false;
  }

  const constraints = (profile.dietary_constraints ?? []).map(normalize);
  const style = normalize(profile.eating_style);

  if (
    constraints.some((constraint) =>
      ["vegan", "vegetalien"].includes(constraint)
    ) ||
    style.includes("vegan")
  ) {
    if (!recipe.dietary.includes("vegan")) return false;
  }

  if (
    constraints.some((constraint) =>
      ["vegetarien", "vegetarienne"].includes(constraint)
    ) ||
    style.includes("vegetar")
  ) {
    if (
      !recipe.dietary.includes("vegetarien") &&
      !recipe.dietary.includes("vegan")
    ) {
      return false;
    }
  }

  if (
    profile.budget_level === "economique" &&
    recipe.budget === "confort"
  ) {
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
  const style = normalize(profile.eating_style);
  const budget = normalize(profile.budget_level);

  for (const goal of goals) {
    if (recipe.goals.some((item) => normalize(item).includes(goal))) {
      score += 5;
    }
  }

  for (const preference of preferences) {
    if (
      recipe.preferences.some(
        (item) =>
          normalize(item).includes(preference) ||
          preference.includes(normalize(item))
      )
    ) {
      score += 3;
    }

    if (
      recipe.tags.some(
        (tag) =>
          normalize(tag).includes(preference) ||
          preference.includes(normalize(tag))
      )
    ) {
      score += 2;
    }
  }

  if (
    style &&
    recipe.dietary.some(
      (diet) =>
        normalize(diet).includes(style) ||
        style.includes(normalize(diet))
    )
  ) {
    score += 4;
  }

  if (budget === "economique" && recipe.budget === "economique") {
    score += 4;
  }

  if (budget === "standard" && recipe.budget !== "confort") {
    score += 2;
  }

  if (profile.available_time) {
    const time = normalize(profile.available_time);

    if (
      time.includes("court") ||
      time.includes("rapide") ||
      time.includes("peu")
    ) {
      if (recipe.prepTime <= 10) score += 5;
      else if (recipe.prepTime <= 15) score += 3;
      else if (recipe.prepTime <= 25) score += 1;
      else score -= 2;
    }

    if (time.includes("long") || time.includes("disponible")) {
      if (recipe.prepTime >= 20) score += 2;
    }
  }

  if (
    scan?.equilibre !== null &&
    scan?.equilibre !== undefined &&
    scan.equilibre < 70
  ) {
    if (
      recipe.goals.some((goal) =>
        normalize(goal).includes("equilibre")
      )
    ) {
      score += 4;
    }
  }

  if (
    scan?.hydratation !== null &&
    scan?.hydratation !== undefined &&
    scan.hydratation < 70
  ) {
    const hydratingIngredients = recipe.ingredients.filter((ingredient) =>
      [
        "tomate",
        "concombre",
        "courgette",
        "fruits",
        "pomme",
        "banane",
        "yaourt",
      ].some((term) =>
        normalize(ingredient.name).includes(term)
      )
    ).length;

    score += Math.min(hydratingIngredients, 2) * 2;
  }

  if (
    scan?.fatigue !== null &&
    scan?.fatigue !== undefined &&
    scan.fatigue < 65
  ) {
    if (
      recipe.goals.some((goal) =>
        ["energie", "proteines", "equilibre"].some((term) =>
          normalize(goal).includes(term)
        )
      )
    ) {
      score += 3;
    }

    if (recipe.proteinLevel === "eleve") score += 2;
    if (recipe.proteinLevel === "modere") score += 1;
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
  index: number,
  usedRecipeIds: Set<string>,
  scan?: OtavioNutritionScan | null
) {
  const candidates = recipesFor(mealType, profile);

  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates
    .map((recipe) => {
      let score = scoreRecipe(recipe, profile, scan);

      // Forte pénalité pour éviter de servir plusieurs fois
      // exactement la même recette pendant la semaine.
      if (usedRecipeIds.has(recipe.id)) {
        score -= 12;
      }

      // Favorise légèrement la rotation naturelle des recettes.
      score += index % Math.max(candidates.length, 1);

      return { recipe, score };
    })
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0].score;

  // Parmi les meilleures recettes, on garde plusieurs possibilités
  // afin de ne pas toujours sélectionner mécaniquement la première.
  const shortlist = scored.filter(
    (item) => item.score >= bestScore - 2
  );

  const selected =
    shortlist[index % shortlist.length]?.recipe ?? scored[0].recipe;

  usedRecipeIds.add(selected.id);

  return selected;
}


export function buildOtavioNutritionAdaptations(
  feedback: OtavioMealFeedback[]
): OtavioNutritionAdaptation[] {
  const adaptations: OtavioNutritionAdaptation[] = [];

  if (feedback.length === 0) {
    return adaptations;
  }

  const ignored = feedback.filter(
    (item) => item.status === "ignore"
  ).length;

  const replaced = feedback.filter(
    (item) => item.status === "remplace"
  ).length;

  const completed = feedback.filter(
    (item) => item.status === "realise"
  ).length;

  const satisfactionScores = feedback
    .map((item) => item.satisfaction)
    .filter((value): value is number => typeof value === "number");

  const averageSatisfaction =
    satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, value) => sum + value, 0) /
        satisfactionScores.length
      : null;

  if (ignored >= 2) {
    adaptations.push({
      type: "adherence",
      message:
        "Plusieurs repas ont été ignorés. Le prochain programme devrait être plus simple et plus facile à suivre.",
      priority: "haute",
    });
  }

  if (replaced >= 2) {
    adaptations.push({
      type: "temps",
      message:
        "Plusieurs repas ont été remplacés. Otavio devrait proposer davantage de recettes rapides et flexibles.",
      priority: "moderee",
    });
  }

  if (
    averageSatisfaction !== null &&
    averageSatisfaction < 3
  ) {
    adaptations.push({
      type: "satisfaction",
      message:
        "La satisfaction moyenne est faible. Les prochaines propositions doivent davantage tenir compte des préférences alimentaires.",
      priority: "haute",
    });
  }

  if (
    averageSatisfaction !== null &&
    averageSatisfaction >= 4
  ) {
    adaptations.push({
      type: "preferences",
      message:
        "Les repas sont globalement bien appréciés. Otavio peut conserver davantage de recettes similaires.",
      priority: "faible",
    });
  }

  if (
    feedback.length >= 4 &&
    completed / feedback.length < 0.5
  ) {
    adaptations.push({
      type: "adherence",
      message:
        "Le taux de réalisation est faible. Le programme devrait être simplifié avant d'augmenter sa complexité.",
      priority: "haute",
    });
  }

  return adaptations;
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

  const usedRecipeIds = new Set<string>();

  for (let day = 0; day < durationDays; day++) {
    const meals: OtavioMealPlanDay["meals"] = [];

    const breakfast = chooseRecipe(
      "petit_dejeuner",
      profile,
      day,
      usedRecipeIds,
      scan
    );

    const lunch = chooseRecipe(
      "dejeuner",
      profile,
      day,
      usedRecipeIds,
      scan
    );

    const dinner = chooseRecipe(
      "diner",
      profile,
      day,
      usedRecipeIds,
      scan
    );

    if (breakfast) {
      meals.push({
        type: "petit_dejeuner",
        recipe: breakfast,
        portion: buildPortion("petit_dejeuner", breakfast, profile),
      });
    }

    if (lunch) {
      meals.push({
        type: "dejeuner",
        recipe: lunch,
        portion: buildPortion("dejeuner", lunch, profile),
      });
    }

    if (dinner) {
      meals.push({
        type: "diner",
        recipe: dinner,
        portion: buildPortion("diner", dinner, profile),
      });
    }

    if (mealsPerDay >= 4) {
      const snack = chooseRecipe(
        "collation",
        profile,
        day,
        usedRecipeIds,
        scan
      );

      if (snack) {
        meals.splice(2, 0, {
          type: "collation",
          recipe: snack,
          portion: buildPortion("collation", snack, profile),
        });
      }
    }

    days.push({
      day: day + 1,
      meals,
    });
  }

  return {
    id: `nutrition_${Date.now()}`,
    durationDays,
    objective: profile.goals?.includes("nutrition")
      ? "Améliorer votre alimentation selon vos objectifs et contraintes."
      : "Construire une alimentation plus régulière et équilibrée.",
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
        (preference) => `Préférence : ${preference}`
      ),
      ...(profile.dietary_constraints ?? []).map(
        (constraint) => `Contrainte : ${constraint}`
      ),
      ...(profile.allergies ?? []).map(
        (allergy) => `Allergie : ${allergy}`
      ),
      ...(profile.intolerances ?? []).map(
        (intolerance) => `Intolérance : ${intolerance}`
      ),
      ...(scan?.equilibre !== null && scan?.equilibre !== undefined
        ? [`Score visuel d’équilibre pris en compte : ${scan.equilibre}/100`]
        : []),
      ...(scan?.hydratation !== null && scan?.hydratation !== undefined
        ? [`Score visuel d’hydratation pris en compte : ${scan.hydratation}/100`]
        : []),
      ...(scan?.fatigue !== null && scan?.fatigue !== undefined
        ? [`Indicateur visuel de fatigue pris en compte : ${scan.fatigue}/100`]
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
