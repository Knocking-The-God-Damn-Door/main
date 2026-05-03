"use client";

import { TypewriterText } from "./TypewriterText";
import { ThresholdGate }  from "./ThresholdGate";
import type { Message }   from "@/types";

interface MessageBubbleProps {
  message: Message;
  isFading: boolean;
}

export function MessageBubble({ message, isFading }: MessageBubbleProps) {
  const isUser      = message.role === "user";
  const knockNumber = message.knockNumber ?? 0;

  return (
    <div
      className={`mb-5 transition-all duration-1000 ${
        isFading ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"
      } ${isUser ? "text-right" : "text-left"}`}
    >
      {message.isRejection ? (
        /* Red mesajı — ThresholdGate zaten knock etiketini içeriyor */
        <ThresholdGate text={message.content} knockNumber={knockNumber} />
      ) : isUser ? (
        /* Kullanıcı mesajı */
        <span
          className="font-mono text-sm"
          style={{ color: "var(--color-dust)", opacity: 0.65 }}
        >
          {message.content}
        </span>
      ) : (
        /* Bot yanıtı */
        <div>
          <TypewriterText
            text={message.content}
            speed={38}
            className="font-mono text-sm leading-relaxed"
          />
          {/* Knock etiketi — kapı açılış mesajında gösterme */}
          {!message.isDoorOpening && knockNumber > 0 && (
            <p
              className="mt-1 font-mono text-xs"
              style={{
                color:         "var(--color-dust)",
                opacity:       0.3,
                letterSpacing: "0.18em",
              }}
            >
              {`— Knock ${knockNumber} —`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
