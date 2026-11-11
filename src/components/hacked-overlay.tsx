"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import {
  digitalScream,
  droneAlarm,
  heartbeat,
  whisperNoise,
  successChime,
} from "@/lib/sound";
import GlitchText from "@/components/glitch-text";
import { Button } from "@/components/ui/button";
import { Eye, Skull, Webcam } from "lucide-react";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const randHex = (n: number) =>
  Array.from({ length: n }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");

const randIp = () =>
  `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 254) + 1}`;

const WHISPERS = [
  "می‌بینمت",
  "پشت سرته",
  "نباید اینجا می‌آمدی",
  "نمی‌تونی فرار کنی",
  "هویتت مال ماست",
  "دستگیر شدی",
  "I SEE YOU",
  "WE ARE INSIDE",
  "LOGGING EVERYTHING",
  "GIVE UP",
  "THERE IS NO EXIT",
  "WE ARE LEGION",
];

const PHASES = [
  { delay: 0, text: "INITIALIZE", cls: "text-[#ffb300]" },
  { delay: 600, text: "BREACHING FIREWALL", cls: "text-[#ffb300]" },
  { delay: 1400, text: "GATHERING CREDENTIALS", cls: "text-[#ffb300]" },
  { delay: 2200, text: "ACCESSING WEBCAM", cls: "text-destructive" },
  { delay: 3000, text: "EXTRACTING FILES", cls: "text-destructive" },
  { delay: 3800, text: "OWNED", cls: "text-destructive text-glow-red" },
];

export default function HackedOverlay() {
  const hackedActive = useGameStore((s) => s.hackedActive);
  const clearHacked = useGameStore.getState().clearHacked;
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showData, setShowData] = useState(false);
  const [revealPrank, setRevealPrank] = useState(false);
  const [escapeProgress, setEscapeProgress] = useState(0);
  const [escapeHeld, setEscapeHeld] = useState(false);
  const [userData, setUserData] = useState({
    ip: "",
    isp: "",
    city: "",
    country: "",
    browser: "",
    os: "",
    screen: "",
    mac: "",
    battery: "",
    gpu: "",
  });
  const [whisperIdx, setWhisperIdx] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const heartRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const droneRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const whisperRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const escapeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // gather fake-but-plausible user info
  useEffect(() => {
    if (!hackedActive) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const ua = navigator.userAgent;
    const browser =
      /edg/i.test(ua) ? "Microsoft Edge" :
      /chrome/i.test(ua) ? "Google Chrome" :
      /firefox/i.test(ua) ? "Mozilla Firefox" :
      /safari/i.test(ua) ? "Apple Safari" : "Unknown";
    const os =
      /windows/i.test(ua) ? "Windows 10/11" :
      /mac/i.test(ua) ? "macOS" :
      /linux/i.test(ua) ? "Linux" :
      /android/i.test(ua) ? "Android" :
      /iphone|ipad/i.test(ua) ? "iOS" : "Unknown";
    setUserData({
      ip: randIp(),
      isp: "AS" + (10000 + Math.floor(Math.random() * 60000)),
      city: "Tehran",
      country: "Iran",
      browser,
      os,
      screen: `${window.screen.width}x${window.screen.height}`,
      mac: randHex(2).toUpperCase() + ":" + randHex(2).toUpperCase() + ":" + randHex(2).toUpperCase() + ":" + randHex(2).toUpperCase() + ":" + randHex(2).toUpperCase() + ":" + randHex(2).toUpperCase(),
      battery: `${Math.floor(Math.random() * 60 + 20)}%`,
      gpu: `${nav.deviceMemory || 8}GB RAM`,
    });
  }, [hackedActive]);

  // phase progression
  useEffect(() => {
    if (!hackedActive) {
      setPhase(0);
      setProgress(0);
      setShowData(false);
      setRevealPrank(false);
      setEscapeProgress(0);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (heartRef.current) clearInterval(heartRef.current);
      if (droneRef.current) clearInterval(droneRef.current);
      if (whisperRef.current) clearInterval(whisperRef.current);
      if (escapeRef.current) clearInterval(escapeRef.current);
      return;
    }
    // immediate alarm + scream
    digitalScream();
    setTimeout(() => droneAlarm(), 200);
    // heartbeat loop
    heartRef.current = setInterval(heartbeat, 900);
    droneRef.current = setInterval(droneAlarm, 3000);
    whisperRef.current = setInterval(() => {
      whisperNoise();
      setWhisperIdx((i) => (i + 1) % WHISPERS.length);
    }, 1700);

    // phase advance
    PHASES.forEach((p) => {
      const t = setTimeout(() => {
        setPhase((ph) => Math.max(ph, PHASES.indexOf(p) + 1));
        if (p.text === "ACCESSING WEBCAM") setShowData(true);
        if (p.text === "OWNED") {
          // start escape timer
          escapeRef.current = setInterval(() => {
            if (!escapeHeld) {
              // not held, reset slowly
              setEscapeProgress((p) => Math.max(0, p - 0.7));
            }
          }, 80);
        }
      }, p.delay);
      timersRef.current.push(t);
    });

    // progress bar
    const progIv = setInterval(() => {
      setProgress((p) => Math.min(100, p + 2.5));
    }, 90);
    timersRef.current.push(progIv as unknown as ReturnType<typeof setTimeout>);

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (heartRef.current) clearInterval(heartRef.current);
      if (droneRef.current) clearInterval(droneRef.current);
      if (whisperRef.current) clearInterval(whisperRef.current);
      if (escapeRef.current) clearInterval(escapeRef.current);
      if (progIv) clearInterval(progIv);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackedActive]);

  // auto-escape after 12s
  useEffect(() => {
    if (!hackedActive) return;
    const t = setTimeout(() => {
      setRevealPrank(true);
      successChime();
      setTimeout(() => {
        clearHacked();
      }, 2500);
    }, 14000);
    return () => clearTimeout(t);
  }, [hackedActive, clearHacked]);

  // manual escape: hold ESC for 2s
  useEffect(() => {
    if (!hackedActive) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscapeHeld(true);
        escapeRef.current = setInterval(() => {
          setEscapeProgress((p) => {
            if (p >= 100) {
              if (escapeRef.current) clearInterval(escapeRef.current);
              setRevealPrank(true);
              successChime();
              setTimeout(() => clearHacked(), 1500);
              return 100;
            }
            return p + 2.5;
          });
        }, 40);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscapeHeld(false);
        if (escapeRef.current) {
          clearInterval(escapeRef.current);
          escapeRef.current = null;
        }
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [hackedActive, clearHacked]);

  if (!hackedActive) return null;

  return (
    <div
      className="hacked-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden violent-shake"
      role="alert"
    >
      {/* blood drips */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="blood-drip"
          style={{
            left: `${(i + 0.3) * 7}%`,
            height: `${30 + Math.random() * 40}px`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* VHS tracking bar */}
      <div className="vhs-bar" aria-hidden="true" />

      {/* center content */}
      <div className="relative w-full max-w-3xl px-4 text-center">
        {/* big skull + warning */}
        {!revealPrank ? (
          <>
            <div className="mb-6 text-center">
              <div className="heartbeat inline-block">
                <Skull
                  className="mx-auto h-24 w-24 text-destructive text-glow-red scream-flicker"
                  aria-hidden="true"
                />
              </div>
            </div>

            <p
              className="scream-flicker font-mono-hacker text-4xl sm:text-6xl font-black text-destructive text-glow-red rgb-shift"
              dir="ltr"
            >
              <GlitchText text="YOU HAVE BEEN HACKED" red />
            </p>

            <p
              className="mt-4 text-base sm:text-lg text-[#ff8899] text-wobble"
            >
              {WHISPERS[whisperIdx]}
            </p>

            {/* phase progress */}
            <div
              dir="ltr"
              className="mx-auto mt-8 max-w-md text-left font-mono-hacker text-[11px] text-[#ffb300]"
            >
              {PHASES.slice(0, phase).map((p, i) => (
                <p key={i} className="fade-up">
                  <span className="text-destructive">[!] </span>
                  <span className={p.cls}>{p.text}</span>
                  <span className="text-primary"> ... OK</span>
                </p>
              ))}
              {phase < PHASES.length && (
                <p className="text-muted-foreground cursor-blink">
                  {PHASES[phase]?.text || "DONE"}
                </p>
              )}
            </div>

            {/* progress bar */}
            <div
              dir="ltr"
              className="mx-auto mt-6 max-w-md"
            >
              <div className="mb-1 flex justify-between font-mono-hacker text-[9px] text-[#ff8899]">
                <span>OWNERSHIP TRANSFER</span>
                <span className="text-destructive">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 w-full border border-destructive/60 bg-[#160508]">
                <div
                  className="h-full bg-gradient-to-r from-[#ffb300] to-[#ff2233] transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 12px rgba(255,34,51,0.8)",
                  }}
                />
              </div>
            </div>

            {/* user data leak */}
            {showData && (
              <div
                dir="ltr"
                className="mx-auto mt-8 max-w-md hacker-panel hacker-panel-red rounded-sm p-4 text-left fade-up"
              >
                <div className="mb-2 flex items-center gap-2 text-destructive">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono-hacker text-[11px] font-bold">
                    TARGET ACQUIRED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono-hacker text-[10px] text-[#ff8899]">
                  <span className="text-muted-foreground">IP</span>
                  <span className="text-destructive">{userData.ip}</span>
                  <span className="text-muted-foreground">ISP</span>
                  <span>{userData.isp}</span>
                  <span className="text-muted-foreground">CITY</span>
                  <span>{userData.city}, {userData.country}</span>
                  <span className="text-muted-foreground">BROWSER</span>
                  <span>{userData.browser}</span>
                  <span className="text-muted-foreground">OS</span>
                  <span>{userData.os}</span>
                  <span className="text-muted-foreground">SCREEN</span>
                  <span>{userData.screen}</span>
                  <span className="text-muted-foreground">MAC</span>
                  <span>{userData.mac}</span>
                  <span className="text-muted-foreground">BATTERY</span>
                  <span>{userData.battery}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-sm bg-[#2a0409] px-2 py-1.5 text-destructive">
                  <Webcam className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  <span className="font-mono-hacker text-[10px] font-bold">
                    WEBCAM ACCESS GRANTED — RECORDING ...
                  </span>
                </div>
              </div>
            )}

            {/* escape instruction */}
            <div
              dir="rtl"
              className="mx-auto mt-8 max-w-md"
            >
              <p className="mb-2 text-[11px] text-[#ff8899]">
                برای توقف، کلید <kbd className="rounded-sm border border-destructive/60 bg-[#2a0409] px-1.5 py-0.5 font-mono-hacker text-destructive">ESC</kbd> را نگه‌دار.
              </p>
              <div className="h-1.5 w-full border border-destructive/40 bg-[#160508]">
                <div
                  className="h-full bg-primary transition-all duration-75"
                  style={{
                    width: `${escapeProgress}%`,
                    boxShadow: "0 0 8px rgba(0,255,65,0.6)",
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          /* reveal prank */
          <div className="fade-up">
            <p
              className="font-mono-hacker text-3xl sm:text-5xl font-black text-primary text-glow"
              dir="ltr"
            >
              <GlitchText text="JUST A PRANK BRO" />
            </p>
            <p className="mt-4 text-base text-foreground/85">
              آرام باش. هیچ چیز واقعی نبود؛ نه هک شدی، نه وب‌کمت رو باز کردیم، نه
              اطلاعاتی لو رفت. کل_show یک شبیه‌سازی برای ترساندن تو بود.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              اما اون IP که روشنت کردیم واقعی نیست — ولی یادت باشه: توی دنیای واقعی،
              کلیک‌های اشتباه می‌تونن همین‌قدر راحت تمومت کنن.
            </p>
            <Button
              onClick={() => clearHacked()}
              size="lg"
              className="mt-6 bg-primary font-bold text-[#02120a] shadow-[0_0_28px_rgba(0,255,65,0.4)] hover:bg-[#00cc33]"
            >
              بستن و بازگشت
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
