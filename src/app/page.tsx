"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MatrixRain from "@/components/matrix-rain";
import BootSequence from "@/components/boot-sequence";
import SiteHeader from "@/components/site-header";
import GlitchText from "@/components/glitch-text";
import ThreatDashboard from "@/components/threat-dashboard";
import CyberGlobe from "@/components/cyber-globe";
import HackerTerminal from "@/components/hacker-terminal";
import CctvGrid from "@/components/cctv-grid";
import PasswordCracker from "@/components/password-cracker";
import DarkWeb from "@/components/dark-web";
import ProfileCard from "@/components/profile-card";
import TraceAlert from "@/components/trace-alert";
import NukeOverlay from "@/components/nuke-overlay";
import HackedOverlay from "@/components/hacked-overlay";
import Jumpscare from "@/components/jumpscare";
import Ransomware from "@/components/ransomware";
import GhostChat from "@/components/ghost-chat";
import DataExfil from "@/components/data-exfil";
import ScreenRecorder from "@/components/screen-recorder";
import FileBrowser from "@/components/file-browser";
import IranTargets from "@/components/iran-targets";
import SmsIntercept from "@/components/sms-intercept";
import BankCardCloner from "@/components/bank-card-cloner";
import LeakedDocs from "@/components/leaked-docs";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { successChime } from "@/lib/sound";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, Globe2, Radio, Skull, TerminalSquare, FolderLock, Target, FileWarning, CreditCard, FileText } from "lucide-react";

const TICKER = [
  "وضعیت شبکه: پایدار",
  "با هر حمله، سطح تحت‌تعقیب بالاتر می‌رود؛ ۵ جمجمه یعنی ردیابی معکوس",
  "دکمه قرمز را نزن. جدی می‌گوییم.",
  "هیچ ردی وجود ندارد. هیچ شاهودی باقی نمانده است.",
  "TRUST NO ONE // VERIFY EVERYTHING",
  "یک کد قدیمی بازی‌ها جایی در این صفحه کار می‌کند ...",
];

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-border bg-[#041006]/80 py-1.5" dir="ltr">
      <div className="marquee-track gap-12 font-mono-hacker text-[11px] text-muted-foreground">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="inline-block">
            <span className="text-primary">&gt;&gt;</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [intense, setIntense] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const alertActive = useGameStore((s) => s.alertActive);
  const nukeActive = useGameStore((s) => s.nukeActive);
  const godMode = useGameStore((s) => s.godMode);
  const bloodMode = useGameStore((s) => s.bloodMode);
  const konamiIdx = useRef(0);

  useEffect(() => {
    if (!intense) return;
    const t = setTimeout(() => setIntense(false), 8000);
    return () => clearTimeout(t);
  }, [intense]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1500);
    return () => clearTimeout(t);
  }, [flash]);

  // konami code easter egg
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[konamiIdx.current]) {
        konamiIdx.current++;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          if (!useGameStore.getState().godMode) {
            useGameStore.getState().activateGodMode();
            successChime();
            toast({
              title: "GOD MODE ACTIVATED",
              description: "کد قدیمی را شناختی. حالا تو قانون این سایبرفظایی.",
            });
          }
        }
      } else {
        konamiIdx.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onMatrix = useCallback(() => setIntense((v) => !v), []);
  const onAccessFlash = useCallback((msg: string) => setFlash(msg), []);

  return (
    <div className={`relative min-h-screen flex flex-col ${bloodMode ? "blood-mode-main" : ""}`}>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      {/* overlays */}
      <div className="crt-overlay" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-sweep" aria-hidden="true" />
      {intense && (
        <div className="fixed inset-0 z-[55] bg-primary/5 pointer-events-none" aria-hidden="true" />
      )}

      {/* access flash */}
      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center" aria-hidden="true">
          <span className="access-flash font-mono-hacker text-4xl sm:text-6xl font-black text-destructive text-glow-red tracking-[0.3em]">
            {flash}
          </span>
        </div>
      )}

      <TraceAlert />
      <NukeOverlay />
      <HackedOverlay />
      <Jumpscare />
      <GhostChat />
      <DataExfil />
      <ScreenRecorder />
      <SmsIntercept />

      <div className={alertActive || nukeActive ? "shake-it" : ""}>
        <MatrixRain intense={intense} rainbow={godMode} />
        <SiteHeader />
        <Marquee />

        <main className="flex-1">
          {/* hero */}
          <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-16 text-center sm:pt-24">
            <p
              dir="ltr"
              className="mb-4 flex items-center gap-2 rounded-sm border border-destructive/50 bg-[#160508] px-3 py-1 font-mono-hacker text-[10px] sm:text-xs text-destructive"
            >
              <Skull className="h-3.5 w-3.5" aria-hidden="true" />
              CLASSIFIED // LEVEL 5 CLEARANCE REQUIRED
            </p>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight text-primary float-glitch">
              <GlitchText text="سازمان کیان" />
            </h1>

            <p
              dir="ltr"
              className="mt-3 font-mono-hacker text-sm sm:text-lg text-muted-foreground tracking-[0.5em]"
            >
              KIAN ORGANIZATION
            </p>

            <p className="mt-6 max-w-2xl text-sm sm:text-base leading-8 text-foreground/85">
              به تاریکی خوش آمدی. اینجا مرز میان دنیای مجاز و واقعی محو می‌شود؛ جایی که
              کدها نفس می‌کشند و شبکه‌ها زمزمه می‌کنند. اگر تا اینجا آمده‌ای، یعنی کنجکاوی
             ‌ات از ترست قوی‌تر است. پس دستت را روی کلیدها بگذار و وارد شو — اما یادت باشد،
              <span className="text-primary text-glow-dim"> تاریکی همیشه تماشا می‌کند.</span>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("terminal")?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-primary font-bold text-[#02120a] shadow-[0_0_28px_rgba(0,255,65,0.35)] hover:bg-[#00cc33] hover:text-[#02120a]"
              >
                <TerminalSquare className="ml-2 h-5 w-5" aria-hidden="true" />
                ورود به ترمینال
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("globe")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-primary/60 bg-transparent font-bold text-primary shadow-[0_0_18px_rgba(0,255,65,0.2)] hover:bg-[#041006] hover:text-primary"
              >
                <Globe2 className="ml-2 h-5 w-5" aria-hidden="true" />
                نقشه‌ی حملات زنده
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("darkweb")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-destructive/60 bg-transparent font-bold text-destructive shadow-[0_0_18px_rgba(255,34,51,0.2)] hover:bg-[#160508] hover:text-destructive"
              >
                <Radio className="ml-2 h-5 w-5" aria-hidden="true" />
                دروازه دارک وب
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("filesystem")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-primary/60 bg-transparent font-bold text-primary shadow-[0_0_18px_rgba(0,255,65,0.2)] hover:bg-[#041006] hover:text-primary"
              >
                <FolderLock className="ml-2 h-5 w-5" aria-hidden="true" />
                فایل‌های محرمانه
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("irantargets")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-destructive/60 bg-transparent font-bold text-destructive shadow-[0_0_18px_rgba(255,34,51,0.2)] hover:bg-[#160508] hover:text-destructive"
              >
                <Target className="ml-2 h-5 w-5" aria-hidden="true" />
                اهداف نفوذ ایران
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("cardcloner")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-[#ffb300]/60 bg-transparent font-bold text-[#ffb300] shadow-[0_0_18px_rgba(255,179,0,0.2)] hover:bg-[#1c1503] hover:text-[#ffb300]"
              >
                <CreditCard className="ml-2 h-5 w-5" aria-hidden="true" />
                شبیه‌ساز کارت بانکی
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("leakeddocs")?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-primary/60 bg-transparent font-bold text-primary shadow-[0_0_18px_rgba(0,255,65,0.2)] hover:bg-[#041006] hover:text-primary"
              >
                <FileText className="ml-2 h-5 w-5" aria-hidden="true" />
                اسناد نشت‌شده
              </Button>
            </div>

            <button
              onClick={() =>
                document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-12 animate-bounce text-muted-foreground hover:text-primary"
              aria-label="رفتن به بخش بعدی"
            >
              <ChevronDown className="h-6 w-6" aria-hidden="true" />
            </button>
          </section>

          <ThreatDashboard />

          <CyberGlobe />

          <IranTargets />

          {/* terminal */}
          <section id="terminal" className="relative z-10 mx-auto max-w-4xl px-4 py-14">
            <div className="mb-6 flex items-center gap-3">
              <TerminalSquare className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
                  شبیه‌ساز ترمینال هکری
                </h2>
                <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
                  INTERACTIVE SHELL — TRY: help / hack / nuke / cctv / crack / evade
                </p>
              </div>
            </div>
            <HackerTerminal onMatrix={onMatrix} onAccessFlash={onAccessFlash} />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              نکته: دستورها را انگلیسی تایپ کن و با کلیدهای بالا/پایین تاریخچه‌ات را بگرد.
            </p>
          </section>

          <CctvGrid />
          <PasswordCracker />
          <DarkWeb />
          <LeakedDocs />
          <BankCardCloner />
          <FileBrowser />
          <Ransomware />
          <ProfileCard />
        </main>

        {/* footer */}
        <footer className="relative z-10 mt-auto border-t border-border bg-[#030803]/90">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center">
            <p className="font-mono-hacker text-sm text-primary text-glow-dim" dir="ltr">
              &quot;We are KIAN. We are Legion. Expect us.&quot;
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              سازمان کیان © ۱۴۰۴ — ساخته‌شده در اعماق شبکه
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground/70">
              این وب‌سایت صرفاً یک شبیه‌ساز تفریحی و دکوری است و هیچ فعالیت واقعی هکری یا
              دارک‌وبی در آن وجود ندارد.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
