"use client";

import { useEffect, useRef, useState } from "react";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { whisperNoise, glitchBlip } from "@/lib/sound";
import { Smartphone, MessageSquare, Eye, Phone, X } from "lucide-react";

/* Fake SMS interception simulator.
 * Shows fake SMS messages being intercepted in real-time from Iranian numbers.
 */

type Sms = {
  id: number;
  from: string;
  to: string;
  text: string;
  time: string;
  type: "بانکی" | "شخصی" | "احراز هویت" | "تبلیغاتی" | "دولتی";
};

const SAMPLE_SENDERS = [
  "+98 912 845 9210",
  "+98 935 112 8847",
  "+98 919 220 4451",
  "+98 910 778 9234",
  "+98 937 412 7761",
  "+98 922 884 1009",
  "+98 938 119 2847",
  "+98 911 442 8856",
  "+98 939 220 7711",
];

const SAMPLE_MESSAGES: { text: string; type: Sms["type"] }[] = [
  { text: "بانک ملت - کد تأیید: 847221. این کد را به کسی ندهید.", type: "بانکی" },
  { text: "بانک صادرات - تراکنش: برداشت ۲٬۵۰۰٬۰۰۰ تومان. موجودی: ۱۸٬۴۲۰٬۰۰۰", type: "بانکی" },
  { text: "سلام عزیزم، شام آماده‌ست. زود بیا", type: "شخصی" },
  { text: "کد ورود به سامانه ثبت‌احوال: 7291", type: "احراز هویت" },
  { text: "پیشنهاد ویژه! ۵۰٪ تخفیف روی خرید پلن ۱۲۳", type: "تبلیغاتی" },
  { text: "اقامتگاه ۸ شب - هتل اسپیناس - تأیید شد", type: "شخصی" },
  { text: "بانک ملی - واریز ۸٬۵۰۰٬۰۰۰ تومان از طرف شرکت پاسارگاد", type: "بانکی" },
  { text: "رمز یک‌بارمصرف سامانه دولت: 928174", type: "دولتی" },
  { text: "پسرم، تماس بگیر سریع. مامان", type: "شخصی" },
  { text: "اسنپ - سفر شما با کد 8472 تأیید شد", type: "تبلیغاتی" },
  { text: "تALT: کد ورود به پرتال: 102938", type: "احراز هویت" },
  { text: "پیامک شما دریافت شد. در انتظار پاسخ اپراتور", type: "تبلیغاتی" },
];

let idCounter = 1;

const TYPE_COLORS = {
  "بانکی": "text-[#ffb300]",
  "شخصی": "text-foreground",
  "احراز هویت": "text-destructive text-glow-red",
  "تبلیغاتی": "text-muted-foreground",
  "دولتی": "text-primary text-glow-dim",
};

export default function SmsIntercept() {
  const [messages, setMessages] = useState<Sms[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Sms | null>(null);
  const [interceptCount, setInterceptCount] = useState(0);
  const godMode = useGameStore((s) => s.godMode);

  // spawn messages
  useEffect(() => {
    if (godMode) return;
    const spawn = () => {
      const sender = SAMPLE_SENDERS[Math.floor(Math.random() * SAMPLE_SENDERS.length)];
      const msg = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const sms: Sms = {
        id: idCounter++,
        from: sender,
        to: "+98 912 ┄┄┄ ┄┄┄",
        text: msg.text,
        time,
        type: msg.type,
      };
      setMessages((prev) => [sms, ...prev].slice(0, 20));
      setInterceptCount((c) => c + 1);
      whisperNoise();
    };
    const iv = setInterval(spawn, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, [godMode]);

  const close = () => {
    setSelected(null);
    setOpen(false);
  };

  return (
    <>
      {/* floating indicator (bottom-right, above data exfil) */}
      {!open && !godMode && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-sm border border-destructive/60 bg-[#160508]/95 px-3 py-2 font-mono-hacker text-[11px] text-destructive hover:bg-[#2a0409] shadow-[0_0_18px_rgba(255,34,51,0.3)]"
          style={{ transform: messages.length > 0 ? "translateY(-80px)" : "none" }}
          aria-label="باز کردن رهگیری پیامک"
        >
          <Smartphone className="h-3.5 w-3.5 heartbeat" aria-hidden="true" />
          <span className="cursor-blink">{interceptCount} پیامک رهگیری</span>
        </button>
      )}

      {/* popup panel */}
      {open && !godMode && (
        <div
          className="fixed bottom-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] hacker-panel hacker-panel-red rounded-sm fade-up"
          style={{ transform: "translateY(-80px)" }}
          role="dialog"
          aria-label="پیامک‌های رهگیری‌شده"
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-destructive/30 bg-[#0a0204] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              <span className="font-mono-hacker text-[11px] font-bold text-destructive text-glow-red" dir="ltr">
                SMS INTERCEPT
              </span>
            </div>
            <button
              onClick={close}
              className="text-muted-foreground hover:text-destructive"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* stats bar */}
          <div className="flex items-center justify-between border-b border-destructive/20 px-3 py-1.5 font-mono-hacker text-[10px]">
            <span className="flex items-center gap-1 text-muted-foreground" dir="ltr">
              <MessageSquare className="h-3 w-3" aria-hidden="true" />
              LIVE
            </span>
            <span className="text-destructive" dir="ltr">INTERCEPTED: {interceptCount}</span>
          </div>

          {/* messages */}
          <div className="max-h-[260px] overflow-y-auto px-3 py-2 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-[11px] text-muted-foreground py-4">
                در حال اسکن شبکه موبایل ...
              </p>
            )}
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  glitchBlip();
                }}
                className="block w-full text-right fade-up rounded-sm border border-destructive/20 bg-[#0a0204] p-2 hover:border-destructive/50 hover:bg-[#160508]"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className={`font-mono-hacker text-[10px] ${TYPE_COLORS[m.type]}`} dir="ltr">
                    {m.from}
                  </span>
                  <span className="font-mono-hacker text-[9px] text-muted-foreground" dir="ltr">
                    {m.time}
                  </span>
                </div>
                <p className="text-[11px] leading-5 text-foreground line-clamp-2">{m.text}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`rounded-sm px-1.5 py-0.5 text-[9px] bg-[#160508] ${TYPE_COLORS[m.type]}`}>
                    {m.type}
                  </span>
                  <Eye className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>

          {/* footer */}
          <div className="border-t border-destructive/30 bg-[#0a0204] px-3 py-1.5 flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <p className="text-[10px] text-muted-foreground" dir="ltr">
              BTS HIJACK: ACTIVE // 7 SECTORS
            </p>
          </div>
        </div>
      )}

      {/* SMS detail popup */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-label="جزئیات پیامک"
        >
          <div
            className="hacker-panel hacker-panel-red w-full max-w-md rounded-sm p-4 fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-destructive text-glow-red">
                <GlitchText text="پیامک رهگیری‌شده" red />
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">فرستنده:</span>
                <span className="font-mono-hacker text-primary" dir="ltr">{selected.from}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">گیرنده:</span>
                <span className="font-mono-hacker text-muted-foreground" dir="ltr">{selected.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">زمان:</span>
                <span className="font-mono-hacker text-muted-foreground" dir="ltr">{selected.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع:</span>
                <span className={`font-mono-hacker ${TYPE_COLORS[selected.type]}`}>{selected.type}</span>
              </div>
              <div className="mt-3 rounded-sm border border-border bg-[#030803] p-3">
                <p className="text-[11px] leading-6 text-foreground">{selected.text}</p>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                تمام شماره‌ها و پیام‌ها تصادفی و ساختگی هستند
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
