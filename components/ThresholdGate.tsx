"use client";

import { useEffect, useState } from "react";

interface ThresholdGateProps {
  text: string;
  knockNumber: number; // mesajın ait olduğu knock turu
}

export function ThresholdGate({ text, knockNumber }: ThresholdGateProps) {
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

      {/* Knock numarası */}
      <p
        className="mt-1 font-mono text-xs"
        style={{ color: "var(--color-dust)", opacity: 0.3, letterSpacing: "0.18em" }}
      >
        {knockNumber > 0
          ? `— Knock ${knockNumber} —`
          : "— the door is silent —"}
      </p>
    </div>
  );
}
