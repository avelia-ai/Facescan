export type OtavioSkinProfile = {
  skin_type?: string | null;
  skin_sensitivity?: string | null;
  skin_concerns?: string[] | null;
  goals?: string[] | null;
  hydration_level?: string | null;
};

export type OtavioSkinScan = {
  peau?: number | null;
  hydratation?: number | null;
  fatigue?: number | null;
  equilibre?: number | null;
};

export type OtavioSkinAction = {
  moment: "matin" | "soir";
  title: string;
  description: string;
  priority: "essentiel" | "important" | "optionnel";
};

export type OtavioSkinDay = {
  day: number;
  objective: string;
  actions: OtavioSkinAction[];
};

export type OtavioSkinPlan = {
  id: string;
  durationDays: number;
  objective: string;
  personalization: string[];
  days: OtavioSkinDay[];
};

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function has(profile: OtavioSkinProfile, value: string) {
  const target = normalize(value);

  return [
    profile.skin_type,
    profile.skin_sensitivity,
    profile.hydration_level,
    ...(profile.skin_concerns ?? []),
    ...(profile.goals ?? []),
  ]
    .filter(Boolean)
    .some((item) => normalize(item).includes(target));
}

export function buildOtavioSkinPlan(
  profile: OtavioSkinProfile,
  scan?: OtavioSkinScan | null,
  durationDays = 7
): OtavioSkinPlan {
  const sensitivity = has(profile, "sensible");
  const reactive = has(profile, "reactive");
  const dry = has(profile, "sec") || has(profile, "deshydrat");
  const oily = has(profile, "gras");
  const combination = has(profile, "mixte");
  const acne =
    has(profile, "acne") ||
    has(profile, "imperfection") ||
    has(profile, "bouton");
  const redness =
    has(profile, "rougeur") ||
    has(profile, "rouge") ||
    reactive;
  const dullness =
    has(profile, "eclat") ||
    has(profile, "terne");
  const texture =
    has(profile, "texture") ||
    has(profile, "pigmentation") ||
    has(profile, "tache");

  const hydration = scan?.hydratation ?? null;
  const skinScore = scan?.peau ?? null;
  const fatigue = scan?.fatigue ?? null;
  const balance = scan?.equilibre ?? null;

  const lowHydration =
    hydration !== null && hydration < 70;

  const veryLowHydration =
    hydration !== null && hydration < 60;

  const lowSkinScore =
    skinScore !== null && skinScore < 70;

  const veryLowSkinScore =
    skinScore !== null && skinScore < 60;

  const highFatigue =
    fatigue !== null && fatigue < 65;

  const lowBalance =
    balance !== null && balance < 70;

  const needsFundamentals =
    veryLowSkinScore ||
    veryLowHydration ||
    lowBalance;

  const personalization: string[] = [];

  if (profile.skin_type) {
    personalization.push(
      `Type de peau déclaré : ${profile.skin_type}.`
    );
  }

  if (profile.skin_sensitivity) {
    personalization.push(
      `Sensibilité cutanée : ${profile.skin_sensitivity}.`
    );
  }

  if (profile.skin_concerns?.length) {
    personalization.push(
      `Préoccupations prioritaires : ${profile.skin_concerns.join(", ")}.`
    );
  }

  if (hydration !== null) {
    personalization.push(
      `Observation visuelle d’hydratation du dernier scan : ${hydration}/100.`
    );
  }

  if (skinScore !== null) {
    personalization.push(
      `Score visuel de peau du dernier scan : ${skinScore}/100.`
    );
  }

  if (fatigue !== null) {
    personalization.push(
      `Indicateur visuel de fatigue du dernier scan : ${fatigue}/100.`
    );
  }

  if (balance !== null) {
    personalization.push(
      `Indicateur visuel d’équilibre du dernier scan : ${balance}/100.`
    );
  }

  if (sensitivity || redness) {
    personalization.push(
      "Otavio privilégie une progression douce et limite les changements simultanés."
    );
  }

  if (acne) {
    personalization.push(
      "Les imperfections sont prises en compte dans le choix des gestes et des actifs."
    );
  }

  if (dry || lowHydration) {
    personalization.push(
      "L’hydratation et le confort cutané sont renforcés dans le programme."
    );
  }

  if (highFatigue) {
    personalization.push(
      "La fatigue visuelle est prise en compte : Otavio évite de surcharger la routine et privilégie les fondamentaux."
    );
  }

  if (needsFundamentals) {
    personalization.push(
      "Les fondamentaux sont prioritaires avant toute augmentation du nombre d’actifs."
    );
  }

  const days: OtavioSkinDay[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const actions: OtavioSkinAction[] = [];

    actions.push({
      moment: "matin",
      title: "Nettoyage doux",
      description:
        sensitivity || redness
          ? "Utilisez un nettoyant visage doux, idéalement sans parfum, sans frotter et sans multiplier les lavages."
          : oily || acne
            ? "Nettoyez doucement le visage pour retirer l’excès de sébum sans chercher à décaper la peau."
            : "Nettoyez le visage avec un produit doux et adapté à votre tolérance.",
      priority: "essentiel",
    });

    actions.push({
      moment: "matin",
      title: "Hydratation ciblée",
      description:
        dry || veryLowHydration
          ? "Votre scan suggère une hydratation basse. Privilégiez une formule simple avec des agents humectants comme la glycérine, puis une crème contenant notamment des céramides pour soutenir la barrière cutanée."
          : lowHydration
            ? "Votre hydratation visuelle mérite une attention particulière. Appliquez régulièrement un soin hydratant puis une crème adaptée à votre tolérance."
            : oily
              ? "Privilégiez un hydratant léger de type gel-crème, idéalement indiqué non comédogène."
              : combination
                ? "Utilisez une hydratation légère sur l’ensemble du visage et adaptez la quantité selon les zones."
                : "Appliquez une crème hydratante adaptée à votre type de peau.",
      priority: "essentiel",
    });

    actions.push({
      moment: "matin",
      title: "Protection solaire",
      description:
        "Lorsque vous êtes exposé à l’extérieur, terminez la routine par une protection solaire large spectre SPF 30+.",
      priority: "important",
    });

    actions.push({
      moment: "soir",
      title: "Nettoyage du soir",
      description:
        oily || acne
          ? "Nettoyez le visage le soir pour retirer les impuretés et l’excès de sébum, sans gommage agressif."
          : "Nettoyez doucement le visage pour retirer les impuretés accumulées pendant la journée.",
      priority: "essentiel",
    });

    if (day >= 2 && (dry || lowHydration)) {
      actions.push({
        moment: "soir",
        title: "Renforcer la barrière cutanée",
        description:
          veryLowHydration
            ? "Ce soir, privilégiez une routine réparatrice très simple : soin hydratant puis crème contenant par exemple des céramides. Évitez les exfoliants et les actifs multiples."
            : "Appliquez une crème contenant par exemple des céramides, de la glycérine ou d’autres agents hydratants pour soutenir le confort cutané.",
        priority: "important",
      });
    } else if (
      day >= 2 &&
      acne &&
      !sensitivity &&
      !redness &&
      !needsFundamentals
    ) {
      actions.push({
        moment: "soir",
        title: "Actif ciblé imperfections",
        description:
          "Un soin contenant de l’acide salicylique peut être envisagé progressivement. Commencez doucement et n’ajoutez pas plusieurs actifs ciblés en même temps.",
        priority: "important",
      });
    } else if (
      day >= 2 &&
      dullness &&
      !sensitivity &&
      !redness &&
      !needsFundamentals
    ) {
      actions.push({
        moment: "soir",
        title: "Soin éclat",
        description:
          "Un produit contenant de la niacinamide peut compléter progressivement votre routine si votre peau le tolère.",
        priority: "important",
      });
    } else {
      actions.push({
        moment: "soir",
        title: needsFundamentals
          ? "Routine fondamentale"
          : "Routine ciblée",
        description:
          sensitivity || redness
            ? "Gardez une routine courte et évitez d’introduire plusieurs nouveaux actifs simultanément."
            : needsFundamentals
              ? "Votre dernier scan invite à stabiliser les fondamentaux avant d’ajouter de nouveaux actifs : nettoyage doux, hydratation et protection solaire."
              : texture && !sensitivity
                ? "Un actif de type rétinol peut être envisagé progressivement si adapté à votre situation, sans le cumuler immédiatement avec plusieurs exfoliants."
                : "Conservez les étapes utiles de votre routine sans multiplier les produits.",
        priority: "important",
      });
    }

    if (highFatigue && day >= 2) {
      actions.push({
        moment: "soir",
        title: "Soirée récupération",
        description:
          "Votre indicateur visuel de fatigue est bas. Gardez ce soir une routine courte et confortable, puis privilégiez une bonne récupération plutôt que d’ajouter plusieurs soins.",
        priority: "optionnel",
      });
    }

    if (day >= 3) {
      actions.push({
        moment: "soir",
        title: "Vérifier la tolérance",
        description:
          "Observez pendant quelques secondes les tiraillements, rougeurs, inconforts ou nouvelles imperfections avant de poursuivre ou d’ajouter un produit.",
        priority: "optionnel",
      });
    }

    if (day >= 5 && !sensitivity && !redness && !needsFundamentals) {
      actions.push({
        moment: "soir",
        title: "Ne pas surcharger la routine",
        description:
          "Gardez uniquement les produits qui ont un objectif clair pour votre peau et évitez d’empiler plusieurs actifs simplement parce qu’ils sont populaires.",
        priority: "optionnel",
      });
    }

    let objective = "Installer une routine simple et régulière.";

    if (day === 2) {
      objective =
        lowHydration || dry
          ? "Renforcer l’hydratation et le confort cutané."
          : needsFundamentals
            ? "Stabiliser les fondamentaux avant d’ajouter de nouveaux actifs."
            : "Stabiliser les gestes essentiels.";
    } else if (day === 3) {
      objective =
        acne && !needsFundamentals
          ? "Commencer une action ciblée sur les imperfections."
          : dullness || texture
            ? "Commencer progressivement le travail sur l’éclat et la texture."
            : highFatigue
              ? "Maintenir une routine simple tout en favorisant la récupération."
              : "Commencer l’adaptation selon vos observations.";
    } else if (day === 4) {
      objective =
        sensitivity || redness
          ? "Protéger la tolérance de votre peau."
          : needsFundamentals
            ? "Consolider les fondamentaux avant toute intensification."
            : "Renforcer la régularité de votre routine.";
    } else if (day === 5) {
      objective =
        highFatigue
          ? "Maintenir une routine efficace sans ajouter de charge inutile."
          : "Éliminer les gestes inutiles et conserver l’essentiel.";
    } else if (day === 6) {
      objective = "Observer les premiers changements et la tolérance.";
    } else if (day === 7) {
      objective =
        "Faire le bilan et préparer l’ajustement suivant.";
    }

    days.push({
      day,
      objective,
      actions,
    });
  }

  let objective =
    "Améliorer progressivement la régularité de votre routine cutanée.";

  if (veryLowHydration) {
    objective =
      "Priorité à une routine simple centrée sur l’hydratation et le confort cutané.";
  } else if (lowHydration || dry) {
    objective =
      "Priorité à l’hydratation et au confort cutané avec une progression douce.";
  } else if (veryLowSkinScore || lowBalance) {
    objective =
      "Stabiliser les fondamentaux de la routine avant d’intensifier les soins.";
  } else if (acne && !sensitivity) {
    objective =
      "Construire une routine régulière et ciblée autour des imperfections.";
  } else if (redness || sensitivity) {
    objective =
      "Préserver la tolérance cutanée avec une routine simple et progressive.";
  } else if (dullness || texture) {
    objective =
      "Améliorer progressivement l’éclat et la texture sans surcharger la routine.";
  } else if (oily || combination) {
    objective =
      "Maintenir l’équilibre cutané avec une routine efficace mais non agressive.";
  }

  if (highFatigue) {
    objective +=
      " La fatigue visuelle observée pousse Otavio à privilégier une routine courte et régulière.";
  }

  if (lowSkinScore) {
    objective += ` Votre dernier score visuel de peau est de ${skinScore}/100 : Otavio donne la priorité aux fondamentaux avant d’ajouter des actifs.`;
  }

  return {
    id: `skin-${Date.now()}`,
    durationDays,
    objective,
    personalization,
    days,
  };
}
