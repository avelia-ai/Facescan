type ProfileForDaily = {
  goals?: string[] | null;

  skin_type?: string | null;
  skin_sensitivity?: string | null;
  skin_concerns?: string[] | null;

  hydration_level?: string | null;

  activity_level?: string | null;
  activity_frequency?: string | null;

  bedtime?: string | null;
  wake_time?: string | null;
  sleep_duration?: number | null;
  sleep_quality?: string | null;
  sleep_regularity?: string | null;

  eating_style?: string | null;
  meals_per_day?: number | null;
  budget_level?: string | null;
  food_preferences?: string[] | null;
  dietary_constraints?: string[] | null;
  allergies?: string[] | null;
  intolerances?: string[] | null;
  current_products?: string[] | null;

  available_time?: string | null;
};

export type OtavioDailyScan = {
  score?: number | null;
  indicators?: {
    peau?: number | null;
    hydratation?: number | null;
    fatigue?: number | null;
    equilibre?: number | null;
  } | null;
};

export type OtavioDailyTask = {
  task_key: string;
  title: string;
  description: string;
  category: "hydratation" | "peau" | "sommeil" | "nutrition" | "activité" | "bien-être";
  priority: "high" | "medium" | "low";
};

type TaskCandidate = OtavioDailyTask & {
  score: number;
};

function pickVariant<T>(items: T[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

function hasGoal(profile: ProfileForDaily, ...values: string[]) {
  return values.some((value) => (profile.goals ?? []).includes(value));
}

function toNumber(value?: string | number | null) {
  if (typeof value === "number") return value;
  if (!value) return null;

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildHydrationTask(
  profile: ProfileForDaily,
  scan: OtavioDailyScan | null,
  seed: number
): TaskCandidate {
  const hydrationScore = scan?.indicators?.hydratation ?? null;
  const hydrationLow =
    profile.hydration_level === "faible" ||
    (hydrationScore !== null && hydrationScore < 70);

  const variants = hydrationLow
    ? [
        {
          title: "Structurer mes pauses hydratation",
          description:
            "Répartissez vos boissons sur la journée plutôt que d’attendre d’avoir soif.",
        },
        {
          title: "Commencer ma journée par un verre d’eau",
          description:
            "Commencez votre journée par un verre d’eau puis gardez une bouteille accessible.",
        },
        {
          title: "Créer un réflexe hydratation",
          description:
            "Associez une pause hydratation à deux moments fixes de votre journée.",
        },
      ]
    : [
        {
          title: "Maintenir une hydratation régulière",
          description:
            "Conservez des prises régulières dans la journée sans chercher à boire de grandes quantités d’un seul coup.",
        },
        {
          title: "Garder ma bouteille à portée de main",
          description:
            "Rendez l’hydratation facile en gardant une bouteille accessible pendant vos activités.",
        },
      ];

  return {
    ...pickVariant(variants, seed),
    task_key: `hydration_${seed % variants.length}`,
    category: "hydratation",
    priority: hydrationLow ? "high" : "medium",
    score:
      (hasGoal(profile, "hydratation") ? 45 : 20) +
      (hydrationLow ? 35 : 10),
  };
}

function buildSkinTask(
  profile: ProfileForDaily,
  scan: OtavioDailyScan | null,
  seed: number
): TaskCandidate {
  const skinScore = scan?.indicators?.peau ?? null;
  const sensitive = profile.skin_sensitivity === "sensible";
  const concerns = profile.skin_concerns ?? [];

  const variants = sensitive
    ? [
        {
          title: "Garder une routine douce",
          description:
            "Aujourd’hui, privilégiez les produits déjà bien tolérés et évitez d’ajouter plusieurs nouveautés en même temps.",
        },
        {
          title: "Simplifier ma routine",
          description:
            "Restez sur l’essentiel aujourd’hui : nettoyage doux, hydratation et protection solaire si exposition.",
        },
      ]
    : concerns.includes("imperfections")
      ? [
          {
            title: "Rester régulier sur ma routine",
            description:
              "Conservez une routine simple et régulière plutôt que de multiplier les produits ciblant les imperfections.",
          },
          {
            title: "Éviter de manipuler ma peau",
            description:
              "Évitez de toucher ou de percer les imperfections afin de limiter les agressions mécaniques.",
          },
        ]
      : [
          {
            title: "Maintenir ma routine peau",
            description:
              "Conservez aujourd’hui votre routine habituelle avec des gestes réguliers et non agressifs.",
          },
          {
            title: "Protéger ma peau en cas d’exposition",
            description:
              "En cas d’exposition au soleil, pensez à votre protection solaire et renouvelez-la selon les conditions d’exposition.",
          },
        ];

  return {
    ...pickVariant(variants, seed),
    task_key: `skin_${seed % variants.length}`,
    category: "peau",
    priority:
      skinScore !== null && skinScore < 70 ? "high" : "medium",
    score:
      (hasGoal(profile, "qualite_peau", "eclat") ? 45 : 15) +
      (skinScore !== null && skinScore < 70 ? 30 : 5) +
      (sensitive ? 10 : 0),
  };
}

function buildSleepTask(
  profile: ProfileForDaily,
  scan: OtavioDailyScan | null,
  seed: number
): TaskCandidate {
  const fatigueScore = scan?.indicators?.fatigue ?? null;
  const sleepDuration = toNumber(profile.sleep_duration);

  const needsSleepSupport =
    profile.sleep_quality === "mauvaise" ||
    profile.sleep_regularity === "irrégulière" ||
    (sleepDuration !== null && sleepDuration < 7) ||
    (fatigueScore !== null && fatigueScore < 70);

  const variants = needsSleepSupport
    ? [
        {
          title: "Préparer mon sommeil plus tôt",
          description:
            "Commencez votre phase de déconnexion avant le coucher pour favoriser une transition plus calme vers la nuit.",
        },
        {
          title: "Garder une heure de coucher régulière",
          description:
            "Essayez de conserver ce soir une heure de coucher proche de celle de vos autres jours.",
        },
        {
          title: "Réduire les écrans avant de dormir",
          description:
            "Prévoyez un moment sans écran avant le coucher et remplacez-le par une activité calme.",
        },
      ]
    : [
        {
          title: "Préserver ma régularité de sommeil",
          description:
            "Conservez autant que possible votre rythme habituel de coucher et de lever.",
        },
        {
          title: "Préparer une soirée calme",
          description:
            "Gardez un dernier temps calme avant le coucher pour préserver votre routine.",
        },
      ];

  return {
    ...pickVariant(variants, seed),
    task_key: `sleep_${seed % variants.length}`,
    category: "sommeil",
    priority: needsSleepSupport ? "high" : "medium",
    score:
      (hasGoal(profile, "sommeil", "fatigue") ? 45 : 10) +
      (needsSleepSupport ? 35 : 5),
  };
}

function buildNutritionTask(
  profile: ProfileForDaily,
  seed: number
): TaskCandidate {
  const constraints = profile.dietary_constraints ?? [];
  const allergies = profile.allergies ?? [];
  const intolerances = profile.intolerances ?? [];
  const budget = profile.budget_level;

  const budgetFriendly =
    budget === "faible" || budget === "serré";

  let variants = [
    {
      title: "Ajouter un végétal à mon prochain repas",
      description:
        "Ajoutez un fruit ou un légume à l’un de vos repas aujourd’hui.",
    },
    {
      title: "Construire un repas simple et complet",
      description:
        "Cherchez un repas réunissant une source de protéines, un féculent ou céréale, et un ou plusieurs végétaux.",
    },
    {
      title: "Préparer un repas maison",
      description:
        "Quand c’est possible, privilégiez un repas préparé simplement à partir d’aliments que vous connaissez déjà.",
    },
  ];

  if (budgetFriendly) {
    variants = [
      {
        title: "Faire simple avec mon budget",
        description:
          "Choisissez aujourd’hui une base économique et polyvalente : légumineuses, œufs, féculents, légumes de saison ou surgelés selon vos préférences.",
      },
      {
        title: "Optimiser un repas",
        description:
          "Utilisez les aliments déjà disponibles pour construire un repas simple plutôt que d’acheter plusieurs ingrédients spécifiques.",
      },
    ];
  }

  const safetySuffix =
    allergies.length || intolerances.length || constraints.length
      ? " Respectez bien vos allergies, intolérances et contraintes alimentaires enregistrées."
      : "";

  const selected = pickVariant(variants, seed);

  return {
    ...selected,
    description: selected.description + safetySuffix,
    task_key: `nutrition_${seed % variants.length}`,
    category: "nutrition",
    priority: hasGoal(profile, "nutrition") ? "high" : "medium",
    score: hasGoal(profile, "nutrition") ? 45 : 10,
  };
}

function buildActivityTask(
  profile: ProfileForDaily,
  seed: number
): TaskCandidate {
  const lowActivity =
    profile.activity_level === "faible" ||
    profile.activity_level === "sédentaire";

  const variants = lowActivity
    ? [
        {
          title: "Faire une courte marche",
          description:
            "Ajoutez aujourd’hui une courte marche à votre journée, à un moment facile à tenir.",
        },
        {
          title: "Faire une pause mouvement",
          description:
            "Levez-vous quelques minutes pendant une période prolongée en position assise.",
        },
      ]
    : [
        {
          title: "Entretenir mon mouvement",
          description:
            "Conservez aujourd’hui un peu de mouvement en fonction de votre niveau habituel et de votre disponibilité.",
        },
        {
          title: "Faire une pause active",
          description:
            "Profitez d’un moment libre pour marcher quelques minutes ou changer régulièrement de position.",
        },
      ];

  return {
    ...pickVariant(variants, seed),
    task_key: `activity_${seed % variants.length}`,
    category: "activité",
    priority: lowActivity ? "medium" : "low",
    score: lowActivity ? 25 : 10,
  };
}

function buildWellbeingTask(
  profile: ProfileForDaily,
  seed: number
): TaskCandidate {
  const variants = [
    {
      title: "Faire une vraie pause",
      description:
        "Prenez quelques minutes sans écran pour souffler et revenir à votre journée avec plus de disponibilité.",
    },
    {
      title: "Créer un moment calme",
      description:
        "Réservez quelques minutes à une activité calme qui vous aide à décrocher.",
    },
  ];

  return {
    ...pickVariant(variants, seed),
    task_key: `wellbeing_${seed % variants.length}`,
    category: "bien-être",
    priority: "low",
    score: hasGoal(profile, "bien_etre") ? 30 : 5,
  };
}

export function buildOtavioDailyTasks(
  profile: ProfileForDaily,
  scan: OtavioDailyScan | null = null,
  date = new Date()
): OtavioDailyTask[] {
  const daySeed =
    date.getUTCFullYear() * 372 +
    (date.getUTCMonth() + 1) * 31 +
    date.getUTCDate();

  const candidates: TaskCandidate[] = [];

  if (
    hasGoal(profile, "hydratation") ||
    profile.hydration_level ||
    (scan?.indicators?.hydratation ?? 100) < 70
  ) {
    candidates.push(buildHydrationTask(profile, scan, daySeed));
  }

  if (
    hasGoal(profile, "qualite_peau", "eclat") ||
    profile.skin_type ||
    profile.skin_sensitivity ||
    (scan?.indicators?.peau ?? 100) < 70
  ) {
    candidates.push(buildSkinTask(profile, scan, daySeed + 1));
  }

  if (
    hasGoal(profile, "sommeil", "fatigue") ||
    profile.sleep_quality ||
    profile.sleep_duration !== null ||
    (scan?.indicators?.fatigue ?? 100) < 70
  ) {
    candidates.push(buildSleepTask(profile, scan, daySeed + 2));
  }

  if (
    hasGoal(profile, "nutrition") ||
    profile.eating_style ||
    profile.meals_per_day
  ) {
    candidates.push(buildNutritionTask(profile, daySeed + 3));
  }

  candidates.push(buildActivityTask(profile, daySeed + 4));

  if (hasGoal(profile, "bien_etre")) {
    candidates.push(buildWellbeingTask(profile, daySeed + 5));
  }

  const unique = Array.from(
    new Map(candidates.map((task) => [task.task_key, task])).values()
  );

  return unique
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score: _score, ...task }) => task);
}
