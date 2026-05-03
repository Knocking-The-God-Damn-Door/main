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

  // knockCount, cevap geldikten SONRA +1 yapılıyor
  // yani bu mesaj kaçıncı knock'un cevabıysa onu göster
  const displayKnock = knockCount; // örn. 1. red => knockCount=1 => "Knock 1"

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

      {/* Knock numarası — her zaman göster */}
      <p
        className="mt-1 font-mono text-xs"
        style={{ color: "var(--color-dust)", opacity: 0.3, letterSpacing: "0.18em" }}
      >
        {displayKnock > 0
          ? `— Knock ${displayKnock} —`
          : "— the door is silent —"}
      </p>
    </div>
  );
}
