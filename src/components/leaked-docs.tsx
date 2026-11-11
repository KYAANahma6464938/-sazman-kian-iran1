"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { glitchBlip, whisperNoise } from "@/lib/sound";
import {
  FileText,
  Download,
  Eye,
  Lock,
  Database,
  Building2,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
} from "lucide-react";

type Doc = {
  id: number;
  title: string;
  source: string;
  type: "هویتی" | "بانکی" | "پزشکی" | "دانشگاهی" | "شرکتی" | "دولتی";
  size: string;
  pages: number;
  preview: string;
  downloaded?: boolean;
};

const DOCS: Omit<Doc, "id" | "downloaded">[] = [
  {
    title: "فهرست کامل کارمندان وزارت آموزش و پرورش",
    source: "portal.medu.ir",
    type: "دولتی",
    size: "247 MB",
    pages: 8420,
    preview: "نام، کدملی، شماره تماس، حقوق ماهانه، آدرس منزل، سابقه‌ی بیمه — ۸٬۴۲۰ کارمند. فایل PDF رمزگشایی‌شده.",
  },
  {
    title: "پایگاه‌داده‌ی بیمه‌شدگان تأمین اجتماعی",
    source: "dash.ssaa.ir",
    type: "هویتی",
    size: "1.4 GB",
    pages: 0,
    preview: "۴۸ میلیون رکورد بیمه‌ای شامل کد ملی، شماره بیمه، سوابق درمانی، نسخه‌های دارویی.",
  },
  {
    title: "تراکنش‌های بانکی ۳۰ روز اخیر - بانک ملت",
    source: "bankmellat.ir",
    type: "بانکی",
    size: "892 MB",
    pages: 0,
    preview: "۱۴ میلیون تراکنش شامل شماره کارت، مبلغ، تاریخ، کد پذیرنده. آماده برای استخراج.",
  },
  {
    title: "پرونده‌های پزشکی بیمارستان‌های دانشگاهی",
    source: "treatment_ir",
    type: "پزشکی",
    size: "2.3 GB",
    pages: 0,
    preview: "اطلاعات بیماران شامل تشخیص، نسخه‌ها، تاریخچه‌ی بیماری، آزمایش‌ها. اطلاعات حساس.",
  },
  {
    title: "نتایج کنکور ۱۴۰۳ - کل کشور",
    source: "konkur.sanjesh.org",
    type: "دانشگاهی",
    size: "184 MB",
    pages: 0,
    preview: "اطلاعات ۱.۸ میلیون داوطلب: نام، کدملی، رتبه، انتخاب رشته. سورت‌شده بر اساس رتبه.",
  },
  {
    title: "اطلاعات مشترکین شرکت‌های بزرگ",
    source: "internal_corp",
    type: "شرکتی",
    size: "412 MB",
    pages: 0,
    preview: "اطلاعات مشتریان اسنپ، تپسی، دیجی‌کالا — شماره موبایل، ایمیل، آدرس، تاریخچه‌ی خرید.",
  },
  {
    title: "لیست مأموران سازمان اطلاعات",
    source: "??? [CLASSIFIED]",
    type: "دولتی",
    size: "12 KB",
    pages: 47,
    preview: "۴۷ مأمور فعال. نام مستعار، رتبه، حوزه‌ی فعالیت. اطلاعات فوق‌محرمانه.",
  },
  {
    title: "اطلاعات کامل وام‌گیرندگان بانک مسکن",
    source: "bankmaskan.ir",
    type: "بانکی",
    size: "678 MB",
    pages: 0,
    preview: "اطلاعات وام‌گیرندگان مسکن: نام، کدملی، مبلغ وام، آدرس ملک، ضامنین.",
  },
  {
    title: "اسناد محرمانه‌ی دفتر رئیس‌جمهور",
    source: "??? [CLASSIFIED — LVL 5]",
    type: "دولتی",
    size: "8.4 MB",
    pages: 124,
    preview: "مکاتبات داخلی، گزارش‌های محرمانه، دستورالعمل‌های مدیریتی. سطح دسترسی: ۵.",
  },
];

let idCounter = 1;

const TYPE_COLORS = {
  "هویتی": "text-primary text-glow-dim",
  "بانکی": "text-[#ffb300]",
  "پزشکی": "text-destructive text-glow-red",
  "دانشگاهی": "text-[#00e5ff]",
  "شرکتی": "text-foreground",
  "دولتی": "text-[#ff6644]",
};

const TYPE_ICONS = {
  "هویتی": Shield,
  "بانکی": Database,
  "پزشکی": Heart,
  "دانشگاهی": GraduationCap,
  "شرکتی": Briefcase,
  "دولتی": Building2,
};

export default function LeakedDocs() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [downloadedCount, setDownloadedCount] = useState(0);

  useEffect(() => {
    setDocs(DOCS.map((d) => ({ ...d, id: idCounter++ })));
  }, []);

  const download = (doc: Doc) => {
    glitchBlip();
    whisperNoise();
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, downloaded: true } : d))
    );
    setDownloadedCount((c) => c + 1);
    setSelected(doc);
    useGameStore.getState().addWanted(1);
  };

  const godMode = useGameStore((s) => s.godMode);

  return (
    <section id="leakeddocs" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
              <GlitchText text="اسناد نشت‌شده‌ی محرمانه ایران" />
            </h2>
            <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              CLASSIFIED IRANIAN LEAKED DOCUMENTS
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-primary/40 bg-[#041006] px-2 py-1 font-mono-hacker text-[10px] text-primary" dir="ltr">
          DOWNLOADED: {downloadedCount}
        </div>
      </div>

      {/* warning */}
      <div className="warning-stripes mb-6 rounded-sm px-4 py-3">
        <p className="text-center text-xs sm:text-sm text-[#ff8899]">
          <Shield className="mb-0.5 ml-1 inline h-4 w-4" aria-hidden="true" />
          تمام اسناد، عناوین و منابع کاملاً تخیلی و ساختگی هستند. هیچ داده‌ی واقعی نشت نکرده و هیچ پایگاه‌داده‌ی واقعی مورد دسترسی قرار نگرفته است.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* docs list */}
        <div className="lg:col-span-2 space-y-2">
          {docs.map((d) => {
            const Icon = TYPE_ICONS[d.type];
            return (
              <div
                key={d.id}
                className={`hacker-panel ${d.downloaded ? "hacker-panel-red" : "corner-brackets"} rounded-sm p-3 transition-transform hover:-translate-y-0.5`}
              >
                <button
                  onClick={() => download(d)}
                  className="flex w-full items-start gap-3 text-right"
                  disabled={godMode ? false : !d.downloaded}
                >
                  <Icon className={`h-6 w-6 shrink-0 ${TYPE_COLORS[d.type]}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold leading-5 text-foreground mb-1">
                      {d.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
                      <span>src: {d.source}</span>
                      <span className="text-border">|</span>
                      <span>{d.size}</span>
                      {d.pages > 0 && (
                        <>
                          <span className="text-border">|</span>
                          <span>{d.pages.toLocaleString("en-US")} pages</span>
                        </>
                      )}
                    </div>
                  </div>
                  {d.downloaded ? (
                    <span className="shrink-0 rounded-sm bg-[#2a0409] px-2 py-1 text-[9px] font-bold text-destructive animate-pulse" dir="ltr">
                      OWNED
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-sm bg-[#041006] px-2 py-1 text-[9px] text-muted-foreground" dir="ltr">
                      [LOCK]
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* preview panel */}
        <div className="hacker-panel rounded-sm p-4 min-h-[300px]">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
              PREVIEW
            </h3>
          </div>

          {!selected && (
            <div className="text-center py-8">
              <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-[11px] text-muted-foreground">
                یه سند رو انتخاب کن تا پیش‌نمایش ببینی
              </p>
            </div>
          )}

          {selected && (
            <div className="fade-up">
              <h4 className={`mb-2 text-sm font-bold ${TYPE_COLORS[selected.type]}`}>
                {selected.title}
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">منبع:</span>
                  <span className="font-mono-hacker text-foreground" dir="ltr">{selected.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع:</span>
                  <span className={TYPE_COLORS[selected.type]}>{selected.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">حجم:</span>
                  <span className="font-mono-hacker text-foreground" dir="ltr">{selected.size}</span>
                </div>
                {selected.pages > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">صفحات:</span>
                    <span className="font-mono-hacker text-foreground" dir="ltr">{selected.pages.toLocaleString("en-US")}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 rounded-sm border border-border bg-[#030803] p-3">
                <p className="mb-1 font-mono-hacker text-[9px] text-muted-foreground" dir="ltr">
                  ABSTRACT
                </p>
                <p dir="rtl" className={`text-[11px] leading-6 ${selected.type === "پزشکی" || selected.type === "دولتی" ? "text-destructive/85" : "text-foreground/85"}`}>
                  {selected.preview}
                </p>
              </div>
              <button
                onClick={() => download(selected)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm border border-primary/60 bg-[#041006] py-2 font-mono-hacker text-xs font-bold text-primary hover:bg-[#08170c]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {selected.downloaded ? "دوباره دریافت" : "دریافت سند"}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        تمام اسناد نشت‌شده در این بخش، عناوین و منابع کاملاً تخیلی و شبیه‌سازی‌شده هستند.
      </p>
    </section>
  );
}
