"use client";

import { TypewriterText } from "./TypewriterText";

interface ThresholdGateProps {
  text: string;
  knockNumber: number;
  speed?: number;
}

export function ThresholdGate({ text, knockNumber, speed = 0 }: ThresholdGateProps) {
  return (
    <div>
      <p
        className="font-mono text-sm italic leading-relaxed"
        style={{ color: "var(--color-rust)", letterSpacing: "0.04em" }}
      >
        <TypewriterText text={text} speed={speed} />
      </p>

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
