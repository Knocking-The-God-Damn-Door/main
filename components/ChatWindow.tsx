"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message }  from "@/types";

interface ChatWindowProps {
  messages: Message[];
  isFading: boolean;
  finalMessageId?: string;
}

export function ChatWindow({
  messages,
  isFading,
  finalMessageId,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isFading={isFading && msg.id !== finalMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
