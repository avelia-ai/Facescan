export type OtavioStage = {
  stage: number;
  name: string;
  minXp: number;
};

export const OTAVIO_STAGES: OtavioStage[] = [
  { stage: 1, name: "Éveil", minXp: 0 },
  { stage: 2, name: "Éclosion", minXp: 200 },
  { stage: 3, name: "Progression", minXp: 500 },
  { stage: 4, name: "Équilibre", minXp: 1000 },
  { stage: 5, name: "Maîtrise", minXp: 2000 },
  { stage: 6, name: "Épanouissement", minXp: 3500 },
  { stage: 7, name: "Harmonie", minXp: 6000 },
] as const;

export const OTAVIO_XP = {
  first_scan: 100,
  new_scan: 50,
  daily_action: 10,
  routine_completed: 15,
  advice_followed: 10,
  weekly_consistency: 50,
  positive_progress: 50,
  good_dynamic: 20,
} as const;

export function getOtavioStage(xp: number) {
  let current = OTAVIO_STAGES[0];

  for (const stage of OTAVIO_STAGES) {
    if (xp >= stage.minXp) {
      current = stage;
    } else {
      break;
    }
  }

  return current;
}

export function getNextOtavioStage(xp: number) {
  return (
    OTAVIO_STAGES.find((stage) => stage.minXp > xp) ??
    OTAVIO_STAGES[OTAVIO_STAGES.length - 1]
  );
}

export function getOtavioProgress(xp: number) {
  const current = getOtavioStage(xp);
  const next = OTAVIO_STAGES.find(
    (stage) => stage.stage === current.stage + 1
  );

  if (!next) {
    return {
      stage: current.stage,
      name: current.name,
      xp,
      nextXp: null,
      progress: 100,
    };
  }

  const range = next.minXp - current.minXp;
  const progress = Math.min(
    100,
    Math.max(0, ((xp - current.minXp) / range) * 100)
  );

  return {
    stage: current.stage,
    name: current.name,
    xp,
    nextXp: next.minXp,
    progress,
  };
}
