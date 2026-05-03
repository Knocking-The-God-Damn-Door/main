"use client";

import { useEffect, useRef, useState } from "react";
import { playDoorOpenSound } from "@/lib/sounds";

interface DoorPanelProps {
  knockCount: number;   // label için
  doorOpened: boolean;
  doorOpenness: number; // 0-100
}

/* ── Kapı geri kapanma — hafif ahşap thud ──────────────── */
function playCloseThud() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t0  = ctx.currentTime;
    const osc  = ctx.createOscillator();
    osc.type   = "sine";
    osc.frequency.setValueAtTime(90, t0);
    osc.frequency.exponentialRampToValueAtTime(35, t0 + 0.22);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + 0.26);
    setTimeout(() => ctx.close(), 400);
  } catch (_) {}
}

/* ── Bileşen ─────────────────────────────────────────────── */
export function DoorPanel({ knockCount, doorOpened, doorOpenness }: DoorPanelProps) {
  const prevOpennessRef = useRef(0);
  const prevOpenedRef   = useRef(false);
  const [shaking, setShaking] = useState(false);
  const [closing, setClosing] = useState(false);

  // Openness değişince görsel shake + kapanma sesi
  useEffect(() => {
    const prev = prevOpennessRef.current;
    const diff = doorOpenness - prev;
    if (!doorOpened) {
      if (diff > 3) {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      } else if (diff < -3) {
        playCloseThud();
        setClosing(true);
        setTimeout(() => setClosing(false), 600);
      }
    }
    prevOpennessRef.current = doorOpenness;
  }, [doorOpenness, doorOpened]);

  // Kapı tam açıldığında gerçekçi ses
  useEffect(() => {
    if (doorOpened && !prevOpenedRef.current) playDoorOpenSound();
    prevOpenedRef.current = doorOpened;
  }, [doorOpened]);

  const openPercent  = doorOpened ? 100 : doorOpenness;
  const rotateY      = -(openPercent * 0.78);
  const glowOpacity  = Math.pow(openPercent / 100, 1.5);
  const shakeClass   = closing ? "door-shake-close" : shaking ? "door-shake" : "";

  return (
    <div className="door-panel-wrapper">
      {/* Etiket */}
      <div className="door-label">
        {doorOpened ? (
          <span className="door-label-open">— kapı açık —</span>
        ) : (
          <span>
            {knockCount === 0 && openPercent < 1
              ? "eşik kapalı"
              : knockCount === 0
              ? `%${Math.round(openPercent)} aralık`
              : `knock ${knockCount} · %${Math.round(openPercent)}`}
          </span>
        )}
      </div>

      {/* ── Kapı çerçevesi + 3D kapı ── */}
      <div className={`door-svg-container ${shakeClass}`}>
        <div className="door-frame-box">

          {/* İç karanlık */}
          <div
            className="door-interior-bg"
            style={{ opacity: Math.min(glowOpacity * 1.2, 1) }}
          />

          {/* Amber ışık */}
          {openPercent > 5 && (
            <div
              className="door-interior-light"
              style={{ opacity: glowOpacity * 0.75 }}
            />
          )}

          {/* Perspective wrapper */}
          <div
            style={{
              position:          "absolute",
              inset:             0,
              perspective:       "500px",
              perspectiveOrigin: "100% 50%",
            }}
          >
            {/* Kapı yaprağı */}
            <div
              className="door-leaf"
              style={{
                transformOrigin: "100% 50%",
                transform:       `rotateY(${rotateY}deg)`,
                transition: doorOpened
                  ? "transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  : "transform 0.55s ease-out",
              }}
            >
              <div className="door-leaf-surface">
                {/* Üst panel */}
                <div className="door-panel-inset" style={{ top: "8%", left: "8%", right: "8%", height: "36%" }} />
                {/* Alt panel */}
                <div className="door-panel-inset" style={{ bottom: "6%", left: "8%", right: "8%", height: "44%" }} />

                {/* Yatay tahta çizgileri */}
                {[20, 38, 56, 74, 90].map((pct) => (
                  <div
                    key={pct}
                    style={{
                      position:   "absolute",
                      left: 0, right: 0,
                      top:        `${pct}%`,
                      height:     "1px",
                      background: "rgba(20,10,0,0.18)",
                    }}
                  />
                ))}

                {/* Kapı kolu */}
                <div className="door-handle-group">
                  <div className="door-handle-bar" />
                  <div className="door-handle-knob" />
                </div>

                {/* Anahtar deliği */}
                <div className="door-keyhole" />
              </div>

              {/* Menteşeler */}
              {[18, 49, 80].map((pct) => (
                <div
                  key={pct}
                  className="door-hinge"
                  style={{ top: `${pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="door-floor-shadow" />
      </div>

      {/* Progress bar */}
      <div className="door-progress-bar-wrapper">
        <div
          className="door-progress-bar-fill"
          style={{
            width: `${Math.round(openPercent)}%`,
            transition: "width 0.6s ease-out",
            background: doorOpened
              ? "linear-gradient(90deg, #D4A017, #f5c842)"
              : "linear-gradient(90deg, #704214, #D4A017)",
          }}
        />
      </div>
      <p className="door-progress-label">
        {doorOpened ? "✦ açık ✦" : `${Math.round(openPercent)}% aralık`}
      </p>
    </div>
  );
}
