"use client";

import { useEffect, useState } from "react";

interface ThresholdGateProps {
  text: string;
  knockCount: number;
}

export function ThresholdGate({ text, knockCount }: ThresholdGateProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div
      className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <p
        className="font-mono text-sm italic leading-relaxed"
        style={{ color: "var(--color-rust)", letterSpacing: "0.04em" }}
      >
        {text}
      </p>
      {knockCount > 2 && (
        <p
          className="mt-1 font-mono text-xs"
          style={{ color: "var(--color-dust)", opacity: 0.35 }}
        >
          {knockCount} knocks. The door remembers.
        </p>
      )}
    </div>
  );
}
