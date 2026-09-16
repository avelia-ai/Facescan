"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const videos = [
  "/otavio/programme.mp4",
  "/otavio/programme2.mp4",
  "/otavio/programme3.mp4",
  "/otavio/chargement.mp4",
];

export default function OnboardingFinalisationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState(0);

  const isLoadingVideo = currentVideo === 3;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    video.play().catch(() => {});
  }, [currentVideo]);

  const handleEnded = () => {
    if (currentVideo < videos.length - 1) {
      setCurrentVideo((value) => value + 1);
    } else {
      router.replace("/");
    }
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-white">
      <video
        ref={videoRef}
        src={videos[currentVideo]}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        className="absolute inset-0 h-full w-full object-contain bg-white"
      />

      {isLoadingVideo && (
        <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center">
          <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 shadow-md backdrop-blur-sm">
            <span className="text-sm font-medium text-[#102f3a]">
              Chargement
            </span>

            <span className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#168f91] animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#168f91] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#168f91] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
