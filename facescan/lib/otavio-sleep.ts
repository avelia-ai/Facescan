export type OtavioSleepProfile = {
  bedtime?: string | null;
  wake_time?: string | null;
  sleep_duration?: number | null;
  sleep_quality?: string | null;
  sleep_regularity?: string | null;
  activity_level?: string | null;
  goals?: string[] | null;
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
  durationDays = 7
): OtavioSleepPlan {
  const personalization: string[] = [];

  const bedtime =
    profile.bedtime ||
    "23:00";

  const wakeTime =
    profile.wake_time ||
    "07:00";

  const sleepDuration =
    profile.sleep_duration ??
    calculateSleepDuration(bedtime, wakeTime) ??
    8;

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

  if (profile.activity_level) {
    personalization.push(
      `Activité : ${profile.activity_level}`
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
          "Conservez une heure de lever aussi régulière que possible, y compris le week-end.",
        category: "matin",
      },
      {
        time: shiftTime(wakeTime, 30),
        title: "Lumière naturelle",
        description:
          "Exposez-vous à la lumière naturelle en début de journée pour aider à stabiliser votre rythme veille-sommeil.",
        category: "matin",
      },
      {
        time: "14:00",
        title: "Limiter les stimulants tardifs",
        description:
          "Évitez autant que possible les boissons caféinées en fin d'après-midi.",
        category: "journee",
      },
      {
        time: shiftTime(targetBedtime, -60),
        title: "Début de la routine du soir",
        description:
          "Commencez progressivement à ralentir : lumière plus douce, activité calme et environnement moins stimulant.",
        category: "soir",
      },
      {
        time: shiftTime(targetBedtime, -30),
        title: "Déconnexion progressive",
        description:
          "Réduisez les écrans et privilégiez une activité calme avant le coucher.",
        category: "soir",
      },
      {
        time: targetBedtime,
        title: "Coucher cible",
        description:
          `Objectif : environ ${targetDuration.toFixed(1)} h de sommeil cette nuit.`,
        category: "soir",
      },
    ];

    if (day >= 3) {
      actions.push({
        time: shiftTime(targetBedtime, -90),
        title: "Préparer le lendemain",
        description:
          "Préparez vos affaires et les tâches importantes avant la routine du soir afin de réduire la charge mentale au coucher.",
        category: "soir",
      });
    }

    if (day >= 5) {
      actions.push({
        time: "18:00",
        title: "Activité physique adaptée",
        description:
          "Maintenez une activité régulière dans la journée, en évitant les séances très stimulantes juste avant le coucher.",
        category: "journee",
      });
    }

    days.push({
      day,
      objective:
        day === 1
          ? "Stabiliser les horaires"
          : day <= 3
            ? "Installer une routine régulière"
            : day <= 5
              ? "Renforcer les habitudes favorables au sommeil"
              : "Consolider la routine",
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
