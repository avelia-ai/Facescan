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
  const score = scan.indicators.hydratation;
  const activity = profile.activity_level ?? "non renseigné";
  const hydrationLevel = profile.hydration_level ?? "non renseigné";

  const priority = indicatorPriority(score);

  const steps = [
    `Commencez la journée par un verre d’eau puis répartissez vos boissons régulièrement plutôt que de boire de grandes quantités en une seule fois.`,
    `Gardez une bouteille ou un verre à portée de main pendant vos périodes de travail, de déplacement ou d’activité.`,
    `Utilisez les repas comme repères simples pour boire régulièrement au lieu d’attendre d’avoir très soif.`,
    profile.activity_level === "actif" || profile.activity_level === "tres_actif"
      ? "Lors des périodes d’activité physique, augmentez progressivement vos apports en fonction de la durée, de l’intensité, de la chaleur et de votre soif."
      : "Lors d’une journée chaude ou lorsque votre activité augmente, soyez particulièrement attentif à vos besoins en boissons.",
    profile.hydration_level === "faible"
      ? "Si votre consommation actuelle est basse, augmentez-la progressivement plutôt que de chercher à atteindre immédiatement un objectif élevé."
      : "Conservez une répartition régulière de vos boissons au fil de la journée.",
  ];

  return {
    id: "hydration_profile",
    category: "Hydratation",
    priority,

    title:
      score < 65
        ? "Renforcez progressivement votre hydratation"
        : score < 80
          ? "Structurez mieux votre hydratation"
          : "Maintenez une hydratation régulière",

    observation:
      `Votre indicateur visuel d’hydratation est actuellement à ${score}/100.`,

    summary:
      `Otavio croise votre hydratation déclarée (${hydrationLevel}), votre niveau d’activité (${activity}) et votre dernier indicateur visuel.`,

    why:
      "L’objectif est de rendre l’hydratation plus régulière et plus facile à maintenir dans votre journée, sans transformer un repère général en prescription.",

    target:
      `Repère personnalisé actuel : environ ${formatLiters(target)} de boissons sur la journée, à adapter à votre contexte.`,

    quantity: formatLiters(target),

    frequency: "Tout au long de la journée",

    duration: "À réévaluer lors des prochains scans et selon vos habitudes.",

    steps,

    alternatives: [
      "Eau plate",
      "Eau gazeuse",
      "Boissons non sucrées",
      "Aliments riches en eau en complément",
    ],

    basedOn: [
      "Niveau d’activité",
      "Hydratation déclarée",
      "Indicateur visuel d’hydratation",
    ],

    safetyNote:
      "Il s’agit d’un repère général et non d’une prescription. Les besoins peuvent varier selon votre contexte, notamment en cas de chaleur importante, d’activité physique ou de certaines situations médicales.",
  };
}


function buildSkinRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const sensitivity = (profile.skin_sensitivity ?? "").toLowerCase();
  const skinType = (profile.skin_type ?? "").toLowerCase();
  const concerns = (profile.skin_concerns ?? []).map((item) =>
    item.toLowerCase()
  );

  const sensitive =
    sensitivity.includes("sensible") ||
    sensitivity.includes("forte");

  const imperfections = concerns.some((item) =>
    ["imperfections", "acne", "acné", "pores", "points_noirs"].some((term) =>
      item.includes(term)
    )
  );

  const redness = concerns.some((item) =>
    ["rougeurs", "rougeur", "reactive", "réactive"].some((term) =>
      item.includes(term)
    )
  );

  const dryness = concerns.some((item) =>
    ["secheresse", "sécheresse", "deshydratation", "déshydratation"].some(
      (term) => item.includes(term)
    )
  );

  const dullness = concerns.some((item) =>
    ["eclat", "éclat", "teint", "terne"].some((term) =>
      item.includes(term)
    )
  );

  const texture = concerns.some((item) =>
    ["texture", "taches", "taches", "pigmentation"].some((term) =>
      item.includes(term)
    )
  );

  const routine = [
    "MATIN — Nettoyez votre visage avec un nettoyant doux, sans multiplier les lavages ni les produits décapants.",
    dryness
      ? "MATIN — Appliquez un sérum hydratant à base d’acide hyaluronique ou de glycérine, puis une crème contenant notamment des céramides ou d’autres agents hydratants."
      : "MATIN — Appliquez un soin hydratant adapté à votre type de peau ; privilégiez une texture plus légère si votre peau est grasse.",
    imperfections
      ? "MATIN — Si votre peau est sujette aux imperfections, privilégiez des produits indiqués non comédogènes et évitez d’empiler plusieurs actifs exfoliants."
      : "MATIN — Terminez par une protection solaire large spectre SPF 30 ou plus lorsque vous êtes exposé au soleil.",
    "SOIR — Démaquillez/nettoyez doucement puis appliquez votre soin hydratant.",
    redness || sensitive
      ? "PEAU SENSIBLE/RÉACTIVE — Introduisez un seul nouveau produit à la fois, idéalement après avoir stabilisé une routine simple."
      : "PROGRESSION — Introduisez les nouveaux actifs progressivement plutôt que plusieurs nouveautés simultanément.",
    imperfections
      ? "IMPERFECTIONS — Un produit contenant de l’acide salicylique peut être envisagé progressivement si votre peau le tolère ; réduisez ou arrêtez en cas d’irritation."
      : "ENTRETIEN — Observez la tolérance de votre peau avant d’ajouter un nouvel actif.",
    texture || dullness
      ? "TEXTURE/ÉCLAT — Un produit au rétinol peut être une option pour certaines personnes, mais il doit être introduit progressivement et ne convient pas à toutes les peaux."
      : "CONSTANCE — La régularité d’une routine simple est plus importante que la multiplication des produits.",
  ];

  const productTypes = [
    "Nettoyant visage doux, sans parfum si votre peau est sensible",
    "Sérum hydratant à base d’acide hyaluronique et/ou glycérine",
    "Crème hydratante contenant des céramides",
    imperfections
      ? "Hydratant indiqué non comédogène"
      : "Hydratant adapté à votre type de peau",
    "Protection solaire large spectre SPF 30+ pour les périodes d’exposition",
  ];

  if (imperfections && !sensitive) {
    productTypes.push(
      "Produit ciblé contenant de l’acide salicylique, introduit progressivement"
    );
  }

  if ((texture || dullness) && !sensitive) {
    productTypes.push(
      "Soin au rétinol à faible intensité, uniquement si adapté à votre situation"
    );
  }

  return {
    id: "skin_routine",
    category: "Peau",
    priority: indicatorPriority(scan.indicators.peau),

    title:
      scan.indicators.peau < 60
        ? "Construisez une routine peau plus ciblée"
        : "Affinez votre routine peau",

    observation:
      `Votre indicateur visuel de qualité de peau est à ${scan.indicators.peau}/100.`,

    summary:
      `${skinType ? `Type de peau : ${skinType}` : "Type de peau non renseigné"} · ${
        concerns.length
          ? `Préoccupations : ${concerns.join(", ")}`
          : "Préoccupations non renseignées"
      }.`,

    why:
      "Otavio adapte la routine à votre type de peau, votre sensibilité, vos préoccupations déclarées et votre résultat de scan afin d’éviter une routine inutilement complexe.",

    target:
      sensitive
        ? "Une routine courte, régulière et particulièrement orientée vers la tolérance et le maintien de la barrière cutanée."
        : imperfections
          ? "Une routine régulière qui soutient l’hydratation tout en ciblant progressivement les imperfections."
          : "Une routine régulière qui soutient l’hydratation, la protection et les besoins spécifiques identifiés.",

    frequency: "Matin et soir",

    duration: "Routine à stabiliser pendant plusieurs semaines avant de multiplier les changements.",

    steps: routine,

    alternatives: productTypes,

    basedOn: [
      "Type de peau",
      "Sensibilité",
      "Préoccupations déclarées",
      "Indicateur visuel de peau",
    ],

    safetyNote:
      sensitive
        ? "En cas d’irritation, brûlure ou réaction persistante, interrompez le nouveau produit et demandez conseil à un professionnel de santé. Les observations du scan restent visuelles et ne constituent pas un diagnostic dermatologique."
        : "Les observations du scan sont visuelles et ne constituent pas un diagnostic dermatologique. Les rétinoïdes ne conviennent pas à tout le monde et ne doivent notamment pas être utilisés pendant la grossesse ; demandez conseil à un professionnel de santé dans ce contexte.",
  };
}


function buildSleepRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const duration =
    typeof profile.sleep_duration === "number"
      ? profile.sleep_duration
      : null;

  const irregular =
    profile.sleep_regularity === "irreguliere";

  const poorQuality =
    profile.sleep_quality === "mauvaise";

  const shortSleep = duration !== null && duration < 7;

  const steps = [
    irregular
      ? "Commencez par stabiliser surtout votre heure de lever, y compris les jours où votre emploi du temps change."
      : "Conservez autant que possible une heure de lever et de coucher relativement régulière.",
    shortSleep
      ? `Votre durée déclarée est de ${duration} h : essayez de créer progressivement davantage de temps disponible pour dormir plutôt que de modifier brutalement votre rythme.`
      : "Préservez une durée de sommeil suffisante pour vous sentir reposé au réveil.",
    "Dans les 30 à 60 minutes précédant le coucher, passez progressivement à des activités calmes et peu stimulantes.",
    "Réduisez les écrans et la lumière forte en fin de soirée et gardez la chambre calme, sombre et confortable.",
    "Évitez autant que possible les boissons caféinées tardives et les repas très copieux juste avant de dormir.",
    "Conservez une activité physique régulière dans la journée, plutôt que de placer les efforts les plus intenses juste avant le coucher.",
    poorQuality
      ? "Votre qualité de sommeil déclarée étant basse, notez pendant quelques jours l’heure du coucher, du lever, les réveils et votre niveau de forme au matin pour identifier les habitudes qui influencent votre ressenti."
      : "Observez votre niveau de forme au réveil et votre fatigue dans la journée pour suivre l’évolution de votre routine.",
  ];

  return {
    id: "sleep_routine",
    category: "Sommeil",
    priority: indicatorPriority(scan.indicators.fatigue),

    title:
      scan.indicators.fatigue < 65
        ? "Donnez davantage de place à votre récupération"
        : irregular || poorQuality || shortSleep
          ? "Stabilisez votre rythme de sommeil"
          : "Entretenez votre rythme de sommeil",

    observation:
      `Votre indicateur de fatigue apparente est actuellement à ${scan.indicators.fatigue}/100.`,

    summary:
      `Votre profil indique ${
        duration ? `${duration} h de sommeil déclarées` : "une durée non renseignée"
      }, une qualité ${
        profile.sleep_quality ?? "non renseignée"
      } et une régularité ${
        profile.sleep_regularity ?? "non renseignée"
      }.`,
    
    why:
      "Otavio croise votre durée de sommeil, votre régularité, votre qualité déclarée et votre indicateur visuel de fatigue pour adapter les priorités.",

    target:
      "Un rythme de sommeil suffisamment long et aussi régulier que possible, adapté à votre emploi du temps et à votre ressenti.",

    frequency: "Chaque soir",

    duration: "À suivre sur plusieurs jours plutôt que sur une seule nuit.",

    steps,

    alternatives: [
      "Routine courte : 10 à 15 minutes de déconnexion et activité calme",
      "Routine complète : 30 à 60 minutes avec lumière réduite et activité relaxante",
      "Lecture calme",
      "Étirements doux",
      "Respiration ou relaxation",
      "Préparation des affaires du lendemain pour réduire les sollicitations tardives",
    ],

    basedOn: [
      "Durée de sommeil",
      "Qualité du sommeil",
      "Régularité",
      "Indicateur visuel de fatigue",
    ],

    safetyNote:
      "Un indicateur visuel de fatigue ne permet pas d’en déterminer la cause. En cas de troubles du sommeil persistants ou importants, demandez conseil à un professionnel de santé.",
  };
}


function buildNutritionRecommendation(
  profile: PersonalizationProfile,
  scan: PersonalizationScan
): PersonalizedRecommendation {
  const constraints = (profile.dietary_constraints ?? []).map((item) =>
    item.toLowerCase()
  );
  const allergies = profile.allergies ?? [];
  const intolerances = profile.intolerances ?? [];
  const preferences = profile.food_preferences ?? [];
  const budget = profile.budget_level;

  const vegetarian =
    constraints.some((item) => item.includes("vegetar")) ||
    constraints.some((item) => item.includes("vegan"));

  const vegan = constraints.some((item) => item.includes("vegan"));
  const noGluten = constraints.some((item) => item.includes("gluten"));
  const noLactose = constraints.some((item) => item.includes("lactose"));

  const proteinExamples = vegan
    ? "lentilles, pois chiches, haricots, tofu ou tempeh"
    : vegetarian
      ? "œufs, produits laitiers tolérés, lentilles, pois chiches, haricots ou tofu"
      : "œufs, poisson, volaille, produits laitiers selon vos préférences, ou légumineuses";

  const starchExamples = noGluten
    ? "riz, pommes de terre, quinoa ou autres céréales naturellement sans gluten compatibles avec vos habitudes"
    : "riz, pommes de terre, semoule, pain ou pâtes, de préférence complets ou semi-complets selon votre tolérance";

  const budgetAdvice =
    budget === "economique"
      ? "Pour maîtriser le budget, construisez vos repas autour de légumes secs, féculents simples, légumes de saison ou surgelés nature et quelques sources de protéines polyvalentes."
      : budget === "confort"
        ? "Votre budget permet de varier plus facilement les sources de protéines, les légumes, les fruits et les féculents complets."
        : "Cherchez surtout un équilibre entre variété, simplicité, plaisir et coût.";

  const steps = [
    `À chaque repas principal, partez d’une structure simple : une source de protéines (${proteinExamples}) + une composante végétale + une source de féculents (${starchExamples}).`,
    "Ajoutez régulièrement des légumes et des fruits selon vos goûts et la saison.",
    "Privilégiez les aliments peu transformés lorsque cela est pratique pour vous, tout en gardant une alimentation compatible avec votre mode de vie.",
    profile.meals_per_day
      ? `Votre profil indique ${profile.meals_per_day} repas/jour : utilisez ce rythme comme structure plutôt que de multiplier les prises alimentaires inutilement.`
      : "Construisez votre journée autour d’un rythme de repas que vous pouvez réellement maintenir.",
    budgetAdvice,
    preferences.length
      ? `Vos préférences alimentaires (${preferences.slice(0, 3).join(", ")}) doivent guider les choix afin que le programme reste agréable et réaliste.`
      : "Faites varier les aliments selon vos goûts pour rendre la routine durable.",
    "Planifiez quelques repas à l’avance et gardez des ingrédients polyvalents disponibles pour les journées chargées.",
  ];

  const alternatives = [
    `Protéines : ${proteinExamples}`,
    `Féculents : ${starchExamples}`,
    "Légumes : frais, surgelés nature ou en conserve selon ce qui est pratique",
    "Fruits : frais ou surgelés selon la saison et le budget",
    budget === "economique"
      ? "Option économique : lentilles, pois chiches, haricots, œufs, légumes surgelés nature et féculents complets"
      : "Option rapide : légumes surgelés nature + protéine simple + féculent déjà disponible",
    "Pour les repas sans beaucoup de temps : préparez une base de céréale/féculent et une source de protéines pouvant servir sur plusieurs repas.",
  ];

  if (noLactose) {
    alternatives.push(
      "Sans lactose : choisissez des produits explicitement sans lactose ou des alternatives végétales adaptées à vos préférences."
    );
  }

  const safetyNote =
    allergies.length || intolerances.length || constraints.length
      ? "Les allergies, intolérances et contraintes alimentaires enregistrées doivent rester prioritaires. En cas d’allergie importante ou de régime médical, ne les contournez pas avec une simple recommandation générale."
      : "Les recommandations nutritionnelles restent générales et ne remplacent pas un accompagnement médical ou diététique lorsqu’il est nécessaire.";

  return {
    id: "nutrition_balance",
    category: "Alimentation",
    priority: profile.goals?.includes("nutrition") ? "high" : "medium",

    title:
      scan.indicators.equilibre < 70
        ? "Construisez une alimentation plus équilibrée"
        : "Personnalisez davantage vos repas",

    observation:
      `Votre indicateur d’équilibre visuel est actuellement à ${scan.indicators.equilibre}/100.`,

    summary:
      `${profile.eating_style ?? "Style alimentaire non renseigné"} · ${
        profile.meals_per_day
          ? `${profile.meals_per_day} repas/jour`
          : "nombre de repas non renseigné"
      } · budget ${budget ?? "non renseigné"}.`,

    why:
      "Otavio combine vos habitudes alimentaires, vos objectifs, vos préférences, votre budget et vos contraintes pour construire des recommandations compatibles avec votre quotidien.",

    target:
      "Des repas variés, suffisamment structurés et réalistes à maintenir dans votre rythme de vie.",

    frequency: "À chaque repas principal",

    duration: "À ajuster progressivement selon vos habitudes et votre évolution.",

    steps,

    alternatives,

    basedOn: [
      "Style alimentaire",
      "Nombre de repas",
      "Budget",
      "Préférences alimentaires",
      "Contraintes alimentaires",
      "Allergies et intolérances",
      "Indicateur visuel d’équilibre",
    ],

    safetyNote,
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
      goalAliases: ["peau", "qualite_peau", "eclat"],
      label: "Peau",
      value: indicators.peau,
    },
    {
      goalAliases: ["hydratation"],
      label: "Hydratation",
      value: indicators.hydratation,
    },
    {
      goalAliases: ["recuperation", "fatigue", "sommeil"],
      label: "Récupération",
      value: indicators.fatigue,
    },
    {
      goalAliases: ["equilibre", "bien_etre", "evolution"],
      label: "Équilibre",
      value: indicators.equilibre,
    },
  ];

  const insights: Array<PersonalizedInsight & { relevance: number }> =
    items.map((item) => {
      const priority = indicatorPriority(item.value);

      const goalMatch = goals.some((goal) =>
        item.goalAliases.includes(goal)
      );

      return {
        title:
          priority === "high"
            ? `${item.label} : priorité de suivi`
            : priority === "medium"
              ? `${item.label} : à suivre`
              : `${item.label} : tendance favorable`,

        text:
          priority === "high"
            ? `Votre indicateur ${item.label.toLowerCase()} est actuellement à ${item.value}/100. Otavio en tient compte parmi les priorités de votre accompagnement.`
            : priority === "medium"
              ? `Votre indicateur ${item.label.toLowerCase()} est actuellement à ${item.value}/100. Otavio le conserve dans votre suivi et adapte progressivement les actions associées.`
              : `Votre indicateur ${item.label.toLowerCase()} est actuellement favorable (${item.value}/100). Otavio privilégie le maintien et la régularité sur cet axe.`,

        priority,
        type: priority === "low" ? "positive" : "attention",
        relevance:
          (priority === "high" ? 30 : priority === "medium" ? 15 : 0) +
          (goalMatch ? 8 : 0),
      };
    });

  if (insights.length === 0) {
    insights.push({
      title: "Votre suivi personnalisé",
      text:
        "Otavio affinera progressivement ses recommandations avec vos objectifs et vos prochains scans.",
      priority: "low",
      type: "neutral",
      relevance: 0,
    });
  }

  return insights
    .sort((a, b) => {
      const rank = {
        high: 0,
        medium: 1,
        low: 2,
      };

      const aRank = rank[a.priority];
      const bRank = rank[b.priority];

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      return b.relevance - a.relevance;
    })
    .map(({ relevance: _relevance, ...insight }) => insight);
}
