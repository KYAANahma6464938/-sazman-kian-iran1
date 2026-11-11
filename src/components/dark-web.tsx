"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import GlitchText from "@/components/glitch-text";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game-store";
import {
  Copy,
  EyeOff,
  Flame,
  Lock,
  ShieldAlert,
  Skull,
  Unlock,
  KeyRound,
  Fingerprint,
  Terminal,
  AlertTriangle,
  Ghost,
  Eye,
  Zap,
} from "lucide-react";
import {
  whisperNoise,
  deniedBuzz,
  glitchBlip,
  droneAlarm,
  digitalScream,
} from "@/lib/sound";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type MarketItem = {
  name: string;
  cat: string;
  price: string;
  seller: string;
  rating: number;
  stock: string;
  hot?: boolean;
  forbidden?: boolean;
};

const MARKET: MarketItem[] = [
  { name: "اکسپلویت روز صفر — نسخه نمایشی", cat: "اکسپلویت", price: "2.40 BTC", seller: "GHOST_K", rating: 4.9, stock: "۳ عدد باقی‌مانده", hot: true },
  { name: "بات‌نت ۵۰ هزار نودی", cat: "بات‌نت", price: "1.20 BTC", seller: "SHADOW_FOX", rating: 4.7, stock: "موجود" },
  { name: "پایگاه‌داده‌ی دانشگاه اسرارآمیز", cat: "دیتا لیک", price: "0.55 BTC", seller: "NIGHTOWL", rating: 4.5, stock: "موجود" },
  { name: "کلید اصلی کیف‌پول‌های گمشده", cat: "رمزارز", price: "3.70 BTC", seller: "KEYMASTER", rating: 5.0, stock: "۱ عدد", hot: true },
  { name: "کیت جعل هویت دیجیتال", cat: "گمنامی", price: "0.90 BTC", seller: "INVISIBLE", rating: 4.6, stock: "موجود" },
  { name: "نقشه‌ی سرورهای مخفی سازمان‌ها", cat: "اطلاعات", price: "1.80 BTC", seller: "DEEP_DIVER", rating: 4.8, stock: "۲ عدد باقی‌مانده" },
  { name: "سرویس قتل‌آموز استخدام // ممنوع", cat: "ممنوعه", price: "??.?? BTC", seller: "??????", rating: 0, stock: "دسترسی ممنوع", forbidden: true },
  { name: "دستورالعمل ساخت سلاح سایبری", cat: "ممنوعه", price: "؟.؟؟ BTC", seller: "??????", rating: 0, stock: "دسترسی ممنوع", forbidden: true },
  { name: "آدرس شخصی فرد ناشناس // این را نخر", cat: "ممنوعه", price: "؟؟؟", seller: "??????", rating: 0, stock: "دسترسی ممنوع", forbidden: true },
];

const TX_FEED = [
  "TX#8f3a2c — 0.42 BTC — فروش بات‌نت — تایید شد",
  "TX#1b9e77 — 2.40 BTC — اکسپلویت روز صفر — در حال تایید",
  "TX#c4d011 — 0.09 BTC — خدمات گمنامی — تایید شد",
  "TX#77aa03 — 1.20 BTC — دیتا لیک — تایید شد",
  "TX#5e21ff — 0.66 BTC — ابزار فیشینگ — برگشت خورد",
  "TX#0dd771 — 3.70 BTC — کلید.master — تایید شد",
  "TX#9b4c2a — 0.31 BTC — مشاوره نفوذ — در انتظار",
];

const HOPS = [
  "نود ۱ — تهران، ایران [رمزگذاری شد]",
  "نود ۲ — فرانکفورت، آلمان [رمزگذاری شد]",
  "نود ۳ — ریکیاویک، ایسلند [رمزگذاری شد]",
  "نود ۴ — ??? [مسیر پنهان شد]",
  "لایه پیازی باز شد — لایه ۳ از ۳",
];

const WHISPERS_DARK = [
  "نباید اینجا بودی",
  "آن‌ها دارند نگاه می‌کنند",
  "خداحافظ، هویتت",
  "ما همیشه اینجاییم",
  "پشت سرت",
  "این قفل را باز نکن",
];

const ONION = "kian7gh0st4x9pq2dnightcore.onion";

// The "correct" passcode to enter the deep market.
// Hint: something that walks in the dark with a zero in it
const CORRECT_CODE = "gh0st";

// Scattered fake buttons in the chaos state
const CHAOS_BUTTONS = [
  { label: "[ENTER]", color: "#00ff41", x: 5, y: 12, anim: "chaos-float-1" },
  { label: "do NOT click", color: "#ff2233", x: 78, y: 8, anim: "chaos-float-2" },
  { label: "FREE BTC", color: "#ffb300", x: 35, y: 75, anim: "chaos-float-3" },
  { label: "click me", color: "#00e5ff", x: 60, y: 40, anim: "chaos-float-4" },
  { label: "???????", color: "#ff2233", x: 15, y: 60, anim: "chaos-jitter" },
  { label: "EXIT", color: "#666", x: 90, y: 70, anim: "chaos-float-1" },
  { label: "EXIT", color: "#666", x: 8, y: 35, anim: "chaos-float-3" },
  { label: "ACCESS", color: "#00ff41", x: 45, y: 18, anim: "chaos-jitter" },
  { label: "don't", color: "#ff2233", x: 72, y: 88, anim: "chaos-float-2" },
  { label: "TRADE", color: "#ffb300", x: 25, y: 88, anim: "chaos-float-4" },
  { label: "KILL", color: "#ff2233", x: 88, y: 30, anim: "chaos-jitter" },
  { label: "?????", color: "#00e5ff", x: 50, y: 55, anim: "chaos-spin-slow" },
];

const CHAOS_TEXT_RAIN = [
  "ACCESS DENIED",
  "WE SEE YOU",
  "GIVE UP",
  "I AM HERE",
  "NO EXIT",
  "GH0ST",
  "RUN",
  "01001000",
  "BEHIND YOU",
  "NO ESCAPE",
];

function Stars({ n }: { n: number }) {
  return (
    <span className="font-mono-hacker text-[10px] text-[#ffb300]" dir="ltr">
      {"★".repeat(Math.round(n))}
      <span className="text-muted-foreground">{"☆".repeat(5 - Math.round(n))}</span>
      <span className="ml-1 text-muted-foreground">{n.toFixed(1)}</span>
    </span>
  );
}

export default function DarkWeb() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"locked" | "connecting" | "chaos" | "password" | "open">("locked");
  const [hops, setHops] = useState<string[]>([]);
  const [clock, setClock] = useState("--:--:--");
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [whisperIdx, setWhisperIdx] = useState(0);
  const [glitchKey, setGlitchKey] = useState(0);
  const [chaosClicks, setChaosClicks] = useState(0);
  const [scaryPopup, setScaryPopup] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const whisperTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    }, 1000);
    return () => {
      clearInterval(iv);
      timersRef.current.forEach(clearTimeout);
      if (whisperTimerRef.current) clearInterval(whisperTimerRef.current);
    };
  }, []);

  // whisper loop during chaos + password phases
  useEffect(() => {
    if (phase !== "chaos" && phase !== "password") {
      if (whisperTimerRef.current) clearInterval(whisperTimerRef.current);
      return;
    }
    whisperTimerRef.current = setInterval(() => {
      whisperNoise();
      setWhisperIdx((i) => (i + 1) % WHISPERS_DARK.length);
    }, 1900);
    return () => {
      if (whisperTimerRef.current) clearInterval(whisperTimerRef.current);
    };
  }, [phase]);

  // chaos phase: spawn random scary popups
  useEffect(() => {
    if (phase !== "chaos") return;
    const popupTimer = setInterval(() => {
      const phrases = [
        "BEHIND YOU",
        "I SEE YOU",
        "NEVER EXIT",
        "GH0ST IS HERE",
        "DON'T RUN",
        "STAY",
        "WATCHING",
      ];
      setScaryPopup(phrases[Math.floor(Math.random() * phrases.length)]);
      glitchBlip();
      // clear popup after 800ms
      setTimeout(() => setScaryPopup(null), 800);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(popupTimer);
  }, [phase]);

  const connect = async () => {
    setPhase("connecting");
    setHops([]);
    for (let i = 0; i < HOPS.length; i++) {
      await sleep(650);
      setHops((h) => [...h, HOPS[i]]);
    }
    await sleep(500);
    // After TOR connects, go to CHAOS phase (broken page)
    setPhase("chaos");
    droneAlarm();
    useGameStore.getState().addWanted(1);
  };

  const onChaosClick = (label: string) => {
    glitchBlip();
    setChaosClicks((c) => c + 1);
    if (label === "[ENTER]" || label === "ACCESS") {
      // Only the right ones lead to password
      setPhase("password");
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } else {
      // Random scary reaction
      const reactions = [
        "نه این نبود.",
        "اشتباه زدی.",
        "هاها. باز هم.",
        "این دکمه دروغه.",
        "هیچ خروجی وجود ندارد.",
        "???",
      ];
      toast({
        title: reactions[Math.floor(Math.random() * reactions.length)],
        description: "یه دکمه‌ی دیگه رو امتحان کن. یا نه.",
        variant: "destructive",
      });
      // increment wanted slowly
      if (chaosClicks > 0 && chaosClicks % 3 === 0) {
        useGameStore.getState().addWanted(1);
      }
    }
  };

  const copyOnion = async () => {
    try {
      await navigator.clipboard.writeText(ONION);
      toast({ title: "آدرس پیازی کپی شد", description: ONION });
    } catch {
      toast({ title: "کپی نشد", description: "مرورگر اجازه‌ی کپی نداد" });
    }
  };

  const submitCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = code.trim().toLowerCase();
    if (!value) return;
    setCode("");

    if (value === CORRECT_CODE) {
      // success
      setPhase("open");
      useGameStore.getState().addWanted(1);
      toast({
        title: "دسترسی به بازار عمیق باز شد",
        description: "خوش اومدی. اونجا که داری می‌ری، هیچ‌کس نمی‌تونه پیدات کنه.",
      });
    } else {
      // wrong code - increment attempts, ramp up scares
      const next = attempts + 1;
      setAttempts(next);
      deniedBuzz();
      setGlitchKey((g) => g + 1);

      if (next >= 3) {
        // after 3 wrong attempts, trigger full hacked takeover
        toast({
          title: "هشدار نفوذ",
          description: "اشتباه زدی. الان فکر می‌کنی هک شدی ...",
          variant: "destructive",
        });
        await sleep(900);
        useGameStore.getState().triggerHacked("darkweb_wrong_code");
        setAttempts(0);
        setPhase("locked");
      } else {
        toast({
          title: `رمز عبور اشتباه است (${next} از ۳)`,
          description: "باز هم اشتباه بزن، عواقبش رو ببین.",
          variant: "destructive",
        });
      }
    }
  };

  const tryForbidden = () => {
    glitchBlip();
    setAttempts((a) => a + 1);
    toast({
      title: "این آیتم ممنوع است",
      description: "خواستی دست بزنی، نه؟ الان متوجه می‌شی ...",
      variant: "destructive",
    });
    if (attempts + 1 >= 2) {
      setTimeout(() => {
        useGameStore.getState().triggerHacked("darkweb_forbidden");
        setAttempts(0);
      }, 1200);
    }
  };

  return (
    <section id="darkweb" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      {/* header */}
      <div className="warning-stripes mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <Skull className="h-7 w-7 text-destructive text-glow-red" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-destructive text-glow-red">
              <GlitchText text="دروازه دارک وب" red />
            </h2>
            <p className="text-xs text-[#ff8899]">DARKNET GATEWAY — ONLY FOR THE BRAVE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono-hacker text-[10px] sm:text-xs text-destructive" dir="ltr">
          <span className={`inline-block h-2 w-2 rounded-full ${phase === "open" ? "pulse-dot bg-destructive" : "bg-muted-foreground"}`} />
          {phase === "open" ? "TOR: CONNECTED" : "TOR: DISCONNECTED"} | {clock}
        </div>
      </div>

      <p className="mb-6 rounded-sm border border-[#5c0a12] bg-[#160508]/70 px-4 py-2 text-center text-xs sm:text-sm text-[#ff8899]">
        <ShieldAlert className="mb-0.5 ml-1 inline h-4 w-4" aria-hidden="true" />
        هشدار: این بخش صرفا یک شبیه‌ساز تفریحی و دکوری است؛ هیچ فعالیت، تراکنش یا داده واقعی در کار نیست. اما ظاهرش را جدی نگه داشتیم.
      </p>

      {/* locked state */}
      {phase === "locked" && (
        <div className="hacker-panel hacker-panel-red danger-breathe rounded-sm p-6 sm:p-10 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-destructive" aria-hidden="true" />
          <h3 className="mb-2 text-lg sm:text-xl font-bold text-destructive text-glow-red">
            دسترسی مسدود است
          </h3>
          <p className="mb-6 text-sm text-[#ff8899]">
            برای ورود به بازار سیاه شبیه‌سازی‌شده، باید از شبکه TOR عبور کنی.
            <br />
            <span className="text-destructive font-bold">
              هشدار: بعد از اتصال، صفحه به‌هم‌می‌ریزد. باید دکمه‌ی درست رو پیدا کنی
              و بعد رمز رو وارد کنی. سه بار اشتباه = نفوذ.
            </span>
          </p>
          <Button
            onClick={connect}
            size="lg"
            className="bg-destructive font-bold text-white hover:bg-[#cc1122] hover:text-white shadow-[0_0_24px_rgba(255,34,51,0.4)]"
          >
            <Flame className="ml-2 h-5 w-5" aria-hidden="true" />
            اتصال از طریق TOR
          </Button>
        </div>
      )}

      {phase === "connecting" && (
        <div className="hacker-panel hacker-panel-red danger-breathe rounded-sm p-6 sm:p-10 text-center">
          <h3 className="mb-2 text-lg sm:text-xl font-bold text-destructive text-glow-red">
            در حال عبور از لایه‌های پیازی ...
          </h3>
          <p className="mb-6 text-sm text-[#ff8899]">
            لطفا صبر کن؛ مسیرت در حال پنهان‌سازی است.
          </p>
          <div dir="ltr" className="mx-auto mb-6 max-w-md space-y-1.5 text-right font-mono-hacker text-xs text-[#ff8899]">
            {hops.map((h, i) => (
              <p key={i} className="animate-in fade-in slide-in-from-left-2">
                [OK] {h}
              </p>
            ))}
            {hops.length < HOPS.length && (
              <p className="text-muted-foreground cursor-blink">routing</p>
            )}
          </div>
        </div>
      )}

      {/* CHAOS PHASE — broken page with scattered buttons */}
      {phase === "chaos" && (
        <div className="relative">
          {/* The broken/messy page container */}
          <div className="chaos-grid-bg chaos-bg-roll relative min-h-[500px] rounded-sm border-2 border-destructive/50 chaos-distort overflow-hidden">
            {/* full screen distortion layer */}
            <div className="absolute inset-0 warn-flash pointer-events-none" aria-hidden="true" />
            <div className="absolute inset-0 chaos-jitter pointer-events-none" aria-hidden="true" />

            {/* Text rain columns */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="chaos-text-rain"
                style={{
                  left: `${(i + 0.5) * (100 / 12)}%`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  animationDelay: `${Math.random() * 3}s`,
                  color: i % 3 === 0 ? "rgba(255,179,0,0.4)" : "rgba(255,34,51,0.4)",
                }}
                aria-hidden="true"
              >
                {Array.from({ length: 12 }).map((_, j) => (
                  <div key={j}>{CHAOS_TEXT_RAIN[Math.floor(Math.random() * CHAOS_TEXT_RAIN.length)]}</div>
                ))}
              </div>
            ))}

            {/* Random scary popups */}
            {scaryPopup && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[96]">
                <div className="popup-pop text-5xl sm:text-7xl font-black text-destructive text-glow-red scream-flicker rgb-shift font-mono-hacker" dir="ltr">
                  {scaryPopup}
                </div>
              </div>
            )}

            {/* Central warning text */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-[94]">
              <p className="text-2xl sm:text-4xl font-black text-destructive text-glow-red scream-flicker font-mono-hacker" dir="ltr">
                <GlitchText text="DARKNET CHAOS" red />
              </p>
              <p className="mt-2 text-sm text-[#ff8899] text-wobble">
                صفحه به‌هم‌ریخته. دکمه‌ی درست رو پیدا کن.
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                راهنمایی: یه دکمه‌ی سبز رنگ وسط‌چین وجود داره. شاید.
              </p>
            </div>

            {/* Whisper line */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-[94]">
              <p className="text-sm text-[#ff8899] text-wobble" aria-live="polite">
                «{WHISPERS_DARK[whisperIdx]}»
              </p>
            </div>

            {/* Scattered fake buttons */}
            {CHAOS_BUTTONS.map((btn, i) => (
              <button
                key={i}
                onClick={() => onChaosClick(btn.label)}
                className={`chaos-btn ${btn.anim} font-mono-hacker text-xs font-bold px-3 py-2 rounded-sm border`}
                style={{
                  left: `${btn.x}%`,
                  top: `${btn.y}%`,
                  color: btn.color,
                  borderColor: btn.color,
                  background: "rgba(10,2,4,0.85)",
                  boxShadow: `0 0 12px ${btn.color}40`,
                }}
                dir="ltr"
              >
                {btn.label}
              </button>
            ))}

            {/* "EXIT" trap that doesn't actually exit */}
            <button
              onClick={() => onChaosClick("EXIT")}
              className="chaos-btn chaos-float-3 font-mono-hacker text-xs font-bold px-3 py-2 rounded-sm border border-muted-foreground text-muted-foreground"
              style={{ left: "92%", top: "55%" }}
              dir="ltr"
            >
              EXIT?
            </button>

            {/* Click counter */}
            <div className="absolute top-3 right-3 z-[94] font-mono-hacker text-[10px] text-destructive" dir="ltr">
              CLICKS: {chaosClicks} | WANTED: {useGameStore.getState().wanted}
            </div>

            {/* Floating ghost eye */}
            <div className="absolute top-1/3 right-1/4 chaos-float-2 pointer-events-none" aria-hidden="true">
              <Eye className="h-12 w-12 text-destructive/60 heartbeat" />
            </div>
            <div className="absolute top-2/3 left-1/4 chaos-float-4 pointer-events-none" aria-hidden="true">
              <Ghost className="h-10 w-10 text-destructive/50" />
            </div>
            <div className="absolute top-1/4 left-1/3 chaos-spin-slow pointer-events-none" aria-hidden="true">
              <Skull className="h-8 w-8 text-[#ffb300]/60" />
            </div>

            {/* Faint instruction */}
            <div className="absolute bottom-3 right-3 z-[94] font-mono-hacker text-[9px] text-muted-foreground" dir="ltr">
              hint: find [ENTER] or ACCESS
            </div>
          </div>

          {/* Disconnect button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setPhase("locked");
                setChaosClicks(0);
              }}
              className="text-[11px] text-muted-foreground hover:text-[#ff8899] underline-offset-2 hover:underline"
            >
              قطع اتصال و بازگشت
            </button>
          </div>
        </div>
      )}

      {/* PASSWORD GATE */}
      {phase === "password" && (
        <div className="hacker-panel hacker-panel-red danger-breathe violent-shake rounded-sm p-6 sm:p-10">
          <div className="mb-6 text-center">
            <div className="heartbeat inline-block">
              <Fingerprint
                className="mx-auto mb-3 h-16 w-16 text-destructive text-glow-red scream-flicker"
                aria-hidden="true"
              />
            </div>
            <h3 className="mb-2 text-xl sm:text-2xl font-black text-destructive text-glow-red">
              <GlitchText text="رمز عبور لازم است" red />
            </h3>
            <p className="text-sm text-[#ff8899]">
              دکمه‌ی درست رو پیدا کردی. حالا رمز عبور لایه‌ی سوم رو وارد کن.
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              راهنمای مخفی: نام چیزی که در تاریکی می‌گرد، با حرف g شروع می‌شود و یک صفر و یک ۴ در میانش دارد.
            </p>
          </div>

          {/* whisper line */}
          <p
            className="mb-4 text-center text-sm text-[#ff8899] text-wobble"
            aria-live="polite"
          >
            «{WHISPERS_DARK[whisperIdx]}»
          </p>

          <form onSubmit={submitCode} className="mx-auto max-w-md">
            <div
              dir="ltr"
              className="flex items-center gap-2 hacker-panel rounded-sm px-3 py-2"
            >
              <KeyRound className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
              <input
                ref={codeInputRef}
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="enter passcode ..."
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent font-mono-hacker text-sm text-destructive placeholder:text-muted-foreground/60 outline-none"
                aria-label="رمز عبور دارک وب"
              />
              <button
                type="submit"
                className="rounded-sm border border-destructive/60 bg-[#2a0409] px-3 py-1.5 font-mono-hacker text-xs font-bold text-destructive hover:bg-[#3d050c]"
              >
                ENTER
              </button>
            </div>
            {attempts > 0 && (
              <p className="mt-2 text-center text-[11px] text-destructive" dir="rtl">
                {attempts} تلاش ناموفق. {3 - attempts} تلاش دیگر تا نفوذ.
              </p>
            )}
            <p className="mt-3 text-center text-[10px] text-muted-foreground" dir="ltr">
              hint: <span className="text-[#ffb300]">g _ _ _ t</span> // something that walks in the dark
            </p>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setPhase("chaos");
                setAttempts(0);
              }}
              className="text-[11px] text-muted-foreground hover:text-[#ff8899] underline-offset-2 hover:underline"
            >
              بازگشت به صفحه‌ی به‌هم‌ریخته
            </button>
          </div>
        </div>
      )}

      {/* open state */}
      {phase === "open" && (
        <>
          {/* onion address bar */}
          <div
            dir="ltr"
            className="hacker-panel hacker-panel-red mb-6 flex flex-wrap items-center gap-3 rounded-sm px-4 py-3 font-mono-hacker text-xs sm:text-sm"
          >
            <EyeOff className="h-4 w-4 text-destructive" aria-hidden="true" />
            <span className="text-muted-foreground">http://</span>
            <span className="text-destructive text-glow-red break-all">{ONION}</span>
            <button
              onClick={copyOnion}
              className="ml-auto flex items-center gap-1 rounded-sm border border-[#5c0a12] px-2 py-1 text-[#ff8899] transition-colors hover:bg-[#2a0409]"
              aria-label="کپی آدرس پیازی"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              COPY
            </button>
            <span className="flex items-center gap-1 rounded-sm bg-[#2a0409] px-2 py-1 text-destructive">
              <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              SESSION ACTIVE
            </span>
          </div>

          {/* market grid */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={item.forbidden ? tryForbidden : undefined}
                disabled={!item.forbidden}
                className={`hacker-panel hacker-panel-red rounded-sm p-4 text-left transition-transform ${
                  item.forbidden
                    ? "cursor-pointer danger-breathe violent-shake"
                    : "hover:-translate-y-1"
                } ${item.hot ? "danger-breathe" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] ${
                      item.forbidden
                        ? "bg-[#1a0000] text-destructive text-glow-red"
                        : "bg-[#2a0409] text-[#ff8899]"
                    }`}
                  >
                    {item.cat}
                  </span>
                  {item.hot && (
                    <span className="font-mono-hacker text-[10px] font-bold text-destructive animate-pulse" dir="ltr">
                      HOT
                    </span>
                  )}
                  {item.forbidden && (
                    <span className="font-mono-hacker text-[10px] font-bold text-destructive animate-pulse" dir="ltr">
                      FORBIDDEN
                    </span>
                  )}
                </div>
                <h4 className={`mb-2 text-sm font-bold ${item.forbidden ? "text-destructive text-glow-red" : "text-foreground"}`}>
                  {item.name}
                </h4>
                {item.forbidden ? (
                  <p className="mb-3 text-[11px] text-destructive/80">
                    دسترسی به این آیتم ممنوع است. هر تلاشی برای باز کردن، ردیابی فوری دارد.
                  </p>
                ) : (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono-hacker text-sm font-bold text-destructive" dir="ltr">
                      {item.price}
                    </span>
                    <Stars n={item.rating} />
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#2a0409] pt-2 text-[11px] text-muted-foreground">
                  <span dir="ltr" className="font-mono-hacker">@{item.seller}</span>
                  <span>{item.stock}</span>
                </div>
              </button>
            ))}
          </div>

          {/* tx ticker */}
          <div className="hacker-panel hacker-panel-red overflow-hidden rounded-sm py-2" dir="ltr">
            <div className="marquee-track gap-10 font-mono-hacker text-[11px] text-[#ff8899]">
              {[...TX_FEED, ...TX_FEED].map((tx, i) => (
                <span key={i} className="inline-block" dir="rtl">
                  {tx} <span className="text-destructive">{"//"}</span>
                </span>
              ))}
            </div>
          </div>

          {/* creepy watcher panel */}
          <div className="mt-6 hacker-panel hacker-panel-red rounded-sm p-4">
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <Terminal className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono-hacker text-xs font-bold" dir="ltr">
                PRIVATE MESSAGE — FROM: ???
              </span>
            </div>
            <p className="text-sm leading-7 text-[#ff8899]">
              «دیدم که وارد شدی. خریدت را تمام کن و برو. اگر به آیتم‌های ممنوعه دست
              بزنی، من می‌فهمم. من همیشه اینجا هستم. این پیام را بعد از خواندن
              فراموش کن.»
            </p>
          </div>
        </>
      )}
    </section>
  );
}
