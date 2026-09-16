"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ShieldCheck,
  ScanFace,
  Sparkles,
} from "lucide-react";

const steps = [
  "Vérification de l’image",
  "Détection du visage",
  "Analyse des zones",
  "Préparation des résultats",
];

export default function AnalysePage() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 1200),
      window.setTimeout(() => setStep(2), 2400),
      window.setTimeout(() => setStep(3), 3600),
      window.setTimeout(() => setStep(4), 4800),
      window.setTimeout(() => {
        window.location.href = "/resultats";
      }, 5600),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const progress = Math.min(100, step * 25);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#102f39] via-[#174f5b] to-[#4b4a86] text-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#72f0dc]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#aaa5ff]/15 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl">
          <div className="text-center">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-[36px] border border-white/15 bg-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.20)]">
              <video
                src="/otavio/analyse.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 shadow-[0_0_45px_rgba(102,229,215,0.12)] backdrop-blur-md px-3 py-1.5 text-[10px] text-white/70">
              <ShieldCheck size={13} strokeWidth={1.7} className="text-[#72f0dc]" />
              Analyse privée
            </div>

            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
              Analyse en cours
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Votre visage est en cours d’analyse
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-[13px] leading-6 text-white/65">
              Otavio prépare vos indicateurs à partir de l’image que vous
              venez de sélectionner.
            </p>
          </div>

          <section className="mt-10 rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_60px_rgba(5,35,43,0.20)] backdrop-blur-md sm:p-7">
            <div className="space-y-3">
              {steps.map((label, index) => {
                const number = index + 1;
                const completed = step >= number;
                const active = step === index;

                return (
                  <div
                    key={label}
                    className={`flex items-center gap-4 rounded-[20px] border px-4 py-4 transition-all ${
                      completed
                        ? "border-[#72f0dc]/20 bg-white/[0.10] shadow-[0_8px_25px_rgba(75,220,204,0.06)]"
                        : active
                          ? "border-white/15 bg-white/[0.08]"
                          : "border-white/8 bg-white/[0.035]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-[#72f0dc] text-[#123842] shadow-[0_0_20px_rgba(114,240,220,0.18)]"
                          : active
                            ? "border border-[#72f0dc]/60 text-[#b9fff6] shadow-[0_0_18px_rgba(114,240,220,0.10)]"
                            : "border border-white/12 text-white/45"
                      }`}
                    >
                      {completed ? (
                        <Check size={16} strokeWidth={2.2} />
                      ) : (
                        <span className="text-[11px] font-semibold">
                          {number}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] font-medium ${
                          completed || active
                            ? "text-white"
                            : "text-white/45"
                        }`}
                      >
                        {label}
                      </p>

                      {active && !completed && (
                        <p className="mt-1 text-[10px] text-white/45">
                          En cours…
                        </p>
                      )}
                    </div>

                    {active && !completed && (
                      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#72f0dc] shadow-[0_0_14px_rgba(114,240,220,0.65)]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-7">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#72f0dc] via-[#63d9d4] to-[#aaa5ff] shadow-[0_0_14px_rgba(114,240,220,0.35)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/45">
                  Analyse en cours
                </span>
                <span className="text-[10px] font-semibold text-white/70">
                  {progress} %
                </span>
              </div>
            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4 shadow-[0_12px_35px_rgba(5,35,43,0.12)] backdrop-blur-sm">
            <Sparkles
              size={17}
              strokeWidth={1.6}
              className="mt-0.5 shrink-0 text-white/65"
            />

            <p className="text-[11px] leading-5 text-white/70">
              Cette étape est actuellement simulée. Le moteur d’analyse réel
              sera connecté ultérieurement.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
