"use client";

import { useEffect, useRef, useState } from "react";
import { playDoorOpenSound } from "@/lib/sounds";

interface DoorPanelProps {
  knockCount: number;
  doorOpened: boolean;
  doorOpenness: number; // 0–100
}

/* ses fonksiyonları kaldırıldı — sadece kapı açılma sesi lib/sounds.ts'ten */

/* ── Component ──────────────────────────────────────────── */
export function DoorPanel({ knockCount, doorOpened, doorOpenness }: DoorPanelProps) {
  const prevOpennessRef = useRef(0);
  const prevOpenedRef   = useRef(false);
  const [shaking, setShaking] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const prev = prevOpennessRef.current;
    const diff = doorOpenness - prev;
    if (!doorOpened) {
      if (diff > 3) {
        // sadece görsel shake — gıcırtı sesi yok
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      } else if (diff < -3) {
        // sadece görsel closing animasyonu — ses yok
        setClosing(true);
        setTimeout(() => setClosing(false), 600);
      }
    }
    prevOpennessRef.current = doorOpenness;
  }, [doorOpenness, doorOpened]);

  useEffect(() => {
    if (doorOpened && !prevOpenedRef.current) playDoorOpenSound();
    prevOpenedRef.current = doorOpened;
  }, [doorOpened]);

  const openPercent = doorOpened ? 100 : doorOpenness;
  // Door rotates open from its right edge (hinge). 0% → 0° | 100% → -78°
  const rotateY     = -(openPercent * 0.78);
  // Opacity of the light leaking through the gap.
  const glowOpacity = Math.pow(openPercent / 100, 1.5);
  const shakeClass  = closing ? "door-shake-close" : shaking ? "door-shake" : "";

  return (
    <div className="door-panel-wrapper">
      <div className="door-label">
        {doorOpened ? (
          <span className="door-label-open">— door open —</span>
        ) : (
          <span>
            {knockCount === 0 && openPercent < 1
              ? "threshold closed"
              : knockCount === 0
              ? `${Math.round(openPercent)}% ajar`
              : `knock ${knockCount} · ${Math.round(openPercent)}%`}
          </span>
        )}
      </div>

      <div className={`door-svg-container ${shakeClass}`}>
        <div className="door-frame-box">

          <div
            className="door-interior-bg"
            style={{ opacity: Math.min(glowOpacity * 1.2, 1) }}
          />

          {openPercent > 5 && (
            <div
              className="door-interior-light"
              style={{ opacity: glowOpacity * 0.75 }}
            />
          )}

          {/* Perspective wrapper — hinge on the right edge */}
          <div
            style={{
              position:          "absolute",
              inset:             0,
              perspective:       "500px",
              perspectiveOrigin: "100% 50%",
            }}
          >
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
                {/* Top panel */}
                <div className="door-panel-inset" style={{ top: "8%", left: "8%", right: "8%", height: "36%" }} />
                {/* Bottom panel */}
                <div className="door-panel-inset" style={{ bottom: "6%", left: "8%", right: "8%", height: "44%" }} />

                {/* Horizontal wood grain lines */}
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

                {/* Door handle */}
                <div className="door-handle-group">
                  <div className="door-handle-bar" />
                  <div className="door-handle-knob" />
                </div>

                {/* Keyhole */}
                <div className="door-keyhole" />
              </div>

              {/* Hinges */}
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
        {doorOpened ? "✦ open ✦" : `${Math.round(openPercent)}% ajar`}
      </p>
    </div>
  );
}
