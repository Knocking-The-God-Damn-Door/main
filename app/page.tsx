"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { InputArea }  from "@/components/InputArea";
import { useChat }    from "@/hooks/useChat";
import { useAudio }   from "@/hooks/useAudio";
import type { ScreenState } from "@/types";

export default function Home() {
  const { messages, isLoading, doorOpened, doorOpenedNow, knockCount, sendMessage } =
    useChat();
  const { play }                            = useAudio("/placeholder_ambient.mp3");
  const [screenState, setScreenState]       = useState<ScreenState>("chatting");

  const finalMessage = messages.findLast((m) => m.isDoorOpening);

  // Trigger cinematic transition when door first opens
  useEffect(() => {
    if (!doorOpenedNow) return;

    play();
    setScreenState("transitioning");

    if (finalMessage) {
      // Just wait a moment before final state
      // (The voice is now automatically played by useChat hook)
    }

    const t = setTimeout(() => setScreenState("final"), 1600);
    return () => clearTimeout(t);
  }, [doorOpenedNow, play, finalMessage]);

  const isFading = screenState === "transitioning";

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      {/* Header — fades when transitioning or final */}
      <header
        className={`mb-10 transition-all duration-1000 ${
          screenState !== "chatting" ? "opacity-0" : "opacity-100"
        }`}
      >
        <h1
          className="flicker select-none font-mono text-xs uppercase"
          style={{
            color:          "var(--color-dust)",
            letterSpacing:  "0.45em",
            opacity:        0.6,
          }}
        >
          K &nbsp; N &nbsp; O &nbsp; C &nbsp; K
        </h1>
      </header>

      {/* ── FINAL STATE: only Dylan's last message, centered ── */}
      {screenState === "final" && finalMessage ? (
        <div
          className="dust-rise flex flex-1 flex-col items-center justify-center text-center px-6"
        >
          <p
            className="font-mono text-base leading-loose"
            style={{ color: "var(--color-amber)" }}
          >
            {finalMessage.content}
          </p>
          <span
            className="mt-10 font-mono text-xs select-none"
            style={{
              color:         "var(--color-dust)",
              opacity:       0.2,
              letterSpacing: "0.35em",
            }}
          >
            ─── 1973 ───
          </span>
        </div>
      ) : (
        <>
          {/* ── CHAT STATE (chatting | transitioning) ── */}
          <ChatWindow
            messages={messages}
            isFading={isFading}
            finalMessageId={finalMessage?.id}
            knockCount={knockCount}
          />

          {/* Loading indicator */}
          {isLoading && (
            <p
              className="mb-4 font-mono text-xs"
              style={{ color: "var(--color-dust)", opacity: 0.35 }}
            >
              . &nbsp; . &nbsp; .
            </p>
          )}

          {/* Input */}
          <InputArea
            onSend={sendMessage}
            disabled={isLoading || doorOpened}
            isGone={isFading}
            knockCount={knockCount}
          />
        </>
      )}
    </div>
  );
}
