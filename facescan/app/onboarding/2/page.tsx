"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const skinTypes = [
  {
    value: "seche",
    label: "Sèche",
    description: "Tiraillements ou sensation de manque de confort",
  },
  {
    value: "normale",
    label: "Normale",
    description: "Peu de brillances ou de tiraillements",
  },
  {
    value: "mixte",
    label: "Mixte",
    description: "Zone T plus brillante, autres zones plus équilibrées",
  },
  {
    value: "grasse",
    label: "Grasse",
    description: "Brillance plus importante et peau souvent plus grasse",
  },
  {
    value: "inconnue",
    label: "Je ne sais pas",
    description: "Otavio pourra vous aider à mieux l'observer",
  },
];

const concerns = [
  "Déshydratation",
  "Imperfections",
  "Rougeurs",
  "Texture",
  "Teint irrégulier",
  "Cernes",
  "Poches",
  "Brillance",
  "Pores visibles",
  "Manque d'éclat",
  "Signes de fatigue",
];

const sensitivityOptions = [
  {
    value: "faible",
    label: "Peu sensible",
  },
  {
    value: "moderee",
    label: "Modérément sensible",
  },
  {
    value: "forte",
    label: "Très sensible",
  },
  {
    value: "inconnue",
    label: "Je ne sais pas",
  },
];

export default function OnboardingStepTwo() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [skinType, setSkinType] = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
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
        .select("skin_type, skin_sensitivity, skin_concerns")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Impossible de charger votre profil.");
        setLoading(false);
        return;
      }

      if (data) {
        setSkinType(data.skin_type ?? "");
        setSensitivity(data.skin_sensitivity ?? "");
        setSelectedConcerns(
          Array.isArray(data.skin_concerns) ? data.skin_concerns : []
        );
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((current) =>
      current.includes(concern)
        ? current.filter((item) => item !== concern)
        : [...current, concern]
    );
  };

  const handleContinue = async () => {
    setError("");

    if (!skinType) {
      setError("Sélectionnez votre type de peau.");
      return;
    }

    if (!sensitivity) {
      setError("Indiquez la sensibilité de votre peau.");
      return;
    }

    if (selectedConcerns.length === 0) {
      setError("Sélectionnez au moins une priorité.");
      return;
    }

    setSaving(true);

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
        skin_type: skinType,
        skin_sensitivity: sensitivity,
        skin_concerns: selectedConcerns,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible d'enregistrer vos informations.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/3");
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
              Votre peau
            </span>

            <span className="text-sm text-[#89969c]">2 / 5</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#cfe9ec]">
            <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2]" />
          </div>
        </div>

        <div className="mt-9">
          <p className="mb-2 text-sm font-semibold text-[#168f91]">
            Étape 2
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#102f3a]">
            Parlons de votre peau
          </h1>

          <p className="mt-3 text-base leading-6 text-[#66757d]">
            Ces informations aideront Otavio à adapter ses conseils et vos
            futures routines.
          </p>
        </div>

        <section className="mt-7 rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Quel est votre type de peau ?
          </p>

          <div className="space-y-3">
            {skinTypes.map((option) => {
              const selected = skinType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSkinType(option.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#12a6a6] bg-[#d4f6ef]"
                      : "border-[#afd9df] bg-white hover:bg-[#e9f8fa]"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${
                      selected ? "text-[#176678]" : "text-[#183d48]"
                    }`}
                  >
                    {option.label}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-[#7b898f]">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Votre peau est-elle sensible ?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {sensitivityOptions.map((option) => {
              const selected = sensitivity === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSensitivity(option.value)}
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                    selected
                      ? "border-[#9b8cff] bg-[#e8e3ff] text-[#5d55bd]"
                      : "border-[#afd9df] bg-white text-[#526168]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#183d48]">
                Qu’aimeriez-vous améliorer ?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7b898f]">
                Sélectionnez toutes les préoccupations qui vous correspondent.
              </p>
            </div>

            <span className="rounded-full bg-[#e8f6f7] px-3 py-1 text-xs font-semibold text-[#718088]">
              {selectedConcerns.length}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {concerns.map((concern) => {
              const selected = selectedConcerns.includes(concern);

              return (
                <button
                  key={concern}
                  type="button"
                  onClick={() => toggleConcern(concern)}
                  className={`rounded-full border px-3.5 py-2.5 text-xs font-semibold transition ${
                    selected
                      ? "border-[#12a6a6] bg-[#d4f6ef] text-[#176678]"
                      : "border-[#afd9df] bg-white text-[#5f6d74] hover:bg-[#edf9f8]"
                  }`}
                >
                  {concern}
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl bg-[#ffdcd3] px-4 py-3 text-sm leading-5 text-[#d96550]">
            {error}
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#7767e8] px-5 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Continuer"}
          </button>
        </div>
      </div>
    </main>
  );
}
