"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOtavioProgress } from "@/lib/otavio-progression";
import {
  Activity,
  ArrowLeft,
  Bell,
  ChevronRight,
  Droplets,
  LockKeyhole,
  Moon,
  ScanFace,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  LogOut,
} from "lucide-react";

type StoredScan = {
  id: string;
  date: string;
  score: number;
  indicators: {
    peau: number;
    hydratation: number;
    fatigue: number;
    equilibre: number;
  };
  photo?: string;
};

type ProfileData = {
  age: number | null;
  sex: string | null;
  skin_type: string | null;
  skin_sensitivity: string | null;
  skin_concerns: string[];
  activity_level: string | null;
  activity_frequency: string | null;
  hydration_level: string | null;
  bedtime: string | null;
  wake_time: string | null;
  sleep_duration: number | null;
  sleep_quality: string | null;
  sleep_regularity: string | null;
  eating_style: string | null;
  meals_per_day: number | null;
  budget_level: string | null;
  food_preferences: string[];
  dietary_constraints: string[];
  allergies: string[];
  intolerances: string[];
  current_products: string | null;
};

const goalAliases: Record<string, string> = {
  peau: "qualite_peau",
  qualite_peau: "qualite_peau",
  eclat: "eclat",
  hydratation: "hydratation",
  recuperation: "sommeil",
  fatigue: "fatigue",
  sommeil: "sommeil",
  equilibre: "bien_etre",
  nutrition: "nutrition",
  bien_etre: "bien_etre",
  evolution: "evolution",
};

function normalizeGoalId(value: string) {
  return goalAliases[value] ?? value;
}

const labelMaps = {
  sex: {
    homme: "Homme",
    femme: "Femme",
    autre: "Autre",
    non_precise: "Non précisé",
  },
  skinType: {
    seche: "Sèche",
    normale: "Normale",
    mixte: "Mixte",
    grasse: "Grasse",
    inconnue: "À préciser",
  },
  sensitivity: {
    faible: "Faible",
    moderee: "Modérée",
    forte: "Forte",
    inconnue: "À préciser",
  },
  activity: {
    sedentaire: "Sédentaire",
    peu_actif: "Peu actif",
    actif: "Actif",
    tres_actif: "Très actif",
  },
  hydration: {
    faible: "Je bois peu",
    moderee: "Je bois régulièrement",
    bonne: "Bonne",
    inconnue: "À préciser",
  },
  sleepQuality: {
    mauvaise: "Mauvaise",
    moyenne: "Moyenne",
    bonne: "Bonne",
    tres_bonne: "Très bonne",
  },
  sleepRegularity: {
    irreguliere: "Irrégulière",
    variable: "Variable",
    reguliere: "Régulière",
  },
  budget: {
    economique: "Économique",
    standard: "Standard",
    confort: "Confort",
  },
};

function displayLabel(
  value: string | null | undefined,
  map: Record<string, string>,
  fallback = "À préciser"
) {
  if (!value) return fallback;
  return map[value] ?? value;
}

const profileSections = [
  {
    icon: Target,
    title: "Mes objectifs",
    text: "Suivre votre peau, votre hydratation, votre récupération et votre équilibre.",
  },
  {
    icon: Bell,
    title: "Notifications",
    text: "Recevoir des rappels et informations utiles au bon moment.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité",
    text: "Gérer vos données et les préférences liées à vos analyses.",
  },
  {
    icon: Settings,
    title: "Paramètres",
    text: "Gérer votre compte et les préférences de l’application.",
  },
];

export default function ProfilPage() {
  const [scanFrequency, setScanFrequency] = useState(7);
  const [storedScans, setStoredScans] = useState<StoredScan[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [stage, setStage] = useState(1);
  const [streak, setStreak] = useState(0);
  const [displayName, setDisplayName] = useState("vous");
  const [profileGoals, setProfileGoals] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (authData.user) {
        localStorage.removeItem(
          `facescan-read-notifications-${authData.user.id}`,
        );
      }

      await supabase.auth.signOut();

      window.location.href = "/connexion";
    } catch {
      window.location.href = "/connexion";
    }
  };

  useEffect(() => {
    const loadProfileStats = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const metadataName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "vous";

      setDisplayName(
        String(metadataName)
          .trim()
          .replace(/\s+/g, " ")
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "age, sex, skin_type, skin_sensitivity, skin_concerns, activity_level, activity_frequency, hydration_level, bedtime, wake_time, sleep_duration, sleep_quality, sleep_regularity, eating_style, meals_per_day, budget_level, food_preferences, dietary_constraints, allergies, intolerances, current_products, otavio_xp, otavio_stage, otavio_streak, goals"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setProfileData({
          age: typeof profile.age === "number" ? profile.age : null,
          sex: typeof profile.sex === "string" ? profile.sex : null,
          skin_type:
            typeof profile.skin_type === "string"
              ? profile.skin_type
              : null,
          skin_sensitivity:
            typeof profile.skin_sensitivity === "string"
              ? profile.skin_sensitivity
              : null,
          skin_concerns: Array.isArray(profile.skin_concerns)
            ? profile.skin_concerns.filter(
                (value): value is string => typeof value === "string"
              )
            : [],
          activity_level:
            typeof profile.activity_level === "string"
              ? profile.activity_level
              : null,
          activity_frequency:
            typeof profile.activity_frequency === "string"
              ? profile.activity_frequency
              : profile.activity_frequency != null
                ? String(profile.activity_frequency)
                : null,
          hydration_level:
            typeof profile.hydration_level === "string"
              ? profile.hydration_level
              : null,
          bedtime:
            typeof profile.bedtime === "string" ? profile.bedtime : null,
          wake_time:
            typeof profile.wake_time === "string" ? profile.wake_time : null,
          sleep_duration:
            typeof profile.sleep_duration === "number"
              ? profile.sleep_duration
              : null,
          sleep_quality:
            typeof profile.sleep_quality === "string"
              ? profile.sleep_quality
              : null,
          sleep_regularity:
            typeof profile.sleep_regularity === "string"
              ? profile.sleep_regularity
              : null,
          eating_style:
            typeof profile.eating_style === "string"
              ? profile.eating_style
              : null,
          meals_per_day:
            typeof profile.meals_per_day === "number"
              ? profile.meals_per_day
              : null,
          budget_level:
            typeof profile.budget_level === "string"
              ? profile.budget_level
              : null,
          food_preferences: Array.isArray(profile.food_preferences)
            ? profile.food_preferences.filter(
                (value): value is string => typeof value === "string"
              )
            : [],
          dietary_constraints: Array.isArray(profile.dietary_constraints)
            ? profile.dietary_constraints.filter(
                (value): value is string => typeof value === "string"
              )
            : [],
          allergies: Array.isArray(profile.allergies)
            ? profile.allergies.filter(
                (value): value is string => typeof value === "string"
              )
            : [],
          intolerances: Array.isArray(profile.intolerances)
            ? profile.intolerances.filter(
                (value): value is string => typeof value === "string"
              )
            : [],
          current_products:
            typeof profile.current_products === "string"
              ? profile.current_products
              : null,
        });
      }

      const remoteGoals =
        profile && Array.isArray(profile.goals)
          ? Array.from(
              new Set(
                profile.goals
                  .filter(
                    (value): value is string => typeof value === "string"
                  )
                  .map(normalizeGoalId)
              )
            )
          : [];

      let resolvedGoals = remoteGoals;

      if (resolvedGoals.length === 0) {
        try {
          const storedGoals = localStorage.getItem("facescan-goals");
          const parsedGoals = storedGoals ? JSON.parse(storedGoals) : [];

          if (Array.isArray(parsedGoals)) {
            resolvedGoals = Array.from(
              new Set(
                parsedGoals
                  .filter(
                    (value): value is string => typeof value === "string"
                  )
                  .map(normalizeGoalId)
              )
            );
          }
        } catch {
          resolvedGoals = [];
        }
      }

      setProfileGoals(resolvedGoals);

      const nextXp = profile?.otavio_xp ?? 0;
      const progress = getOtavioProgress(nextXp);

      setXp(nextXp);
      setStage(progress.stage);
      setStreak(profile?.otavio_streak ?? 0);

      let scans: any[] = [];
      let loadedFromSupabase = false;

      try {
        const { data: remoteScans, error: scansError } = await supabase
          .from("scans")
          .select("id, created_at, score, indicators")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (scansError) throw scansError;

        if (Array.isArray(remoteScans) && remoteScans.length > 0) {
          scans = remoteScans
            .filter(
              (scan: any) =>
                scan &&
                typeof scan.id === "string" &&
                typeof scan.created_at === "string" &&
                typeof scan.score === "number" &&
                scan.indicators
            )
            .map((scan: any) => ({
              id: scan.id,
              date: scan.created_at,
              score: scan.score,
              indicators: scan.indicators,
            }));

          loadedFromSupabase = scans.length > 0;
        }
      } catch (error) {
        console.error("Supabase profile scans error:", error);
      }

      if (!loadedFromSupabase) {
        try {
          const storedScans = localStorage.getItem("facescan-scans");
          const parsed = storedScans ? JSON.parse(storedScans) : [];

          scans = Array.isArray(parsed)
            ? parsed
                .filter(
                  (scan: any) =>
                    scan &&
                    typeof scan.id === "string" &&
                    typeof scan.date === "string" &&
                    typeof scan.score === "number" &&
                    scan.indicators
                )
                .sort(
                  (a: any, b: any) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
                )
            : [];
        } catch {
          scans = [];
        }
      }

      setStoredScans(scans);
      setScanCount(scans.length);
      setCurrentScore(scans[0]?.score ?? null);
      setPreviousScore(scans[1]?.score ?? null);
    };

    loadProfileStats();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("facescan-scan-frequency");

    if (!stored) return;

    const value = Number(stored);

    if ([3, 7, 14, 30].includes(value)) {
      setScanFrequency(value);
    }
  }, []);

  const updateScanFrequency = (value: number) => {
    setScanFrequency(value);
    localStorage.setItem("facescan-scan-frequency", String(value));
  };

  const latestScan = storedScans[0];

  const indicatorItems = [
    {
      label: "Peau",
      key: "peau" as const,
    },
    {
      label: "Hydratation",
      key: "hydratation" as const,
    },
    {
      label: "Fatigue",
      key: "fatigue" as const,
    },
    {
      label: "Équilibre",
      key: "equilibre" as const,
    },
  ];

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)]"
              aria-label="Retour à l’accueil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f8587]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Mon profil
              </h1>
            </div>
          </div>

          <Link
            href="/scanner"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#087ea4] to-[#12a6a6] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_10px_25px_rgba(23,102,120,0.18)] sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-[#ffb19d] bg-[linear-gradient(135deg,#ffffff_0%,#fff0eb_100%)] px-4 py-3 text-[12px] font-semibold text-[#b45a48] shadow-sm transition hover:bg-[#ffe3db]"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Déconnexion
          </button>
        </header>

        <div className="mt-5 sm:hidden">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ffb19d] bg-[linear-gradient(135deg,#ffffff_0%,#fff0eb_100%)] px-4 py-3.5 text-sm font-semibold text-[#b45a48]"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Se déconnecter
          </button>
        </div>

        <section className="mt-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0b5876] via-[#087ea4] to-[#7767e8] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#42cfc2]/28 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#ff8066]/18 blur-3xl" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/12">
              <UserRound size={34} strokeWidth={1.5} />
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Votre espace personnel
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Bonjour {displayName}
              </h2>

              <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/70">
                Votre profil permet à Otavio de mieux contextualiser vos
                analyses et d’adapter progressivement votre expérience.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Scans", String(scanCount)],
              ["Score actuel", currentScore !== null ? String(currentScore) : "—"],
              [
                "Progression",
                currentScore !== null && previousScore !== null
                  ? `${currentScore - previousScore >= 0 ? "+" : ""}${currentScore - previousScore}`
                  : "—",
              ],
              ["Série", `${streak} j`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-3"
              >
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/55">
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Ma personnalisation
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Les informations qui façonnent votre expérience
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/objectifs"
              className="group block w-full rounded-[24px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d1f4ed]">
                  <Target size={18} strokeWidth={1.7} />
                </div>
                <span className="rounded-full bg-[#d1f4ed] px-2.5 py-1 text-[9px] font-semibold text-[#087ea4]">
                  {profileGoals.length > 0
                    ? `${profileGoals.length} objectif${profileGoals.length > 1 ? "s" : ""}`
                    : "À compléter"}
                </span>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Mes objectifs
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Choisissez les aspects que vous souhaitez particulièrement
                suivre dans le temps.
              </p>

              <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold">
                {profileGoals.length > 0 ? "Modifier mes objectifs" : "Configurer"}
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </Link>

            <article className="rounded-[24px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d1f4ed]">
                  <Activity size={18} strokeWidth={1.7} />
                </div>

                <span className="rounded-full bg-[#d1f4ed] px-2.5 py-1 text-[9px] font-semibold text-[#087ea4]">
                  {scanFrequency} jours
                </span>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Fréquence de suivi
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Choisissez à quelle fréquence Otavio vous suggère de refaire
                une analyse.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {[3, 7, 14, 30].map((days) => {
                  const active = scanFrequency === days;

                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => updateScanFrequency(days)}
                      className={`rounded-xl border px-2 py-2.5 text-[10px] font-semibold transition ${
                        active
                          ? "border-[#087ea4] bg-[#c9f2eb] text-[#087ea4]"
                          : "border-[#b9dfe3] bg-white text-[#557078] hover:bg-[#e9f8f7]"
                      }`}
                    >
                      {days} j
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[10px] leading-5 text-[#809092]">
                Otavio vous proposera un nouveau scan après {scanFrequency}{" "}
                jour{scanFrequency > 1 ? "s" : ""}.
              </p>

              <p className="mt-5 text-[10px] font-medium text-[#7b8e91]">
                Enregistré automatiquement
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Mes informations
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Votre profil personnel
          </h2>

          <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#718487]">
            Ces informations permettent à Otavio d’adapter ses recommandations
            à votre profil et à vos habitudes.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-[24px] border border-[#dce6e5] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5f5]">
                  <UserRound size={18} strokeWidth={1.7} />
                </div>

                <Link
                  href="/onboarding/1?from=profil"
                  className="text-[10px] font-semibold text-[#087ea4]"
                >
                  Modifier
                </Link>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Profil général
              </h3>

              <div className="mt-4 space-y-2 text-[12px] text-[#587174]">
                <p>
                  Âge :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {profileData?.age ?? "À préciser"}
                  </span>
                </p>
                <p>
                  Sexe :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(profileData?.sex, labelMaps.sex)}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#dce6e5] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5f5]">
                  <Sparkles size={18} strokeWidth={1.7} />
                </div>

                <Link
                  href="/onboarding/2?from=profil"
                  className="text-[10px] font-semibold text-[#087ea4]"
                >
                  Modifier
                </Link>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Peau
              </h3>

              <div className="mt-4 space-y-2 text-[12px] text-[#587174]">
                <p>
                  Type :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(profileData?.skin_type, labelMaps.skinType)}
                  </span>
                </p>
                <p>
                  Sensibilité :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(
                      profileData?.skin_sensitivity,
                      labelMaps.sensitivity
                    )}
                  </span>
                </p>
                <p>
                  Préoccupations :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {profileData?.skin_concerns?.length
                      ? profileData.skin_concerns.join(", ")
                      : "Aucune renseignée"}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#dce6e5] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5f5]">
                  <Activity size={18} strokeWidth={1.7} />
                </div>

                <Link
                  href="/onboarding/4?from=profil"
                  className="text-[10px] font-semibold text-[#087ea4]"
                >
                  Modifier
                </Link>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Activité, hydratation & sommeil
              </h3>

              <div className="mt-4 space-y-2 text-[12px] text-[#587174]">
                <p>
                  Activité :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(
                      profileData?.activity_level,
                      labelMaps.activity
                    )}
                  </span>
                </p>
                <p>
                  Hydratation :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(
                      profileData?.hydration_level,
                      labelMaps.hydration
                    )}
                  </span>
                </p>
                <p>
                  Sommeil :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {profileData?.sleep_duration != null
                      ? `${profileData.sleep_duration} h`
                      : "À préciser"}
                    {profileData?.sleep_quality
                      ? ` · ${displayLabel(
                          profileData.sleep_quality,
                          labelMaps.sleepQuality
                        )}`
                      : ""}
                  </span>
                </p>
                <p>
                  Régularité :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(
                      profileData?.sleep_regularity,
                      labelMaps.sleepRegularity
                    )}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#dce6e5] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5f5]">
                  <Droplets size={18} strokeWidth={1.7} />
                </div>

                <Link
                  href="/onboarding/5?from=profil"
                  className="text-[10px] font-semibold text-[#087ea4]"
                >
                  Modifier
                </Link>
              </div>

              <h3 className="mt-5 text-[16px] font-semibold">
                Alimentation
              </h3>

              <div className="mt-4 space-y-2 text-[12px] text-[#587174]">
                <p>
                  Style :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {profileData?.eating_style || "À préciser"}
                  </span>
                </p>
                <p>
                  Repas par jour :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {profileData?.meals_per_day ?? "À préciser"}
                  </span>
                </p>
                <p>
                  Budget :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {displayLabel(profileData?.budget_level, labelMaps.budget)}
                  </span>
                </p>
                <p>
                  Allergies / intolérances :{" "}
                  <span className="font-semibold text-[#26393d]">
                    {[
                      ...(profileData?.allergies ?? []),
                      ...(profileData?.intolerances ?? []),
                    ].length > 0
                      ? [
                          ...(profileData?.allergies ?? []),
                          ...(profileData?.intolerances ?? []),
                        ].join(", ")
                      : "Aucune renseignée"}
                  </span>
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Votre suivi
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Vue d’ensemble
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {indicatorItems.map((item) => {
              const Icon =
                item.key === "peau"
                  ? Sparkles
                  : item.key === "hydratation"
                    ? Droplets
                    : item.key === "fatigue"
                      ? Moon
                      : Activity;

              const value = latestScan?.indicators?.[item.key] ?? null;
              const previous = storedScans[1]?.indicators?.[item.key] ?? null;

              const change =
                value !== null && previous !== null
                  ? value - previous
                  : null;

              return (
                <Link
                  key={item.label}
                  href={`/indicateur?type=${item.label
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")}`}
                  className="rounded-[22px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-4 shadow-[0_10px_30px_rgba(35,55,60,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(35,55,60,0.07)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d1f4ed]">
                      <Icon size={17} strokeWidth={1.7} />
                    </div>

                    <TrendingUp
                      size={14}
                      strokeWidth={1.7}
                      className="text-[#668083]"
                    />
                  </div>

                  <p className="mt-4 text-[10px] text-[#718789]">
                    {item.label}
                  </p>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-[-0.03em]">
                      {value ?? "—"}
                    </span>

                    {value !== null && (
                      <span className="text-[10px] text-[#8aa0a1]">
                        /100
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-[10px] font-semibold ${
                      change === null
                        ? "text-[#8a9a9d]"
                        : change >= 0
                          ? "text-[#287f72]"
                          : "text-[#c76852]"
                    }`}
                  >
                    {change === null
                      ? value !== null
                        ? "Référence"
                        : "Après votre premier scan"
                      : `${change >= 0 ? "+" : ""}${change} pts`}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Gestion
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {profileSections.map((item) => {
              const Icon = item.icon;

              const href =
                item.title === "Mes objectifs"
                  ? "/objectifs"
                  : item.title === "Notifications"
                    ? "/notifications"
                    : item.title === "Confidentialité"
                      ? "/confidentialite"
                      : item.title === "Paramètres"
                        ? "/parametres"
                        : "#";

              if (href !== "#") {
                return (
                  <Link
                    key={item.title}
                    href={href}
                    className="group flex items-center gap-4 rounded-[22px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d1f4ed]">
                      <Icon size={19} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold">{item.title}</h3>
                      <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                        {item.text}
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#718789] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                );
              }

              return (
                <button
                  key={item.title}
                  type="button"
                  className="group flex items-center gap-4 rounded-[22px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)] text-left transition hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d1f4ed]">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                      {item.text}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#718789] transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] bg-gradient-to-br from-[#eee9ff] via-[#def7f1] to-[#fff0eb] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <LockKeyhole size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Vos données
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Vous gardez le contrôle
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Les réglages de confidentialité permettront de contrôler la
                conservation et l’utilisation de vos données et analyses.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#718789]">
          Otavio fournit des observations visuelles et des informations
          générales. Elles ne constituent pas un diagnostic médical et ne
          remplacent pas l’avis, l’examen ou le suivi d’un professionnel de
          santé.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#087ea4] via-[#12a6a6] to-[#7767e8] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#587174]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#171717]"
          >
            <UserRound size={18} strokeWidth={2} />
            <span className="text-[9px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
