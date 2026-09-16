"use client";

import Link from "next/link";
import { ArrowLeft, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { buildOtavioNutritionPlan, buildOtavioShoppingList, buildOtavioNutritionAdaptations, type OtavioMealFeedback, type OtavioMealStatus } from "@/lib/otavio-programs";

export default function AlimentationPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<OtavioMealFeedback[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(data ?? {});
      } catch {
        setProfile({});
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const nutritionPlan = buildOtavioNutritionPlan(profile ?? {}, 7);
  const shoppingList = buildOtavioShoppingList(nutritionPlan);
  const adaptations = buildOtavioNutritionAdaptations(feedback);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("otavio-nutrition-feedback");
      if (stored) {
        setFeedback(JSON.parse(stored));
      }
    } catch {
      setFeedback([]);
    }
  }, []);

  function updateMealStatus(
    day: number,
    mealType: OtavioMealFeedback["mealType"],
    recipeId: string,
    status: OtavioMealStatus
  ) {
    setFeedback((current) => {
      const next = [
        ...current.filter(
          (item) => !(item.day === day && item.mealType === mealType)
        ),
        {
          day,
          mealType,
          recipeId,
          status,
        },
      ];

      localStorage.setItem(
        "otavio-nutrition-feedback",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function setMealSatisfaction(
    day: number,
    mealType: OtavioMealFeedback["mealType"],
    value: number
  ) {
    setFeedback((current) => {
      const next = current.map((item) =>
        item.day === day && item.mealType === mealType
          ? { ...item, satisfaction: value }
          : item
      );

      localStorage.setItem(
        "otavio-nutrition-feedback",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function getMealFeedback(day: number, mealType: OtavioMealFeedback["mealType"]) {
    return feedback.find(
      (item) => item.day === day && item.mealType === mealType
    );
  }

  return (
    <main className="app-background min-h-screen px-4 pb-24 pt-6 text-[#183d48] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/conseils"
          className="inline-flex items-center gap-2 rounded-full border border-[#cbdcd5] bg-white px-3 py-1.5 text-[11px] font-medium text-[#587174] shadow-[0_5px_16px_rgba(40,90,75,0.04)] transition hover:-translate-y-0.5"
        >
          <ArrowLeft size={15} />
          Retour aux conseils
        </Link>

        <header className="mt-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b8d9ce] bg-[linear-gradient(135deg,#eaf8f2_0%,#d8eee5_100%)] text-[#287f72] shadow-[0_8px_20px_rgba(40,127,114,0.08)]">
            <Utensils size={22} strokeWidth={1.7} />
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948f87]">
            Alimentation
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-white">
            Votre programme alimentaire
          </h1>

          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[#6f8587]">
            Un programme construit à partir de votre profil, de vos
            préférences et de vos contraintes.
          </p>
        </header>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-[#cbdcd5] bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_100%)] p-6 text-[12px] text-[#668083] shadow-[0_12px_30px_rgba(40,90,75,0.05)]">
            Préparation de votre programme…
          </div>
        ) : (
          <>
            <section className="mt-8 overflow-hidden rounded-[28px] border border-[#bcd4c8] bg-[linear-gradient(145deg,#ffffff_0%,#f9fcfa_100%)] p-5 shadow-[0_14px_36px_rgba(43,70,58,0.065)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668083]">
                    Votre semaine
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Programme sur {nutritionPlan.durationDays} jours
                  </h2>
                </div>

                <span className="rounded-full border border-[#b7d9cd] bg-[#e7f6f0] px-3 py-1.5 text-[10px] font-semibold text-[#287b72] shadow-[0_5px_14px_rgba(40,127,114,0.06)]">
                  Personnalisé
                </span>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-[#587174]">
                {nutritionPlan.objective}
              </p>

              {nutritionPlan.personalization.length > 0 && (
                <p className="mt-2 text-[10px] leading-5 text-[#668083]">
                  Adapté selon :{" "}
                  {nutritionPlan.personalization.join(" • ")}
                </p>
              )}
            </section>

            {feedback.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-[28px] border border-[#cbdcd5] bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-[0_14px_36px_rgba(40,90,75,0.055)] sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668083]">
                  Otavio apprend
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Votre programme évolue avec vous
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[#668083]">
                  Vos retours permettent à Otavio d'ajuster progressivement
                  les prochaines recommandations.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-[#d3e6df] bg-[linear-gradient(145deg,#f9fdfb_0%,#eff8f4_100%)] p-3 shadow-[0_5px_14px_rgba(40,90,75,0.035)]">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#7b8e90]">
                      Repas suivis
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#176678]">
                      {feedback.length}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-[#d3e6df] bg-[linear-gradient(145deg,#f9fdfb_0%,#eff8f4_100%)] p-3 shadow-[0_5px_14px_rgba(40,90,75,0.035)]">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#7b8e90]">
                      Réalisés
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#176678]">
                      {feedback.filter((item) => item.status === "realise").length}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-[#d3e6df] bg-[linear-gradient(145deg,#f9fdfb_0%,#eff8f4_100%)] p-3 shadow-[0_5px_14px_rgba(40,90,75,0.035)]">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#7b8e90]">
                      Satisfaction
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#176678]">
                      {(() => {
                        const scores = feedback
                          .map((item) => item.satisfaction)
                          .filter(
                            (value): value is number =>
                              typeof value === "number"
                          );

                        if (scores.length === 0) return "—";

                        const average =
                          scores.reduce((sum, value) => sum + value, 0) /
                          scores.length;

                        return `${average.toFixed(1)}/5`;
                      })()}
                    </p>
                  </div>
                </div>

                {adaptations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {adaptations.map((adaptation, index) => (
                      <div
                        key={`${adaptation.type}-${index}`}
                        className="rounded-2xl border border-[#e6eceb] bg-[#fcfdfd] px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11px] font-medium leading-5 text-[#183d48]">
                            {adaptation.message}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                              adaptation.priority === "haute"
                                ? "bg-[#fff0eb] text-[#b55d42]"
                                : adaptation.priority === "moderee"
                                  ? "bg-[#fff8e8] text-[#9a741e]"
                                  : "bg-[#eaf8f5] text-[#287b78]"
                            }`}
                          >
                            {adaptation.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="mt-6 rounded-[26px] border border-[#dfe7e6] bg-white p-5 shadow-[0_14px_38px_rgba(35,55,60,0.055)] sm:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668083]">
                  Courses
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Ma liste de courses
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-[#668083]">
                  Les ingrédients nécessaires pour préparer votre programme de la semaine.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {shoppingList.map((category) => (
                  <div
                    key={category.name}
                    className="rounded-[22px] border border-[#d5e4df] bg-[linear-gradient(145deg,#ffffff_0%,#f8fbfa_100%)] p-4 shadow-[0_6px_16px_rgba(40,90,75,0.035)]"
                  >
                    <h3 className="text-[12px] font-semibold text-[#183d48]">
                      {category.name}
                    </h3>

                    <div className="mt-3 space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={`${category.name}-${item.name}-${item.unit}`}
                          className="flex items-center justify-between gap-4 border-b border-[#edf1f0] pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-[10px] text-[#587174]">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold text-[#287b78]">
                            {Number.isInteger(item.quantity)
                              ? item.quantity
                              : item.quantity.toFixed(1)}{" "}
                            {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 space-y-4">
              {nutritionPlan.days.map((day) => (
                <article
                  key={day.day}
                  className="overflow-hidden rounded-[26px] border border-[#dfe7e6] bg-white shadow-[0_14px_38px_rgba(35,55,60,0.055)]"
                >
                  <div className="flex items-center justify-between border-b border-[#edf1f0] bg-[#f8fbfa] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668083]">
                        Jour {day.day}
                      </p>
                      <h2 className="mt-1 text-[15px] font-semibold">
                        Votre journée alimentaire
                      </h2>
                    </div>

                    <Utensils
                      size={18}
                      strokeWidth={1.7}
                      className="text-[#287b78]"
                    />
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {day.meals.map((meal) => (
                      <div
                        key={`${day.day}-${meal.type}`}
                        className="overflow-hidden rounded-[24px] border border-[#d2dfdb] bg-white shadow-[0_8px_22px_rgba(40,90,75,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(40,90,75,0.08)]"
                      >
                        <div
                          className={`px-4 py-3 ${
                            meal.type === "petit_dejeuner"
                              ? "bg-[linear-gradient(135deg,#fff8dc_0%,#f7eac1_100%)]"
                              : meal.type === "dejeuner"
                                ? "bg-[linear-gradient(135deg,#edf7ef_0%,#d9ecdf_100%)]"
                                : meal.type === "diner"
                                  ? "bg-[linear-gradient(135deg,#fff0ea_0%,#f6dcd2_100%)]"
                                  : "bg-[linear-gradient(135deg,#f2effb_0%,#e4e0f2_100%)]"
                          }`}
                        >
                          <p
                            className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
                              meal.type === "petit_dejeuner"
                                ? "text-[#9a7818]"
                                : meal.type === "dejeuner"
                                  ? "text-[#39775b]"
                                  : meal.type === "diner"
                                    ? "text-[#b45d4b]"
                                    : "text-[#655f9e]"
                            }`}
                          >
                            {meal.type === "petit_dejeuner"
                              ? "Petit-déjeuner"
                              : meal.type === "dejeuner"
                                ? "Déjeuner"
                                : meal.type === "diner"
                                  ? "Dîner"
                                  : "Collation"}
                          </p>
                        </div>

                        <div className="p-4">
                          <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.015em] text-[#183d48]">
                            {meal.recipe.name}
                          </h3>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {meal.portion && (
                              <span className="rounded-full bg-[#f4f7f6] px-2.5 py-1 text-[9px] font-medium text-[#587174]">
                                {meal.portion}
                              </span>
                            )}

                            <span className="rounded-full bg-[#edf7f4] px-2.5 py-1 text-[9px] font-semibold text-[#287b78]">
                              {meal.recipe.prepTime} min
                            </span>
                          </div>

                          <div className="mt-5 border-t border-[#edf1f0] pt-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b8e90]">
                                Suivi du repas
                              </p>

                              {getMealFeedback(day.day, meal.type) && (
                                <span className="text-[8px] font-medium text-[#287b78]">
                                  Suivi enregistré
                                </span>
                              )}
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#f7f9f8] p-1">
                              {[
                                ["realise", "✓ Réalisé"],
                                ["remplace", "↻ Remplacé"],
                                ["ignore", "— Ignoré"],
                              ].map(([status, label]) => {
                                const current = getMealFeedback(
                                  day.day,
                                  meal.type
                                );

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() =>
                                      updateMealStatus(
                                        day.day,
                                        meal.type,
                                        meal.recipe.id,
                                        status as OtavioMealStatus
                                      )
                                    }
                                    className={`rounded-xl px-2 py-2 text-[8px] font-semibold transition ${
                                      current?.status === status
                                        ? "bg-white text-[#176678] shadow-[0_3px_10px_rgba(40,90,75,0.08)]"
                                        : "text-[#7b8e90] hover:bg-white/80 hover:text-[#587174]"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>

                            {getMealFeedback(day.day, meal.type) && (
                              <div className="mt-3 rounded-2xl bg-[#fafcfb] px-3 py-2.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] font-medium text-[#668083]">
                                    Votre satisfaction
                                  </p>

                                  <span className="text-[8px] text-[#9aa9aa]">
                                    sur 5
                                  </span>
                                </div>

                                <div className="mt-2 flex gap-1.5">
                                  {[1, 2, 3, 4, 5].map((value) => {
                                    const current = getMealFeedback(
                                      day.day,
                                      meal.type
                                    );

                                    return (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                          setMealSatisfaction(
                                            day.day,
                                            meal.type,
                                            value
                                          )
                                        }
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-semibold transition ${
                                          current?.satisfaction === value
                                            ? "bg-[#287b78] text-white shadow-[0_3px_10px_rgba(40,127,114,0.16)]"
                                            : "bg-white text-[#7b8e90] ring-1 ring-[#e5ece9] hover:bg-[#edf7f4]"
                                        }`}
                                        aria-label={`Satisfaction ${value} sur 5`}
                                      >
                                        {value}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <details className="group mt-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-[#e4ebe8] bg-[#fafcfb] px-3.5 py-3 text-[10px] font-semibold text-[#183d48] transition hover:bg-[#f4f8f6]">
                              <span>Voir la recette</span>
                              <span className="text-[14px] font-normal text-[#287b78] transition-transform group-open:rotate-45">
                                +
                              </span>
                            </summary>

                            <div className="mt-3 space-y-4 rounded-2xl bg-[#fafcfb] p-3.5">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b8e90]">
                                Ingrédients
                              </p>

                              <div className="mt-1.5 space-y-1">
                                {meal.recipe.ingredients.map((ingredient) => (
                                  <p
                                    key={`${ingredient.name}-${ingredient.quantity ?? ""}-${ingredient.unit ?? ""}`}
                                    className="text-[10px] leading-4 text-[#587174]"
                                  >
                                    • {ingredient.quantity ? `${ingredient.quantity} ${ingredient.unit ?? ""} ` : ""}{ingredient.name}
                                  </p>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b8e90]">
                                Préparation
                              </p>

                              <div className="mt-1.5 space-y-1">
                                {meal.recipe.instructions.map(
                                  (instruction, index) => (
                                    <p
                                      key={instruction}
                                      className="text-[10px] leading-4 text-[#587174]"
                                    >
                                      {index + 1}. {instruction}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </details>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/conseils"
            className="inline-flex rounded-full bg-[#176678] px-5 py-3 text-[11px] font-semibold text-white"
          >
            Retour aux conseils
          </Link>
        </div>
      </div>
    </main>
  );
}
