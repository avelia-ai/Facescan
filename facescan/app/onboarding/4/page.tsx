"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const activityOptions = [
  {
    value: "sedentaire",
    label: "Sédentaire",
    description: "Peu ou pas d’activité physique au quotidien",
  },
  {
    value: "peu_actif",
    label: "Peu actif",
    description: "1 à 2 séances ou une activité légère par semaine",
  },
  {
    value: "actif",
    label: "Actif",
    description: "3 à 4 séances ou une activité régulière",
  },
  {
    value: "tres_actif",
    label: "Très actif",
    description: "5 séances ou plus, ou activité physique importante",
  },
];

const hydrationOptions = [
  { value: "faible", label: "Je bois peu" },
  { value: "moderee", label: "Je bois régulièrement" },
  { value: "bonne", label: "Je pense bien m’hydrater" },
  { value: "inconnue", label: "Je ne sais pas" },
];

const sleepQualityOptions = [
  { value: "mauvaise", label: "Souvent difficile" },
  { value: "moyenne", label: "Variable" },
  { value: "bonne", label: "Plutôt bonne" },
  { value: "tres_bonne", label: "Très bonne" },
];

const sleepRegularityOptions = [
  { value: "irreguliere", label: "Très irrégulier" },
  { value: "variable", label: "Assez variable" },
  { value: "reguliere", label: "Plutôt régulier" },
];

export default function OnboardingStepFour() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [activity, setActivity] = useState("");
  const [frequency, setFrequency] = useState("");
  const [hydration, setHydration] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [sleepRegularity, setSleepRegularity] = useState("");
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
        .select(
          "activity_level, activity_frequency, hydration_level, bedtime, wake_time, sleep_duration, sleep_quality, sleep_regularity"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Impossible de charger votre profil.");
        setLoading(false);
        return;
      }

      if (data) {
        setActivity(data.activity_level ?? "");
        setFrequency(data.activity_frequency ?? "");
        setHydration(data.hydration_level ?? "");
        setBedtime(data.bedtime ?? "");
        setWakeTime(data.wake_time ?? "");
        setSleepDuration(
          data.sleep_duration != null ? String(data.sleep_duration) : ""
        );
        setSleepQuality(data.sleep_quality ?? "");
        setSleepRegularity(data.sleep_regularity ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleContinue = async () => {
    setError("");

    if (!activity) {
      setError("Indiquez votre niveau d’activité.");
      return;
    }

    if (!hydration) {
      setError("Indiquez votre niveau d’hydratation habituel.");
      return;
    }

    if (!bedtime || !wakeTime || !sleepDuration) {
      setError("Complétez vos informations de sommeil.");
      return;
    }

    if (!sleepQuality || !sleepRegularity) {
      setError("Indiquez la qualité et la régularité de votre sommeil.");
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
        activity_level: activity,
        activity_frequency: frequency || null,
        hydration_level: hydration,
        bedtime,
        wake_time: wakeTime,
        sleep_duration: Number(sleepDuration),
        sleep_quality: sleepQuality,
        sleep_regularity: sleepRegularity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible d'enregistrer vos informations.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/5");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm font-medium text-[#64747b]">
          Préparation de votre profil…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#168f91]">
              Votre quotidien
            </span>
            <span className="text-sm text-[#89969c]">4 / 5</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#dfe8e9]">
            <div className="h-full w-[80%] rounded-full bg-[#168f91]" />
          </div>
        </div>

        <div className="mt-9">
          <p className="mb-2 text-sm font-semibold text-[#168f91]">
            Votre rythme de vie
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#102f3a]">
            Comment se passe votre quotidien ?
          </h1>

          <p className="mt-3 text-base leading-6 text-[#66757d]">
            Otavio va utiliser ces informations pour adapter ses conseils à
            votre rythme réel.
          </p>
        </div>

        <section className="mt-7 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Quel est votre niveau d’activité ?
          </p>

          <div className="space-y-3">
            {activityOptions.map((option) => {
              const selected = activity === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActivity(option.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#168f91] bg-[#e5faf7]"
                      : "border-[#d7e2e4] bg-white hover:bg-[#f8fafb]"
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

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            À quelle fréquence êtes-vous actif ?
          </p>

          <input
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            placeholder="Ex. 3 séances par semaine"
            className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-4 text-sm text-[#183d48] outline-none placeholder:text-[#9aa7ad] focus:border-[#168f91]"
          />
        </section>

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Comment vous hydratez-vous ?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {hydrationOptions.map((option) => {
              const selected = hydration === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHydration(option.value)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    selected
                      ? "border-[#168f91] bg-[#e5faf7] text-[#176678]"
                      : "border-[#d7e2e4] bg-white text-[#526168]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Votre sommeil
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#6e7c83]">
                Coucher
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(event) => setBedtime(event.target.value)}
                className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-3 py-3.5 text-sm text-[#183d48] outline-none focus:border-[#756bd4]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#6e7c83]">
                Lever
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(event) => setWakeTime(event.target.value)}
                className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-3 py-3.5 text-sm text-[#183d48] outline-none focus:border-[#756bd4]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold text-[#6e7c83]">
              Durée moyenne
            </label>

            <input
              type="number"
              min="1"
              max="16"
              step="0.5"
              value={sleepDuration}
              onChange={(event) => setSleepDuration(event.target.value)}
              placeholder="Ex. 7.5 heures"
              className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-3.5 text-sm text-[#183d48] outline-none placeholder:text-[#9aa7ad] focus:border-[#756bd4]"
            />
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold text-[#6e7c83]">
              Qualité du sommeil
            </p>

            <div className="grid grid-cols-2 gap-3">
              {sleepQualityOptions.map((option) => {
                const selected = sleepQuality === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepQuality(option.value)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-[#756bd4] bg-[#eeecff] text-[#5d55bd]"
                        : "border-[#d7e2e4] bg-white text-[#526168]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold text-[#6e7c83]">
              Régularité
            </p>

            <div className="grid grid-cols-3 gap-2">
              {sleepRegularityOptions.map((option) => {
                const selected = sleepRegularity === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepRegularity(option.value)}
                    className={`rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
                      selected
                        ? "border-[#756bd4] bg-[#eeecff] text-[#5d55bd]"
                        : "border-[#d7e2e4] bg-white text-[#526168]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl bg-[#fff0eb] px-4 py-3 text-sm leading-5 text-[#a64f3d]">
            {error}
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="w-full rounded-2xl bg-[#102f3a] px-5 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Continuer"}
          </button>
        </div>
      </div>
    </main>
  );
}
