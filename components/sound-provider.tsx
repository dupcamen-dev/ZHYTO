"use client";

import { useEffect, useRef } from "react";
import { BASE_PATH } from "@/lib/constants";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(`${BASE_PATH}/sounds/click.mp3`);
    audioRef.current.volume = 0.3;
    audioRef.current.load();

    const handler = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return <>{children}</>;
}