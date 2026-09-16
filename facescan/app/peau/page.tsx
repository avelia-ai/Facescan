"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Droplets,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { buildOtavioSkinPlan } from "@/lib/otavio-skin";

export default function PeauPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setProfile({});
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

  const skinPlan = buildOtavioSkinPlan(profile ?? {}, null, 7);
  const today = skinPlan.days[selectedDay - 1] ?? skinPlan.days[0];

  if (loading) {
    return (
      <main className="app-background min-h-screen flex items-center justify-center">
        <div className="text-sm text-[#777]">
          Préparation de votre programme…
        </div>
      </main>
    );
  }

  return (
    <main className="app-background min-h-screen text-[#171717] pb-12">
      <div className="mx-auto max-w-3xl px-5 pt-6">

        <header className="flex items-center justify-between mb-7">
          <Link
            href="/conseils"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#e8ebe9]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">Peau</h1>
          </div>

          <div className="h-10 w-10 rounded-full bg-[#edf4f1] flex items-center justify-center">
            <Sparkles size={18} className="text-[#39715f]" />
          </div>
        </header>

        <section className="rounded-[28px] bg-[#18352d] text-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={21} />
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider">
                Votre programme
              </p>
              <h2 className="text-xl font-semibold">
                Une routine adaptée à votre peau
              </h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-white/75 mb-6">
            Otavio construit une routine progressive à partir de votre profil,
            de vos préoccupations et, lorsque disponible, de vos observations
            de scan.
          </p>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-white/60 mb-1">Objectif actuel</p>
            <p className="text-base font-medium leading-6">
              {skinPlan.objective}
            </p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white border border-[#e8ebe9] p-4">
            <Droplets size={18} className="text-[#39715f] mb-3" />
            <p className="text-xs text-[#8a928e]">Routine</p>
            <p className="font-semibold mt-1">Matin + soir</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#e8ebe9] p-4">
            <ShieldCheck size={18} className="text-[#39715f] mb-3" />
            <p className="text-xs text-[#8a928e]">Approche</p>
            <p className="font-semibold mt-1">Progressive</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#e8ebe9] p-4">
            <Sun size={18} className="text-[#39715f] mb-3" />
            <p className="text-xs text-[#8a928e]">Programme</p>
            <p className="font-semibold mt-1">7 jours</p>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#89918d]">
                Programme du jour
              </p>
              <h2 className="text-xl font-semibold mt-1">
                {today?.objective}
              </h2>
            </div>

            <div className="text-xs text-[#89918d]">
              Jour {selectedDay}/7
            </div>
          </div>

          <div className="space-y-3">
            {today?.actions.map((action, index) => (
              <div
                key={`${action.title}-${index}`}
                className="rounded-2xl bg-white border border-[#e8ebe9] p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#edf4f1] flex items-center justify-center">
                    {action.moment === "matin" ? (
                      <Sun size={18} className="text-[#39715f]" />
                    ) : (
                      <MoonIcon />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[15px]">
                          {action.title}
                        </h3>
                        <p className="text-[11px] text-[#8a928e] mt-1 uppercase tracking-wider">
                          {action.moment}
                        </p>
                      </div>

                      <span className="text-[10px] px-2 py-1 rounded-full bg-[#f1f4f2] text-[#39715f] whitespace-nowrap">
                        {action.priority}
                      </span>
                    </div>

                    <p className="text-sm leading-5 text-[#737a76] mt-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="text-xs uppercase tracking-wider text-[#89918d] mb-3">
            Votre semaine
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {skinPlan.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`min-w-[64px] rounded-2xl border px-3 py-3 text-center transition ${
                  selectedDay === day.day
                    ? "bg-[#18352d] text-white border-[#18352d]"
                    : "bg-white border-[#e8ebe9] text-[#555]"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-60">
                  Jour
                </div>
                <div className="text-lg font-semibold mt-0.5">
                  {day.day}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 rounded-2xl bg-white border border-[#e8ebe9] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#edf4f1] flex items-center justify-center">
              <Droplets size={18} className="text-[#39715f]" />
            </div>

            <div>
              <h2 className="font-semibold">Personnalisation Otavio</h2>
              <p className="text-xs text-[#8a928e]">
                Ce qui influence votre programme
              </p>
            </div>
          </div>

          {skinPlan.personalization.length > 0 ? (
            <div className="space-y-2">
              {skinPlan.personalization.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-[#666d69]"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#39715f] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-[#737a76]">
              Complétez votre profil pour permettre à Otavio de rendre votre
              routine plus précise.
            </p>
          )}
        </section>

        <p className="text-[11px] leading-5 text-[#8a928e] mt-5 px-2">
          Les observations cutanées proposées par Otavio sont des observations
          visuelles et des recommandations de bien-être. Elles ne constituent
          pas un diagnostic médical.
        </p>

      </div>
    </main>
  );
}

function MoonIcon() {
  return <span className="text-[#39715f] text-lg">☾</span>;
}
