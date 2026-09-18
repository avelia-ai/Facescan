"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun, Clock3, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { buildOtavioSleepPlan } from "@/lib/otavio-sleep";

export default function SommeilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scan, setScan] = useState<any>(null);
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
      } catch {
        setProfile({});
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const sleepPlan = buildOtavioSleepPlan(
    profile ?? {},
    7,
    scan ? { fatigue: scan.fatigue ?? null } : null
  );
  const today = sleepPlan.days[selectedDay - 1] ?? sleepPlan.days[0];

  if (loading) {
    return (
      <main className="app-background min-h-screen flex items-center justify-center">
        <div className="text-sm text-[#777]">Préparation de votre programme…</div>
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
            <h1 className="text-xl font-semibold text-white">Sommeil</h1>
          </div>

          <div className="h-10 w-10 rounded-full bg-[#e8f1ed] flex items-center justify-center">
            <Moon size={18} className="text-[#39715f]" />
          </div>
        </header>

        <section className="rounded-[28px] bg-[#18352d] text-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                <Moon size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wider">
                  Votre programme
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  7 jours pour stabiliser votre sommeil
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
                aria-label="Otavio vous accompagne dans votre programme sommeil"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          <p className="text-sm leading-6 text-white/75 mb-6">
            Otavio adapte progressivement vos horaires et votre routine
            du soir à partir de votre profil actuel.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                <Moon size={14} />
                Coucher cible
              </div>
              <div className="text-2xl font-semibold">
                {sleepPlan.targetBedtime}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                <Sun size={14} />
                Réveil cible
              </div>
              <div className="text-2xl font-semibold">
                {sleepPlan.targetWakeTime}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-[#e8ebe9] p-4">
            <p className="text-xs text-[#8a928e] mb-1">Programme</p>
            <p className="font-semibold">7 jours</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#e8ebe9] p-4">
            <p className="text-xs text-[#8a928e] mb-1">Objectif</p>
            <p className="font-semibold">Régularité</p>
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#89918d]">
                Aujourd’hui
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
                    {action.category === "matin" ? (
                      <Sun size={18} className="text-[#39715f]" />
                    ) : action.category === "soir" ? (
                      <Moon size={18} className="text-[#39715f]" />
                    ) : (
                      <Clock3 size={18} className="text-[#39715f]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-[15px]">
                        {action.title}
                      </h3>

                      <span className="text-xs font-medium text-[#39715f] whitespace-nowrap">
                        {action.time}
                      </span>
                    </div>

                    <p className="text-sm leading-5 text-[#737a76] mt-1.5">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-wider text-[#89918d]">
              Votre progression
            </p>
            <h2 className="text-xl font-semibold mt-1">
              Programme sur 7 jours
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {sleepPlan.days.map((day) => (
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
              <CheckCircle2 size={18} className="text-[#39715f]" />
            </div>

            <div>
              <h2 className="font-semibold">Pourquoi ce programme ?</h2>
              <p className="text-xs text-[#8a928e]">
                Personnalisation Otavio
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sleepPlan.personalization.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-[#666d69]"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#39715f] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
