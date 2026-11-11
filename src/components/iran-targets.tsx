"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { glitchBlip, droneAlarm } from "@/lib/sound";
import {
  Crosshair,
  Skull,
  Shield,
  Building2,
  Landmark,
  Wifi,
  Database,
  Server,
  Lock,
  CheckCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";

/* Iranian Targets Hack Simulator - shows fake breached government/bank sites.
 * All targets are fictional and no real systems are involved.
 */

type Target = {
  id: number;
  name: string;
  type: "دولتی" | "بانکی" | "نظامی" | "دانشگاهی" | "شرکتی" | "زیرساختی";
  url: string;
  status: "قفل" | "در حال نفوذ" | "هک‌شده" | "آماده";
  pct: number;
  dataLeaked: string;
  icon: typeof Building2;
};

const INITIAL_TARGETS: Omit<Target, "id" | "status" | "pct">[] = [
  { name: "وزارت ارتباطات و فناوری اطلاعات", type: "دولتی", url: "mcit.gov.ir", dataLeaked: "۸٬۴۰۰ رکورد کارمند", icon: Building2 },
  { name: "بانک مرکزی جمهوری اسلامی ایران", type: "بانکی", url: "cbi.ir", dataLeaked: "تراکنش‌های ۲۴ ساعت", icon: Landmark },
  { name: "سازمان ثبت احوال", type: "دولتی", url: "sabteahval.ir", dataLeaked: "۱۲ میلیون هویت", icon: Database },
  { name: "سازمان مالیاتی", type: "دولتی", url: "tax.gov.ir", dataLeaked: "اطلاعات مودیان", icon: Server },
  { name: "بانک ملت", type: "بانکی", url: "bankmellat.ir", dataLeaked: "اطلاعات کارت‌ها", icon: Landmark },
  { name: "بانک صادرات", type: "بانکی", url: "bsi.ir", dataLeaked: "۱۲٬۰۰۰ حساب", icon: Landmark },
  { name: "دانشگاه تهران - پرتال دانشجویی", type: "دانشگاهی", url: "ut.ac.ir", dataLeaked: "اطلاعات ۲۴٬۰۰۰ دانشجو", icon: Building2 },
  { name: "شرکت ارتباطات زیرساختی", type: "زیرساختی", url: "tia.ir", dataLeaked: "ترافیک شبکه", icon: Wifi },
  { name: "سازمان نظام صنفی کامپیوتر", type: "شرکتی", url: "scs.org.ir", dataLeaked: "اطلاعات اعضا", icon: Shield },
  { name: "مرکز آمار ایران", type: "دولتی", url: "amar.org.ir", dataLeaked: "داده‌های سرشماری", icon: Database },
  { name: "سازمان بنادر و دریانوردی", type: "دولتی", url: "ports.ir", dataLeaked: "اطلاعات کانتینرها", icon: Server },
  { name: "بانک کشاورزی", type: "بانکی", url: "bank-keshavarzi.ir", dataLeaked: "وام‌های روستایی", icon: Landmark },
  { name: "سازمان تأمین اجتماعی", type: "دولتی", url: "ssa.ir", dataLeaked: "بیمه‌شدگان", icon: Building2 },
  { name: "وزارت نیرو - زیرساخت برق", type: "زیرساختی", url: "moe.gov.ir", dataLeaked: "شبکه برق", icon: Wifi },
  { name: "سامانه ثنا - ابلاغ قضایی", type: "دولتی", url: "thana.ir", dataLeaked: "احکام قضایی", icon: Server },
  { name: "سامانه آموزش الکترونیک (?,وزارت آموزش و پرورش)", type: "دولتی", url: "mooresan.ir", dataLeaked: "اطلاعات دانش‌آموزان", icon: Building2 },
];

let idCounter = 1000;

const TYPE_COLORS = {
  "دولتی": "text-primary",
  "بانکی": "text-[#ffb300]",
  "نظامی": "text-destructive text-glow-red",
  "دانشگاهی": "text-[#00e5ff]",
  "شرکتی": "text-primary text-glow-dim",
  "زیرساختی": "text-[#ff6644]",
};

export default function IranTargets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [hackedCount, setHackedCount] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const godMode = useGameStore((s) => s.godMode);

  // Initialize targets
  useEffect(() => {
    const initial = INITIAL_TARGETS.map((t) => ({
      ...t,
      id: idCounter++,
      status: "قفل" as const,
      pct: 0,
    }));
    setTargets(initial);
  }, []);

  // Random hacking progression
  useEffect(() => {
    if (godMode) return;
    const iv = setInterval(() => {
      setTargets((prev) => {
        // pick a target to start hacking
        const next = [...prev];
        const locked = next.filter((t) => t.status === "قفل");
        if (locked.length > 0 && Math.random() < 0.4) {
          const idx = next.findIndex((t) => t.id === locked[Math.floor(Math.random() * locked.length)].id);
          if (idx !== -1) {
            next[idx] = { ...next[idx], status: "در حال نفوذ" };
            glitchBlip();
          }
        }
        // progress hacking targets
        for (let i = 0; i < next.length; i++) {
          if (next[i].status === "در حال نفوذ") {
            const newPct = next[i].pct + 8 + Math.random() * 16;
            if (newPct >= 100) {
              next[i] = { ...next[i], pct: 100, status: "هک‌شده" };
              setHackedCount((c) => c + 1);
              droneAlarm();
              setTotalData((t) => t + Math.floor(Math.random() * 10000));
            } else {
              next[i] = { ...next[i], pct: newPct };
            }
          }
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(iv);
  }, [godMode]);

  // Reset all in GOD MODE
  useEffect(() => {
    if (godMode) {
      setTargets((prev) =>
        prev.map((t) => ({ ...t, status: "قفل" as const, pct: 0 }))
      );
      setHackedCount(0);
      setTotalData(0);
    }
  }, [godMode]);

  const manualHack = (id: number) => {
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "قفل") {
          glitchBlip();
          useGameStore.getState().addWanted(1);
          return { ...t, status: "در حال نفوذ" };
        }
        if (t.status === "هک‌شده") return t;
        return t;
      })
    );
  };

  const lockPct = Math.round(
    (targets.filter((t) => t.status === "قفل").length / targets.length) * 100
  );

  return (
    <section id="irantargets" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skull className="h-7 w-7 text-destructive text-glow-red heartbeat" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-destructive text-glow-red">
              <GlitchText text="اهداف نفوذ سایبری ایران" red />
            </h2>
            <p className="font-mono-hacker text-[10px] text-[#ff8899]" dir="ltr">
              IRAN CYBER ARMY — BREACHED TARGETS LOG
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono-hacker text-[10px]" dir="ltr">
          <div className="rounded-sm border border-destructive/40 bg-[#160508] px-2 py-1 text-destructive">
            HACKED: {hackedCount}
          </div>
          <div className="rounded-sm border border-[#ffb300]/40 bg-[#1c1503] px-2 py-1 text-[#ffb300]">
            DATA: {totalData.toLocaleString("en-US")} records
          </div>
          <div className="rounded-sm border border-primary/40 bg-[#041006] px-2 py-1 text-primary">
            LOCKED: {lockPct}%
          </div>
        </div>
      </div>

      {/* warning banner */}
      <div className="warning-stripes mb-6 rounded-sm px-4 py-3 violent-shake">
        <p className="text-center text-xs sm:text-sm text-[#ff8899]">
          <AlertTriangle className="mb-0.5 ml-1 inline h-4 w-4 heartbeat" aria-hidden="true" />
          سپاه سایبری سازمان کیان در حال نفوذ به زیرساخت‌های حیاتی ایران است. تمام داده‌ها تصادفی و ساختگی هستند.
        </p>
      </div>

      {/* targets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {targets.map((t) => {
          const Icon = t.icon;
          const colorClass = TYPE_COLORS[t.type];
          return (
            <button
              key={t.id}
              onClick={() => manualHack(t.id)}
              disabled={t.status === "هک‌شده" || t.status === "در حال نفوذ"}
              className={`hacker-panel ${
                t.status === "هک‌شده"
                  ? "hacker-panel-red danger-breathe"
                  : t.status === "در حال نفوذ"
                    ? "brutal-frame"
                    : "corner-brackets"
              } rounded-sm p-3 text-left transition-transform ${
                t.status === "قفل" ? "hover:-translate-y-1 cursor-pointer" : ""
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} aria-hidden="true" />
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold ${
                    t.status === "هک‌شده"
                      ? "bg-[#2a0409] text-destructive"
                      : t.status === "در حال نفوذ"
                        ? "bg-[#1c1503] text-[#ffb300] animate-pulse"
                        : "bg-[#041006] text-muted-foreground"
                  }`}
                  dir="ltr"
                >
                  {t.status === "هک‌شده" ? "OWNED" : t.status === "در حال نفوذ" ? "BREACHING" : "LOCKED"}
                </span>
              </div>
              <h4 className={`mb-1 text-[12px] font-bold leading-5 ${t.status === "هک‌شده" ? "text-destructive text-glow-red" : "text-foreground"}`}>
                {t.name}
              </h4>
              <p className="mb-2 font-mono-hacker text-[10px] text-muted-foreground break-all" dir="ltr">
                https://{t.url}
              </p>
              {t.status === "در حال نفوذ" && (
                <div className="mb-2">
                  <div className="flex justify-between font-mono-hacker text-[9px] text-[#ffb300] mb-0.5" dir="ltr">
                    <span>BREACHING</span>
                    <span>{Math.round(t.pct)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0a0204]">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffb300] to-destructive transition-all"
                      style={{ width: `${t.pct}%`, boxShadow: "0 0 8px rgba(255,179,0,0.6)" }}
                    />
                  </div>
                </div>
              )}
              {t.status === "هک‌شده" && (
                <p className="text-[10px] text-destructive/80 leading-5" dir="rtl">
                  <Eye className="inline h-3 w-3 ml-1" aria-hidden="true" />
                  دیتای نشت‌شده: {t.dataLeaked}
                </p>
              )}
              {t.status === "قفل" && (
                <p className="text-[10px] text-muted-foreground">
                  برای شروع نفوذ کلیک کن
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* stats footer */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="hacker-panel rounded-sm p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono-hacker text-[10px] font-bold" dir="ltr">SUCCESS</span>
          </div>
          <p className="font-mono-hacker text-xl font-black text-primary text-glow-dim" dir="ltr">
            {hackedCount}/{targets.length}
          </p>
        </div>
        <div className="hacker-panel rounded-sm p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#ffb300] mb-1">
            <Database className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono-hacker text-[10px] font-bold" dir="ltr">LEAKED</span>
          </div>
          <p className="font-mono-hacker text-xl font-black text-[#ffb300]" dir="ltr">
            {totalData.toLocaleString("en-US")}
          </p>
        </div>
        <div className="hacker-panel rounded-sm p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-destructive mb-1">
            <Crosshair className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono-hacker text-[10px] font-bold" dir="ltr">BREACHING</span>
          </div>
          <p className="font-mono-hacker text-xl font-black text-destructive" dir="ltr">
            {targets.filter((t) => t.status === "در حال نفوذ").length}
          </p>
        </div>
        <div className="hacker-panel rounded-sm p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono-hacker text-[10px] font-bold" dir="ltr">LOCKED</span>
          </div>
          <p className="font-mono-hacker text-xl font-black text-muted-foreground" dir="ltr">
            {targets.filter((t) => t.status === "قفل").length}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        تمام اهداف، URLها، و داده‌های نشت‌شده در این بخش کاملاً تخیلی و شبیه‌سازی‌شده هستند. هیچ سایت واقعی هدف قرار نگرفته و هیچ داده‌ی واقعی جمع نشده است.
      </p>
    </section>
  );
}
