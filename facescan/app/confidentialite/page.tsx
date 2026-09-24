"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronRight,
  Database,
  Download,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type StoredData = {
  profile: unknown;
  goals: unknown;
  scans: unknown;
  preferences: {
    scanFrequency: number | null;
    readNotifications: string[];
  };
};

export default function ConfidentialitePage() {
  const [data, setData] = useState<StoredData | null>(null);
  const [showData, setShowData] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadLocalData = async () => {
      let profile: unknown = null;

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (authData.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

          profile = profileData ?? null;
        }
      } catch {
        profile = null;
      }

      const storedScans = localStorage.getItem("facescan-scans");
      const storedGoals = localStorage.getItem("facescan-goals");

      let currentUserId: string | null = null;
      let storedFrequency: string | null = null;

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (authData.user) {
          currentUserId = authData.user.id;
          storedFrequency = localStorage.getItem(
            `facescan-scan-frequency-${authData.user.id}`
          );
        }
      } catch {
        storedFrequency = null;
      }

      let readNotifications: string[] = [];

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (authData.user) {
          const storedRead = localStorage.getItem(
            `facescan-read-notifications-${authData.user.id}`,
          );

          if (storedRead) {
            const parsed = JSON.parse(storedRead);
            if (Array.isArray(parsed)) {
              readNotifications = parsed;
            }
          }
        }
      } catch {
        readNotifications = [];
      }

      let scans: unknown = [];
      let goals: unknown = [];

      try {
        scans = storedScans ? JSON.parse(storedScans) : [];
      } catch {
        scans = [];
      }

      try {
        goals = storedGoals ? JSON.parse(storedGoals) : [];
      } catch {
        goals = [];
      }

      setData({
        profile,
        goals,
        scans,
        preferences: {
          scanFrequency: storedFrequency ? Number(storedFrequency) : null,
          readNotifications,
        },
      });
    };

    void loadLocalData();
  }, []);

  const counts = useMemo(() => {
    const scans = Array.isArray(data?.scans) ? data.scans : [];
    const goals = Array.isArray(data?.goals) ? data.goals : [];

    return {
      scans: scans.length,
      goals: goals.length,
      hasProfile: Boolean(data?.profile),
      readNotifications: data?.preferences.readNotifications.length ?? 0,
    };
  }, [data]);

  const buildExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      app: "FaceScan",
      data: data ?? {
        profile: null,
        goals: [],
        scans: [],
        preferences: {
          scanFrequency: null,
          readNotifications: [],
        },
      },
    };

    const blob = new Blob(
      [JSON.stringify(exportPayload, null, 2)],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `facescan-donnees-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setActionMessage("Vos données ont été préparées et téléchargées.");
  };

  const deleteData = async () => {
    setIsDeleting(true);
    setActionMessage("");

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      const keys = [
        "facescan-scans",
        "facescan-goals",
        "facescan-scan-photo",
        "facescan-scan-frequency",
      ];

      keys.forEach((key) => localStorage.removeItem(key));

      if (authData.user) {
        localStorage.removeItem(
          `facescan-scan-frequency-${authData.user.id}`
        );
      }

      if (authData.user) {
        localStorage.removeItem(
          `facescan-read-notifications-${authData.user.id}`,
        );

        await supabase.auth.signOut();
      }

      setData({
        profile: null,
        goals: [],
        scans: [],
        preferences: {
          scanFrequency: null,
          readNotifications: [],
        },
      });

      setShowDeleteConfirm(false);
      setActionMessage(
        "Les données locales FaceScan ont été supprimées. Vous allez être redirigé.",
      );

      window.setTimeout(() => {
        window.location.href = "/connexion";
      }, 1200);
    } catch {
      setActionMessage(
        "La suppression n'a pas pu être terminée. Réessayez.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="app-background min-h-screen text-[#17202a] pb-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between pt-7 sm:pt-9">
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)]"
              aria-label="Retour au profil"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f8587]">
                Otavio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                Confidentialité
              </h1>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ShieldCheck size={18} strokeWidth={1.7} />
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#183d48] via-[#195263] to-[#167b82] p-6 text-white shadow-[0_24px_60px_rgba(23,76,87,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#63e4d4]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#8d8df5]/20 blur-3xl" />

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
              <LockKeyhole size={20} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Protection des données
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                Vous gardez le contrôle.
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-white/70">
            Consultez les données utilisées par FaceScan, téléchargez une
            copie de votre historique ou supprimez les données enregistrées
            localement sur cet appareil.
          </p>
        </section>

        <section className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#668083]">
            Vos données
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Ce qui est associé à votre suivi
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: ScanFace,
                title: "Analyses visuelles",
                text: "Vos scans et les résultats associés.",
              },
              {
                icon: TrendingUp,
                title: "Historique d’évolution",
                text: "Les scores et tendances enregistrés au fil du temps.",
              },
              {
                icon: UserRound,
                title: "Profil et objectifs",
                text: "Les informations utilisées pour personnaliser l’expérience.",
              },
              {
                icon: Sparkles,
                title: "Préférences",
                text: "Vos choix de suivi, conseils et notifications.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(35,55,60,0.045)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-[14px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 space-y-3">
          <button
            type="button"
            onClick={() => {
              setShowData((current) => !current);
              setActionMessage("");
            }}
            className="group flex w-full items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 text-left shadow-[0_10px_30px_rgba(35,55,60,0.045)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
              <Database size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Gérer mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                Consulter les informations conservées pour votre compte.
              </p>
            </div>

            {showData ? (
              <X size={16} strokeWidth={1.8} className="text-[#718789]" />
            ) : (
              <ChevronRight
                size={16}
                strokeWidth={1.8}
                className="text-[#718789]"
              />
            )}
          </button>

          {showData && (
            <div className="rounded-[22px] border border-[#e0e9e7] bg-[#f8fbfa] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#718789]">
                    Profil
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {counts.hasProfile ? "Présent" : "Non disponible"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#718789]">
                    Scans
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {counts.scans}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#718789]">
                    Objectifs
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {counts.goals}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#718789]">
                    Préférences
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {data?.preferences.scanFrequency
                      ? `Scan tous les ${data.preferences.scanFrequency} jours`
                      : "Valeurs par défaut"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={buildExportData}
            className="flex w-full items-center gap-4 rounded-[22px] border border-[#e0e9e7] bg-white p-5 text-left shadow-[0_10px_30px_rgba(35,55,60,0.045)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f5]">
              <Download size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Télécharger mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#587174]">
                Télécharger une copie de vos données disponibles.
              </p>
            </div>

            <ChevronRight
              size={16}
              strokeWidth={1.8}
              className="text-[#718789]"
            />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-4 rounded-[22px] border border-[#ead6d1] bg-[#fff4f1] p-5 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/85">
              <Trash2 size={19} strokeWidth={1.7} />
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold">
                Supprimer mes données
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#755f5a]">
                Supprimer les données FaceScan enregistrées sur cet appareil.
              </p>
            </div>

            <ChevronRight
              size={16}
              strokeWidth={1.8}
              className="text-[#9a7770]"
            />
          </button>
        </section>

        {actionMessage && (
          <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-[#cfe7df] bg-[#effaf6] p-4 text-[12px] text-[#3f6860]">
            <Check size={17} strokeWidth={2} />
            <span>{actionMessage}</span>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="mt-5 rounded-[24px] border border-[#ead6d1] bg-white p-5 shadow-[0_15px_45px_rgba(70,50,45,0.08)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0ec]">
                <Trash2 size={18} strokeWidth={1.8} />
              </div>

              <div className="flex-1">
                <h3 className="text-[15px] font-semibold">
                  Confirmer la suppression
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#755f5a]">
                  Les scans, objectifs, préférences locales et données de
                  notification enregistrées sur cet appareil seront supprimés.
                  Cette action vous déconnectera également du compte.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border border-[#dce5e4] bg-white px-4 py-3 text-[12px] font-semibold"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => void deleteData()}
                disabled={isDeleting}
                className="flex-1 rounded-2xl bg-[#8d5147] px-4 py-3 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        )}

        <section className="mt-8 rounded-[26px] bg-gradient-to-br from-[#f0edff] to-[#e8f8f4] p-6 shadow-[0_12px_35px_rgba(70,80,130,0.07)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80">
              <ShieldCheck size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668083]">
                Principe
              </p>

              <h3 className="mt-1 text-[16px] font-semibold">
                Transparence avant tout
              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#587174]">
                Vous pouvez consulter les données disponibles, en télécharger
                une copie et supprimer les données locales utilisées par
                l’expérience FaceScan.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 max-w-3xl text-[10px] leading-5 text-[#718789]">
          L’export concerne les données accessibles depuis cette interface.
          Les données éventuellement conservées côté serveur Supabase
          nécessiteront une gestion dédiée avant la mise en production.
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dce5e4] bg-white/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-between">
          <Link
            href="/"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <Activity size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Accueil</span>
          </Link>

          <Link
            href="/conseils"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Conseils</span>
          </Link>

          <div className="flex w-16 flex-col items-center gap-1">
            <Link
              href="/scanner"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#176678] to-[#756bd4] text-white shadow-[0_10px_28px_rgba(34,91,105,0.28)]"
              aria-label="Scanner"
            >
              <ScanFace size={21} strokeWidth={1.8} />
            </Link>
            <span className="text-[9px]">Scanner</span>
          </div>

          <Link
            href="/evolution"
            className="flex w-16 flex-col items-center gap-1.5 text-[#668083]"
          >
            <TrendingUp size={18} strokeWidth={1.8} />
            <span className="text-[9px]">Évolution</span>
          </Link>

          <Link
            href="/profil"
            className="flex w-16 flex-col items-center gap-1.5 text-[#171717]"
          >
            <UserRound size={18} strokeWidth={2} />
            <span className="text-[9px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
