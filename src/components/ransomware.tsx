"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { useToast } from "@/hooks/use-toast";
import { droneAlarm, tickBeep, successChime } from "@/lib/sound";
import { Lock, Bitcoin, Clock, FileWarning, AlertTriangle, Check } from "lucide-react";

/* Ransomware simulation panel.
 * Shows fake file encryption + ransom countdown + payment UI.
 * Triggered via terminal `ransom` command or its own button.
 */

type FileState = {
  name: string;
  size: string;
  status: "pending" | "encrypting" | "locked";
};

const SAMPLE_FILES: FileState[] = [
  { name: "C:/Users/You/Documents/family_photos.zip", size: "284 MB", status: "pending" },
  { name: "C:/Users/You/Desktop/passport_scan.pdf", size: "1.2 MB", status: "pending" },
  { name: "C:/Users/You/Documents/work_projects/", size: "5.6 GB", status: "pending" },
  { name: "C:/Users/You/Pictures/camera_2024/", size: "12.3 GB", status: "pending" },
  { name: "C:/Users/You/Desktop/passwords.txt", size: "8 KB", status: "pending" },
  { name: "C:/Users/You/AppData/Local/Browser/profile/", size: "847 MB", status: "pending" },
  { name: "C:/Users/You/Documents/bank_statements.pdf", size: "3.4 MB", status: "pending" },
  { name: "C:/Users/You/Music/library/", size: "4.1 GB", status: "pending" },
  { name: "C:/Users/You/Videos/personal/", size: "18.7 GB", status: "pending" },
  { name: "D:/Backups/full_image_2024.img", size: "120 GB", status: "pending" },
];

const TIME_LIMIT = 48 * 3600; // 48 hours in seconds (fake)

export default function Ransomware() {
  const [active, setActive] = useState(false);
  const [paid, setPaid] = useState(false);
  const [files, setFiles] = useState<FileState[]>(SAMPLE_FILES);
  const [encryptedCount, setEncryptedCount] = useState(0);
  const [ransomTime, setRansomTime] = useState(TIME_LIMIT);
  const [paying, setPaying] = useState(false);
  const encryptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (encryptTimerRef.current) clearInterval(encryptTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // file encryption progress
  useEffect(() => {
    if (!active || paid) return;
    encryptTimerRef.current = setInterval(() => {
      setFiles((prev) => {
        const next = [...prev];
        const idx = next.findIndex((f) => f.status === "pending");
        if (idx === -1) {
          if (encryptTimerRef.current) clearInterval(encryptTimerRef.current);
          return prev;
        }
        // first mark as encrypting
        if (next[idx].status === "pending") {
          next[idx] = { ...next[idx], status: "encrypting" };
          return next;
        }
        return prev;
      });
    }, 350);
    // mark encrypting -> locked
    const lockTimer = setInterval(() => {
      setFiles((prev) => {
        const next = [...prev];
        const idx = next.findIndex((f) => f.status === "encrypting");
        if (idx === -1) return next;
        next[idx] = { ...next[idx], status: "locked" };
        setEncryptedCount((c) => c + 1);
        tickBeep();
        return next;
      });
    }, 500);
    return () => {
      if (encryptTimerRef.current) clearInterval(encryptTimerRef.current);
      clearInterval(lockTimer);
    };
  }, [active, paid]);

  // ransom countdown (decreasing)
  useEffect(() => {
    if (!active || paid) return;
    countdownRef.current = setInterval(() => {
      setRansomTime((t) => Math.max(0, t - 60)); // skip 60s per tick for drama
      droneAlarm();
    }, 1500);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [active, paid]);

  // trigger when game state changes via custom event
  useEffect(() => {
    const trigger = () => {
      setActive(true);
      setFiles(SAMPLE_FILES);
      setEncryptedCount(0);
      setRansomTime(TIME_LIMIT);
      setPaid(false);
    };
    window.addEventListener("kian:ransom", trigger);
    return () => window.removeEventListener("kian:ransom", trigger);
  }, []);

  const startNow = () => {
    window.dispatchEvent(new CustomEvent("kian:ransom"));
    useGameStore.getState().addWanted(2);
  };

  const payRansom = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPaid(true);
    setPaying(false);
    successChime();
    useGameStore.getState().addWanted(-5); // clear wanted
    toast({
      title: "باج پرداخت شد (شوخی)",
      description: "فایل‌هایت ... ظاهراً بازگشتند. ولی اینجا واقعی نبود.",
    });
    // close after a bit
    setTimeout(() => setActive(false), 4000);
  };

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!active) {
    return (
      <section id="ransom" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
        <div className="hacker-panel hacker-panel-red rounded-sm p-6 sm:p-8 text-center">
          <Lock className="mx-auto mb-3 h-12 w-12 text-destructive text-glow-red" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-black text-destructive text-glow-red mb-2">
            <GlitchText text="ماشین باج‌افزار" red />
          </h2>
          <p className="text-xs text-[#ff8899]" dir="ltr">
            RANSOMWARE SIMULATOR — DO NOT PANIC
          </p>
          <p className="mt-4 text-sm text-[#ff8899] max-w-xl mx-auto leading-7">
            یه شبیه‌سازی باج‌افزاره که فایل‌هایت رو «رمزگذاری» می‌کنه، یه شمارش معکوس ۴۸
            ساعته می‌ده و باج ۳ BTC می‌خواد. تمام فایل‌ها و زمان‌ها فیک هستن. اگه
            نمی‌خوای بترسی، نزنش.
          </p>
          <Button
            onClick={startNow}
            className="mt-6 bg-destructive font-bold text-white hover:bg-[#cc1122] shadow-[0_0_24px_rgba(255,34,51,0.4)]"
            size="lg"
          >
            <FileWarning className="ml-2 h-5 w-5" aria-hidden="true" />
            آزادسازی باج‌افزار
          </Button>
        </div>
      </section>
    );
  }

  if (paid) {
    return (
      <section id="ransom" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
        <div className="hacker-panel rounded-sm p-8 text-center fade-up">
          <Check className="mx-auto mb-3 h-12 w-12 text-primary text-glow" aria-hidden="true" />
          <h2 className="text-2xl font-black text-primary text-glow mb-2" dir="ltr">
            <GlitchText text="FILES RECOVERED" />
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            فایل‌هایت (که واقعاً وجود نداشتند) بازگشتند. یادت باشه: در دنیای واقعی،
            پرداخت باج هیچ تضمینی برای بازگشت فایل نیست.
          </p>
        </div>
      </section>
    );
  }

  const allLocked = encryptedCount === files.length;
  const totalSize = files.reduce((acc, f) => acc + parseFloat(f.size), 0);
  const pct = Math.round((encryptedCount / files.length) * 100);

  return (
    <section
      id="ransom"
      className="relative z-10 mx-auto max-w-6xl px-4 py-14"
    >
      {/* header */}
      <div className="warning-stripes mb-6 rounded-sm px-4 py-3 violent-shake">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Lock className="h-7 w-7 text-destructive text-glow-red heartbeat" aria-hidden="true" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-destructive text-glow-red">
                <GlitchText text="سیستم شما رمزگذاری شد" red />
              </h2>
              <p className="font-mono-hacker text-[10px] text-[#ff8899]" dir="ltr">
                YOUR FILES HAVE BEEN ENCRYPTED — KIAN-RANSOMWARE v3.0
              </p>
            </div>
          </div>
          {/* countdown */}
          <div className="text-right" dir="ltr">
            <p className="font-mono-hacker text-[10px] text-[#ff8899]">TIME REMAINING</p>
            <p className="font-mono-hacker text-2xl font-black text-destructive text-glow-red cursor-blink">
              {fmtTime(ransomTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* file list */}
        <div className="lg:col-span-2 hacker-panel hacker-panel-red rounded-sm p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ff8899]">
              <FileWarning className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono-hacker text-xs font-bold" dir="ltr">
                ENCRYPTING FILES — {encryptedCount}/{files.length}
              </span>
            </div>
            <span className="font-mono-hacker text-xs text-destructive" dir="ltr">
              {pct}%
            </span>
          </div>
          {/* progress bar */}
          <div className="mb-3 h-2.5 w-full border border-destructive/60 bg-[#160508]">
            <div
              className="h-full bg-gradient-to-r from-[#ffb300] to-[#ff2233] transition-all duration-300"
              style={{
                width: `${pct}%`,
                boxShadow: "0 0 12px rgba(255,34,51,0.7)",
              }}
            />
          </div>
          {/* file rows */}
          <div className="space-y-1 font-mono-hacker text-[11px]" dir="ltr">
            {files.map((f, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-2 rounded-sm px-2 py-1 ${
                  f.status === "locked"
                    ? "bg-[#2a0409] text-destructive"
                    : f.status === "encrypting"
                      ? "bg-[#1c1503] text-[#ffb300]"
                      : "text-muted-foreground"
                }`}
              >
                <span className="truncate flex-1">
                  {f.status === "locked" && "🔒 "}
                  {f.status === "encrypting" && "⚡ "}
                  {f.status === "pending" && "⏳ "}
                  {f.name}.kianlock
                </span>
                <span className="text-muted-foreground shrink-0">{f.size}</span>
                <span className="shrink-0 w-20 text-right">
                  {f.status === "locked" && "LOCKED"}
                  {f.status === "encrypting" && "ENCRYPTING..."}
                  {f.status === "pending" && "PENDING"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            مجموع داده‌ی هدف: ~{totalSize.toFixed(1)} GB — کل این حجم «رمزگذاری» شده.
            کلید رمزگشایی روی سرورهای مخفی سازمان کیان نگه‌داری می‌شود.
          </p>
        </div>

        {/* ransom panel */}
        <div className="space-y-4">
          {/* demand */}
          <div className="hacker-panel hacker-panel-red danger-breathe rounded-sm p-4 text-center">
            <Bitcoin className="mx-auto mb-2 h-10 w-10 text-[#ffb300]" aria-hidden="true" />
            <p className="font-mono-hacker text-xs text-[#ff8899]" dir="ltr">
              RANSOM DEMAND
            </p>
            <p className="font-mono-hacker text-3xl font-black text-[#ffb300] my-2" dir="ltr">
              3.00 BTC
            </p>
            <p className="text-xs text-[#ff8899]">
              ≈ ۱۸۰,۰۰۰ دلار — به آدرس زیر واریز کنید
            </p>
            <p
              dir="ltr"
              className="mt-2 break-all rounded-sm bg-[#0a0204] p-2 font-mono-hacker text-[10px] text-primary text-glow-dim border border-border"
            >
              bc1qkian7gh0st4x9pq2dn1ghtcore9fz8w
            </p>
          </div>

          {/* warning */}
          <div className="hacker-panel hacker-panel-red rounded-sm p-4">
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4 heartbeat" aria-hidden="true" />
              <span className="font-mono-hacker text-xs font-bold" dir="ltr">
                WARNING
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#ff8899] leading-5">
              <li>• اگر پرداخت نکنی، کلید پس از ۴۸ ساعت نابود می‌شود.</li>
              <li>• پلیس نمی‌تواند کمک کند. ما ناشناسیم.</li>
              <li>• آنتی‌ویروس شما را نجات نمی‌دهد.</li>
              <li>• این تنها راه بازگشت فایل‌هایت است.</li>
              <li>• <span className="text-destructive font-bold">سازمان کیان</span> منتظر است.</li>
            </ul>
          </div>

          {/* pay button */}
          <Button
            onClick={payRansom}
            disabled={paying}
            className="w-full bg-[#ffb300] font-black text-[#1a0e00] hover:bg-[#ffd055] shadow-[0_0_24px_rgba(255,179,0,0.5)]"
            size="lg"
          >
            {paying ? (
              <>
                <Clock className="ml-2 h-5 w-5 animate-spin" aria-hidden="true" />
                در حال پرداخت ...
              </>
            ) : (
              <>
                <Bitcoin className="ml-2 h-5 w-5" aria-hidden="true" />
                پرداخت باج (شوخی)
              </>
            )}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            هیچ تراکنش واقعی انجام نمی‌شود. این دکمه صرفاً شبیه‌سازی است.
          </p>
        </div>
      </div>

      {allLocked && (
        <div className="mt-4 hacker-panel hacker-panel-red violent-shake rounded-sm p-4 text-center fade-up">
          <p className="font-mono-hacker text-lg font-black text-destructive text-glow-red" dir="ltr">
            ENCRYPTION COMPLETE — KEY STORED OFFLINE
          </p>
          <p className="mt-1 text-sm text-[#ff8899]">
            تمام فایل‌هایت رمزگذاری شد. حالا فقط باج باقی مانده.
          </p>
        </div>
      )}
    </section>
  );
}
