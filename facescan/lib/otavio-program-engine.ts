import {
  buildOtavioNutritionPlan,
  type OtavioNutritionPlan,
  type OtavioMealType,
} from "@/lib/otavio-programs";
import { buildOtavioSleepPlan, type OtavioSleepPlan } from "@/lib/otavio-sleep";
import {
  buildOtavioSkinPlan,
  type OtavioSkinPlan,
  type OtavioSkinScan,
} from "@/lib/otavio-skin";

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
  category: "alimentation" | "sommeil" | "peau";
  priority: "haute" | "moderee" | "faible";
  time?: string;
  title: string;
  description: string;
  href: string;
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

export function buildOtavioDailyProgram(
  profile: OtavioProgramProfile,
  scan?: OtavioSkinScan | null,
  date = new Date()
): OtavioDailyProgram {
  const nutrition = buildOtavioNutritionPlan(profile, 7);
  const sleep = buildOtavioSleepPlan(profile, 7);
  const skin = buildOtavioSkinPlan(profile, scan, 7);

  const items: OtavioDailyProgramItem[] = [];

  const programDayIndex =
    Math.floor(
      (new Date(todayKey(date) + "T00:00:00").getTime() -
        new Date("2026-09-15T00:00:00").getTime()) /
        86400000
    ) % 7;

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

  items.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    date: todayKey(date),
    title: "Votre programme du jour",
    subtitle:
      "Otavio sélectionne les actions les plus utiles pour avancer aujourd’hui.",
    items,
    nutrition,
    sleep,
    skin,
  };
}
