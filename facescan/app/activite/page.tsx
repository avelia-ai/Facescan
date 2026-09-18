"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Footprints,
  Sparkles,
  Timer,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  activity_level: string | null;
};

const activityLabels: Record<string, string> = {
  sedentary: "Sédentaire",
  sedentaire: "Sédentaire",
  low: "Peu actif",
  faible: "Peu actif",
  moderate: "Actif",
  modere: "Actif",
  active: "Très actif",
  actif: "Très actif",
  very_active: "Très actif",
  tres_actif: "Très actif",
};

function getActivityLabel(value: string | null) {
  if (!value) return "À personnaliser";
  return activityLabels[value] ?? value;
}

function getActivityDescription(value: string | null) {
  switch (value) {
    case "sedentary":
    case "sedentaire":
      return "Otavio peut vous aider à remettre davantage de mouvement dans votre quotidien, progressivement.";
    case "low":
    case "faible":
      return "Votre niveau d’activité laisse de la place pour augmenter progressivement le mouvement au quotidien.";
    case "moderate":
    case "modere":
      return "Votre niveau d’activité constitue une bonne base pour structurer une routine régulière.";
    case "active":
    case "actif":
      return "Vous avez déjà une activité régulière. Otavio peut vous aider à mieux structurer votre récupération et votre progression.";
    case "very_active":
    case "tres_actif":
      return "Votre activité est élevée. L’objectif est surtout de préserver l’équilibre entre effort, récupération et régularité.";
    default:
      return "Votre niveau d’activité sera utilisé pour personnaliser progressivement vos recommandations.";
  }
}

export default function ActivitePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile({ activity_level: null });
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("activity_level")
          .eq("id", user.id)
          .maybeSingle();

        setProfile((data ?? {}) as Profile);
      } catch {
        setProfile({ activity_level: null });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="app-background flex min-h-screen items-center justify-center">
        <div className="text-sm font-medium text-white/75">
          Préparation de votre programme activité…
        </div>
      </main>
    );
  }

  const activity = profile?.activity_level ?? null;

  return (
    <main className="app-background min-h-screen pb-12 text-[#171717]">
      <div className="mx-auto max-w-3xl px-5 pt-6">
        <header className="mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8ebe9] bg-white shadow-[0_6px_18px_rgba(35,55,60,0.05)] transition hover:-translate-y-0.5"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">
              Activité
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5f2]">
            <Activity size={18} className="text-[#287f72]" />
          </div>
        </header>

        <section className="rounded-[28px] bg-[#18352d] p-6 text-white shadow-[0_20px_48px_rgba(24,53,45,0.16)] sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Activity size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-white/60">
                  Votre programme
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  Une routine adaptée à votre niveau d’activité
                </h2>
              </div>
            </div>

            <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <video
                src="/otavio/video-quotidien.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Otavio vous accompagne dans votre programme activité"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-white/75">
            Otavio adapte progressivement vos recommandations de mouvement,
            d’activité et de récupération à votre rythme quotidien.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Votre niveau actuel
              </p>
              <p className="text-xl font-semibold">
                {getActivityLabel(activity)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="mb-1 text-xs text-white/60">
                Priorité actuelle
              </p>
              <p className="text-sm font-medium leading-5">
                Construire une routine régulière
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#dce7e4] bg-white p-4 shadow-[0_8px_22px_rgba(35,70,60,0.04)]">
            <Footprints size={18} className="mb-3 text-[#287f72]" />
            <p className="text-xs text-[#8a928e]">Mouvement</p>
            <p className="mt-1 font-semibold">À suivre</p>
          </div>

          <div className="rounded-2xl border border-[#dddaf0] bg-white p-4 shadow-[0_8px_22px_rgba(82,75,130,0.04)]">
            <Dumbbell size={18} className="mb-3 text-[#756bd4]" />
            <p className="text-xs text-[#8a928e]">Sport</p>
            <p className="mt-1 font-semibold">À personnaliser</p>
          </div>

          <div className="rounded-2xl border border-[#ead8cf] bg-white p-4 shadow-[0_8px_22px_rgba(120,75,60,0.04)]">
            <Timer size={18} className="mb-3 text-[#b76b58]" />
            <p className="text-xs text-[#8a928e]">Régularité</p>
            <p className="mt-1 font-semibold">À construire</p>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-wider text-[#89918d]">
              Votre niveau
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {getActivityLabel(activity)}
            </h2>
          </div>

          <div className="rounded-[26px] border border-[#dfe8e5] bg-white p-5 shadow-[0_12px_30px_rgba(30,70,65,0.045)]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf8f5] text-[#287f72]">
                <Footprints size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#183d48]">
                  Votre activité aujourd’hui
                </p>
                <p className="mt-2 text-sm leading-6 text-[#718088]">
                  {getActivityDescription(activity)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[26px] border border-[#dfe8e5] bg-white p-5 shadow-[0_12px_30px_rgba(30,70,65,0.045)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf8f5] text-[#287f72]">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#183d48]">
                Ce qu’Otavio peut suivre
              </p>

              <p className="mt-2 text-xs leading-5 text-[#718088]">
                Votre fréquence de pratique, votre mouvement quotidien, votre
                récupération et votre régularité pourront progressivement
                enrichir votre accompagnement.
              </p>
            </div>
          </div>

          <Link
            href="/conseils"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#168f91]"
          >
            Voir mes conseils
            <ArrowRight size={15} />
          </Link>
        </section>

        <p className="mt-5 px-2 text-[11px] leading-5 text-[#8a928e]">
          Les recommandations d’activité proposées par Otavio sont des conseils
          de bien-être et ne remplacent pas l’avis d’un professionnel de santé.
        </p>
      </div>
    </main>
  );
}
