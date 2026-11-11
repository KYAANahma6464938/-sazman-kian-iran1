"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/lib/game-store";
import { digitalScream, heartbeat, glitchBlip, whisperNoise } from "@/lib/sound";

/* Random jumpscare overlay — pops up at unpredictable intervals.
 * Triggers a scary face + sound, lasts ~600ms, then fades.
 */

type ScareKind = "skull" | "face" | "eye" | "static" | "void";

const SCARES: { kind: ScareKind; label: string }[] = [
  { kind: "skull", label: "I SEE YOU" },
  { kind: "face", label: "BEHIND YOU" },
  { kind: "eye", label: "WATCHING" },
  { kind: "static", label: "01001000" },
  { kind: "void", label: "مهمانم" },
];

const MIN_INTERVAL = 22000; // first jumpscare can happen after 22s
const MAX_INTERVAL = 60000; // up to 60s
const DURATION = 700; // scare visible duration

export default function Jumpscare() {
  const [active, setActive] = useState(false);
  const [scare, setScare] = useState<(typeof SCARES)[number]>(SCARES[0]);
  const godMode = useGameStore((s) => s.godMode);
  const soundOn = useGameStore((s) => s.soundOn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (godMode) return; // disable jumpscare in godmode
    let cancelled = false;

    const scheduleNext = () => {
      const wait = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        // Only fire if user has interacted with the page at least once (sound is unlocked)
        if (soundOn) {
          trigger();
        } else {
          scheduleNext();
        }
      }, wait);
    };

    const trigger = () => {
      const next = SCARES[Math.floor(Math.random() * SCARES.length)];
      setScare(next);
      setActive(true);
      digitalScream();
      heartbeat();
      glitchBlip();
      whisperNoise();
      hideTimerRef.current = setTimeout(() => {
        setActive(false);
        scheduleNext();
      }, DURATION);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [godMode, soundOn]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      {/* full-screen red flash */}
      <div className="absolute inset-0 bg-destructive/35 violent-shake" />
      <div className="absolute inset-0 warn-flash" />

      {/* central scary visual */}
      <div className="relative jumpscare">
        {scare.kind === "skull" && (
          <svg
            viewBox="0 0 100 100"
            className="h-[60vh] w-[60vh] scream-flicker"
            aria-hidden="true"
          >
            <g fill="#ff0000" stroke="#fff" strokeWidth="0.5">
              <ellipse cx="50" cy="45" rx="32" ry="35" />
              <rect x="38" y="68" width="24" height="14" rx="2" />
              <rect x="42" y="78" width="3" height="6" />
              <rect x="48" y="78" width="3" height="6" />
              <rect x="54" y="78" width="3" height="6" />
              <ellipse cx="38" cy="42" rx="9" ry="11" fill="#000" />
              <ellipse cx="62" cy="42" rx="9" ry="11" fill="#000" />
              <path d="M 44 58 L 50 64 L 56 58 Z" fill="#000" />
              <path d="M 44 58 L 50 64 L 50 50 Z" fill="#000" opacity="0.4" />
              <path d="M 56 58 L 50 64 L 50 50 Z" fill="#000" opacity="0.4" />
            </g>
          </svg>
        )}
        {scare.kind === "face" && (
          <svg
            viewBox="0 0 100 100"
            className="h-[60vh] w-[60vh] scream-flicker"
            aria-hidden="true"
          >
            <ellipse cx="50" cy="50" rx="40" ry="48" fill="#fff" opacity="0.85" />
            <ellipse cx="35" cy="42" rx="8" ry="14" fill="#000" />
            <ellipse cx="65" cy="42" rx="8" ry="14" fill="#000" />
            <ellipse cx="35" cy="42" rx="3" ry="5" fill="#ff0000" />
            <ellipse cx="65" cy="42" rx="3" ry="5" fill="#ff0000" />
            <path d="M 30 72 Q 50 55 70 72 Q 60 80 50 75 Q 40 80 30 72 Z" fill="#000" />
            <path d="M 30 72 L 70 72" stroke="#ff0000" strokeWidth="0.6" />
          </svg>
        )}
        {scare.kind === "eye" && (
          <svg
            viewBox="0 0 100 100"
            className="h-[60vh] w-[60vh] scream-flicker"
            aria-hidden="true"
          >
            <ellipse cx="50" cy="50" rx="48" ry="28" fill="#fff" opacity="0.9" />
            <ellipse cx="50" cy="50" rx="44" ry="24" fill="#000" />
            <circle cx="50" cy="50" r="20" fill="#ff0000" />
            <circle cx="50" cy="50" r="9" fill="#000" />
            <circle cx="46" cy="46" r="3" fill="#fff" />
            <path d="M 2 50 Q 50 0 98 50" stroke="#fff" strokeWidth="2" fill="none" />
          </svg>
        )}
        {scare.kind === "static" && (
          <div
            className="h-[60vh] w-[60vh] static-noise"
            aria-hidden="true"
            style={{ filter: "brightness(1.5) contrast(1.4)" }}
          />
        )}
        {scare.kind === "void" && (
          <div className="h-[60vh] w-[60vh] flex items-center justify-center" aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 bg-black rounded-full" style={{ filter: "blur(20px)" }} />
              <div className="relative font-mono-hacker text-9xl text-destructive text-glow-red scream-flicker">
                ●
              </div>
            </div>
          </div>
        )}

        {/* scary label */}
        <p
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono-hacker text-3xl sm:text-5xl font-black text-destructive text-glow-red rgb-shift"
          dir="ltr"
        >
          {scare.label}
        </p>
      </div>

      {/* blood drips during scare */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="blood-drip"
          style={{
            left: `${10 + i * 11}%`,
            height: `${40 + Math.random() * 30}px`,
            animationDuration: `${0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
