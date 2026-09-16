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
  const dry = has(profile, "sec") || has(profile, "deshydrat");
  const oily = has(profile, "gras") || has(profile, "mixte");
  const acne = has(profile, "acne") || has(profile, "imperfection");
  const redness = has(profile, "rougeur") || has(profile, "reactive");

  const hydration = scan?.hydratation ?? null;
  const skinScore = scan?.peau ?? null;

  const personalization: string[] = [];

  if (profile.skin_type) {
    personalization.push(`Type de peau déclaré : ${profile.skin_type}.`);
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
      `Observation d'hydratation issue du dernier scan : ${hydration}/100.`
    );
  }

  if (skinScore !== null) {
    personalization.push(
      `Score visuel global de peau issu du dernier scan : ${skinScore}/100.`
    );
  }

  if (sensitivity || redness) {
    personalization.push(
      "Le programme privilégie une routine progressive et évite de multiplier les changements simultanés."
    );
  }

  const days: OtavioSkinDay[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const actions: OtavioSkinAction[] = [];

    actions.push({
      moment: "matin",
      title: "Nettoyage doux",
      description:
        "Nettoyez le visage sans frotter et privilégiez une routine simple adaptée à votre tolérance.",
      priority: "essentiel",
    });

    actions.push({
      moment: "matin",
      title: "Hydratation",
      description: dry || hydration !== null && hydration < 70
        ? "Appliquez une hydratation régulière en privilégiant le confort cutané."
        : "Maintenez une hydratation régulière pour préserver le confort et l'équilibre cutané.",
      priority: "essentiel",
    });

    actions.push({
      moment: "matin",
      title: "Protection solaire",
      description:
        "Utilisez une protection solaire adaptée lorsque vous êtes exposé à la lumière extérieure.",
      priority: "important",
    });

    if (oily || acne) {
      actions.push({
        moment: "soir",
        title: "Nettoyage après la journée",
        description:
          "Nettoyez soigneusement le visage le soir sans décaper la peau.",
        priority: "essentiel",
      });
    } else {
      actions.push({
        moment: "soir",
        title: "Nettoyage du soir",
        description:
          "Retirez les impuretés de la journée avec un nettoyage doux.",
        priority: "essentiel",
      });
    }

    actions.push({
      moment: "soir",
      title: "Routine ciblée",
      description:
        sensitivity || redness
          ? "Conservez une routine courte et évitez d'introduire plusieurs nouveaux actifs en même temps."
          : acne
            ? "Privilégiez une routine ciblée et progressive sur les imperfections."
            : "Conservez les étapes utiles de votre routine sans multiplier les produits.",
      priority: "important",
    });

    if (day >= 3) {
      actions.push({
        moment: "soir",
        title: "Observation de la peau",
        description:
          "Prenez quelques secondes pour observer confort, rougeurs, sécheresse et imperfections afin qu'Otavio puisse ajuster progressivement le programme.",
        priority: "optionnel",
      });
    }

    let objective = "Installer une routine simple et régulière.";

    if (day === 2) {
      objective = "Stabiliser les gestes essentiels.";
    } else if (day === 3) {
      objective = "Commencer l'adaptation selon les observations.";
    } else if (day === 4) {
      objective = "Renforcer la régularité.";
    } else if (day === 5) {
      objective = "Limiter les gestes inutiles et préserver l'équilibre.";
    } else if (day === 6) {
      objective = "Observer l'évolution et ajuster progressivement.";
    } else if (day === 7) {
      objective = "Faire le bilan de la semaine.";
    }

    days.push({
      day,
      objective,
      actions,
    });
  }

  let objective = "Améliorer progressivement la régularité de votre routine cutanée.";

  if (dry || hydration !== null && hydration < 70) {
    objective =
      "Priorité à l'hydratation et au confort cutané, avec une progression douce.";
  } else if (acne) {
    objective =
      "Construire une routine régulière et ciblée autour des imperfections.";
  } else if (redness || sensitivity) {
    objective =
      "Préserver la tolérance cutanée avec une routine simple et progressive.";
  } else if (oily) {
    objective =
      "Maintenir l'équilibre cutané sans multiplier les gestes agressifs.";
  }

  return {
    id: `skin-${Date.now()}`,
    durationDays,
    objective,
    personalization,
    days,
  };
}
