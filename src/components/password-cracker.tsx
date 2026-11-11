"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { keyClick, successChime } from "@/lib/sound";
import { KeyRound, ShieldCheck } from "lucide-react";

const faNum = (n: number) => n.toLocaleString("fa-IR");

function poolSize(p: string) {
  let n = 0;
  if (/[a-z]/.test(p)) n += 26;
  if (/[A-Z]/.test(p)) n += 26;
  if (/[0-9]/.test(p)) n += 10;
  if (/[^a-zA-Z0-9]/.test(p)) n += 33;
  return Math.max(n, 1);
}

function humanTime(sec: number) {
  if (sec < 0.001) return "همین الان";
  if (sec < 1) return "کمتر از یک ثانیه";
  if (sec < 60) return `${faNum(Math.round(sec))} ثانیه`;
  if (sec < 3600) return `${faNum(Math.round(sec / 60))} دقیقه`;
  if (sec < 86400) return `${faNum(Math.round(sec / 3600))} ساعت`;
  if (sec < 31536000) return `${faNum(Math.round(sec / 86400))} روز`;
  const years = sec / 31536000;
  if (years > 1e9) return `${faNum(Math.round(years / 1e9))} میلیارد سال`;
  if (years > 1e6) return `${faNum(Math.round(years / 1e6))} میلیون سال`;
  return `${faNum(Math.round(years))} سال`;
}

export default function PasswordCracker() {
  const [pwd, setPwd] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [pct, setPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bits = pwd ? Math.round(pwd.length * Math.log2(poolSize(pwd))) : 0;
  const crackSec = bits > 0 ? Math.pow(2, bits) / 2 / 1e10 : 0;
  const maxExp = bits > 0 ? Math.min(bits, 80) / Math.log2(10) : 0;
  const curExp = (pct / 100) * maxExp;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const run = () => {
    if (!pwd || phase === "running") return;
    keyClick();
    setPhase("running");
    setPct(0.001);
    timerRef.current = setInterval(() => {
      setPct((p) => Math.min(100, p + 1.6 + Math.random() * 2.4));
    }, 70);
  };

  useEffect(() => {
    if (phase === "running" && pct >= 100) {
      const id = requestAnimationFrame(() => {
        setPhase("done");
        useGameStore.getState().addWanted(1);
        useGameStore.getState().unlock("keysmith");
        successChime();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [phase, pct]);

  const attemptsLabel =
    curExp < 3
      ? Math.round(Math.pow(10, curExp)).toLocaleString("en-US")
      : `${Math.pow(10, curExp - Math.floor(curExp)).toFixed(2)} × 10^${Math.floor(curExp)}`;

  return (
    <section id="cracker" className="relative z-10 mx-auto max-w-4xl px-4 py-14">
      <div className="mb-6 flex items-center gap-3">
        <KeyRound className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
            آزمایشگاه رمزشکن
          </h2>
          <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
            BRUTE-FORCE LAB // LOCAL ONLY
          </p>
        </div>
      </div>

      <div className="hacker-panel corner-brackets rounded-sm p-5 sm:p-6">
        <label className="mb-2 block text-sm text-foreground/85" htmlFor="crack-input">
          یک رمز عبور بنویس تا ببینیم سازمان کیان چقدر سریع می‌شکندش:
        </label>
        <div className="flex flex-col sm:flex-row gap-3" dir="ltr">
          <input
            id="crack-input"
            type="text"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setPhase("idle");
            }}
            placeholder="type a password ..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-sm border border-border bg-[#030803] px-3 py-2.5 font-mono-hacker text-sm text-primary outline-none transition-colors focus:border-primary/70"
          />
          <Button
            onClick={run}
            disabled={!pwd || phase === "running"}
            className="shrink-0 bg-primary font-bold text-[#02120a] shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:bg-[#00cc33] hover:text-[#02120a] disabled:opacity-40"
          >
            {phase === "running" ? "در حال شکستن ..." : "بشکنش // CRACK"}
          </Button>
        </div>

        {pwd && phase !== "running" && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-[11px]">
            <div className="rounded-sm border border-border bg-[#040904] px-2 py-2">
              <p className="font-mono-hacker text-sm text-primary" dir="ltr">{bits} bit</p>
              <p className="text-muted-foreground">آنتروپی</p>
            </div>
            <div className="rounded-sm border border-border bg-[#040904] px-2 py-2">
              <p className="font-mono-hacker text-sm text-primary" dir="ltr">{faNum(poolSize(pwd))}</p>
              <p className="text-muted-foreground">حروف ممکن</p>
            </div>
            <div className="rounded-sm border border-border bg-[#040904] px-2 py-2">
              <p className="text-sm text-primary">{humanTime(crackSec)}</p>
              <p className="text-muted-foreground">زمان شکستن</p>
            </div>
          </div>
        )}

        {phase === "running" && (
          <div className="mt-5" dir="ltr">
            <div className="mb-2 flex justify-between font-mono-hacker text-[11px] text-muted-foreground">
              <span>ATTEMPTS: {attemptsLabel}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-3 w-full border border-border bg-[#030803]">
              <div
                className="h-full bg-gradient-to-r from-[#00872f] to-[#00ff41] transition-all duration-75"
                style={{ width: `${pct}%`, boxShadow: "0 0 12px rgba(0,255,65,0.6)" }}
              />
            </div>
            <p className="mt-2 font-mono-hacker text-[10px] text-muted-foreground">
              testing charset [a-z] [A-Z] [0-9] [symbols] ...
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="mt-5 rounded-sm border border-primary/50 bg-[#041006] p-4 text-center">
            <p className="mb-3 font-mono-hacker text-2xl sm:text-3xl font-black text-primary text-glow" dir="ltr">
              <GlitchText text="CRACKED" />
            </p>
            <p className="mb-1 text-xs text-muted-foreground">رمز عبور پیدا شد:</p>
            <p className="mb-3 select-all font-mono-hacker text-lg font-bold text-[#ffb300]" dir="ltr">
              {pwd}
            </p>
            <p className="font-mono-hacker text-[11px] text-muted-foreground" dir="ltr">
              {attemptsLabel} attempts // {bits} bits
            </p>
          </div>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          هیچ داده‌ای جایی ارسال نمی‌شود؛ همه‌چیز همین‌جا در مرورگر خودت محاسبه می‌شود.
        </p>
      </div>
    </section>
  );
}
