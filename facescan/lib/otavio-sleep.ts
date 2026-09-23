export type OtavioSleepProfile = {
  bedtime?: string | null;
  wake_time?: string | null;
  sleep_duration?: number | null;
  sleep_quality?: string | null;
  sleep_regularity?: string | null;
  activity_level?: string | null;
  goals?: string[] | null;
};

export type OtavioSleepScan = {
  fatigue?: number | null;
};

export type OtavioSleepAction = {
  time: string;
  title: string;
  description: string;
  category: "matin" | "journee" | "soir";
};

export type OtavioSleepDay = {
  day: number;
  objective: string;
  actions: OtavioSleepAction[];
};

export type OtavioSleepPlan = {
  id: string;
  durationDays: number;
  targetBedtime: string;
  targetWakeTime: string;
  personalization: string[];
  days: OtavioSleepDay[];
};

function parseTime(value?: string | null) {
  if (!value) return null;

  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

function formatTime(hours: number, minutes: number) {
  const total = ((hours * 60 + minutes) % 1440 + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function shiftTime(time: string, minutes: number) {
  const parsed = parseTime(time);
  if (!parsed) return time;

  return formatTime(
    parsed.hours,
    parsed.minutes + minutes
  );
}

function calculateSleepDuration(
  bedtime: string,
  wakeTime: string
) {
  const bed = parseTime(bedtime);
  const wake = parseTime(wakeTime);

  if (!bed || !wake) return null;

  let bedMinutes = bed.hours * 60 + bed.minutes;
  let wakeMinutes = wake.hours * 60 + wake.minutes;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 1440;
  }

  return (wakeMinutes - bedMinutes) / 60;
}

export function buildOtavioSleepPlan(
  profile: OtavioSleepProfile,
  durationDays = 7,
  scan?: OtavioSleepScan | null
): OtavioSleepPlan {
  const personalization: string[] = [];

  const goals = (profile.goals ?? []).map((goal) =>
    goal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );

  const hasGoal = (...values: string[]) =>
    values.some((value) => goals.includes(value));

  const sleepGoal = hasGoal("sommeil");
  const fatigueGoal = hasGoal("fatigue");
  const wellbeingGoal = hasGoal("bien_etre", "equilibre");

  const bedtime = profile.bedtime || "23:00";
  const wakeTime = profile.wake_time || "07:00";

  const sleepDuration =
    profile.sleep_duration ??
    calculateSleepDuration(bedtime, wakeTime) ??
    8;

  const quality = (profile.sleep_quality ?? "").toLowerCase();
  const regularity = (profile.sleep_regularity ?? "").toLowerCase();

  const poorQuality =
    quality.includes("mauvaise") ||
    quality.includes("faible");

  const irregular =
    regularity.includes("irrég") ||
    regularity.includes("irreg");

  const shortSleep = sleepDuration < 7;
  const fatigue = scan?.fatigue ?? null;
  const highFatigue = fatigue !== null && fatigue < 65;

  if (profile.sleep_duration) {
    personalization.push(
      `${profile.sleep_duration} h de sommeil actuellement`
    );
  }

  if (profile.sleep_quality) {
    personalization.push(
      `Qualité de sommeil : ${profile.sleep_quality}`
    );
  }

  if (profile.sleep_regularity) {
    personalization.push(
      `Régularité : ${profile.sleep_regularity}`
    );
  }

  if (profile.bedtime) {
    personalization.push(
      `Heure de coucher habituelle : ${profile.bedtime}`
    );
  }

  if (profile.wake_time) {
    personalization.push(
      `Heure de lever habituelle : ${profile.wake_time}`
    );
  }

  if (profile.activity_level) {
    personalization.push(
      `Niveau d’activité : ${profile.activity_level}`
    );
  }

  if (sleepGoal) {
    personalization.push(
      "Objectif sommeil : le programme donne la priorité à la régularité et à la qualité de la récupération nocturne."
    );
  }

  if (fatigueGoal) {
    personalization.push(
      "Objectif fatigue : le programme renforce les temps de récupération et la réduction des sollicitations en fin de journée."
    );
  }

  if (wellbeingGoal) {
    personalization.push(
      "Objectif bien-être : le programme privilégie une transition progressive vers une soirée plus calme."
    );
  }

  if (fatigue !== null) {
    personalization.push(
      `Indicateur visuel de fatigue du dernier scan : ${fatigue}/100.`
    );
  }

  if (irregular) {
    personalization.push(
      "La régularité est traitée comme une priorité dans la première partie du programme."
    );
  }

  if (shortSleep) {
    personalization.push(
      "La durée déclarée est courte : le programme privilégie la récupération progressive."
    );
  }

  const targetDuration =
    sleepDuration < 7
      ? 7.5
      : sleepDuration > 9
        ? 8.5
        : sleepDuration;

  const targetBedtime =
    sleepDuration < 7
      ? shiftTime(bedtime, -15)
      : bedtime;

  const days: OtavioSleepDay[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const actions: OtavioSleepAction[] = [
      {
        time: wakeTime,
        title: "Heure de lever stable",
        description:
          irregular
            ? "Votre priorité cette semaine est de conserver une heure de lever aussi stable que possible, y compris lorsque votre emploi du temps varie."
            : "Conservez une heure de lever aussi régulière que possible.",
        category: "matin",
      },
      {
        time: shiftTime(wakeTime, 30),
        title: "Lumière naturelle",
        description:
          "Exposez-vous à la lumière naturelle en début de journée afin de donner un repère clair à votre rythme veille-sommeil.",
        category: "matin",
      },
      {
        time: "14:00",
        title: "Limiter les stimulants tardifs",
        description:
          "Évitez autant que possible les boissons caféinées tard dans la journée, particulièrement si vous êtes sensible aux stimulants.",
        category: "journee",
      },
    ];

    if (profile.activity_level === "actif" || profile.activity_level === "tres_actif") {
      actions.push({
        time: "18:00",
        title: "Placer l’activité plus tôt",
        description:
          "Votre activité est élevée : lorsque possible, placez les séances les plus stimulantes suffisamment tôt pour laisser un temps de retour au calme.",
        category: "journee",
      });
    } else {
      actions.push({
        time: "18:00",
        title: "Bouger dans la journée",
        description:
          "Conservez une activité régulière dans la journée afin que la soirée soit consacrée progressivement au ralentissement.",
        category: "journee",
      });
    }

    if (highFatigue) {
      actions.push({
        time: "12:30",
        title:
          fatigue !== null && fatigue < 40
            ? "Priorité récupération aujourd’hui"
            : "Pause récupération",
        description:
          fatigue !== null && fatigue < 40
            ? `Votre dernier scan affiche ${fatigue}/100 en fatigue apparente. Otavio réduit aujourd’hui les sollicitations inutiles et donne davantage de place aux temps de récupération.`
            : `Votre dernier scan présente un indicateur visuel de fatigue de ${fatigue}/100. Prévoyez une vraie pause dans la journée, idéalement sans écran, pour éviter de repousser toute la récupération au soir.`,
        category: "journee",
      });
    }

    actions.push({
      time: shiftTime(targetBedtime, -60),
      title:
        fatigueGoal || (fatigue !== null && fatigue < 40)
          ? "Commencer plus tôt ma récupération"
          : wellbeingGoal
            ? "Créer une transition calme"
            : sleepGoal
              ? "Début de la routine du soir"
              : "Début de la routine du soir",
      description:
        fatigueGoal || (fatigue !== null && fatigue < 40)
          ? "Votre objectif met l’accent sur la récupération : lumière plus douce, notifications réduites et activités peu stimulantes avant le coucher."
          : wellbeingGoal
            ? "Accordez-vous une vraie transition avant le coucher : baisse progressive des sollicitations, lumière plus douce et activité calme."
            : sleepGoal || poorQuality || highFatigue
              ? "Commencez environ une heure avant le coucher cible : lumière plus douce, notifications réduites et activité calme."
              : "Commencez progressivement à ralentir : lumière plus douce, activité calme et environnement moins stimulant.",
      category: "soir",
    });

    actions.push({
      time: shiftTime(targetBedtime, -30),
      title: "Déconnexion progressive",
      description:
        "Réduisez les écrans et privilégiez une activité répétitive et calme : lecture, préparation du lendemain, respiration ou étirements doux.",
      category: "soir",
    });

    if (day >= 3) {
      actions.push({
        time: shiftTime(targetBedtime, -90),
        title: "Préparer le lendemain",
        description:
          "Préparez vos affaires et les tâches importantes avant la dernière demi-heure afin de réduire les sollicitations mentales au moment du coucher.",
        category: "soir",
      });
    }

    if (day >= 4) {
      actions.push({
        time: shiftTime(targetBedtime, -20),
        title: "Repas du soir : rester léger",
        description:
          "Évitez autant que possible un repas très lourd juste avant le coucher et laissez un peu de temps entre la fin du repas et votre nuit.",
        category: "soir",
      });
    }

    if (day >= 5 && highFatigue) {
      actions.push({
        time: "12:30",
        title: "Pause récupération",
        description:
          `Votre dernier scan présente un indicateur visuel de fatigue à ${fatigue}/100 : prévoyez dans la journée une vraie pause sans écran plutôt que de compenser uniquement le soir.`,
        category: "journee",
      });
    }

    days.push({
      day,
      objective:
        highFatigue && fatigue !== null && fatigue < 40
          ? day === 1
            ? `Priorité à la récupération après un score de fatigue visuelle de ${fatigue}/100`
            : day === 2
              ? "Réduire la charge de la journée et protéger la récupération"
              : day === 3
                ? "Installer une soirée plus calme et régulière"
                : day === 4
                  ? "Consolider les habitudes favorables à la récupération"
                  : day === 5
                    ? "Maintenir une récupération régulière"
                    : day === 6
                      ? "Observer l’effet des changements sur votre récupération"
                      : "Faire le bilan de la semaine"
          : day === 1
            ? "Stabiliser vos horaires"
            : day === 2
              ? "Installer les premiers repères"
              : day === 3
                ? "Réduire progressivement les stimulations du soir"
                : day === 4
                  ? "Consolider la routine"
                  : day === 5
                    ? "Renforcer la récupération"
                    : day === 6
                      ? "Observer ce qui fonctionne réellement"
                      : "Faire le bilan de la semaine",
      actions,
    });
  }

  return {
    id: `sleep-${Date.now()}`,
    durationDays,
    targetBedtime,
    targetWakeTime: wakeTime,
    personalization,
    days,
  };
}
