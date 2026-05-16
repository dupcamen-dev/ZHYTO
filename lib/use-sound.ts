"use client";

import { useRef, useCallback } from "react";

const SOUND_URL = "/sounds/click.mp3";

export function useSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(SOUND_URL);
      audioRef.current.volume = 0.3;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  return play;
}