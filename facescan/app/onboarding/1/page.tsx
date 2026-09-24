"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  age: number | null;
  sex: string | null;
};

export default function OnboardingStepOne() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/connexion");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("age, sex")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Impossible de charger votre profil.");
        setLoading(false);
        return;
      }

      if (data) {
        const profile = data as Profile;

        if (profile.age) {
          setAge(String(profile.age));
        }

        if (profile.sex) {
          setSex(profile.sex);
        }
      } else {
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
          });

        if (createError) {
          setError("Impossible de créer votre profil.");
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleContinue = async () => {
    setError("");

    const numericAge = Number(age);

    if (!numericAge || numericAge < 13 || numericAge > 120) {
      setError("Veuillez indiquer un âge compris entre 13 et 120 ans.");
      return;
    }

    if (!sex) {
      setError("Veuillez sélectionner une option.");
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
        age: numericAge,
        sex,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible d'enregistrer vos informations.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/2");
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
              Votre profil
            </span>

            <span className="text-sm text-[#89969c]">1 / 5</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#cfe9ec]">
            <div className="h-full w-[20%] rounded-full bg-gradient-to-r from-[#087ea4] via-[#12a6a6] to-[#42cfc2]" />
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] shadow-[0_16px_40px_rgba(16,47,58,0.07)]">
          <div className="relative aspect-[16/8] overflow-hidden bg-white">
            <video
              src="/otavio/profile.mp4"
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
              Quelques informations vont me permettre de mieux personnaliser
              votre expérience.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <p className="mb-2 text-sm font-semibold text-[#168f91]">
            Commençons simplement
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#102f3a]">
            Parlez-nous un peu de vous
          </h1>

          <p className="mt-3 text-base leading-6 text-[#66757d]">
            Ces premières informations aideront Otavio à personnaliser votre
            expérience.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <section className="rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
            <label
              htmlFor="age"
              className="mb-3 block text-sm font-semibold text-[#183d48]"
            >
              Quel âge avez-vous ?
            </label>

            <input
              id="age"
              type="number"
              inputMode="numeric"
              min="13"
              max="120"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="Votre âge"
              className="w-full rounded-2xl border border-[#9ed8df] bg-[#f0fbfc] px-4 py-4 text-base text-[#183d48] outline-none transition placeholder:text-[#9aa7ad] focus:border-[#168f91]"
            />
          </section>

          <section className="rounded-[26px] border border-[#9fd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#eaf8f5_100%)] p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
            <p className="mb-3 text-sm font-semibold text-[#183d48]">
              Comment souhaitez-vous être pris en compte ?
            </p>

            <div className="space-y-3">
              {[
                { value: "femme", label: "Femme" },
                { value: "homme", label: "Homme" },
                {
                  value: "non_precise",
                  label: "Je préfère ne pas préciser",
                },
              ].map((option) => {
                const selected = sex === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSex(option.value)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      selected
                        ? "border-[#12a6a6] bg-[#d4f6ef] text-[#176678]"
                        : "border-[#afd9df] bg-white text-[#526168] hover:bg-[#edf9f8]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

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
