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

        let loadedScan = false;

        try {
          const { data: scans, error: scansError } = await supabase
            .from("scans")
            .select("id, created_at, score, indicators")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (scansError) throw scansError;

          const latestScan = Array.isArray(scans) ? scans[0] : null;
          if (latestScan?.indicators) {
            setScan(latestScan.indicators);
            loadedScan = true;
          }
        } catch {
          loadedScan = false;
        }

        if (!loadedScan) {
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
        }
      } catch {
        setProfile({});
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const skinPlan = buildOtavioSkinPlan(profile ?? {}, scan, 7);
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#c9dfe4]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b8580]">
              Otavio
            </p>
            <h1 className="text-xl font-semibold text-white">Peau</h1>
          </div>

          <div className="h-10 w-10 rounded-full bg-[#dff3f1] flex items-center justify-center">
            <Sparkles size={18} className="text-[#39715f]" />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_48%,#12a6a6_72%,#7767e8_100%)] text-white p-6 shadow-[0_20px_48px_rgba(8,126,164,0.18)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#42cfc2]/22 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[#ff8066]/20 blur-3xl" />
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                <Sparkles size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wider">
                  Votre programme
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  Une routine adaptée à votre peau
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
                aria-label="Otavio vous accompagne"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
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
          <div className="rounded-2xl bg-white border border-[#c9dfe4] p-4">
            <Droplets size={18} className="text-[#39715f] mb-3" />
            <p className="text-xs text-[#8a928e]">Routine</p>
            <p className="font-semibold mt-1">Matin + soir</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#c9dfe4] p-4">
            <ShieldCheck size={18} className="text-[#39715f] mb-3" />
            <p className="text-xs text-[#8a928e]">Approche</p>
            <p className="font-semibold mt-1">Progressive</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#c9dfe4] p-4">
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
                className="rounded-2xl bg-white border border-[#c9dfe4] p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#dff3f1] flex items-center justify-center">
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

                      <span className="text-[10px] px-2 py-1 rounded-full bg-[#ffe2d9] text-[#d96550] whitespace-nowrap">
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
                    ? "bg-[linear-gradient(135deg,#0b5876_0%,#087ea4_48%,#12a6a6_72%,#7767e8_100%)] text-white border-[#18352d]"
                    : "bg-white border-[#c9dfe4] text-[#355763]"
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

        <section className="mt-7 rounded-2xl bg-white border border-[#c9dfe4] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#dff3f1] flex items-center justify-center">
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
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff8066] shrink-0" />
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
