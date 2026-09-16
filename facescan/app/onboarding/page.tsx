"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  useEffect(() => {
    if (checkingAuth) return;

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});
  }, [checkingAuth]);

  if (checkingAuth) {
    return <main className="fixed inset-0 bg-black" />;
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/onboarding0.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => router.push("/onboarding/1")}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={() => router.push("/onboarding/1")}
        className="absolute right-5 top-5 z-20 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-md"
      >
        Passer
      </button>
    </main>
  );
}
