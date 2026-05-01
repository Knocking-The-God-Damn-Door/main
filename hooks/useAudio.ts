"use client";

import { useRef, useCallback, useEffect } from "react";

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = () => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0;
      }

      audioRef.current.play().catch(() => {
        // Silently fail — audio file may not exist yet
      });

      // Fade in to 0.4 over ~1.2 seconds (60ms × 20 steps)
      clearFade();
      let vol = 0;
      fadeRef.current = setInterval(() => {
        if (!audioRef.current) return;
        vol = Math.min(vol + 0.02, 0.4);
        audioRef.current.volume = vol;
        if (vol >= 0.4) clearFade();
      }, 60);
    } catch {
      // Silently fail
    }
  }, [src]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    clearFade();
    const audio = audioRef.current;
    let vol = audio.volume;
    fadeRef.current = setInterval(() => {
      vol = Math.max(vol - 0.02, 0);
      audio.volume = vol;
      if (vol <= 0) {
        audio.pause();
        clearFade();
      }
    }, 60);
  }, []);

  useEffect(() => {
    return () => {
      clearFade();
      audioRef.current?.pause();
    };
  }, []);

  return { play, stop };
}
