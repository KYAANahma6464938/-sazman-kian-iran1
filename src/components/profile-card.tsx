"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import GlitchText from "@/components/glitch-text";
import { ACHIEVEMENTS, useGameStore, type AchievementId } from "@/lib/game-store";
import { Award, Cpu, Eye, Fingerprint, Lock, Skull, TerminalSquare } from "lucide-react";

const ACH_LIST = (Object.keys(ACHIEVEMENTS) as AchievementId[]).map((id) => ({
  id,
  ...ACHIEVEMENTS[id],
}));

const SKILLS = [
  { name: "نفوذ و هک پیشرفته", pct: 98 },
  { name: "برنامه‌نویسی چندزبانه", pct: 95 },
  { name: "شبکه و زیرساخت", pct: 92 },
  { name: "رمزنگاری", pct: 90 },
  { name: "گمنامی و پنهان‌کاری", pct: 100 },
];

export default function ProfileCard() {
  const [shown, setShown] = useState(false);
  const achievements = useGameStore((s) => s.achievements);
  const godMode = useGameStore((s) => s.godMode);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="profile" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* identity */}
        <div className="hacker-panel corner-brackets rounded-sm p-6 text-center">
          <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/60 bg-[#041006]">
            <Skull
              className="h-14 w-14 text-primary text-glow float-glitch"
              aria-hidden="true"
            />
            <span className="pulse-dot absolute -bottom-1 -end-1 h-4 w-4 rounded-full border-2 border-[#020403] bg-primary" />
          </div>
          <h3 className="text-2xl font-black text-primary text-glow">
            <GlitchText text="کیان" />
          </h3>
          <p className="mb-3 font-mono-hacker text-xs text-muted-foreground" dir="ltr">
            ALIAS: <span className="text-[#ffb300]">GHOST-K</span> | RANK:{" "}
            <span className="text-destructive">S-CLASS</span>
          </p>
          <p className="mb-4 text-sm leading-7 text-foreground/85">
            نفر اول سازمان کیان. در تاریکی امن‌ترین جای دنیاست؛ جایی که هیچ دوربینی
            نفوذ نمی‌کند و هیچ لاگی جا نمی‌ماند.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="border border-primary/50 bg-[#08170c] text-primary hover:bg-[#0a2410]">
              <Eye className="ml-1 h-3 w-3" aria-hidden="true" />
              همیشه در تاریکی
            </Badge>
            <Badge className="border border-primary/50 bg-[#08170c] text-primary hover:bg-[#0a2410]">
              <Cpu className="ml-1 h-3 w-3" aria-hidden="true" />
              مغز متفکر سیستم
            </Badge>
            <Badge className="border border-destructive/50 bg-[#160508] text-destructive hover:bg-[#2a0409]">
              خطرناک
            </Badge>
          </div>
        </div>

        {/* skills */}
        <div className="hacker-panel rounded-sm p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-bold text-primary text-glow-dim">توانایی‌ها</h3>
            <span className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              /root/.skills
            </span>
          </div>
          <div className="space-y-4">
            {SKILLS.map((s, i) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-foreground/90">{s.name}</span>
                  <span className="font-mono-hacker text-primary" dir="ltr">
                    {s.pct}%
                  </span>
                </div>
                <div className="h-2.5 w-full border border-border bg-[#030803]">
                  <div
                    className="skill-bar h-full bg-gradient-to-l from-[#00ff41] to-[#00872f]"
                    style={{
                      width: shown ? `${s.pct}%` : "0%",
                      transition: `width 1.4s cubic-bezier(.2,.8,.2,1) ${i * 0.15}s`,
                      boxShadow: "0 0 10px rgba(0,255,65,0.5)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <div>
              <p className="font-mono-hacker text-xl font-bold text-primary" dir="ltr">
                247
              </p>
              <p className="text-[11px] text-muted-foreground">عملیات موفق</p>
            </div>
            <div>
              <p className="font-mono-hacker text-xl font-bold text-primary" dir="ltr">
                39
              </p>
              <p className="text-[11px] text-muted-foreground">کشور زیر پوشش</p>
            </div>
            <div>
              <p className="font-mono-hacker text-xl font-bold text-primary" dir="ltr">
                0
              </p>
              <p className="text-[11px] text-muted-foreground">بار ردیابی‌شده</p>
            </div>
          </div>
        </div>
      </div>

      {/* achievements */}
      <div className="hacker-panel mt-4 rounded-sm p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#ffb300]" aria-hidden="true" />
            <h3 className="font-bold text-[#ffb300]">دستاوردها</h3>
          </div>
          <span className="font-mono-hacker text-[11px] text-muted-foreground" dir="ltr">
            {achievements.length}/{ACH_LIST.length} UNLOCKED
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ACH_LIST.map((a) => {
            const unlocked = achievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-2 rounded-sm border px-2.5 py-2 transition-all ${
                  unlocked
                    ? "border-[#ffb300]/60 bg-[#1c1503] shadow-[0_0_12px_rgba(255,179,0,0.15)]"
                    : "border-border bg-[#040904] opacity-55"
                }`}
              >
                {unlocked ? (
                  <Award className="h-4 w-4 shrink-0 text-[#ffb300]" aria-hidden="true" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className={`truncate text-[11px] font-bold ${unlocked ? "text-[#ffb300]" : "text-muted-foreground"}`}>
                    {a.title}
                  </p>
                  <p className="truncate text-[9px] text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        {!godMode && (
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            یک دستاورد مخفی هم هست؛ کد قدیمی بازی‌ها را جایی از صفحه تایپ کن.
          </p>
        )}
      </div>

      {/* PGP fingerprint */}
      <div
        dir="ltr"
        className="hacker-panel mt-4 flex flex-wrap items-center gap-3 rounded-sm px-4 py-3 font-mono-hacker text-[10px] sm:text-xs text-muted-foreground"
      >
        <Fingerprint className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
        <span>PGP:</span>
        <span className="text-primary/80 break-all">
          3FA9 K1AN 07DE AD32 BEEF  1337 42C0 FEE0 0000 K1AN
        </span>
        <span className="ml-auto rounded-sm bg-[#08170c] px-2 py-0.5 text-primary" dir="ltr">
          TRUST: ULTIMATE
        </span>
      </div>
    </section>
  );
}
