"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert, AlertTriangle, Scale } from "lucide-react";

const BOOT_LINES: { tag: string; text: string; cls: string }[] = [
  { tag: "KIAN-OS v4.0.4", text: "در حال بوت‌کردن هسته ...", cls: "text-foreground" },
  { tag: "OK", text: "بارگذاری ماژول‌های رمزنگاری AES-256", cls: "text-foreground" },
  { tag: "OK", text: "اتصال به شبکه TOR از طریق ۷ نود رمزگذاری‌شده", cls: "text-foreground" },
  { tag: "..", text: "دور زدن فایروال ارائه‌دهنده خدمات ...", cls: "text-muted-foreground" },
  { tag: "OK", text: "فایروال دور زده شد", cls: "text-foreground" },
  { tag: "..", text: "پنهان‌سازی آدرس IP و جعل مکان جغرافیایی ...", cls: "text-muted-foreground" },
  { tag: "OK", text: "هویت شما ناشناس است", cls: "text-foreground" },
  { tag: "WARN", text: "ردیابی معکوس از سمت ۳ سرور ناشناس دفع شد", cls: "text-[#ffb300]" },
  { tag: "OK", text: "بارگذاری رابط کاربری سازمان کیان", cls: "text-foreground" },
  { tag: "GRANTED", text: "دسترسی تایید شد", cls: "text-glow font-bold" },
];

type Phase = "warning" | "boot" | "done";

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("warning");
  const [visibleCount, setVisibleCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(5);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(onDone, 700);
  };

  // warning phase: 5 second countdown, then auto-advance to boot
  useEffect(() => {
    if (phase !== "warning") return;
    const iv = setInterval(() => {
      setWarningSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase !== "warning" || warningSeconds > 0) return;
    setPhase("boot");
  }, [phase, warningSeconds]);

  // boot phase
  useEffect(() => {
    if (phase !== "boot") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      setProgress(Math.min(100, Math.round((i / BOOT_LINES.length) * 100)));
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(finish, 1400);
      }
    }, 340);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const skip = () => {
      if (phase === "warning") setPhase("boot");
      else if (phase === "boot") finish();
    };
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [phase]);

  // WARNING SPLASH
  if (phase === "warning") {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] p-4 cursor-pointer violent-shake"
        onClick={() => setPhase("boot")}
        role="button"
        aria-label="ادامه"
      >
        {/* top stripe */}
        <div className="absolute top-0 inset-x-0 h-2 bg-destructive" />
        <div className="absolute bottom-0 inset-x-0 h-2 bg-destructive" />

        <div className="max-w-3xl w-full text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <ShieldAlert className="h-14 w-14 text-destructive text-glow-red heartbeat" aria-hidden="true" />
            <Scale className="h-12 w-12 text-[#ffb300]" aria-hidden="true" />
            <AlertTriangle className="h-14 w-14 text-destructive text-glow-red heartbeat" aria-hidden="true" />
          </div>

          <h1
            className="text-3xl sm:text-5xl font-black text-destructive text-glow-red scream-flicker mb-4"
            dir="ltr"
          >
            GOVERNMENT WARNING
          </h1>

          <div className="space-y-3 text-sm sm:text-base leading-7 text-foreground/85">
            <p>
              دسترسی غیرمجاز به این سیستم، یک جرم فدرال است که طبق ماده ۱۰۳۰
              عنوان ۱۸ کد مجازات ایالات متحده آمریکا، با حداکثر ۲۰ سال حبس
              همراه است.
            </p>
            <p className="text-[#ff8899]">
              فعالیت شما در حال رهگیری توسط FEMA, INTERPOL و سازمان کیان است.
              آدرس IP شما، موقعیت جغرافیایی، مشخصات مرورگر و مک‌آدرس شما به‌صورت
              خودکار ثبت و به مراجع ذی‌صلاح ارسال می‌شود.
            </p>
            <p className="text-[#ffb300]">
              ادامه به معنای پذیرش خطرات ناشناخته است. هیچ بازگشتی وجود ندارد.
            </p>
            <p className="text-muted-foreground text-xs mt-4">
              (البته این فقط یه سایت تفریحیه و هیچ چیز واقعی در کار نیست — ولی
              اگه دلت خواست ترس‌رو، ادامه بده)
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="font-mono-hacker text-2xl text-destructive cursor-blink">
              {warningSeconds}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhase("boot");
              }}
              className="rounded-sm border border-destructive/60 bg-[#160508] px-4 py-2 font-mono-hacker text-xs text-destructive hover:bg-[#2a0409]"
            >
              ادامه با مسئولیت خودت
            </button>
          </div>

          <p className="mt-4 text-[10px] text-muted-foreground">
            یا صبر کن تا شمارش معکوس تمام شود، یا کلیک کن
          </p>
        </div>
      </div>
    );
  }

  // BOOT PHASE
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020403] p-4 transition-opacity duration-700 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={finish}
      role="button"
      aria-label="رد کردن انیمیشن بوت"
    >
      <div className="w-full max-w-2xl font-mono-hacker text-xs sm:text-sm space-y-1.5" dir="ltr">
        {BOOT_LINES.slice(0, visibleCount).map((line, idx) => (
          <p key={idx} className={`${line.cls} flex items-start gap-2`}>
            <span dir="ltr" className="shrink-0 w-28 text-left opacity-90">
              [{line.tag}]
            </span>
            <span dir="rtl" className="flex-1 text-right">
              {line.text}
            </span>
          </p>
        ))}
        {visibleCount < BOOT_LINES.length && (
          <p className="text-foreground cursor-blink">&nbsp;</p>
        )}
      </div>

      <div className="mt-8 w-full max-w-2xl" dir="ltr">
        <div className="flex justify-between font-mono-hacker text-[10px] text-muted-foreground mb-1">
          <span>LOADING KIAN_CORE</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full border border-[#0f3a18] bg-[#030803]">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 12px rgba(0,255,65,0.8)",
            }}
          />
        </div>
      </div>

      <p className="mt-10 text-[11px] text-muted-foreground animate-pulse">
        برای رد کردن، کلیک کنید یا کلیدی بزنید
      </p>

      {visibleCount >= BOOT_LINES.length && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="access-flash font-mono-hacker text-3xl sm:text-5xl font-black text-glow text-primary tracking-[0.35em]">
            ACCESS GRANTED
          </span>
        </div>
      )}
    </div>
  );
}

