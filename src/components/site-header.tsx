"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlitchText from "@/components/glitch-text";
import WantedMeter from "@/components/wanted-meter";
import { useGameStore } from "@/lib/game-store";
import { Menu, Terminal, Volume2, VolumeX, X, Zap } from "lucide-react";

const NAV = [
  { href: "#dashboard", label: "مرکز عملیات" },
  { href: "#globe", label: "نقشه ایران" },
  { href: "#irantargets", label: "اهداف نفوذ" },
  { href: "#terminal", label: "ترمینال" },
  { href: "#cctv", label: "دوربین‌ها" },
  { href: "#cracker", label: "رمزشکن" },
  { href: "#darkweb", label: "دارک وب" },
  { href: "#leakeddocs", label: "اسناد نشت‌شده" },
  { href: "#cardcloner", label: "کارت‌ساز" },
  { href: "#filesystem", label: "فایل‌ها" },
  { href: "#ransom", label: "باج‌افزار" },
  { href: "#profile", label: "پروفایل" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("--:--:--");
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const godMode = useGameStore((s) => s.godMode);

  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#020403]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="سازمان کیان">
          <Terminal className="h-6 w-6 text-primary text-glow" aria-hidden="true" />
          <span className="text-lg sm:text-xl font-black tracking-tight text-primary">
            <GlitchText text="سازمان کیان" />
          </span>
          <span className="hidden lg:inline font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
            KIAN.ORG
          </span>
        </Link>

        <nav className="mr-auto hidden items-center gap-0.5 lg:flex" aria-label="ناوبری اصلی">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-sm px-2.5 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-[#08170c] hover:text-primary hover:text-glow-dim"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="mr-auto lg:mr-3 flex items-center gap-2 sm:gap-3">
          <WantedMeter />
          {godMode && (
            <span
              className="hidden sm:flex items-center gap-1 rounded-sm border border-[#ffb300]/60 bg-[#1c1503] px-2 py-1 font-mono-hacker text-[10px] font-bold text-[#ffb300]"
              dir="ltr"
            >
              <Zap className="h-3 w-3" aria-hidden="true" />
              GOD MODE
            </span>
          )}
          <span
            dir="ltr"
            className="hidden md:inline font-mono-hacker text-[11px] text-muted-foreground"
          >
            {time}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 rounded-sm border border-primary/40 bg-[#041006] px-2 py-1 font-mono-hacker text-[10px] text-primary" dir="ltr">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-primary" />
            ONLINE
          </span>
          <button
            onClick={toggleSound}
            className="rounded-sm border border-border p-1.5 text-primary/80 transition-colors hover:bg-[#08170c] hover:text-primary"
            aria-label={soundOn ? "قطع صدا" : "وصل صدا"}
            title={soundOn ? "صدا روشن است" : "صدا خاموش است"}
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <button
          className="rounded-sm border border-border p-2 text-primary lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-[#020403]/95 px-4 py-3 lg:hidden"
          aria-label="ناوبری موبایل"
        >
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-3 py-2.5 text-sm text-foreground/85 transition-colors hover:bg-[#08170c] hover:text-primary"
              >
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
