"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, ChatApiRequest, ChatApiResponse } from "@/types";

export function useChat() {
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [doorOpened,    setDoorOpened]    = useState(false);
  const [doorOpenedNow, setDoorOpenedNow] = useState(false);
  const [knockCount,    setKnockCount]    = useState(0);
  // Door openness 0–100, derived from the running sentiment score.
  const [doorOpenness,  setDoorOpenness]  = useState(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || doorOpened) return;

      // Stop any currently playing TTS before sending a new message.
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

        const playTTS = (message: string) => {
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = "";
            currentAudioRef.current = null;
          }
          fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
          })
            .then((r) => { if (!r.ok) throw new Error("TTS failed"); return r.blob(); })
            .then((blob) => {
              const url   = URL.createObjectURL(blob);
              const audio = new Audio(url);
              currentAudioRef.current = audio;
              audio.play().catch((e) => console.warn("Audio error:", e));
              audio.onended = () => { currentAudioRef.current = null; };
            })
            .catch((err) => console.warn("TTS skipped:", err));
        };

        if (data.is_rejection) {
          setKnockCount((c) => c + 1);
        }

        if (data.door_opened) {
          setDoorOpenness(100);
          setDoorOpened(true);
          setDoorOpenedNow(true);
          if (data.message) {
            let ttsText = data.message;
            if (ttsText.length > 250) {
              const sub = ttsText.substring(0, 250);
              const lastPunctuation = Math.max(sub.lastIndexOf('.'), sub.lastIndexOf('!'), sub.lastIndexOf('?'));
              if (lastPunctuation > 0) {
                ttsText = sub.substring(0, lastPunctuation + 1);
              } else {
                ttsText = sub;
              }
            }
            setTimeout(() => playTTS(ttsText), 2500);
          }
        } else {
          const newScore = (data.sentiment_score ?? 0) * 100;
          setDoorOpenness((prev) => {
            if (data.is_rejection) {
              // Punish shallow answers with a fixed penalty based on how hollow they were.
              if (newScore < 15) return Math.max(0, prev - 25);
              if (newScore < 35) return Math.max(0, prev - 12);
            }
            // Meaningful but not yet enough — blend toward the new score.
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
