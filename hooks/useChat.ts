"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, ChatApiRequest, ChatApiResponse } from "@/types";

export function useChat() {
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [doorOpened,    setDoorOpened]    = useState(false);
  const [doorOpenedNow, setDoorOpenedNow] = useState(false);
  const [knockCount,    setKnockCount]    = useState(0);
  // 0-100 arası kapı açıklığı — doğrudan sentiment score'dan türetiliyor
  const [doorOpenness,  setDoorOpenness]  = useState(0);
  // Şu an çalan TTS Audio nesnesi — yeni mesajda durdurulur
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || doorOpened) return;

      // Yeni mesaj gönderilince önceki TTS'i anında kes
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
        currentAudioRef.current = null;
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setDoorOpenedNow(false);

      try {
        const body: ChatApiRequest = {
          message: text.trim(),
          knockCount,
          alreadyOpen: doorOpened,
          history: messages,
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data: ChatApiResponse = await res.json();

        const botMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          sentimentScore: data.sentiment_score,
          isRejection: data.is_rejection,
          isDoorOpening: data.door_opened,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);

        // ── TTS yardımcısı — önceki sesi durdurur, yenisini çalar ──
        const playTTS = (text: string) => {
          // Önceki ses çalıyorsa durdur
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = "";
            currentAudioRef.current = null;
          }

          fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("TTS failed");
              return res.blob();
            })
            .then((blob) => {
              const url   = URL.createObjectURL(blob);
              const audio = new Audio(url);
              currentAudioRef.current = audio;
              audio.play().catch((e) => console.warn("Audio error:", e));
              // Bitince ref'i temizle
              audio.onended = () => { currentAudioRef.current = null; };
            })
            .catch((err) => console.warn("TTS skipped:", err));
        };

        if (data.is_rejection) {
          setKnockCount((c) => c + 1);
          // Rejection metni de ElevenLabs ile seslendirilir
          if (data.message) playTTS(data.message);
        }

        if (data.door_opened) {
          // Kapı tamamen açıldı
          setDoorOpenness(100);
          setDoorOpened(true);
          setDoorOpenedNow(true);
          if (data.message) playTTS(data.message);
        } else {
          // Kapı açılmadı: anlam yüküne göre kapı açıklığını ayarla
          const newScore = (data.sentiment_score ?? 0) * 100;
          setDoorOpenness((prev) => {
            const blended = prev * 0.4 + newScore * 0.6;
            return Math.max(0, Math.min(85, blended));
          });
        }

      } catch {
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "The line went dead.",
          createdAt: new Date(),
          isRejection: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, doorOpened, knockCount, messages]
  );

  return { messages, isLoading, doorOpened, doorOpenedNow, knockCount, doorOpenness, sendMessage };
}
