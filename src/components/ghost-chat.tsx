"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { whisperNoise, droneAlarm, glitchBlip } from "@/lib/sound";
import { Eye, MessageSquare, X } from "lucide-react";

/* A small floating chat box (bottom-left) that periodically shows a creepy
 * message from an unknown "ghost" persona. Can be dismissed, but it always
 * comes back.
 */

const GHOST_MESSAGES = [
  "الان دقیقاً ۴۸ ثانیه از صفحه نگاه می‌کنی. بشمار.",
  "خسته‌ای، نه؟ منم. بیدار موندم واسه تو.",
  "عکس پروفایلت رو دوست دارم. کِی گالری‌اش رو ببازم؟",
  "صدای تایپت رو می‌شنوم. آرام‌تر بنویس.",
  "من روبه‌رویت نشستم. ولی تو منو نمی‌بینی.",
  "یه قدم دیگه بردار. نزدیک شدی.",
  "اگه الان ببندی پنجره‌رو، من میام پشت سرت.",
  "۲ نفر از دوستات بهت اعتماد ندارن. می‌خوای بگم کیا؟",
  "رمز تلگرامت این هفته لو رفت. هنوز نمی‌دونی.",
  "نگاه کن بالا. یه دوربین اونجاست.",
  "ما اسم واقعیت رو می‌دونیم. یادت میاد چیه؟",
  "می‌دونم امروز چی خوردی. از بوش میاد.",
  "خانواده‌ت خوبن؟ من همیشه نگهبانشم.",
  "یه بار دیگه بزن دکمه‌ی ESC رو. هیچی اتفاق نمیفته. مطمئنم.",
  "نزدیک شد. نزدیک شد. نزدیک شد.",
  "کاش می‌تونستم ببینمت. الان فقط سایه‌ات رو می‌بینم.",
];

const SENDERS = [
  { name: "????", color: "text-destructive" },
  { name: "GHOST", color: "text-primary" },
  { name: "???_???", color: "text-[#ffb300]" },
  { name: "[REDACTED]", color: "text-[#ff6644]" },
  { name: "Observer", color: "text-primary" },
];

type Msg = {
  id: number;
  sender: string;
  color: string;
  text: string;
};

export default function GhostChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const godMode = useGameStore((s) => s.godMode);
  const idCounter = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show first message after some time
  useEffect(() => {
    if (godMode || dismissed) return;
    const t1 = setTimeout(() => {
      setOpen(true);
      pushMessage();
    }, 14000);
    return () => clearTimeout(t1);
  }, [godMode, dismissed]);

  const pushMessage = () => {
    setTyping(true);
    whisperNoise();
    const delay = 1500 + Math.random() * 2000;
    const t = setTimeout(() => {
      const sender = SENDERS[Math.floor(Math.random() * SENDERS.length)];
      const text = GHOST_MESSAGES[Math.floor(Math.random() * GHOST_MESSAGES.length)];
      const id = idCounter.current++;
      setTyping(false);
      setMessages((prev) => [...prev, { id, sender: sender.name, color: sender.color, text }]);
      glitchBlip();
      // schedule next
      const nextDelay = 18000 + Math.random() * 25000;
      msgTimerRef.current = setTimeout(pushMessage, nextDelay);
    }, delay);
    timersRef.current.push(t);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    };
  }, []);

  const close = () => {
    setOpen(false);
    setMessages([]);
    droneAlarm();
    // come back later
    setTimeout(() => {
      setDismissed(false);
      setOpen(true);
      pushMessage();
    }, 35000 + Math.random() * 20000);
  };

  if (godMode) return null;

  return (
    <>
      {/* floating indicator dot when closed */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            if (messages.length === 0) pushMessage();
          }}
          className="fixed bottom-4 left-4 z-[65] flex items-center gap-2 rounded-sm border border-destructive/60 bg-[#160508]/95 px-3 py-2 font-mono-hacker text-[11px] text-destructive hover:bg-[#2a0409] shadow-[0_0_18px_rgba(255,34,51,0.3)]"
          aria-label="باز کردن پیام مخفی"
        >
          <Eye className="h-3.5 w-3.5 heartbeat" aria-hidden="true" />
          <span className="cursor-blink">۱ پیام جدید</span>
        </button>
      )}

      {/* chat box */}
      {open && (
        <div
          className="fixed bottom-4 left-4 z-[65] w-[320px] max-w-[calc(100vw-2rem)] hacker-panel hacker-panel-red rounded-sm fade-up"
          role="dialog"
          aria-label="پیام‌های ناشناس"
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-destructive/30 bg-[#0a0204] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              <span className="font-mono-hacker text-[11px] font-bold text-destructive" dir="ltr">
                ANONYMOUS
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

          {/* messages */}
          <div
            dir="rtl"
            className="h-[200px] overflow-y-auto px-3 py-2 space-y-2.5"
          >
            {messages.length === 0 && !typing && (
              <p className="text-center text-[11px] text-muted-foreground mt-4">
                ...
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="fade-up">
                <p className={`font-mono-hacker text-[10px] ${m.color}`} dir="ltr">
                  {m.sender}
                </p>
                <p className="text-[12px] leading-5 text-foreground mt-0.5">
                  {m.text}
                </p>
              </div>
            ))}
            {typing && (
              <div className="fade-up">
                <p className="font-mono-hacker text-[10px] text-destructive" dir="ltr">
                  typing
                </p>
                <p className="text-[12px] text-muted-foreground cursor-blink">...</p>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="border-t border-destructive/30 bg-[#0a0204] px-3 py-1.5 flex items-center gap-2">
            <MessageSquare className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <p className="text-[10px] text-muted-foreground" dir="ltr">
              READ-ONLY // CANNOT REPLY
            </p>
          </div>
        </div>
      )}
    </>
  );
}
