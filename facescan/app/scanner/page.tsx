"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Image as ImageIcon,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { analyzeScanPhoto } from "@/lib/scan-analysis";
import { detectFace } from "@/lib/face-detector";
import { buildVisualAnalysis } from "@/lib/visual-analysis";

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraActive(false);
      setError(
        "La caméra n’est pas disponible dans ce navigateur. Utilisez Chrome ou Safari en HTTPS, ou sélectionnez une photo."
      );
      return;
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1080 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error("Impossible d’initialiser l’aperçu caméra.");
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) {
          resolve();
          return;
        }

        video.onloadedmetadata = () => resolve();
      });

      await video.play();

      setCameraActive(true);
    } catch (cameraError) {
      console.error("Camera error:", cameraError);
      stopCamera();
      setCameraActive(false);

      const name =
        cameraError instanceof DOMException ? cameraError.name : "";

      if (name === "NotAllowedError") {
        setError(
          "L’accès à la caméra a été refusé. Autorisez la caméra dans les réglages du navigateur puis réessayez."
        );
      } else if (name === "NotFoundError") {
        setError(
          "Aucune caméra n’a été détectée sur cet appareil. Vous pouvez sélectionner une photo."
        );
      } else if (name === "NotReadableError") {
        setError(
          "La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez."
        );
      } else {
        setError(
          "Impossible d’accéder à la caméra. Vous pouvez sélectionner une photo depuis votre appareil."
        );
      }
    }
  }
  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || !cameraActive) return;

    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    if (!context) return;

    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;

    context.drawImage(video, x, y, size, size, 0, 0, size, size);

    const image = canvas.toDataURL("image/jpeg", 0.9);
    sessionStorage.setItem("facescan-scan-photo", image);
    setPhoto(image);
    stopCamera();
    setCameraActive(false);
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result as string;
      sessionStorage.setItem("facescan-scan-photo", image);
      setPhoto(image);
      stopCamera();
      setCameraActive(false);
      setError(null);
    };

    reader.readAsDataURL(file);
  }

  function retake() {
    sessionStorage.removeItem("facescan-scan-photo");
    setPhoto(null);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    startCamera();
  }

  async function startAnalysis() {
    if (!photo) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setError(null);

    try {
      const photoAnalysis = await analyzeScanPhoto(photo);

      setAnalysisStep(2);

      const faceAnalysis = await detectFace(photo);

      if (!faceAnalysis.detected) {
        setIsAnalyzing(false);
        setAnalysisStep(0);
        setError(
          "Aucun visage suffisamment visible n’a été détecté. Essayez une photo plus nette, prise de face et bien éclairée."
        );
        return;
      }

      if (faceAnalysis.faceCount > 1) {
        setIsAnalyzing(false);
        setAnalysisStep(0);
        setError(
          "Plusieurs visages ont été détectés. Utilisez une photo avec un seul visage."
        );
        return;
      }

      setAnalysisStep(3);

      const visualAnalysis = await buildVisualAnalysis(
        photo,
        photoAnalysis,
        faceAnalysis
      );

      const existingScans = JSON.parse(
        localStorage.getItem("facescan-scans") || "[]"
      );

      const scan = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        score: visualAnalysis.indicators.equilibre,
        quality: photoAnalysis,
        faceDetection: faceAnalysis,
        visualSignals: visualAnalysis.visualSignals,
        indicators: visualAnalysis.indicators,
      };

      const scansToStore = [scan, ...existingScans]
        .map((item: any) => {
          const { photo: _photo, ...metadata } = item;
          return metadata;
        })
        .slice(0, 20);

      try {
        localStorage.setItem(
          "facescan-scans",
          JSON.stringify(scansToStore)
        );
      } catch (storageError) {
        console.error("Scan storage error:", storageError);

        localStorage.removeItem("facescan-scans");

        localStorage.setItem(
          "facescan-scans",
          JSON.stringify([scan])
        );
      }

      window.location.href = "/analyse";
    } catch (error) {
      console.error("Otavio analysis error:", error);

      let message = "Analyse impossible. Veuillez réessayer.";

      if (error instanceof Error) {
        message = `Erreur : ${error.name} — ${error.message}`;
      } else {
        message = `Erreur : ${String(error)}`;
      }

      setIsAnalyzing(false);
      setAnalysisStep(0);
      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#17202a]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce5e4] bg-white shadow-[0_8px_25px_rgba(30,55,60,0.06)] transition hover:bg-[#f4faf9]"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex items-center gap-2">
          <ScanFace size={20} strokeWidth={1.7} className="text-[#287f86]" />
          <span className="text-sm font-semibold tracking-tight">
            Otavio
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* Main */}
      <section className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-12 pt-4 md:px-8">
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#438287]">
            Analyse visuelle
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Votre visage, aujourd&apos;hui.
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#668083]">
            Prenez une photo de votre visage pour obtenir une analyse visuelle
            personnalisée et suivre votre évolution dans le temps.
          </p>
        </div>

        {/* Scanner */}
        <div className="mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#102f39] via-[#154b58] to-[#176f78] shadow-[0_28px_75px_rgba(24,76,87,0.22)]">
            <div className="relative aspect-square">

              {isAnalyzing ? (
                <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-[#123842] via-[#174f5b] to-[#3f497e] px-5 py-8 text-center">
                  <div className="flex min-h-screen w-full items-center justify-center">
                    <div className="w-full max-w-sm">
                    <div className="mx-auto h-28 w-28 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.16)]">
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

                    <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-[#9ce8df]">
                      Analyse en cours
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      Votre visage est en cours d’analyse
                    </h2>

                    <p className="mt-3 text-[12px] leading-5 text-white/65">
                      Quelques instants pour préparer vos indicateurs.
                    </p>

                    <div className="mt-6 space-y-2 text-left">
                      {[
                        "Vérification de l’image",
                        "Détection du visage",
                        "Analyse des zones",
                        "Préparation des résultats",
                      ].map((step, index) => {
                        const stepNumber = index + 1;
                        const done = analysisStep >= stepNumber;
                        const active = analysisStep === index;

                        return (
                          <div
                            key={step}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 backdrop-blur-sm px-3.5 py-3"
                          >
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                done
                                  ? "bg-white text-[#171716]"
                                  : active
                                    ? "border border-white/30 text-white"
                                    : "border border-white/10 text-white/25"
                              }`}
                            >
                              {done ? (
                                <Check size={14} strokeWidth={2.2} />
                              ) : (
                                <span className="text-[10px] font-semibold">
                                  {stepNumber}
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-[11px] ${
                                done || active
                                  ? "text-white"
                                  : "text-white/40"
                              }`}
                            >
                              {step}
                            </span>

                            {active && !done && (
                              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-white" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#72f0dc] to-[#a9a5ff] transition-all duration-700"
                        style={{
                          width: `${Math.min(100, analysisStep * 25)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[10px] text-white/40">
                      {Math.min(100, analysisStep * 25)} %
                    </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {photo ? (
                    <img
                      src={photo}
                      alt="Aperçu de votre visage"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                          <div>
                            <Camera
                              size={42}
                              strokeWidth={1.4}
                              className="mx-auto mb-4 text-white/70"
                            />
                            <p className="text-sm text-white/75">
                              La caméra sera utilisée uniquement pour réaliser
                              votre scan.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!photo && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative h-[72%] w-[54%] rounded-[48%] border-2 border-[#8df1e4]/85 shadow-[0_0_35px_rgba(101,232,218,0.18)]">
                        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-[#8df1e4]/85" />
                        <div className="absolute bottom-0 left-1/2 h-5 w-px -translate-x-1/2 translate-y-1/2 bg-[#8df1e4]/85" />
                        <div className="absolute left-0 top-1/2 h-px w-5 -translate-x-1/2 bg-[#8df1e4]/85" />
                        <div className="absolute right-0 top-1/2 h-px w-5 translate-x-1/2 bg-[#8df1e4]/85" />
                      </div>
                    </div>
                  )}

                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <div className="rounded-full border border-white/15 bg-[#123842]/65 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-md">
                      {photo ? "Photo sélectionnée" : "Positionnez votre visage"}
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#123842]/65 px-3 py-1.5 text-[11px] text-white shadow-lg backdrop-blur-md">
                      <ShieldCheck size={13} />
                      Privé
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0b252d]/90 via-[#123842]/35 to-transparent px-6 pb-6 pt-20">
                    {photo ? (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={retake}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
                        >
                          <RotateCcw size={16} />
                          Reprendre
                        </button>

                        <button
                          onClick={startAnalysis}
                          disabled={!photo}
                          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#174c58] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f4fffd] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Sparkles size={16} />
                          Analyser mon visage
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-5">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
                          aria-label="Choisir une photo"
                        >
                          <ImageIcon size={19} />
                        </button>

                        <button
                          onClick={capturePhoto}
                          disabled={!cameraActive}
                          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white/85 bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.10),0_12px_35px_rgba(0,0,0,0.20)] transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Prendre une photo"
                        >
                          <span className="h-[56px] w-[56px] rounded-full border border-[#c9d8d7] bg-white" />
                        </button>

                        <div className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              "Regardez face à l'écran",
              "Visage entièrement visible",
              "Lumière uniforme",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-[20px] border border-[#dfe7e6] bg-white px-3 py-3 text-center shadow-[0_8px_25px_rgba(35,55,60,0.045)]"
              >
                <div className="mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f8f5]">
                  <Check size={13} />
                </div>
                <p className="text-[11px] leading-4 text-[#668083]">{item}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-[#c9d8d7] bg-white px-4 py-3 text-center text-xs leading-5 text-black/60">
              {error}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFile}
            className="hidden"
          />

          <p className="mx-auto mt-6 max-w-md text-center text-[11px] leading-5 text-[#718486]">
            Otavio fournit des observations visuelles à titre informatif.
            Elles ne constituent pas un diagnostic médical et ne remplacent
            pas l&apos;avis d&apos;un professionnel de santé.
          </p>
        </div>
      </section>
    </main>
  );
}
