"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const goals = [
  {
    value: "qualite_peau",
    title: "Améliorer ma peau",
    description: "Texture, imperfections et équilibre général",
    icon: "✦",
  },
  {
    value: "hydratation",
    title: "Améliorer mon hydratation",
    description: "Confort, souplesse et hydratation apparente",
    icon: "◌",
  },
  {
    value: "fatigue",
    title: "Réduire les signes de fatigue",
    description: "Regard, teint et récupération",
    icon: "☼",
  },
  {
    value: "eclat",
    title: "Retrouver de l’éclat",
    description: "Teint plus uniforme et aspect plus lumineux",
    icon: "✧",
  },
  {
    value: "nutrition",
    title: "Mieux manger",
    description: "Conseils alimentaires et menus personnalisés",
    icon: "◒",
  },
  {
    value: "sommeil",
    title: "Améliorer mon sommeil",
    description: "Régularité, récupération et habitudes",
    icon: "◔",
  },
  {
    value: "bien_etre",
    title: "Prendre davantage soin de moi",
    description: "Créer de meilleures habitudes au quotidien",
    icon: "♡",
  },
  {
    value: "evolution",
    title: "Suivre mon évolution",
    description: "Observer mes progrès dans le temps",
    icon: "↗",
  },
];

export default function OnboardingStepThree() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("goals")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Impossible de charger votre profil.");
        setLoading(false);
        return;
      }

      if (data && Array.isArray(data.goals)) {
        setSelectedGoals(data.goals);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const toggleGoal = (value: string) => {
    setError("");

    setSelectedGoals((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      if (current.length >= 3) {
        setError("Choisissez au maximum 3 objectifs.");
        return current;
      }

      return [...current, value];
    });
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      setError("Choisissez au moins un objectif.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/connexion");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        goals: selectedGoals,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible d'enregistrer vos objectifs.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/4");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center app-background">
        <div className="text-sm font-medium text-[#64747b]">
          Préparation de votre profil…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#168f91]">
              Vos objectifs
            </span>

            <span className="text-sm text-[#89969c]">3 / 5</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#cfe9ec]">
            <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2]" />
          </div>
        </div>

        <div className="mt-9">
          <p className="mb-2 text-sm font-semibold text-[#168f91]">
            Ce qui compte pour vous
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#102f3a]">
            Qu’aimeriez-vous améliorer ?
          </h1>

          <p className="mt-3 text-base leading-6 text-[#66757d]">
            Choisissez jusqu’à 3 objectifs. Otavio s’en servira pour
            hiérarchiser vos recommandations.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] shadow-[0_16px_40px_rgba(16,47,58,0.07)]">
          <div className="relative aspect-[16/8] overflow-hidden bg-white">
            <video
              src="/otavio/goals.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain scale-[0.97]"
            />
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2]" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#168f91]">
                Otavio
              </span>
            </div>

            <p className="mt-2 text-sm leading-5 text-[#617078]">
              Dites-moi ce qui compte le plus pour vous. Cela m'aidera à
              personnaliser vos recommandations.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          {goals.map((goal) => {
            const selected = selectedGoals.includes(goal.value);

            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => toggleGoal(goal.value)}
                className={`flex w-full items-center gap-4 rounded-[24px] border p-4 text-left transition ${
                  selected
                    ? "border-[#12a6a6] bg-[#d4f6ef] shadow-sm"
                    : "border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] hover:bg-[#f9fbfb]"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${
                    selected
                      ? "bg-white text-[#168f91]"
                      : "bg-[#e8f6f7] text-[#6b7b82]"
                  }`}
                >
                  {goal.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold ${
                      selected ? "text-[#176678]" : "text-[#183d48]"
                    }`}
                  >
                    {goal.title}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-[#7b898f]">
                    {goal.description}
                  </div>
                </div>

                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    selected
                      ? "border-[#168f91] bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2] text-white"
                      : "border-[#9ed7df] bg-white text-transparent"
                  }`}
                >
                  ✓
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#7b898f]">
          <span>Vous pouvez modifier ces objectifs plus tard.</span>
          <span className="font-semibold text-[#168f91]">
            {selectedGoals.length} / 3
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-[#ffdcd3] px-4 py-3 text-sm leading-5 text-[#d96550]">
            {error}
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving || selectedGoals.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#7767e8] px-5 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Continuer"}
          </button>
        </div>
      </div>
    </main>
  );
}
