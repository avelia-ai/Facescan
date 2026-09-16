export type PersonalizationProfile = {
  age?: number | null;
  sex?: string | null;

  skin_type?: string | null;
  skin_sensitivity?: string | null;
  skin_concerns?: string[] | null;

  goals?: string[] | null;

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

  available_time?: string | null;
};

export type PersonalizationScan = {
  id?: string;
  date?: string;
  score: number;
  indicators: {
    peau: number;
    hydratation: number;
    fatigue: number;
    equilibre: number;
  };
};

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationCategory =
  | "Hydratation"
  | "Peau"
  | "Sommeil"
  | "Alimentation"
  | "Routine";

export type PersonalizedRecommendation = {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;

  title: string;
  observation: string;
  summary: string;

  why: string;

  target: string;
  quantity?: string;
  frequency: string;
  duration?: string;

  steps: string[];
  alternatives?: string[];

  basedOn: string[];

  safetyNote?: string;
  source?: string;
};

export type PersonalizedInsight = {
  title: string;
  text: string;
  priority: RecommendationPriority;
  type: "positive" | "attention" | "neutral";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function indicatorPriority(
  value: number
): RecommendationPriority {
  if (value < 60) return "high";
  if (value < 75) return "medium";
  return "low";
}

function hydrationTarget(profile: PersonalizationProfile) {
  let target = 1.5;

  if (profile.sex === "homme") target = 1.8;
  if (profile.sex === "femme") target = 1.6;

  if (profile.activity_level === "actif") target += 0.2;
  if (profile.activity_level === "tres_actif") target += 0.3;

  if (profile.hydration_level === "faible") target += 0.2;

  return clamp(Number(target.toFixed(1)), 1.5, 2);
}

function formatLiters(value: number) {
  return `${value.toFixed(1).replace(".", ",")} L`;
}

function buildHydrationRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const target = hydrationTarget(profile);
  const priority = indicatorPriority(scan.indicators.hydratation);

  return {
    id: "hydration_profile",
    category: "Hydratation",
    priority,

    title:
      scan.indicators.hydratation < 70
        ? "Renforcez progressivement votre hydratation"
        : "Maintenez une hydratation régulière",

    observation: `Votre indicateur visuel d’hydratation est actuellement à ${scan.indicators.hydratation}/100.`,

    summary:
      `Repère général personnalisé à partir de votre profil : environ ${formatLiters(
        target
      )} de boissons sur la journée.`,

    why:
      `Otavio combine ici votre niveau d’activité (${profile.activity_level ?? "non renseigné"}), votre hydratation déclarée (${profile.hydration_level ?? "non renseignée"}) et votre observation visuelle récente.`,

    target:
      `Environ ${formatLiters(target)} de boissons par jour comme repère général, à adapter à votre contexte.`,

    quantity: formatLiters(target),

    frequency: "Tout au long de la journée",

    steps: [
      "Gardez une bouteille à proximité pour avoir un repère visuel simple.",
      "Répartissez les boissons sur la journée plutôt que de tout boire en une seule fois.",
      "Augmentez progressivement si votre consommation actuelle est plus basse.",
    ],

    alternatives: [
      "Eau plate ou gazeuse",
      "Boissons non sucrées",
      "Aliments riches en eau en complément",
    ],

    basedOn: [
      "Niveau d’activité",
      "Hydratation déclarée",
      "Indicateur visuel d’hydratation",
    ],

    safetyNote:
      "Il s’agit d’un repère général et non d’une prescription. Les besoins peuvent varier selon le contexte individuel.",

    source: "Repères généraux d’hydratation adulte",
  };
}

function buildSkinRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const sensitivity = profile.skin_sensitivity;
  const skinType = profile.skin_type;
  const concerns = profile.skin_concerns ?? [];

  const steps =
    sensitivity === "forte"
      ? [
          "Nettoyez doucement sans multiplier les produits.",
          "Utilisez un produit hydratant déjà bien toléré.",
          "Évitez d’introduire plusieurs nouveaux actifs en même temps.",
        ]
      : [
          "Conservez une routine simple et régulière.",
          "Ajoutez les nouveaux produits progressivement.",
          "Évitez de modifier plusieurs éléments de la routine simultanément.",
        ];

  return {
    id: "skin_routine",
    category: "Peau",
    priority: indicatorPriority(scan.indicators.peau),

    title:
      scan.indicators.peau < 65
        ? "Simplifiez et renforcez votre routine peau"
        : "Stabilisez votre routine peau",

    observation:
      `Votre indicateur visuel de qualité de peau est à ${scan.indicators.peau}/100.`,

    summary:
      `${skinType ? `Profil ${skinType}` : "Profil cutané non renseigné"}${
        concerns.length
          ? ` · préoccupations : ${concerns.slice(0, 2).join(", ")}`
          : ""
      }.`,

    why:
      `Otavio tient compte de votre type de peau, de votre sensibilité et de vos préoccupations déclarées pour éviter une routine trop complexe.`,

    target:
      "Une routine suffisamment simple pour être suivie régulièrement et bien tolérée.",

    frequency: "Matin et/ou soir selon les produits",

    steps,

    alternatives: [
      "Routine minimale si vous avez peu de temps",
      "Routine progressive si vous souhaitez ajouter de nouveaux produits",
    ],

    basedOn: [
      "Type de peau",
      "Sensibilité",
      "Préoccupations",
      "Indicateur visuel de peau",
    ],

    safetyNote:
      "Les observations du scan sont visuelles et ne constituent pas un diagnostic dermatologique.",
  };
}

function buildSleepRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  let steps: string[];

  if (profile.sleep_regularity === "irreguliere") {
    steps = [
      "Commencez par stabiliser votre heure de lever.",
      "Essayez de rapprocher progressivement vos horaires de coucher.",
      "Gardez une routine du soir simple et répétable.",
    ];
  } else if (profile.sleep_quality === "mauvaise") {
    steps = [
      "Conservez une heure de lever aussi régulière que possible.",
      "Préparez une période calme avant le coucher.",
      "Réduisez progressivement les activités stimulantes en fin de soirée.",
    ];
  } else {
    steps = [
      "Conservez vos horaires réguliers.",
      "Protégez votre routine du soir.",
      "Observez l’évolution de votre fatigue au fil des prochains jours.",
    ];
  }

  return {
    id: "sleep_routine",
    category: "Sommeil",
    priority: indicatorPriority(scan.indicators.fatigue),

    title:
      scan.indicators.fatigue < 65
        ? "Donnez davantage de place à la récupération"
        : "Stabilisez votre rythme de sommeil",

    observation:
      `Votre indicateur de fatigue apparente est actuellement à ${scan.indicators.fatigue}/100.`,

    summary:
      `Votre profil indique ${
        profile.sleep_duration
          ? `${profile.sleep_duration} h de sommeil déclarées`
          : "une durée de sommeil non renseignée"
      } et une régularité ${
        profile.sleep_regularity ?? "non renseignée"
      }.`,

    why:
      "Otavio croise votre durée de sommeil déclarée, sa régularité, sa qualité et votre observation visuelle de fatigue.",

    target:
      "Un rythme de sommeil aussi régulier que possible et suffisamment long pour vos besoins.",

    frequency: "Chaque soir",

    steps,

    basedOn: [
      "Durée de sommeil",
      "Qualité du sommeil",
      "Régularité",
      "Indicateur visuel de fatigue",
    ],

    safetyNote:
      "Un indicateur visuel de fatigue ne permet pas de déterminer une cause médicale de fatigue.",
  };
}

function buildNutritionRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const budget = profile.budget_level;

  const practical =
    budget === "economique"
      ? "Privilégiez les aliments simples, de saison, les légumineuses et les produits peu transformés pour garder des repas variés à coût maîtrisé."
      : budget === "confort"
        ? "Vous pouvez diversifier davantage les sources de protéines, les légumes et les aliments complets."
        : "Cherchez un équilibre entre variété, simplicité et coût.";

  return {
    id: "nutrition_balance",
    category: "Alimentation",
    priority:
      profile.goals?.includes("nutrition") ? "high" : "medium",

    title: "Construisez des repas plus complets",

    observation:
      "Otavio utilise vos habitudes alimentaires et vos contraintes pour personnaliser ses suggestions.",

    summary:
      `${profile.eating_style ?? "Style alimentaire non renseigné"} · ${
        profile.meals_per_day
          ? `${profile.meals_per_day} repas/jour`
          : "nombre de repas non renseigné"
      }.`,

    why:
      "L’objectif est de vous proposer des recommandations compatibles avec vos préférences plutôt qu’un modèle alimentaire identique pour tout le monde.",

    target:
      "Associer autant que possible une source de protéines, une composante végétale et une source de féculents adaptée au repas.",

    frequency: "À chaque repas principal",

    steps: [
      practical,
      "Adaptez la composition à vos préférences et à votre faim.",
      "Conservez les contraintes, allergies et intolérances comme filtres prioritaires.",
    ],

    basedOn: [
      "Style alimentaire",
      "Nombre de repas",
      "Budget",
      "Préférences",
      "Contraintes alimentaires",
      "Objectifs",
    ],

    safetyNote:
      "Les allergies et intolérances déclarées doivent rester des contraintes strictes lors de toute future génération de repas.",
  };
}

function buildRoutineRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const time =
    profile.available_time === "5"
      ? "5 minutes"
      : profile.available_time === "10"
        ? "10 minutes"
        : profile.available_time === "15"
          ? "15 minutes"
          : profile.available_time === "20_plus"
            ? "20 minutes ou plus"
            : "quelques minutes";

  return {
    id: "routine_realistic",
    category: "Routine",
    priority: "low",

    title: "Construisez une routine que vous pouvez tenir",

    observation:
      `Votre temps disponible déclaré est de ${time}.`,

    summary:
      "Otavio privilégie une routine réaliste et progressive plutôt qu’un programme trop lourd.",

    why:
      "La personnalisation doit tenir compte de votre temps réellement disponible, sinon les recommandations deviennent difficiles à suivre.",

    target:
      `Une routine compatible avec vos ${time} disponibles.`,

    frequency: "Selon votre programme",

    steps: [
      "Commencez par les étapes les plus importantes pour vos objectifs.",
      "Gardez le programme suffisamment simple pour être répété.",
      "Ajoutez de nouvelles habitudes progressivement.",
    ],

    basedOn: [
      "Temps disponible",
      "Objectifs",
      "Type de peau",
      "Habitudes",
    ],
  };
}

export function buildPersonalizedRecommendations({
  profile,
  scan,
}: {
  profile: PersonalizationProfile;
  scan: PersonalizationScan;
}) {
  const recommendations: PersonalizedRecommendation[] = [];

  if (
    profile.goals?.includes("hydratation") ||
    scan.indicators.hydratation < 75
  ) {
    recommendations.push(
      buildHydrationRecommendation(profile, scan)
    );
  }

  if (
    profile.goals?.includes("qualite_peau") ||
    profile.goals?.includes("eclat") ||
    scan.indicators.peau < 75
  ) {
    recommendations.push(
      buildSkinRecommendation(profile, scan)
    );
  }

  if (
    profile.goals?.includes("sommeil") ||
    profile.goals?.includes("fatigue") ||
    scan.indicators.fatigue < 75
  ) {
    recommendations.push(
      buildSleepRecommendation(profile, scan)
    );
  }

  if (
    profile.goals?.includes("nutrition") ||
    profile.eating_style
  ) {
    recommendations.push(
      buildNutritionRecommendation(profile, scan)
    );
  }

  if (profile.goals?.length) {
    recommendations.push(
      buildRoutineRecommendation(profile, scan)
    );
  }

  return recommendations.sort((a, b) => {
    const rank = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return rank[a.priority] - rank[b.priority];
  });
}

/*
 * Compatibilité avec les écrans existants.
 * On conserve l'ancien format utilisé par /resultats.
 */
export function buildPersonalizedInsights({
  goals,
  indicators,
}: {
  goals: string[];
  indicators: PersonalizationScan["indicators"];
}): PersonalizedInsight[] {
  const items = [
    {
      goal: "peau",
      label: "Peau",
      value: indicators.peau,
    },
    {
      goal: "hydratation",
      label: "Hydratation",
      value: indicators.hydratation,
    },
    {
      goal: "recuperation",
      label: "Récupération",
      value: indicators.fatigue,
    },
    {
      goal: "equilibre",
      label: "Équilibre",
      value: indicators.equilibre,
    },
  ];

  const insights: PersonalizedInsight[] = [];

  for (const item of items) {
    if (!goals.includes(item.goal)) continue;

    const priority = indicatorPriority(item.value);

    insights.push({
      title:
        priority === "high"
          ? `${item.label} : priorité de suivi`
          : priority === "medium"
            ? `${item.label} : à suivre`
            : `${item.label} : tendance favorable`,

      text:
        priority === "high"
          ? `Votre indicateur ${item.label.toLowerCase()} est actuellement à ${item.value}/100.`
          : priority === "medium"
            ? `Votre indicateur ${item.label.toLowerCase()} est actuellement à ${item.value}/100 et mérite un suivi régulier.`
            : `Votre indicateur ${item.label.toLowerCase()} est actuellement favorable (${item.value}/100).`,

      priority,
      type:
        priority === "low"
          ? "positive"
          : "attention",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Votre suivi personnalisé",
      text:
        "Otavio affinera progressivement ses recommandations avec vos objectifs et vos prochains scans.",
      priority: "low",
      type: "neutral",
    });
  }

  return insights;
}
