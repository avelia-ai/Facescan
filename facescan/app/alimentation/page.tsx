"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, ShoppingBasket, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { buildOtavioNutritionPlan, buildOtavioShoppingList, buildOtavioNutritionAdaptations, type OtavioMealFeedback, type OtavioMealStatus } from "@/lib/otavio-programs";

const recipePhotos = {
  breakfast:
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=85",
  avocado:
    "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=1200&q=85",
  salmon:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85",
  salad:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
  chicken:
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85",
  curry:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85",
  yogurt:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85",
  apple:
    "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1200&q=85",
};

function getRecipePhoto(name: string, mealType: string) {
  const value = name.toLowerCase();

  if (value.includes("avocat")) return recipePhotos.avocado;
  if (value.includes("saumon")) return recipePhotos.salmon;
  if (value.includes("salade")) return recipePhotos.salad;
  if (
    value.includes("poulet") ||
    value.includes("dinde") ||
    value.includes("œuf") ||
    value.includes("omelette")
  ) {
    return recipePhotos.chicken;
  }
  if (
    value.includes("curry") ||
    value.includes("pois chiches") ||
    value.includes("lentilles") ||
    value.includes("dahl")
  ) {
    return recipePhotos.curry;
  }
  if (
    value.includes("yaourt") ||
    value.includes("fromage blanc") ||
    value.includes("pudding")
  ) {
    return recipePhotos.yogurt;
  }
  if (
    value.includes("pomme") ||
    value.includes("compote")
  ) {
    return recipePhotos.apple;
  }

  if (mealType === "petit_dejeuner") return recipePhotos.breakfast;
  if (mealType === "collation") return recipePhotos.yogurt;

  return recipePhotos.salad;
}

export default function AlimentationPage() {
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<OtavioMealFeedback[]>([]);
  const [scan, setScan] = useState<any>(null);

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

  const nutritionPlan = buildOtavioNutritionPlan(
    profile ?? {},
    7,
    scan
  );
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

  useEffect(() => {
    try {
      const rawScans = localStorage.getItem("facescan-scans");
      const scans = rawScans ? JSON.parse(rawScans) : [];

      const latestScan = Array.isArray(scans)
        ? [...scans].sort(
            (a, b) =>
              new Date(b?.date ?? 0).getTime() -
              new Date(a?.date ?? 0).getTime()
          )[0]
        : null;

      setScan(latestScan?.indicators ?? null);
    } catch {
      setScan(null);
    }
  }, []);

  return (
    <main className="app-background min-h-screen px-4 pb-24 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex items-center justify-between">
          <Link
            href="/conseils"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ebe9] bg-white shadow-[0_6px_18px_rgba(35,55,60,0.05)] transition hover:-translate-y-0.5"
            aria-label="Retour aux conseils"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">
              Alimentation
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf7f0]">
            <Utensils size={18} className="text-[#39775b]" />
          </div>
        </header>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-[#cbdcd5] bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_100%)] p-6 text-[12px] text-[#668083] shadow-[0_12px_30px_rgba(40,90,75,0.05)]">
            Préparation de votre programme…
          </div>
        ) : (
          <>
            <section className="rounded-[28px] bg-[#18352d] p-6 text-white shadow-[0_20px_48px_rgba(24,53,45,0.16)] sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <Utensils size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-white/60">
                      Votre programme
                    </p>
                    <h2 className="text-xl font-semibold leading-tight">
                      Une alimentation adaptée à votre profil
                    </h2>
                  </div>
                </div>

                <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
                  <video
                    src="/otavio/video-sommeil.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label="Otavio vous accompagne dans votre programme alimentaire"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </div>

              <p className="mb-6 text-sm leading-6 text-white/75">
                Otavio construit progressivement vos repas à partir de votre
                profil, de vos préférences, de vos contraintes et de vos
                objectifs.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="mb-1 text-xs text-white/60">
                    Objectif actuel
                  </p>
                  <p className="text-sm font-medium leading-5">
                    {nutritionPlan.objective}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="mb-1 text-xs text-white/60">
                    Programme
                  </p>
                  <p className="text-sm font-medium">
                    {nutritionPlan.durationDays} jours · personnalisé
                  </p>
                </div>
              </div>
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

            <section className="mt-6 overflow-hidden rounded-[30px] border border-[#bcd8d0] bg-[linear-gradient(145deg,#ffffff_0%,#f7fbf9_100%)] shadow-[0_16px_34px_rgba(35,70,60,0.07),0_28px_62px_rgba(35,70,60,0.055),inset_0_1px_0_rgba(255,255,255,0.98)]">
              <button
                type="button"
                onClick={() => setShoppingListOpen((open) => !open)}
                aria-expanded={shoppingListOpen}
                className="group relative flex w-full items-center justify-between gap-4 overflow-hidden px-5 py-5 text-left transition hover:-translate-y-0.5 hover:bg-[#fbfdfc] sm:px-6"
              >
                <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#88d6ca]/12 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 left-16 h-20 w-24 rounded-full bg-[#7e9ff2]/8 blur-2xl" />

                <div className="relative flex min-w-0 items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/80 bg-[linear-gradient(145deg,#eefaf6_0%,#dcefe7_100%)] text-[#287b78] shadow-[0_5px_10px_rgba(40,127,114,0.08),0_10px_22px_rgba(40,127,114,0.07),inset_0_1px_0_rgba(255,255,255,1)]">
                    <ShoppingBasket size={19} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#287b78]">
                        Courses
                      </p>

                      <span className="rounded-full border border-[#cce1da] bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-[#668083] shadow-[0_4px_10px_rgba(40,90,75,0.04)]">
                        {shoppingList.length} catégories
                      </span>
                    </div>

                    <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#183d48]">
                      Ma liste de courses
                    </h2>

                    <p className="mt-1.5 max-w-xl text-[11px] leading-5 text-[#668083]">
                      Tous les ingrédients nécessaires pour préparer votre programme de la semaine.
                    </p>
                  </div>
                </div>

                <span
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d6e5df] bg-white text-[#287b78] shadow-[0_6px_14px_rgba(40,90,75,0.055)] transition-all duration-300 ${
                    shoppingListOpen
                      ? "rotate-180 bg-[#edf8f4]"
                      : "group-hover:scale-105"
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown size={18} strokeWidth={1.8} />
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  shoppingListOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-[#e0ebe7] bg-[linear-gradient(180deg,#f8fcfa_0%,#f4f9f7_100%)] px-5 pb-5 pt-5 sm:px-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7d918f]">
                          Organisation
                        </p>
                        <p className="mt-1 text-[11px] text-[#668083]">
                          Les ingrédients sont regroupés pour simplifier vos achats.
                        </p>
                      </div>

                      <span className="hidden rounded-full border border-[#d2e3dc] bg-white px-3 py-1.5 text-[9px] font-semibold text-[#39775b] shadow-[0_5px_12px_rgba(40,90,75,0.04)] sm:inline-flex">
                        Programme Otavio
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {shoppingList.map((category, index) => (
                        <div
                          key={category.name}
                          className="group rounded-[22px] border border-[#d5e4df] bg-[linear-gradient(145deg,#ffffff_0%,#f8fbfa_100%)] p-4 shadow-[0_7px_16px_rgba(40,90,75,0.04),0_14px_28px_rgba(40,90,75,0.035),inset_0_1px_0_rgba(255,255,255,0.98)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(40,90,75,0.055),0_18px_34px_rgba(40,90,75,0.05)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#edf8f4_0%,#dff0e8_100%)] text-[#287b78] shadow-[0_4px_10px_rgba(40,127,114,0.06)]">
                                <span className="text-[10px] font-bold">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              </div>

                              <h3 className="text-[12px] font-semibold text-[#183d48]">
                                {category.name}
                              </h3>
                            </div>

                            <span className="rounded-full bg-[#eef7f3] px-2 py-1 text-[9px] font-semibold text-[#39775b]">
                              {category.items.length}{" "}
                              {category.items.length > 1 ? "articles" : "article"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2.5">
                            {category.items.map((item) => (
                              <div
                                key={`${category.name}-${item.name}-${item.unit}`}
                                className="flex items-center justify-between gap-4 border-b border-[#edf1f0] pb-2.5 last:border-0 last:pb-0"
                              >
                                <span className="text-[10px] leading-4 text-[#587174]">
                                  {item.name}
                                </span>

                                <span className="shrink-0 rounded-full bg-[#f1f7f4] px-2 py-1 text-[10px] font-semibold text-[#287b78]">
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
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-7 space-y-5">
              {nutritionPlan.days.map((day) => (
                <article
                  key={day.day}
                  className="overflow-hidden rounded-[30px] border border-[#cddfd9] bg-white shadow-[0_14px_30px_rgba(35,70,60,0.055),0_28px_58px_rgba(35,70,60,0.045),inset_0_1px_0_rgba(255,255,255,0.98)]"
                >
                  <div className="relative overflow-hidden bg-[linear-gradient(135deg,#143b43_0%,#1b5963_58%,#287b78_100%)] px-5 py-5 text-white sm:px-6">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#78d9d0]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-14 left-16 h-28 w-32 rounded-full bg-[#756bd4]/10 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_18px_rgba(0,0,0,0.10)]">
                          <span className="text-lg font-semibold tracking-[-0.04em]">
                            {String(day.day).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
                            Programme Otavio
                          </p>
                          <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em]">
                            Jour {day.day}
                          </h2>
                          <p className="mt-0.5 text-[10px] text-white/60">
                            Votre journée alimentaire
                          </p>
                        </div>
                      </div>

                      <div className="hidden shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-semibold text-white/80 backdrop-blur-sm sm:inline-flex">
                        {day.meals.length}{" "}
                        {day.meals.length > 1 ? "repas" : "repas"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 bg-[linear-gradient(180deg,#fbfdfc_0%,#f6faf8_100%)] p-4 sm:p-5 lg:grid-cols-2">
                    {day.meals.map((meal) => {
                      const feedback = getMealFeedback(day.day, meal.type);

                      return (
                        <div
                          key={`${day.day}-${meal.type}`}
                          className="group overflow-hidden rounded-[26px] border border-[#d2e1dc] bg-white shadow-[0_8px_20px_rgba(40,90,75,0.04),0_16px_32px_rgba(40,90,75,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(40,90,75,0.06),0_20px_38px_rgba(40,90,75,0.05)]"
                        >
                          <div className="relative h-[170px] overflow-hidden bg-[#eaf1ee]">
                            <img
                              src={getRecipePhoto(
                                meal.recipe.name,
                                meal.type
                              )}
                              alt={meal.recipe.name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              loading="lazy"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#102f3a]/55 via-[#102f3a]/5 to-transparent" />

                            <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/20 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-md">
                              {day.meals.length > 1 ? "Programme Otavio" : "Repas"}
                            </div>
                          </div>

                          <div
                            className={`relative overflow-hidden px-4 py-4 ${
                              meal.type === "petit_dejeuner"
                                ? "bg-[linear-gradient(135deg,#fff9e5_0%,#f7edcf_100%)]"
                                : meal.type === "dejeuner"
                                  ? "bg-[linear-gradient(135deg,#edf8f0_0%,#d9eee0_100%)]"
                                  : meal.type === "diner"
                                    ? "bg-[linear-gradient(135deg,#fff1eb_0%,#f5ddd4_100%)]"
                                    : "bg-[linear-gradient(135deg,#f3f0fb_0%,#e5e1f2_100%)]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/80 bg-white/70 shadow-[0_4px_10px_rgba(35,55,60,0.05)]">
                                  <Utensils
                                    size={16}
                                    strokeWidth={1.7}
                                    className={
                                      meal.type === "petit_dejeuner"
                                        ? "text-[#9a7818]"
                                        : meal.type === "dejeuner"
                                          ? "text-[#39775b]"
                                          : meal.type === "diner"
                                            ? "text-[#b45d4b]"
                                            : "text-[#655f9e]"
                                    }
                                  />
                                </div>

                                <div>
                                  <p
                                    className={`text-[9px] font-bold uppercase tracking-[0.16em] ${
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

                                  <p className="mt-0.5 text-[9px] text-[#7b8988]">
                                    Repas du programme
                                  </p>
                                </div>
                              </div>

                              <span className="shrink-0 rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[9px] font-semibold text-[#587174] shadow-[0_4px_10px_rgba(35,55,60,0.04)]">
                                {meal.recipe.prepTime} min
                              </span>
                            </div>
                          </div>

                          <div className="p-4 sm:p-5">
                            <h3 className="text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[#183d48]">
                              {meal.recipe.name}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {meal.portion && (
                                <span className="rounded-full border border-[#dce8e3] bg-[#f6faf8] px-2.5 py-1.5 text-[9px] font-medium text-[#587174]">
                                  {meal.portion}
                                </span>
                              )}

                              <span className="rounded-full border border-[#cae3dc] bg-[#edf8f4] px-2.5 py-1.5 text-[9px] font-semibold text-[#287b78]">
                                Préparation {meal.recipe.prepTime} min
                              </span>
                            </div>

                            <div className="mt-5 rounded-[20px] border border-[#dfeae6] bg-[linear-gradient(145deg,#fbfdfc_0%,#f4f9f7_100%)] p-3.5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#7b8e90]">
                                    Suivi du repas
                                  </p>
                                  <p className="mt-1 text-[10px] text-[#9aa8a7]">
                                    Votre retour aide Otavio à ajuster vos prochains repas.
                                  </p>
                                </div>

                                {feedback && (
                                  <span className="shrink-0 rounded-full bg-[#eaf7f3] px-2.5 py-1 text-[8px] font-semibold text-[#287b78]">
                                    Enregistré
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-[16px] bg-[#eaf0ed] p-1">
                                {[
                                  ["realise", "✓ Réalisé"],
                                  ["remplace", "↻ Remplacé"],
                                  ["ignore", "— Ignoré"],
                                ].map(([status, label]) => (
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
                                    className={`rounded-[12px] px-2 py-2 text-[8px] font-semibold transition ${
                                      feedback?.status === status
                                        ? "bg-white text-[#176678] shadow-[0_4px_12px_rgba(40,90,75,0.08)]"
                                        : "text-[#7b8e90] hover:bg-white/80 hover:text-[#587174]"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>

                              {feedback && (
                                <div className="mt-3 rounded-[16px] border border-[#e2ebe8] bg-white/80 p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-[9px] font-medium text-[#668083]">
                                      Votre satisfaction
                                    </p>

                                    <span className="text-[8px] text-[#9aa9aa]">
                                      sur 5
                                    </span>
                                  </div>

                                  <div className="mt-2 flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((value) => (
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
                                          feedback?.satisfaction === value
                                            ? "bg-[#287b78] text-white shadow-[0_4px_10px_rgba(40,127,114,0.16)]"
                                            : "bg-[#f7faf8] text-[#7b8e90] ring-1 ring-[#e1ebe7] hover:bg-[#edf7f4]"
                                        }`}
                                        aria-label={`Satisfaction ${value} sur 5`}
                                      >
                                        {value}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <details className="group mt-4">
                              <summary className="flex cursor-pointer list-none items-center justify-between rounded-[18px] border border-[#dfe9e5] bg-[linear-gradient(145deg,#fbfdfc_0%,#f4f8f6_100%)] px-4 py-3.5 text-[10px] font-semibold text-[#183d48] shadow-[0_5px_12px_rgba(40,90,75,0.035)] transition hover:bg-[#eef6f2]">
                                <span>Voir la recette complète</span>
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[15px] font-normal text-[#287b78] shadow-[0_4px_10px_rgba(40,90,75,0.05)] transition-transform group-open:rotate-45">
                                  +
                                </span>
                              </summary>

                              <div className="mt-3 space-y-4 rounded-[20px] border border-[#e1eae7] bg-[linear-gradient(145deg,#f9fcfa_0%,#f1f7f4_100%)] p-4">
                                <div className="rounded-[16px] border border-white/80 bg-white/75 p-3.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b8e90]">
                                    Ingrédients
                                  </p>

                                  <div className="mt-2 space-y-1.5">
                                    {meal.recipe.ingredients.map((ingredient) => (
                                      <div
                                        key={`${ingredient.name}-${ingredient.quantity ?? ""}-${ingredient.unit ?? ""}`}
                                        className="flex items-start justify-between gap-4 border-b border-[#edf1f0] pb-1.5 last:border-0 last:pb-0"
                                      >
                                        <span className="text-[10px] leading-4 text-[#587174]">
                                          {ingredient.name}
                                        </span>

                                        <span className="shrink-0 text-[9px] font-semibold text-[#287b78]">
                                          {ingredient.quantity
                                            ? `${ingredient.quantity} ${ingredient.unit ?? ""}`
                                            : ""}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-[16px] border border-white/80 bg-white/75 p-3.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7b8e90]">
                                    Préparation
                                  </p>

                                  <div className="mt-2 space-y-2">
                                    {meal.recipe.instructions.map(
                                      (instruction, index) => (
                                        <div
                                          key={instruction}
                                          className="flex items-start gap-2.5"
                                        >
                                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e7f4ef] text-[8px] font-bold text-[#287b78]">
                                            {index + 1}
                                          </span>

                                          <p className="pt-0.5 text-[10px] leading-4 text-[#587174]">
                                            {instruction}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      );
                    })}
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
