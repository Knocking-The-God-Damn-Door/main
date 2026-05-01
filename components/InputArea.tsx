"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isGone: boolean;
  knockCount: number;
}

export function InputArea({ onSend, disabled, isGone, knockCount }: InputAreaProps) {
  const [value, setValue]   = useState("");
  const inputRef            = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && !isGone) inputRef.current?.focus();
  }, [disabled, isGone]);

  const submit = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const placeholder =
    knockCount === 0
      ? "knock..."
      : knockCount < 3
      ? "knock again..."
      : "the door is listening...";

  return (
    <div
      className={`transition-all duration-1000 ${
        isGone ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100"
      }`}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isGone}
        placeholder={placeholder}
        rows={1}
        className="w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:opacity-30"
        style={{
          color:        "var(--color-ash)",
          caretColor:   "var(--color-amber)",
          borderBottom: "1px solid rgba(196,168,130,0.2)",
          padding:      "0.5rem 0",
          lineHeight:   "1.6",
          opacity:      disabled ? 0.4 : 1,
          transition:   "opacity 0.3s",
        }}
      />
      <p
        className="mt-1 font-mono text-xs select-none"
        style={{ color: "var(--color-dust)", opacity: 0.2 }}
      >
        ↵ to send
      </p>
    </div>
  );
}
