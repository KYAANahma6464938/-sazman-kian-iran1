"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Circle, Camera, AlertTriangle } from "lucide-react";

/* Fixed-position screen recorder indicator that blinks REC + a frame border
 * around the viewport. Appears periodically when wanted >= 2.
 */

export default function ScreenRecorder() {
  const wanted = useGameStore((s) => s.wanted);
  const godMode = useGameStore((s) => s.godMode);
  const [visible, setVisible] = useState(false);
  const [rec, setRec] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // show when wanted >= 2
  useEffect(() => {
    if (godMode) {
      setVisible(false);
      return;
    }
    if (wanted >= 2 && !visible) {
      setVisible(true);
      setSeconds(0);
    }
    if (wanted < 2 && visible) {
      setVisible(false);
    }
  }, [wanted, godMode, visible]);

  // blink REC every second + count up
  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      setRec((r) => !r);
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [visible]);

  if (!visible) return null;

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <>
      {/* frame border around viewport */}
      <div
        className="pointer-events-none fixed inset-3 z-[55] border-2 border-destructive/60 rounded-sm"
        aria-hidden="true"
        style={{
          boxShadow: "inset 0 0 30px rgba(255,34,51,0.18), 0 0 24px rgba(255,34,51,0.15)",
        }}
      />
      {/* corner brackets */}
      <div
        className="pointer-events-none fixed top-3 left-3 z-[56] h-6 w-6 border-t-2 border-l-2 border-destructive"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-3 right-3 z-[56] h-6 w-6 border-t-2 border-r-2 border-destructive"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-3 left-3 z-[56] h-6 w-6 border-b-2 border-l-2 border-destructive"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-3 right-3 z-[56] h-6 w-6 border-b-2 border-r-2 border-destructive"
        aria-hidden="true"
      />

      {/* REC indicator */}
      <div
        className="pointer-events-none fixed top-5 right-5 z-[57] flex items-center gap-2 rounded-sm bg-[#160508]/85 px-3 py-1.5 backdrop-blur"
        aria-hidden="true"
      >
        <Circle
          className={`h-3 w-3 ${rec ? "text-destructive fill-destructive" : "text-destructive/30"}`}
        />
        <span
          className={`font-mono-hacker text-[11px] font-bold ${
            rec ? "text-destructive text-glow-red" : "text-destructive/40"
          }`}
          dir="ltr"
        >
          REC
        </span>
        <span className="font-mono-hacker text-[11px] text-[#ff8899]" dir="ltr">
          {fmtTime(seconds)}
        </span>
        <Camera className="h-3 w-3 text-[#ff8899]" />
      </div>

      {/* warning text at top */}
      <div
        className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-[57] flex items-center gap-2 rounded-sm bg-[#160508]/85 px-3 py-1.5 backdrop-blur"
        dir="rtl"
        aria-hidden="true"
      >
        <AlertTriangle className="h-3 w-3 text-destructive heartbeat" />
        <span className="text-[11px] text-[#ff8899]">
          صفحه‌نمایشت در حال ضبط است — فایل ارسال می‌شود
        </span>
      </div>
    </>
  );
}
