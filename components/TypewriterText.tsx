"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 35,
  onComplete,
  className,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);
  const onCompleteRef             = useRef(onComplete);
  onCompleteRef.current           = onComplete;

  useEffect(() => {
    if (speed <= 0) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span
          className="inline-block w-px h-[1em] ml-0.5 align-middle"
          style={{
            backgroundColor: "var(--color-amber)",
            animation: "blink 0.8s step-end infinite",
          }}
        />
      )}
    </span>
  );
}
