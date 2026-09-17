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

        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("activity_level")
          .eq("id", user.id)
          .maybeSingle();

        setProfile((data ?? null) as Profile | null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="app-background min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
          <p className="text-sm font-medium text-white/75">
            Préparation de votre espace activité…
          </p>
        </div>
      </main>
    );
  }

  const activity = profile?.activity_level ?? null;

  return (
    <main className="app-background min-h-screen pb-12">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-medium text-white backdrop-blur-md transition hover:bg-white/15"
        >
          <ArrowLeft size={14} />
          Accueil
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-sm">
              <Activity size={21} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                Votre quotidien
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-white">
                Activité & mouvement
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
            Votre niveau de mouvement et votre pratique sportive peuvent aider
            Otavio à ajuster vos recommandations au quotidien.
          </p>
        </header>

        <section className="mt-7 overflow-hidden rounded-[28px] border border-[#a9d1cb] bg-white shadow-[0_18px_45px_rgba(24,70,76,0.08)]">
          <div className="bg-[linear-gradient(135deg,#edf9f6_0%,#d9eee9_100%)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#168f91]">
                  Votre niveau actuel
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#183d48]">
                  {getActivityLabel(activity)}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#168f91] shadow-sm">
                <Footprints size={20} strokeWidth={1.8} />
              </div>
            </div>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f7278]">
              {getActivityDescription(activity)}
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            <div className="rounded-2xl bg-[#f6fbfa] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#168f91] shadow-sm">
                <Footprints size={18} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#718088]">
                Mouvement
              </p>
              <p className="mt-1 text-sm font-semibold text-[#183d48]">
                À suivre
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f7fd] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6d68b6] shadow-sm">
                <Dumbbell size={18} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#718088]">
                Sport
              </p>
              <p className="mt-1 text-sm font-semibold text-[#183d48]">
                À personnaliser
              </p>
            </div>

            <div className="rounded-2xl bg-[#fff8f4] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#b76b58] shadow-sm">
                <Timer size={18} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#718088]">
                Régularité
              </p>
              <p className="mt-1 text-sm font-semibold text-[#183d48]">
                À construire
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-[#d9e5e2] bg-white p-5 shadow-[0_12px_30px_rgba(30,70,75,0.055)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf8f6] text-[#168f91]">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#183d48]">
                Ce qu’Otavio pourra suivre
              </p>

              <p className="mt-2 text-xs leading-5 text-[#718088]">
                Fréquence de pratique, mouvement quotidien, récupération et
                progression pourront progressivement enrichir votre
                accompagnement.
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
      </div>
    </main>
  );
}
