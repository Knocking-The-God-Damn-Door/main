"use client";

import { TypewriterText } from "./TypewriterText";
import { ThresholdGate }  from "./ThresholdGate";
import type { Message }   from "@/types";

interface MessageBubbleProps {
  message: Message;
  isFading: boolean;
  knockCount: number;
}

export function MessageBubble({ message, isFading, knockCount }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`mb-5 transition-all duration-1000 ${
        isFading ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"
      } ${isUser ? "text-right" : "text-left"}`}
    >
      {message.isRejection ? (
        <ThresholdGate text={message.content} knockCount={knockCount} />
      ) : isUser ? (
        <span
          className="font-mono text-sm"
          style={{ color: "var(--color-dust)", opacity: 0.65 }}
        >
          {message.content}
        </span>
      ) : (
        <TypewriterText
          text={message.content}
          speed={38}
          className="font-mono text-sm leading-relaxed"
          // color via parent or inline
        />
      )}
    </div>
  );
}
