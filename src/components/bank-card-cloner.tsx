"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Cpu,
  Shield,
  Lock,
} from "lucide-react";
import { glitchBlip, successChime, droneAlarm } from "@/lib/sound";

/* Iranian Bank Card Cloner Simulator.
 * Lets user "clone" fake Iranian bank cards. Educational/parody only.
 */

type Card = {
  bank: string;
  bankColor: string;
  number: string;
  holder: string;
  exp: string;
  cvv: string;
  iban: string;
  balance: string;
};

const BANKS = [
  { name: "بانک ملت", color: "#ffcc00", textColor: "#000" },
  { name: "بانک صادرات", color: "#0066b3", textColor: "#fff" },
  { name: "بانک ملی", color: "#00a651", textColor: "#fff" },
  { name: "بانک سپه", color: "#7a4d8e", textColor: "#fff" },
  { name: "بانک کشاورزی", color: "#c69821", textColor: "#fff" },
  { name: "بانک پاسارگاد", color: "#e30613", textColor: "#fff" },
  { name: "بانک پارسیان", color: "#005baa", textColor: "#fff" },
  { name: "بانک تجارت", color: "#0066b3", textColor: "#fff" },
];

const PERSIAN_NAMES = [
  "علی محمدی",
  "زهرا حسینی",
  "محمد رضایی",
  "فاطمه کریمی",
  "حسین احمدی",
  "مریم موسوی",
  "رضا صادقی",
  "سارا اکبری",
  "امیر تهرانی",
  "نگار شیرازی",
];

function randomDigits(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

function formatCardNumber(num: string) {
  return num.match(/.{1,4}/g)?.join(" ") ?? num;
}

function generateCard(): Card {
  const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
  return {
    bank: bank.name,
    bankColor: bank.color,
    number: randomDigits(16),
    holder: PERSIAN_NAMES[Math.floor(Math.random() * PERSIAN_NAMES.length)],
    exp: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 6) + 25).slice(-2)}`,
    cvv: randomDigits(3),
    iban: `IR${randomDigits(24)}`,
    balance: `${Math.floor(Math.random() * 500 + 5).toLocaleString("en-US")},000,000 تومان`,
  };
}

export default function BankCardCloner() {
  const [card, setCard] = useState<Card | null>(null);
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clonedCount, setClonedCount] = useState(0);
  const { toast } = useToast();

  const clone = async () => {
    setScanning(true);
    setRevealed(false);
    droneAlarm();
    await new Promise((r) => setTimeout(r, 2500));
    glitchBlip();
    const newCard = generateCard();
    setCard(newCard);
    setScanning(false);
    setRevealed(true);
    setClonedCount((c) => c + 1);
    useGameStore.getState().addWanted(2);
    successChime();
    toast({
      title: "کارت شبیه‌سازی شد!",
      description: `${newCard.bank} - ${newCard.holder}`,
    });
  };

  const copyCard = async () => {
    if (!card) return;
    try {
      const text = `${card.bank}\n${formatCardNumber(card.number)}\n${card.holder}\n${card.exp}\nCVV: ${card.cvv}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "کپی شد", description: "اطلاعات کارت در حافظه (شوخی)" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "کپی نشد", description: "مرورگر اجازه نداد" });
    }
  };

  return (
    <section id="cardcloner" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-[#ffb300] text-glow-dim" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#ffb300]">
              <GlitchText text="شبیه‌ساز شبیه‌سازی کارت بانکی" />
            </h2>
            <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              IRANIAN BANK CARD CLONER — SIMULATION ONLY
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-[#ffb300]/40 bg-[#1c1503] px-2 py-1 font-mono-hacker text-[10px] text-[#ffb300]" dir="ltr">
          CLONED: {clonedCount}
        </div>
      </div>

      {/* warning */}
      <div className="warning-stripes mb-6 rounded-sm px-4 py-3">
        <p className="text-center text-xs sm:text-sm text-[#ff8899]">
          <Shield className="mb-0.5 ml-1 inline h-4 w-4" aria-hidden="true" />
          این بخش صرفاً یه شبیه‌ساز تفریحیه. تمام کارت‌ها، اعداد، نام‌ها و موجودی‌ها تصادفی و کاملاً تخیلی هستن. هیچ کارت واقعی کپی نمی‌شه و هیچ تراکنشی انجام نمیشه.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* card display */}
        <div className="lg:col-span-2">
          {!card && !scanning && (
            <div className="hacker-panel rounded-sm p-10 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h3 className="mb-2 text-lg font-bold text-foreground">
                کارت موجود نیست
              </h3>
              <p className="text-sm text-muted-foreground">
                برای شبیه‌سازی کارت، روی دکمه‌ی زیر بزن.
              </p>
            </div>
          )}

          {scanning && (
            <div className="hacker-panel brutal-frame warn-flash rounded-sm p-10 text-center">
              <Cpu className="mx-auto mb-4 h-12 w-12 text-[#ffb300] chaos-spin-slow" aria-hidden="true" />
              <h3 className="mb-2 text-lg font-bold text-[#ffb300] animate-pulse">
                در حال اسکن تراشه کارت ...
              </h3>
              <p className="text-sm text-muted-foreground">
                خواندن داده‌های مغناطیسی، شناسایی بانک، استخراج CVV
              </p>
              <div className="mx-auto mt-4 max-w-xs space-y-1 font-mono-hacker text-[10px] text-[#ffb300]" dir="ltr">
                <p className="animate-pulse">[+] RFID scan: 13.56 MHz ...</p>
                <p className="animate-pulse">[+] Reading EMV chip ...</p>
                <p className="animate-pulse">[+] Extracting PAN ...</p>
                <p className="animate-pulse cursor-blink">[+] Decrypting track 2 ...</p>
              </div>
            </div>
          )}

          {card && revealed && (
            <div className="fade-up">
              {/* the bank card visual */}
              <div
                className="relative mx-auto max-w-md rounded-xl p-6 shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${card.bankColor} 0%, ${card.bankColor}dd 60%, ${card.bankColor}aa 100%)`,
                  color: BANKS.find((b) => b.name === card.bank)?.textColor,
                  aspectRatio: "1.6",
                  boxShadow: "0 0 30px rgba(255,179,0,0.4), 0 4px 12px rgba(0,0,0,0.6)",
                }}
              >
                {/* shine effect */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  }}
                />
                {/* chip */}
                <div className="absolute top-6 left-6 h-8 w-10 rounded-sm" style={{ background: "linear-gradient(135deg, #ffd700, #b8860b)" }}>
                  <div className="absolute inset-1 border border-yellow-900/40 rounded-sm" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-900/30" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-900/30" />
                </div>
                {/* bank name */}
                <div className="text-right">
                  <p className="font-bold text-base">{card.bank}</p>
                  <p className="text-[10px] opacity-70" dir="ltr">DEBIT CARD</p>
                </div>
                {/* card number */}
                <p className="absolute bottom-20 left-6 right-6 font-mono-hacker text-lg tracking-widest" dir="ltr">
                  {formatCardNumber(card.number)}
                </p>
                {/* holder & exp */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] opacity-60" dir="ltr">CARD HOLDER</p>
                    <p className="font-bold text-sm">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] opacity-60" dir="ltr">EXPIRES</p>
                    <p className="font-mono-hacker text-sm" dir="ltr">{card.exp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] opacity-60" dir="ltr">CVV</p>
                    <p className="font-mono-hacker text-sm" dir="ltr">{card.cvv}</p>
                  </div>
                </div>
                {/* shetab logo */}
                <div className="absolute top-6 right-6 h-8 w-8 rounded-full border-2 opacity-60" />
              </div>

              {/* actions */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => setRevealed((v) => !v)}
                  variant="outline"
                  size="sm"
                  className="border-[#ffb300]/60 text-[#ffb300] hover:bg-[#1c1503]"
                >
                  {revealed ? <EyeOff className="ml-2 h-4 w-4" /> : <Eye className="ml-2 h-4 w-4" />}
                  {revealed ? "پنهان کردن" : "نمایش"}
                </Button>
                <Button
                  onClick={copyCard}
                  variant="outline"
                  size="sm"
                  className="border-primary/60 text-primary hover:bg-[#041006]"
                >
                  {copied ? <CheckCircle className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
                  {copied ? "کپی شد" : "کپی اطلاعات"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* info panel */}
        <div className="space-y-3">
          {card && revealed && (
            <>
              <div className="hacker-panel rounded-sm p-4 fade-up">
                <h3 className="mb-3 font-mono-hacker text-xs font-bold text-[#ffb300]" dir="ltr">
                  EXTRACTED DATA
                </h3>
                <div className="space-y-2 text-[11px]" dir="rtl">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">شماره کارت:</span>
                    <span className="font-mono-hacker text-foreground" dir="ltr">{formatCardNumber(card.number)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">دارنده:</span>
                    <span className="text-foreground">{card.holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">انقضا:</span>
                    <span className="font-mono-hacker text-foreground" dir="ltr">{card.exp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CVV2:</span>
                    <span className="font-mono-hacker text-destructive" dir="ltr">{card.cvv}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">شبا (IBAN):</span>
                    </div>
                    <p className="font-mono-hacker text-[10px] text-foreground break-all" dir="ltr">
                      {card.iban}
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">موجودی:</span>
                    <span className="font-mono-hacker text-[#ffb300] font-bold" dir="ltr">{card.balance}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={clone}
            disabled={scanning}
            className="w-full bg-[#ffb300] font-black text-[#1a0e00] hover:bg-[#ffd055] shadow-[0_0_24px_rgba(255,179,0,0.5)]"
            size="lg"
          >
            <Cpu className="ml-2 h-5 w-5" aria-hidden="true" />
            {scanning ? "در حال اسکن ..." : "شبیه‌سازی کارت جدید"}
          </Button>

          <p className="text-center text-[10px] text-muted-foreground">
            هیچ کارت واقعی در کار نیست — همه‌چیز تصادفی و تخیلی است
          </p>
        </div>
      </div>
    </section>
  );
}
