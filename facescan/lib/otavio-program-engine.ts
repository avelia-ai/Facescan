import {
  buildOtavioNutritionPlan,
  type OtavioNutritionPlan,
  type OtavioMealType,
  type OtavioMealFeedback,
} from "@/lib/otavio-programs";
import { buildOtavioSleepPlan, type OtavioSleepPlan } from "@/lib/otavio-sleep";
import {
  buildOtavioSkinPlan,
  type OtavioSkinPlan,
  type OtavioSkinScan,
} from "@/lib/otavio-skin";
import { buildOtavioDailyTasks } from "@/lib/otavio-daily";

export type OtavioProgramProfile = {
  age?: number | null;
  activity_level?: string | null;
  goals?: string[] | null;

  bedtime?: string | null;
  wake_time?: string | null;
  sleep_duration?: number | null;
  sleep_quality?: string | null;
  sleep_regularity?: string | null;

  skin_type?: string | null;
  skin_sensitivity?: string | null;
  skin_concerns?: string[] | null;
  hydration_level?: string | null;

  eating_style?: string | null;
  meals_per_day?: number | null;
  budget_level?: string | null;
  food_preferences?: string[] | null;
  dietary_constraints?: string[] | null;
  allergies?: string[] | null;
  intolerances?: string[] | null;
  available_time?: string | null;
};

export type OtavioDailyProgramItem = {
  id: string;
  category: "alimentation" | "sommeil" | "peau" | "hydratation";
  priority: "haute" | "moderee" | "faible";
  time?: string;
  title: string;
  description: string;
  href: string;
  relevance?: number;
};

export type OtavioDailyProgram = {
  date: string;
  title: string;
  subtitle: string;
  items: OtavioDailyProgramItem[];
  nutrition: OtavioNutritionPlan;
  sleep: OtavioSleepPlan;
  skin: OtavioSkinPlan;
};

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function mealLabel(type: OtavioMealType) {
  switch (type) {
    case "petit_dejeuner":
      return "Petit-déjeuner";
    case "dejeuner":
      return "Déjeuner";
    case "diner":
      return "Dîner";
    case "collation":
      return "Collation";
  }
}

function priorityForMeal(type: OtavioMealType) {
  return type === "dejeuner" || type === "diner"
    ? "haute"
    : "moderee";
}

function scanNeed(value?: number | null) {
  if (typeof value !== "number") return 0;
  if (value < 60) return 20;
  if (value < 70) return 12;
  if (value < 80) return 6;
  return 0;
}

function calculateRelevance(
  item: OtavioDailyProgramItem,
  scan?: OtavioSkinScan | null,
  profile?: OtavioProgramProfile
) {
  let relevance = 0;

  const goals = (profile?.goals ?? []).map((goal) => goal.toLowerCase());

  if (item.priority === "haute") relevance += 2;
  if (item.priority === "moderee") relevance += 1;

  if (
    item.category === "peau" &&
    goals.some((goal) =>
      ["peau", "qualite_peau"].includes(goal)
    )
  ) {
    relevance += 3;
  }

  if (
    item.category === "peau" &&
    goals.includes("hydratation")
  ) {
    relevance += 2;
  }

  if (
    item.category === "hydratation" &&
    goals.includes("hydratation")
  ) {
    relevance += 4;
  }

  if (
    item.category === "sommeil" &&
    goals.some((goal) =>
      ["sommeil", "fatigue", "recuperation"].includes(goal)
    )
  ) {
    relevance += 3;
  }

  if (
    item.category === "alimentation" &&
    goals.includes("nutrition")
  ) {
    relevance += 3;
  }

  if (
    item.category === "alimentation" &&
    goals.includes("equilibre")
  ) {
    relevance += 2;
  }

  if (!scan) return relevance;

  if (item.category === "peau") {
    relevance += scanNeed(scan.peau);
  }

  if (item.category === "hydratation") {
    relevance += scanNeed(scan.hydratation);
  }

  if (item.category === "sommeil") {
    relevance += scanNeed(scan.fatigue);
  }

  if (item.category === "alimentation") {
    relevance += scanNeed(scan.equilibre);
  }

  return relevance;
}

export function buildOtavioDailyProgram(
  profile: OtavioProgramProfile,
  scan?: OtavioSkinScan | null,
  feedback?: OtavioMealFeedback[],
  date = new Date()
): OtavioDailyProgram {
  const nutrition = buildOtavioNutritionPlan(
    profile,
    7,
    scan,
    feedback
  );
  const sleep = buildOtavioSleepPlan(profile, 7, scan);
  const skin = buildOtavioSkinPlan(profile, scan, 7);

  const items: OtavioDailyProgramItem[] = [];

  const dailyScan = scan
    ? {
        score: null,
        indicators: {
          peau: scan.peau ?? null,
          hydratation: scan.hydratation ?? null,
          fatigue: scan.fatigue ?? null,
          equilibre: scan.equilibre ?? null,
        },
      }
    : null;

  const dailyTasks = buildOtavioDailyTasks(profile, dailyScan, date);
  const hydrationTask = dailyTasks.find(
    (task) => task.category === "hydratation"
  );

  if (hydrationTask) {
    items.push({
      id: `hydration-${hydrationTask.task_key}`,
      category: "hydratation",
      priority:
        hydrationTask.priority === "high"
          ? "haute"
          : hydrationTask.priority === "medium"
            ? "moderee"
            : "faible",
      title: hydrationTask.title,
      description: hydrationTask.description,
      href: "/hydratation",
    });
  }

  // Rotation hebdomadaire indépendante d'une date d'ancrage.
  // Lundi = 0, mardi = 1, ..., dimanche = 6.
  const programDate = new Date(
    todayKey(date) + "T12:00:00"
  );
  const programDayIndex =
    (programDate.getDay() + 6) % 7;

  const nutritionDay =
    nutrition.days[Math.max(0, programDayIndex)] ?? nutrition.days[0];

  nutritionDay?.meals.forEach((meal) => {
    items.push({
      id: `nutrition-${meal.type}`,
      category: "alimentation",
      priority: priorityForMeal(meal.type),
      title: `${mealLabel(meal.type)} : ${meal.recipe.name}`,
      description:
        meal.portion ??
        `Préparation en ${meal.recipe.prepTime} min.`,
      href: "/alimentation",
    });
  });

  const sleepDay =
    sleep.days[Math.max(0, programDayIndex)] ?? sleep.days[0];

  sleepDay?.actions.forEach((action, index) => {
    items.push({
      id: `sleep-${index}`,
      category: "sommeil",
      priority: action.category === "soir" ? "haute" : "moderee",
      time: action.time,
      title: action.title,
      description: action.description,
      href: "/sommeil",
    });
  });

  const skinDay =
    skin.days[Math.max(0, programDayIndex)] ?? skin.days[0];

  skinDay?.actions.forEach((action, index) => {
    items.push({
      id: `skin-${index}`,
      category: "peau",
      priority:
        action.priority === "essentiel"
          ? "haute"
          : action.priority === "important"
            ? "moderee"
            : "faible",
      time: action.moment === "matin" ? "Matin" : "Soir",
      title: action.title,
      description: action.description,
      href: "/peau",
    });
  });

  const priorityOrder = {
    haute: 0,
    moderee: 1,
    faible: 2,
  };

  const scoredItems = items.map((item) => ({
    ...item,
    relevance: calculateRelevance(item, scan, profile),
  }));

  scoredItems.sort((a, b) => {
    const relevanceDifference = (b.relevance ?? 0) - (a.relevance ?? 0);

    if (relevanceDifference !== 0) {
      return relevanceDifference;
    }

    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const scanFocus = scan
    ? [
        {
          key: "peau",
          label: "votre peau",
          value: scan.peau,
        },
        {
          key: "hydratation",
          label: "votre hydratation",
          value: scan.hydratation,
        },
        {
          key: "fatigue",
          label: "votre fatigue apparente",
          value: scan.fatigue,
        },
        {
          key: "equilibre",
          label: "votre équilibre visuel",
          value: scan.equilibre,
        },
      ]
        .filter(
          (item) => typeof item.value === "number"
        )
        .sort(
          (a, b) =>
            (a.value as number) - (b.value as number)
        )[0]
    : null;

  const subtitle = scanFocus
    ? `Votre dernier scan place ${scanFocus.label} à ${Math.round(
        scanFocus.value as number
      )}/100. Otavio ajuste vos actions du jour autour de ce repère visuel.`
    : "Otavio sélectionne les actions les plus utiles pour avancer aujourd’hui.";

  return {
    date: todayKey(date),
    title: "Votre programme du jour",
    subtitle,
    items: scoredItems,
    nutrition,
    sleep,
    skin,
  };
}
