export type GamificationLevel = {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
};

export const GAMIFICATION_LEVELS: GamificationLevel[] = [
  {
    level: 1,
    name: "Éveil",
    minPoints: 0,
    maxPoints: 49,
    description: "Votre parcours commence.",
  },
  {
    level: 2,
    name: "Découverte",
    minPoints: 50,
    maxPoints: 119,
    description: "Votre régularité commence à s’installer.",
  },
  {
    level: 3,
    name: "Élan",
    minPoints: 120,
    maxPoints: 219,
    description: "Votre suivi devient une vraie routine.",
  },
  {
    level: 4,
    name: "Harmonie",
    minPoints: 220,
    maxPoints: 349,
    description: "Votre parcours gagne en constance.",
  },
  {
    level: 5,
    name: "Épanouissement",
    minPoints: 350,
    maxPoints: Infinity,
    description: "Votre compagnon atteint sa forme avancée.",
  },
];

type Scan = {
  date: string;
  score: number;
  indicators?: {
    peau?: number;
    hydratation?: number;
    fatigue?: number;
    equilibre?: number;
  };
};

function daysBetween(a: Date, b: Date) {
  return Math.max(
    0,
    Math.floor(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function calculateGamification(
  scans: Scan[],
  goals: string[]
) {
  const sortedScans = [...scans].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const scanCount = sortedScans.length;

  const regularityPoints = scanCount * 18;

  let streakDays = 0;

  if (sortedScans.length >= 2) {
    let currentStreak = 1;

    for (let i = 1; i < sortedScans.length; i++) {
      const previous = new Date(sortedScans[i - 1].date);
      const current = new Date(sortedScans[i].date);

      if (daysBetween(previous, current) <= 8) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }

    streakDays = currentStreak;
  } else if (sortedScans.length === 1) {
    streakDays = 1;
  }

  const streakPoints = streakDays * 8;

  let progressionPoints = 0;

  if (sortedScans.length >= 2) {
    const first = sortedScans[0].score;
    const latest = sortedScans[sortedScans.length - 1].score;

    progressionPoints = Math.max(0, latest - first) * 3;
  }

  const goalPoints = Math.min(goals.length * 12, 48);

  const points =
    regularityPoints +
    streakPoints +
    progressionPoints +
    goalPoints;

  const level =
    [...GAMIFICATION_LEVELS]
      .reverse()
      .find((item) => points >= item.minPoints) ??
    GAMIFICATION_LEVELS[0];

  const nextLevel =
    GAMIFICATION_LEVELS.find(
      (item) => item.level === level.level + 1
    ) ?? null;

  const progressToNextLevel = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((points - level.minPoints) /
            (nextLevel.minPoints - level.minPoints)) *
            100
        )
      )
    : 100;

  return {
    points,
    scanCount,
    streakDays,
    progressionPoints,
    goalPoints,
    level,
    nextLevel,
    progressToNextLevel,
  };
}
