"use client";

import { useEffect } from "react";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const audio = new Audio("/sounds/click.mp3");
    audio.volume = 0.3;

    const handler = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return <>{children}</>;
}