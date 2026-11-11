"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game-store";
import { explosion, tickBeep } from "@/lib/sound";
import GlitchText from "@/components/glitch-text";

export default function NukeOverlay() {
  const nukeActive = useGameStore((s) => s.nukeActive);
  const [count, setCount] = useState(5);
  const [boom, setBoom] = useState(false);

  // reset when opened
  useEffect(() => {
    if (nukeActive) {
      const id = requestAnimationFrame(() => {
        setCount(5);
        setBoom(false);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [nukeActive]);

  // countdown driver
  useEffect(() => {
    if (!nukeActive || boom) return;
    const t = setTimeout(() => {
      tickBeep();
      setCount((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearTimeout(t);
  }, [nukeActive, count, boom]);

  // zero -> boom
  useEffect(() => {
    if (nukeActive && !boom && count === 0) {
      const id = requestAnimationFrame(() => setBoom(true));
      return () => cancelAnimationFrame(id);
    }
  }, [nukeActive, boom, count]);

  // boom: sound, flash, close
  useEffect(() => {
    if (!boom) return;
    explosion();
    const t = setTimeout(() => {
      useGameStore.getState().setNuke(false);
      useGameStore.getState().unlock("nuker");
      toast({
        title: "SELF-DESTRUCT لغو شد",
        description: "شوخی بود؛ دنیا هنوز سر پاست. سرورها هم.",
      });
    }, 2900);
    return () => clearTimeout(t);
  }, [boom]);

  if (!nukeActive) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" role="alert">
      {!boom ? (
        <>
          <div className="absolute inset-0 alarm-pulse" aria-hidden="true" />
          <div className="relative text-center">
            <p className="mb-4 font-mono-hacker text-sm font-bold tracking-[0.4em] text-destructive" dir="ltr">
              SELF-DESTRUCT SEQUENCE
            </p>
            <p key={count} className="zoom-number font-mono-hacker text-[9rem] sm:text-[13rem] font-black leading-none text-destructive text-glow-red" dir="ltr">
              {count}
            </p>
            <p className="mt-4 text-sm text-[#ff8899]">
              توالی انهدام سرور فعال شد. هیچ‌کس نمی‌تواند این را متوقف کند.
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="absolute inset-0 bg-destructive/40" aria-hidden="true" />
          <p className="relative font-mono-hacker text-5xl sm:text-8xl font-black text-[#1a0000]" dir="ltr">
            <GlitchText text="SYSTEM WIPED" red />
          </p>
        </div>
      )}
    </div>
  );
}
