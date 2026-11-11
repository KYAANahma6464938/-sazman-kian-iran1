"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/glitch-text";
import { useGameStore } from "@/lib/game-store";
import { whisperNoise, glitchBlip } from "@/lib/sound";
import {
  Folder,
  File,
  Lock,
  Eye,
  Skull,
  Terminal,
  AlertTriangle,
} from "lucide-react";

type Node = {
  name: string;
  type: "folder" | "file" | "locked" | "hidden" | "danger";
  size?: string;
  desc?: string;
  children?: Node[];
};

const FS: Node = {
  name: "/",
  type: "folder",
  children: [
    {
      name: "victims",
      type: "folder",
      children: [
        { name: "2024_archive.db", type: "file", size: "284 MB", desc: "۸٬۴۲۷ رکورد هویتی" },
        { name: "you.dat", type: "file", size: "12 KB", desc: "این فایل مال خودته. هشدار: دست نزن" },
        {
          name: "???",
          type: "locked",
          desc: "رمزگشایی نشده — نیاز به کلید LVL5",
        },
      ],
    },
    {
      name: "spoils",
      type: "folder",
      children: [
        { name: "wallets.leak", type: "file", size: "8.2 MB", desc: "۱۲٬۰۰۰ کیف پول رمزشکسته" },
        { name: "photos.tar.gz", type: "hidden", size: "3.4 GB", desc: "محتوای پنهان — فعال نشده" },
        { name: "voice_recordings/", type: "folder", children: [
          { name: "you_sleeping.wav", type: "danger", size: "12 MB", desc: "ضبط ۸ ساعته" },
          { name: "your_calls.mp3", type: "danger", size: "84 MB", desc: "تمام مکالمات تلفنیت" },
        ]},
      ],
    },
    {
      name: "watchers",
      type: "folder",
      children: [
        { name: "alive.lst", type: "file", size: "4 KB", desc: "۴۲ نفر هم‌اکنون زنده‌اند" },
        { name: "marked.lst", type: "danger", size: "1 KB", desc: "تو شماره ۱۷ هستی" },
      ],
    },
    {
      name: "do_not_open",
      type: "danger",
      desc: "اگه بازش کنی، نمی‌تونی برگردی",
      children: [
        { name: "ritual.txt", type: "danger", size: "1 KB", desc: "متن باستانی ناشناخته" },
        { name: "your_real_name.txt", type: "locked", desc: "نام واقعیت — لایه ۵" },
        { name: "future.txt", type: "danger", desc: "فردای تو — نوشته شد" },
      ],
    },
    {
      name: ".ghost_config",
      type: "hidden",
      desc: "تنظیمات سایبری سازمان",
      children: [
        { name: "c2_servers.conf", type: "file", size: "2 KB" },
        { name: "agents.lst", type: "locked", desc: "۴۷ مأمور فعال" },
      ],
    },
  ],
};

const TYPE_ICON = {
  folder: Folder,
  file: File,
  locked: Lock,
  hidden: Eye,
  danger: Skull,
};

const TYPE_COLOR = {
  folder: "text-primary",
  file: "text-foreground/80",
  locked: "text-[#ffb300]",
  hidden: "text-muted-foreground",
  danger: "text-destructive text-glow-red",
};

const TYPE_LABEL = {
  folder: "DIR",
  file: "FILE",
  locked: "LOCK",
  hidden: "HID",
  danger: "!!!",
};

export default function FileBrowser() {
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<Node | null>(null);
  const { addWanted } = useGameStore.getState();

  // navigate
  let current: Node = FS;
  for (const p of path) {
    const child = current.children?.find((c) => c.name === p);
    if (child) current = child;
    else break;
  }

  const navigateTo = (node: Node) => {
    glitchBlip();
    if (node.type === "danger") {
      addWanted(1);
      whisperNoise();
    }
    if (node.type === "folder" || node.type === "hidden" || node.type === "danger") {
      if (node.children) {
        setPath((p) => [...p, node.name]);
        setSelected(null);
      }
    } else {
      setSelected(node);
      if (node.type === "locked" || node.type === "danger") {
        addWanted(1);
      }
    }
  };

  const goUp = () => {
    setSelected(null);
    setPath((p) => p.slice(0, -1));
  };

  const godMode = useGameStore((s) => s.godMode);

  return (
    <section id="filesystem" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Terminal className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
              <GlitchText text="سیستم‌فایل محرمانه سازمان کیان" />
            </h2>
            <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              CLASSIFIED FILESYSTEM — TRESPASSERS LOGGED
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-sm border border-destructive/40 bg-[#160508] px-2 py-1 font-mono-hacker text-[10px] text-destructive" dir="ltr">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-destructive" />
          TRACKING: ENABLED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* file list */}
        <div className="lg:col-span-2 hacker-panel corner-brackets rounded-sm p-4">
          {/* breadcrumb */}
          <div
            dir="ltr"
            className="mb-3 flex items-center gap-1 font-mono-hacker text-[11px] text-muted-foreground overflow-x-auto"
          >
            <button
              onClick={() => {
                setPath([]);
                setSelected(null);
              }}
              className="hover:text-primary"
            >
              root://
            </button>
            {path.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => {
                    setPath((prev) => prev.slice(0, i + 1));
                    setSelected(null);
                  }}
                  className="hover:text-primary"
                >
                  {p}
                </button>
              </span>
            ))}
            {path.length > 0 && (
              <button
                onClick={goUp}
                className="ml-3 rounded-sm border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-primary"
              >
                ↑ UP
              </button>
            )}
          </div>

          {/* node rows */}
          <div className="space-y-1" dir="ltr">
            {current.children?.map((node, i) => {
              const Icon = TYPE_ICON[node.type];
              const color = TYPE_COLOR[node.type];
              const label = TYPE_LABEL[node.type];
              return (
                <button
                  key={i}
                  onClick={() => navigateTo(node)}
                  className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-[#08170c] ${
                    selected?.name === node.name ? "bg-[#08170c]" : ""
                  } ${node.type === "danger" ? "danger-breathe" : ""}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
                  <span className={`flex-1 truncate font-mono-hacker text-[12px] ${color}`}>
                    {node.name}
                  </span>
                  <span className="shrink-0 font-mono-hacker text-[9px] text-muted-foreground">
                    [{label}]
                  </span>
                  {node.size && (
                    <span className="shrink-0 font-mono-hacker text-[10px] text-muted-foreground">
                      {node.size}
                    </span>
                  )}
                  {node.children && (
                    <span className="shrink-0 font-mono-hacker text-[9px] text-muted-foreground">
                      ({node.children.length})
                    </span>
                  )}
                </button>
              );
            })}
            {(!current.children || current.children.length === 0) && (
              <p className="text-center text-xs text-muted-foreground py-6">
                — این پوشه خالی است —
              </p>
            )}
          </div>
        </div>

        {/* preview panel */}
        <div className="hacker-panel rounded-sm p-4 min-h-[200px]">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
              PREVIEW
            </h3>
          </div>

          {!selected && (
            <div className="text-center py-8">
              <Folder className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-[11px] text-muted-foreground">
                یه فایل یا پوشه رو انتخاب کن
              </p>
            </div>
          )}

          {selected && (
            <div className="fade-up">
              <div className="mb-3 flex items-center gap-2">
                {(() => {
                  const Icon = TYPE_ICON[selected.type];
                  return <Icon className={`h-5 w-5 ${TYPE_COLOR[selected.type]}`} aria-hidden="true" />;
                })()}
                <span className={`font-mono-hacker text-sm break-all ${TYPE_COLOR[selected.type]}`}>
                  {selected.name}
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع:</span>
                  <span className={`font-mono-hacker ${TYPE_COLOR[selected.type]}`}>
                    {TYPE_LABEL[selected.type]}
                  </span>
                </div>
                {selected.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">حجم:</span>
                    <span className="font-mono-hacker text-foreground" dir="ltr">{selected.size}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">دسترسی:</span>
                  <span className="font-mono-hacker text-[#ffb300]" dir="ltr">
                    {selected.type === "locked" ? "DENIED" : selected.type === "danger" ? "!!!" : "READ"}
                  </span>
                </div>
              </div>

              {selected.desc && (
                <div className="mt-4 rounded-sm border border-border bg-[#030803] p-3 text-[11px] leading-6 text-foreground/85">
                  <p className="mb-1 font-mono-hacker text-[9px] text-muted-foreground" dir="ltr">
                    DESCRIPTION
                  </p>
                  <p dir="rtl" className={selected.type === "danger" ? "text-destructive" : ""}>
                    {selected.desc}
                  </p>
                </div>
              )}

              {selected.type === "locked" && (
                <div className="mt-4 rounded-sm border border-[#ffb300]/40 bg-[#1c1503] p-3 text-center">
                  <Lock className="mx-auto mb-2 h-6 w-6 text-[#ffb300]" aria-hidden="true" />
                  <p className="text-[11px] text-[#ffb300]">
                    نیاز به کلید لایه ۵
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    GOD MODE رو فعال کن تا دسترسی بگیری
                  </p>
                </div>
              )}

              {selected.type === "danger" && (
                <div className="mt-4 rounded-sm border border-destructive/60 bg-[#160508] p-3 text-center danger-breathe">
                  <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-destructive heartbeat" aria-hidden="true" />
                  <p className="text-[11px] text-destructive text-glow-red">
                    این فایل خطرناک است
                  </p>
                  <p className="text-[10px] text-[#ff8899] mt-1">
                    هر بار که بازش کنی، سطح تحت‌تعقیب +۱
                  </p>
                </div>
              )}

              {godMode && selected.type === "locked" && (
                <div className="mt-3 rounded-sm border border-primary/40 bg-[#041006] p-3 text-center">
                  <p className="font-mono-hacker text-[11px] text-primary text-glow">
                    [GOD MODE] محتوا باز شد:
                  </p>
                  <p className="mt-2 text-[11px] text-foreground/80 break-all">
                    {selected.name === "your_real_name.txt"
                      ? "[REDACTED] // تو هنوز آماده‌ی دیدنش نیستی."
                      : selected.name === "agents.lst"
                        ? "۴۷ مأمور فعال. تو یکی از اونایی."
                        : "محتوای محرمانه. تموم شد."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        همه‌ی فایل‌ها و توضیحات کاملاً تخیلی و شبیه‌سازی‌شده‌اند — هیچ داده‌ی واقعی
        ذخیره یا نمایش داده نمی‌شود.
      </p>
    </section>
  );
}
