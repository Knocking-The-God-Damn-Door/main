"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message }  from "@/types";

interface ChatWindowProps {
  messages: Message[];
  isFading: boolean;
  finalMessageId?: string;
  knockCount: number;
}

export function ChatWindow({
  messages,
  isFading,
  finalMessageId,
  knockCount,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto py-4" style={{ minHeight: "60vh" }}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isFading={isFading && msg.id !== finalMessageId}
          knockCount={knockCount}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
