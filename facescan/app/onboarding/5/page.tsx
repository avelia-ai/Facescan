"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const eatingStyles = [
  "Omnivore",
  "Flexitarien(ne)",
  "Végétarien(ne)",
  "Végétalien(ne)",
  "Pescétarien(ne)",
];

const budgets = [
  {
    value: "economique",
    label: "Économique",
    description: "Privilégier les solutions accessibles",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Un bon équilibre prix / qualité",
  },
  {
    value: "confort",
    label: "Confort",
    description: "Plus de liberté sur les choix",
  },
];

const preferences = [
  "J’aime cuisiner",
  "Je préfère les repas rapides",
  "Je mange souvent à l’extérieur",
  "Je privilégie le fait maison",
  "Je veux plus de fruits et légumes",
  "Je veux réduire le sucre",
  "Je veux réduire les produits ultra-transformés",
];

const constraints = [
  "Peu de temps",
  "Budget limité",
  "Allergies",
  "Intolérances",
  "Contraintes alimentaires",
  "Peu de matériel de cuisine",
  "Déplacements fréquents",
];

export default function OnboardingStepFive() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [eatingStyle, setEatingStyle] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [budget, setBudget] = useState("");
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [constraintsSelected, setConstraintsSelected] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [intolerances, setIntolerances] = useState("");
  const [currentProducts, setCurrentProducts] = useState("");
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
          "eating_style, meals_per_day, budget_level, food_preferences, dietary_constraints, allergies, intolerances, current_products"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("Impossible de charger votre profil.");
        setLoading(false);
        return;
      }

      if (data) {
        setEatingStyle(data.eating_style ?? "");
        setMealsPerDay(
          data.meals_per_day != null ? String(data.meals_per_day) : ""
        );
        setBudget(data.budget_level ?? "");
        setFoodPreferences(
          Array.isArray(data.food_preferences) ? data.food_preferences : []
        );
        setConstraintsSelected(
          Array.isArray(data.dietary_constraints)
            ? data.dietary_constraints
            : []
        );
        setAllergies(
          Array.isArray(data.allergies) ? data.allergies.join(", ") : ""
        );
        setIntolerances(
          Array.isArray(data.intolerances)
            ? data.intolerances.join(", ")
            : ""
        );
        setCurrentProducts(data.current_products ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const toggleItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleContinue = async () => {
    setError("");

    if (!eatingStyle) {
      setError("Indiquez votre façon de vous alimenter.");
      return;
    }

    if (!mealsPerDay || !budget) {
      setError("Complétez vos habitudes alimentaires et votre budget.");
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
        eating_style: eatingStyle,
        meals_per_day: Number(mealsPerDay),
        budget_level: budget,
        food_preferences: foodPreferences,
        dietary_constraints: constraintsSelected,
        allergies: allergies
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        intolerances: intolerances
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        current_products: currentProducts || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Impossible d'enregistrer votre profil.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/finalisation");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm font-medium text-[#64747b]">
          Finalisation de votre profil…
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
              Vos préférences
            </span>
            <span className="text-sm text-[#89969c]">5 / 5</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#dfe8e9]">
            <div className="h-full w-full rounded-full bg-[#168f91]" />
          </div>
        </div>

        <div className="mt-9">
          <p className="mb-2 text-sm font-semibold text-[#168f91]">
            Dernière étape
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#102f3a]">
            Et maintenant, votre quotidien
          </h1>

          <p className="mt-3 text-base leading-6 text-[#66757d]">
            Ces dernières informations permettront à Otavio de rendre ses
            recommandations vraiment adaptées à votre vie.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-[#dce7e8] bg-white shadow-[0_16px_40px_rgba(16,47,58,0.07)]">
          <div className="relative aspect-[16/8] overflow-hidden bg-white">
            <video
              src="/otavio/daily.mp4"
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
              <span className="h-2 w-2 rounded-full bg-[#168f91]" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#168f91]">
                Otavio
              </span>
            </div>

            <p className="mt-2 text-sm leading-5 text-[#617078]">
              Encore quelques informations et je pourrai mieux adapter votre
              programme à votre quotidien.
            </p>
          </div>
        </div>

        <section className="mt-7 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Comment mangez-vous principalement ?
          </p>

          <div className="flex flex-wrap gap-2.5">
            {eatingStyles.map((option) => {
              const selected = eatingStyle === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEatingStyle(option)}
                  className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    selected
                      ? "border-[#168f91] bg-[#e5faf7] text-[#176678]"
                      : "border-[#d7e2e4] bg-white text-[#5f6d74]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-[#183d48]">
              Combien de repas prenez-vous généralement ?
            </label>

            <select
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(event.target.value)}
              className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-4 text-sm text-[#183d48] outline-none focus:border-[#168f91]"
            >
              <option value="">Choisir</option>
              <option value="2">2 repas</option>
              <option value="3">3 repas</option>
              <option value="4">4 repas</option>
              <option value="5">5 repas ou plus</option>
            </select>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-4 text-sm font-semibold text-[#183d48]">
            Quel budget souhaitez-vous privilégier ?
          </p>

          <div className="space-y-3">
            {budgets.map((option) => {
              const selected = budget === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBudget(option.value)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#e06f59] bg-[#fff0eb]"
                      : "border-[#d7e2e4] bg-white"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${
                      selected ? "text-[#b45a48]" : "text-[#183d48]"
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
          <p className="text-sm font-semibold text-[#183d48]">
            Qu’est-ce qui vous correspond ?
          </p>

          <p className="mt-1 text-xs leading-5 text-[#7b898f]">
            Plusieurs réponses possibles.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {preferences.map((option) => {
              const selected = foodPreferences.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleItem(option, setFoodPreferences)}
                  className={`rounded-full border px-3.5 py-2.5 text-xs font-semibold transition ${
                    selected
                      ? "border-[#756bd4] bg-[#eeecff] text-[#5d55bd]"
                      : "border-[#d7e2e4] bg-white text-[#5f6d74]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="text-sm font-semibold text-[#183d48]">
            Y a-t-il des contraintes à prendre en compte ?
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {constraints.map((option) => {
              const selected = constraintsSelected.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleItem(option, setConstraintsSelected)
                  }
                  className={`rounded-full border px-3.5 py-2.5 text-xs font-semibold transition ${
                    selected
                      ? "border-[#168f91] bg-[#e5faf7] text-[#176678]"
                      : "border-[#d7e2e4] bg-white text-[#5f6d74]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            <input
              value={allergies}
              onChange={(event) => setAllergies(event.target.value)}
              placeholder="Allergies, si besoin"
              className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-3.5 text-sm text-[#183d48] outline-none placeholder:text-[#9aa7ad] focus:border-[#168f91]"
            />

            <input
              value={intolerances}
              onChange={(event) => setIntolerances(event.target.value)}
              placeholder="Intolérances, si besoin"
              className="w-full rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-3.5 text-sm text-[#183d48] outline-none placeholder:text-[#9aa7ad] focus:border-[#168f91]"
            />
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#dce7e8] bg-white p-5 shadow-[0_16px_40px_rgba(16,47,58,0.06)]">
          <p className="mb-3 text-sm font-semibold text-[#183d48]">
            Utilisez-vous déjà certains produits ?
          </p>

          <textarea
            value={currentProducts}
            onChange={(event) => setCurrentProducts(event.target.value)}
            rows={3}
            placeholder="Ex. nettoyant, sérum, crème, SPF…"
            className="w-full resize-none rounded-2xl border border-[#d7e2e4] bg-[#f9fbfb] px-4 py-3.5 text-sm leading-5 text-[#183d48] outline-none placeholder:text-[#9aa7ad] focus:border-[#168f91]"
          />
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
            {saving ? "Enregistrement…" : "Créer mon programme"}
          </button>
        </div>
      </div>
    </main>
  );
}
