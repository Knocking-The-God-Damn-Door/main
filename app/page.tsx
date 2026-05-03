"use client";

import { useEffect, useState } from "react";
import { ChatWindow }     from "@/components/ChatWindow";
import { InputArea }      from "@/components/InputArea";
import { DoorPanel }      from "@/components/DoorPanel";
import { TypewriterText } from "@/components/TypewriterText";
import { useChat }        from "@/hooks/useChat";
import { useAudio }       from "@/hooks/useAudio";
import type { ScreenState } from "@/types";

export default function Home() {
  const { messages, isLoading, doorOpened, doorOpenedNow, knockCount, doorOpenness, sendMessage, audioStarted, audioDuration } =
    useChat();
  const { play }                          = useAudio("/placeholder_ambient.mp3");
  const [screenState, setScreenState]     = useState<ScreenState>("chatting");

  const finalMessage = messages.findLast((m) => m.isDoorOpening);

  useEffect(() => {
    if (!doorOpenedNow) return;
    play();
    setScreenState("transitioning");
  }, [doorOpenedNow, play, finalMessage]);

  useEffect(() => {
    if (doorOpenedNow && audioStarted) {
      setScreenState("final");
    }
  }, [doorOpenedNow, audioStarted]);

  const isFading = screenState === "transitioning";

  // Calculate perfect typing speed to match audio duration
  // Slight offset (-500ms) so text doesn't finish exactly as audio ends, but slightly before to feel natural
  const typeSpeed = (audioDuration > 0 && finalMessage) 
    ? Math.max(10, (audioDuration - 500) / finalMessage.content.length) 
    : 45;

  return (
    <div
      style={{
        display:    "flex",
        height:     "100vh",
        overflow:   "hidden",
        alignItems: "stretch",
      }}
    >
      {/* ── LEFT: Door Panel ── */}
      <div
        style={{
          width:          "210px",
          flexShrink:     0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "2rem 1rem",
          borderRight:    "1px solid rgba(196,168,130,0.08)",
          background:     "rgba(0,0,0,0.18)",
          position:       "sticky",
          top:            0,
          height:         "100vh",
        }}
      >
        <h1
          className="flicker select-none font-mono"
          style={{
            color:         "var(--color-dust)",
            letterSpacing: "0.45em",
            opacity:       0.45,
            fontSize:      "0.58rem",
            textTransform: "uppercase",
            marginBottom:  "2rem",
          }}
        >
          K&nbsp;N&nbsp;O&nbsp;C&nbsp;K
        </h1>

        <DoorPanel
          knockCount={knockCount}
          doorOpened={doorOpened}
          doorOpenness={doorOpenness}
        />
      </div>

      {/* ── RIGHT: Chat Area (scroll container — tam genişlik, scrollbar ekran sağında) ── */}
      <div
        style={{
          flex:      1,
          overflowY: "auto",
          height:    "100%",
        }}
      >
        {/* İç içerik ortalanmış */}
        <div
          style={{
            maxWidth:      "660px",
            margin:        "0 auto",
            padding:       "2rem 2rem",
            display:       "flex",
            flexDirection: "column",
            minHeight:     "100%",
          }}
        >
        {/* FINAL STATE */}
        {screenState === "final" && finalMessage ? (
          <div className="dust-rise flex flex-1 flex-col items-center justify-center text-center px-6">
            <p
              className="font-mono text-base leading-loose"
              style={{ color: "var(--color-amber)" }}
            >
              <TypewriterText
                text={finalMessage.content}
                speed={typeSpeed}
                className="font-mono text-base leading-loose"
              />
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
            {/* Chat */}
            <ChatWindow
              messages={messages}
              isFading={isFading}
              finalMessageId={finalMessage?.id}
            />

            {/* Loading */}
            {isLoading && (
              <p
                className="mb-4 font-mono text-xs"
                style={{ color: "var(--color-dust)", opacity: 0.35 }}
              >
                .&nbsp;.&nbsp;.
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
      </div>
    </div>
  );
}
