"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game-store";
import { alarmBlast, explosion, successChime, tickBeep } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import GlitchText from "@/components/glitch-text";
import { Siren } from "lucide-react";

const EVADE_LINES = [
  "مسیردهی از طریق ۹ نود پراکسی ...",
  "پاشیدن بوت‌های جعلی در شبکه ...",
  "پاک‌کردن لاگ‌های ورودی ...",
  "هویت جدید ساخته شد",
];

export default function TraceAlert() {
  const alertActive = useGameStore((s) => s.alertActive);
  const evading = useGameStore((s) => s.evading);
  const exposed = useGameStore((s) => s.exposed);
  const [count, setCount] = useState(10);
  const [evadePct, setEvadePct] = useState(0);
  const [evadeStep, setEvadeStep] = useState(0);

  // reset on close
  useEffect(() => {
    if (!alertActive) {
      const id = requestAnimationFrame(() => {
        setCount(10);
        setEvadePct(0);
        setEvadeStep(0);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [alertActive]);

  // alarm loop
  useEffect(() => {
    if (!alertActive || evading || exposed) return;
    alarmBlast();
    const iv = setInterval(alarmBlast, 1200);
    return () => clearInterval(iv);
  }, [alertActive, evading, exposed]);

  // countdown
  useEffect(() => {
    if (!alertActive || evading || exposed) return;
    const iv = setInterval(() => {
      tickBeep();
      setCount((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [alertActive, evading, exposed]);

  // countdown hit zero -> exposed
  useEffect(() => {
    if (alertActive && !evading && !exposed && count === 0) {
      const id = requestAnimationFrame(() =>
        useGameStore.getState().triggerExposed()
      );
      return () => cancelAnimationFrame(id);
    }
  }, [alertActive, evading, exposed, count]);

  // exposed: boom then clear
  useEffect(() => {
    if (!exposed) return;
    explosion();
    const t = setTimeout(() => {
      useGameStore.getState().clearAlert();
      toast({
        title: "IDENTITY EXPOSED ... تقریباً",
        description: "خوش‌شانسی: سرورهای ردیاب قبل از افشای کامل سوختند. سطح تحت‌تعقیب صفر شد.",
      });
    }, 2800);
    return () => clearTimeout(t);
  }, [exposed]);

  // evasion progress
  useEffect(() => {
    if (!evading) return;
    const iv = setInterval(() => {
      setEvadePct((p) => Math.min(100, p + 3 + Math.random() * 7));
      setEvadeStep((s) => Math.min(EVADE_LINES.length - 1, s + (Math.random() > 0.6 ? 1 : 0)));
    }, 130);
    return () => clearInterval(iv);
  }, [evading]);

  useEffect(() => {
    if (evading && evadePct >= 100) {
      useGameStore.getState().finishEvade();
      useGameStore.getState().unlock("ghost");
      successChime();
      toast({
        title: "فرار موفق // GHOST",
        description: "ردیابی پاک شد. انگار هیچ‌وقت اینجا نبودی.",
      });
    }
  }, [evading, evadePct]);

  if (!alertActive) return null;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" role="alert">
      <div className="absolute inset-0 alarm-pulse" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(255,34,51,0.35) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="hacker-panel hacker-panel-red pointer-events-auto danger-breathe w-full max-w-md rounded-sm p-6 text-center">
          {exposed ? (
            <>
              <p className="mb-2 font-mono-hacker text-4xl sm:text-5xl font-black text-destructive text-glow-red exposed-flash" dir="ltr">
                EXPOSED
              </p>
              <p className="text-sm text-[#ff8899]">هویتت در حال لو رفتن بود ...</p>
            </>
          ) : evading ? (
            <>
              <p className="mb-3 text-lg font-bold text-primary text-glow">
                در حال فرار از ردیابی ...
              </p>
              <div dir="ltr" className="mb-3 space-y-1 text-right font-mono-hacker text-[11px] text-[#ff8899]">
                {EVADE_LINES.slice(0, evadeStep + 1).map((l, i) => (
                  <p key={i}>[OK] {l}</p>
                ))}
              </div>
              <div className="h-2.5 w-full border border-destructive/60 bg-[#160508]">
                <div
                  className="h-full bg-gradient-to-l from-[#ff2233] to-[#ff8844] transition-all duration-100"
                  style={{ width: `${evadePct}%`, boxShadow: "0 0 12px rgba(255,34,51,0.7)" }}
                />
              </div>
              <p className="mt-2 font-mono-hacker text-xs text-destructive" dir="ltr">
                {Math.round(evadePct)}%
              </p>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-center gap-2">
                <Siren className="h-7 w-7 text-destructive text-glow-red" aria-hidden="true" />
                <span className="font-mono-hacker text-2xl font-black text-destructive text-glow-red" dir="ltr">
                  <GlitchText text="TRACE DETECTED" red />
                </span>
              </div>
              <p className="mb-4 text-sm leading-7 text-[#ff8899]">
                سطح تحت‌تعقیب به حداکثر رسید! سیستم ضدردیابی سازمان فعال شد.
                تا لو رفتن هویتت {count} ثانیه وقت داری.
              </p>
              <p key={count} className="zoom-number mx-auto mb-4 w-fit font-mono-hacker text-6xl font-black text-destructive text-glow-red" dir="ltr">
                {count}
              </p>
              <Button
                onClick={() => useGameStore.getState().startEvade()}
                size="lg"
                className="w-full bg-primary font-black text-[#02120a] shadow-[0_0_28px_rgba(0,255,65,0.4)] hover:bg-[#00cc33] hover:text-[#02120a]"
              >
                فرار فوری // EVADE NOW
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
