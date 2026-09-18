"use client";

import { buildPersonalizedRecommendations } from "@/lib/personalization";
import { buildOtavioNutritionPlan } from "@/lib/otavio-programs";
import { registerOtavioDailyAction } from "@/lib/otavio-streak";

import { useEffect, useState } from "react";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Moon,
  Sparkles,
  Utensils,
  UserRound,
  ScanFace,
  SunMedium,
} from "lucide-react";

const recommendations = [
  {
    icon: Droplets,
    category: "Hydratation",
    title: "Augmentez légèrement votre hydratation",
    text: "Votre dernier scan suggère un niveau d’hydratation perfectible. Une hydratation régulière peut contribuer au confort cutané et à votre routine quotidienne.",
    priority: "Priorité aujourd’hui",
    action: "Boire régulièrement dans la journée",
    goal: "hydratation",
  },
  {
    icon: Moon,
    category: "Récupération",
    title: "Accordez plus de place au repos",
    text: "Votre indicateur de fatigue reste inférieur à vos autres indicateurs. Une routine de sommeil régulière peut favoriser une meilleure récupération.",
    priority: "À surveiller",
    action: "Préserver une heure de coucher régulière",
    goal: "recuperation",
  },
  {
    icon: Utensils,
    category: "Alimentation",
    title: "Misez sur une alimentation variée",
    text: "Privilégiez des repas contenant légumes, fruits, sources de protéines et bonnes graisses afin de soutenir vos habitudes de bien-être.",
    priority: "Conseil personnalisé",
    action: "Ajouter une portion végétale à votre prochain repas",
    goal: "equilibre",
  },
];

const categories = [
  { label: "Peau", icon: Sparkles },
  { label: "Hydratation", icon: Droplets },
  { label: "Sommeil", icon: Moon },
  { label: "Alimentation", icon: Utensils },
];

export default function ConseilsPage() {
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [latestScan, setLatestScan] = useState<{
    score: number;
    indicators: {
      peau: number;
      hydratation: number;
      fatigue: number;
      equilibre: number;
    };
  } | null>(null);
  const [expandedAdvice, setExpandedAdvice] = useState<string | null>(null);
  const [completedAdvice, setCompletedAdvice] = useState<string[]>([]);
  const [completingAdvice, setCompletingAdvice] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(profileData ?? null);
      }

      const scansStored = localStorage.getItem("facescan-scans");

      if (scansStored) {
        try {
          const scans = JSON.parse(scansStored);

          if (Array.isArray(scans) && scans.length > 0) {
            const first = scans[0];

            if (first?.indicators) {
              setLatestScan({
                score: typeof first.score === "number" ? first.score : 78,
                indicators: first.indicators,
              });
            }
          }
        } catch {
          setLatestScan(null);
        }
      }

      const stored = localStorage.getItem("facescan-goals");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setUserGoals(parsed);
          }
        } catch {}
      }
    };

    loadData();
  }, []);

  const toggleAdviceCompletion = async (adviceId: string) => {
    if (completedAdvice.includes(adviceId) || completingAdvice) return;

    setCompletingAdvice(adviceId);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/connexion";
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const recommendation = visibleRecommendations.find(
        (item) => item.id === adviceId
      );

      if (recommendation) {
        await supabase.from("otavio_daily_tasks").upsert(
          {
            user_id: user.id,
            task_date: today,
            task_key: `advice_${recommendation.id}`,
            title: recommendation.title,
            description: recommendation.steps,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,task_date,task_key",
          }
        );
      }

      await registerOtavioDailyAction(adviceId);

      setCompletedAdvice((current) => [...current, adviceId]);
    } catch (error) {
      console.error("Advice completion error:", error);
    } finally {
      setCompletingAdvice(null);
    }
  };

  const visibleRecommendations =
    profile && latestScan
      ? buildPersonalizedRecommendations({
          profile,
          scan: latestScan,
        })
      : [];

  const nutritionPlan =
    profile && visibleRecommendations.some(
      (item) => item.category === "Alimentation"
    )
      ? buildOtavioNutritionPlan(profile, 7)
      : null;

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9d9d4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.07)] transition hover:-translate-y-0.5"
              aria-label="Retour à l'accueil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f8587]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Conseils
              </h1>
            </div>
          </div>

          <Link
            href="/scanner"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#176678] to-[#287f88] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_12px_30px_rgba(23,102,120,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(23,102,120,0.26)] sm:flex"
          >
            <ScanFace size={16} strokeWidth={1.8} />
            Nouveau scan
          </Link>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[34px] border border-[#326978] bg-gradient-to-br from-[#163947] via-[#1a5667] to-[#207f82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#78d9d0]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-20 h-32 w-32 rounded-full bg-[#f2b58f]/10 blur-3xl" />

          <div className="relative min-h-[190px]">
            <div className="min-w-0 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] text-white/80 shadow-sm backdrop-blur-md">
                <Sparkles size={13} strokeWidth={1.8} />
                Basé sur vos objectifs et votre dernier scan
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Des conseils pensés pour vous.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-[15px]">
                Otavio transforme vos observations en actions simples à intégrer
                dans votre quotidien.
              </p>

              <div className="mt-6 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12">
                  <Activity size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">
                    État global
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">
                    {latestScan?.score ?? 78} / 100
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 h-[78px] w-[78px] overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)] sm:bottom-3 sm:right-3">
              <video
                src="/conseils-otavio.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Otavio vous accompagne dans vos conseils personnalisés"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948f87]">
                Aujourd’hui
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                Vos priorités
              </h2>
            </div>
            <span className="rounded-full border border-[#bfe8e3] bg-[#effcf9] px-3 py-1.5 text-[10px] font-semibold text-[#287b78]">
              {visibleRecommendations.length} action
              {visibleRecommendations.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {visibleRecommendations.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[28px] border border-[#c8d9d5] bg-white shadow-[0_14px_36px_rgba(36,78,70,0.065)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(35,55,60,0.10)]"
              >
                <div
                  className={`flex items-center justify-between gap-3 border-b px-5 py-3.5 ${
                    item.category === "Peau"
                      ? "border-[#e4c5bb] bg-[linear-gradient(135deg,#fff0eb_0%,#f9dfd5_100%)]"
                      : item.category === "Hydratation"
                        ? "border-[#b9dfe0] bg-[linear-gradient(135deg,#eafafa_0%,#d9f0f1_100%)]"
                        : item.category === "Sommeil"
                          ? "border-[#c8c4e2] bg-[linear-gradient(135deg,#f2f0fc_0%,#e4e1f4_100%)]"
                          : item.category === "Alimentation"
                            ? "border-[#bfd6c7] bg-[linear-gradient(135deg,#edf7f0_0%,#dceee3_100%)]"
                            : String(item.category) === "Activité"
                              ? "border-[#beded7] bg-[linear-gradient(135deg,#edf9f6_0%,#d9eee9_100%)]"
                              : "border-[#e8d9a9] bg-[linear-gradient(135deg,#fff9e8_0%,#f8edc9_100%)]"
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                      item.category === "Peau"
                        ? "text-[#b45f4d]"
                        : item.category === "Hydratation"
                          ? "text-[#23888a]"
                          : item.category === "Sommeil"
                            ? "text-[#655f9e]"
                            : item.category === "Alimentation"
                              ? "text-[#39775b]"
                              : String(item.category) === "Activité"
                                ? "text-[#287f72]"
                                : "text-[#9a7a18]"
                    }`}
                  >
                    {item.category}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                      item.priority === "high"
                        ? "bg-[#fff0eb] text-[#b45a48]"
                        : item.priority === "medium"
                          ? "bg-[#fff8df] text-[#9a7a18]"
                          : "bg-[#eaf8f5] text-[#167b82]"
                    }`}
                  >
                    {item.priority === "high"
                      ? "Priorité"
                      : item.priority === "medium"
                        ? "À suivre"
                        : "À maintenir"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-[18px] font-semibold leading-6 tracking-[-0.02em]">
                  {item.title}
                </h3>

                <p className="mt-3 text-[13px] leading-6 text-[#6b8183]">
                  {item.summary}
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#d7ebe7] bg-[#f5fbf9] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                      Cible
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#35666b]">
                      {item.target}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e0ddf1] bg-[#f9f8fe] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7770a8]">
                      Fréquence
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#5f5a82]">
                      {item.frequency}
                    </p>
                  </div>
                </div>

                {(item.quantity || item.duration) && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {item.quantity && (
                      <div className="rounded-2xl border border-[#e4ebea] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                          Repère
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                          {item.quantity}
                        </p>
                      </div>
                    )}

                    {item.duration && (
                      <div className="rounded-2xl border border-[#e4ebea] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                          Durée
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                          {item.duration}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`mt-3 rounded-2xl px-4 py-3 ${
                    completedAdvice.includes(item.id)
                      ? "bg-[#e5faf7] text-[#176678]"
                      : "bg-[#f8faf9] text-[#35666b]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current">
                      {completedAdvice.includes(item.id) && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                        {completedAdvice.includes(item.id)
                          ? "Conseil suivi"
                          : "À faire"}
                      </p>

                      <p className="mt-1 text-[11px] leading-5">
                        {completedAdvice.includes(item.id)
                          ? "Otavio a enregistré cette action aujourd’hui."
                          : item.steps[0]}
                      </p>
                    </div>
                  </div>

                  {!completedAdvice.includes(item.id) && (
                    <button
                      type="button"
                      onClick={() => toggleAdviceCompletion(item.id)}
                      disabled={completingAdvice === item.id}
                      className="mt-3 rounded-full bg-gradient-to-r from-[#176678] to-[#287f88] px-4 py-2 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(23,102,120,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,102,120,0.22)] disabled:opacity-50"
                    >
                      {completingAdvice === item.id
                        ? "Enregistrement…"
                        : "J’ai suivi ce conseil"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedAdvice(
                      expandedAdvice === item.id ? null : item.id
                    )
                  }
                  aria-expanded={expandedAdvice === item.id}
                  className="mt-4 flex items-center gap-2 text-[11px] font-medium text-[#183d48]"
                >
                  Pourquoi ce conseil ?
                  <ArrowRight
                    size={14}
                    strokeWidth={1.8}
                    className={`transition-transform ${
                      expandedAdvice === item.id ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {expandedAdvice === item.id && (
                  <div className="mt-4 space-y-3 rounded-[22px] border border-[#cfe2dd] bg-[linear-gradient(145deg,#f8fcfb_0%,#edf7f4_100%)] p-4">
                    <div className="rounded-[18px] border border-[#d8e9e5] bg-white/80 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#287b78]">
                        Ce que votre scan a observé
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-[#355f64]">
                        {item.observation || item.summary}
                      </p>
                    </div>

                    <div className="rounded-[18px] border border-[#d8e9e5] bg-white/80 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#287b78]">
                        Votre plan Otavio
                      </p>
                      <div className="mt-3 space-y-2.5">
                        {item.steps.map((step, index) => (
                          <div
                            key={`${item.id}-step-${index}`}
                            className="flex items-start gap-3 rounded-[15px] border border-[#dfeae7] bg-white/75 px-3.5 py-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#176678] text-[10px] font-bold text-white">
                              {index + 1}
                            </span>
                            <p className="pt-0.5 text-[11px] leading-5 text-[#355f64]">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-[#dddaf0] bg-[#faf9fe] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b65a1]">
                        Pourquoi ce conseil vous concerne
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-[#5f5a82]">
                        {item.why}
                      </p>
                    </div>

                    {(item.quantity || item.duration) && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.quantity && (
                          <div className="rounded-[16px] border border-[#dfe9e7] bg-white/75 px-3.5 py-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                              Repère
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-[#355f64]">
                              {item.quantity}
                            </p>
                          </div>
                        )}

                        {item.duration && (
                          <div className="rounded-[16px] border border-[#dfe9e7] bg-white/75 px-3.5 py-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                              Durée
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-[#355f64]">
                              {item.duration}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {item.alternatives?.length ? (
                      <div className="rounded-[18px] border border-[#d8e9e5] bg-white/80 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#287b78]">
                          Alternatives adaptées
                        </p>

                        <div className="mt-2 space-y-1.5">
                          {item.alternatives.map((alternative) => (
                            <div
                              key={alternative}
                              className="flex items-start gap-2 text-[11px] leading-5 text-[#355f64]"
                            >
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#287b78]" />
                              <span>{alternative}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {item.basedOn?.length ? (
                      <div className="rounded-[18px] border border-[#e3e8e7] bg-white/70 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#668083]">
                          Ce qu’Otavio a pris en compte
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.basedOn.map((factor) => (
                            <span
                              key={factor}
                              className="rounded-full border border-[#d5e5e1] bg-[#f5faf8] px-2.5 py-1.5 text-[10px] font-medium text-[#48686c]"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {item.safetyNote && (
                      <div className="rounded-[18px] border border-[#eadfbe] bg-[#fffbf0] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a7a18]">
                          À garder en tête
                        </p>
                        <p className="mt-2 text-[11px] leading-5 text-[#75652d]">
                          {item.safetyNote}
                        </p>
                      </div>
                    )}

                    {item.source && (
                      <div className="border-t border-[#dfe9e7] pt-3">
                        <p className="text-[10px] leading-5 text-[#718487]">
                          Référence : {item.source}
                        </p>
                      </div>
                    )}

                    <p className="pt-1 text-[10px] leading-5 text-[#718487]">
                      Les recommandations Otavio sont informatives et ne
                      constituent pas un diagnostic médical.
                    </p>
                  </div>
                )}
              </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#948f87]">
              Explorer
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
              Tous vos conseils
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className="group rounded-[26px] border border-[#cbdad7] bg-[linear-gradient(145deg,#ffffff_0%,#fbfdfc_100%)] p-4 text-left shadow-[0_10px_28px_rgba(36,78,70,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(36,78,70,0.08)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e8f8f3_0%,#d8eee7_100%)] text-[#287f72] shadow-[0_6px_16px_rgba(40,127,114,0.08)] transition group-hover:scale-[1.03]">
                    <Icon size={18} strokeWidth={1.7} />
                  </div>
                  <p className="mt-4 text-[13px] font-semibold">{item.label}</p>
                  <p className="mt-1 text-[10px] text-[#6f8587]">
                    Voir les conseils
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-[#cbdad7] bg-[linear-gradient(145deg,#ffffff_0%,#f9fcfa_100%)] p-6 shadow-[0_14px_34px_rgba(36,78,70,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f8f5]">
                <SunMedium size={18} strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a948b]">
                  Votre tendance
                </p>
                <h3 className="mt-1 text-[17px] font-semibold">
                  Vous progressez bien
                </h3>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Peau", "82", "+6"],
                ["Hydratation", "74", "+9"],
                ["Fatigue", "68", "-4"],
                ["Équilibre", "79", "+3"],
              ].map(([label, value, trend]) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-[#cfe1dd] bg-[linear-gradient(145deg,#f8fcfa_0%,#eef8f4_100%)] px-3.5 py-3.5 shadow-[0_5px_14px_rgba(36,78,70,0.035)]"
                >
                  <p className="text-[10px] text-[#8d887f]">{label}</p>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <p className="text-lg font-semibold">{value}</p>
                    <p className="text-[10px] font-semibold text-[#6b675f]">
                      {trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#cbc7df] bg-[linear-gradient(135deg,#f5f2ff_0%,#eaf8f4_100%)] p-6 shadow-[0_14px_34px_rgba(82,75,130,0.07)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
              <UserRound size={18} strokeWidth={1.7} />
            </div>

            <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">
              Votre personnalisation
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-[#587174]">
              Plus votre historique s’enrichit, plus Otavio pourra adapter
              précisément les conseils qui vous sont proposés.
            </p>

            <Link
              href="/profil"
              className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold"
            >
              Compléter mon profil
              <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#9a958d]">
          Les observations et conseils proposés par Otavio sont informatifs
          et ne constituent pas un diagnostic médical. Ils ne remplacent pas
          l’avis, l’examen ou le suivi d’un professionnel de santé.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d9e1df] bg-white/92 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(36,78,70,0.06)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#183d48]"
          >
            <Sparkles size={18} strokeWidth={2} />
            <span className="text-[9px] font-medium">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#123544] to-[#287f88] text-white shadow-[0_12px_30px_rgba(18,53,68,0.24)] ring-4 ring-white"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#6b8183]"
          >
            <UserRound size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
