"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Upload, Eye, FileText, Database, Key } from "lucide-react";

/* Data exfiltration visualization - shows fake files being uploaded
 * from the user's "machine" to a "remote server" with progress bars
 * and file names scrolling. Triggered automatically when wanted >= 4.
 */

type ExfilFile = {
  id: number;
  name: string;
  size: string;
  category: "passwords" | "documents" | "media" | "keys" | "history";
  pct: number;
  done: boolean;
};

const FILE_TEMPLATES = [
  { name: "chrome_passwords.db", size: "24 KB", cat: "passwords" as const },
  { name: "saved_credit_cards.json", size: "1.2 KB", cat: "keys" as const },
  { name: "ssh_private_key", size: "3.4 KB", cat: "keys" as const },
  { name: "whatsapp_backup.msg", size: "84 MB", cat: "media" as const },
  { name: "telegram_session", size: "12 KB", cat: "keys" as const },
  { name: "browser_history.sqlite", size: "8.7 MB", cat: "history" as const },
  { name: "cookies_all_browsers.bin", size: "3.1 MB", cat: "history" as const },
  { name: "discord_token.txt", size: "0.4 KB", cat: "keys" as const },
  { name: "metamask_vault.json", size: "18 KB", cat: "keys" as const },
  { name: "wallet_seed_phrase.txt", size: "0.2 KB", cat: "keys" as const },
  { name: "personal_photos/", size: "342 MB", cat: "media" as const },
  { name: "tax_returns_2024.pdf", size: "4.8 MB", cat: "documents" as const },
  { name: "bank_login_cookies", size: "0.9 KB", cat: "keys" as const },
  { name: "facebook_session", size: "1.1 KB", cat: "keys" as const },
  { name: "instagram_account.json", size: "8 KB", cat: "documents" as const },
  { name: "outlook_emails.pst", size: "127 MB", cat: "documents" as const },
];

const CAT_META = {
  passwords: { label: "PASSWORDS", icon: Key, color: "text-destructive" },
  documents: { label: "DOCS", icon: FileText, color: "text-primary" },
  media: { label: "MEDIA", icon: Upload, color: "text-[#ffb300]" },
  keys: { label: "KEYS", icon: Key, color: "text-destructive text-glow-red" },
  history: { label: "HISTORY", icon: Database, color: "text-primary text-glow-dim" },
};

let idCounter = 0;

export default function DataExfil() {
  const [active, setActive] = useState(false);
  const [files, setFiles] = useState<ExfilFile[]>([]);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [serverUrl, setServerUrl] = useState("kian-drop.shadow.onion");
  const wanted = useGameStore((s) => s.wanted);
  const godMode = useGameStore((s) => s.godMode);
  const [dismissed, setDismissed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // auto-trigger when wanted reaches max
  useEffect(() => {
    if (godMode) return;
    if (wanted >= 4 && !active && !dismissed) {
      setActive(true);
    }
    if (wanted === 0 && active) {
      // cleared
      setActive(false);
      setFiles([]);
    }
  }, [wanted, active, dismissed, godMode]);

  // spawn files when active
  useEffect(() => {
    if (!active) return;
    const spawn = () => {
      const tpl = FILE_TEMPLATES[Math.floor(Math.random() * FILE_TEMPLATES.length)];
      const file: ExfilFile = {
        id: idCounter++,
        name: tpl.name,
        size: tpl.size,
        category: tpl.cat,
        pct: 0,
        done: false,
      };
      setFiles((prev) => [file, ...prev].slice(0, 8));
      // animate progress
      const progressTimer = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== file.id) return f;
            if (f.done) return f;
            const newPct = Math.min(100, f.pct + 12 + Math.random() * 18);
            if (newPct >= 100) {
              setTotalUploaded((t) => t + 1);
              return { ...f, pct: 100, done: true };
            }
            return { ...f, pct: newPct };
          })
        );
      }, 200);
      setTimeout(() => clearInterval(progressTimer), 2500);
    };
    const spawnTimer = setInterval(spawn, 900);
    return () => clearInterval(spawnTimer);
  }, [active]);

  if (!active || godMode) return null;

  return (
    <section
      className="fixed bottom-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] hacker-panel hacker-panel-red rounded-sm p-3 fade-up"
      aria-label="داده‌کشی فعال"
    >
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-destructive heartbeat" aria-hidden="true" />
          <span className="font-mono-hacker text-[11px] font-bold text-destructive text-glow-red" dir="ltr">
            DATA EXFILTRATION
          </span>
        </div>
        <span className="font-mono-hacker text-[10px] text-destructive cursor-blink" dir="ltr">
          LIVE
        </span>
      </div>

      {/* target */}
      <p className="mb-2 text-[10px] text-[#ff8899] leading-5" dir="rtl">
        در حال ارسال داده‌هایت به{" "}
        <span className="font-mono-hacker text-primary text-glow-dim" dir="ltr">
          {serverUrl}
        </span>{" "}
        — شما نمیتوانید این رو متوقف کنید.
      </p>

      {/* total uploaded */}
      <div className="mb-3 flex items-center justify-between rounded-sm bg-[#0a0204] px-2 py-1 font-mono-hacker text-[10px]">
        <span className="text-muted-foreground" dir="ltr">TOTAL UPLOADED</span>
        <span className="text-destructive font-bold" dir="ltr">
          {totalUploaded} FILES
        </span>
      </div>

      {/* file list */}
      <div className="space-y-1.5">
        {files.map((f) => {
          const meta = CAT_META[f.category];
          const Icon = meta.icon;
          return (
            <div key={f.id} className="fade-up">
              <div className="flex items-center justify-between gap-1.5 font-mono-hacker text-[10px]">
                <span className="flex items-center gap-1 truncate">
                  <Icon className={`h-3 w-3 ${meta.color}`} aria-hidden="true" />
                  <span className="truncate text-foreground/80">{f.name}</span>
                </span>
                <span className="shrink-0 text-muted-foreground" dir="ltr">
                  {f.done ? `${f.size} ✓` : `${f.pct}%`}
                </span>
              </div>
              <div className="h-1 w-full bg-[#0a0204] mt-0.5">
                <div
                  className={`h-full transition-all duration-200 ${
                    f.done ? "bg-destructive" : "bg-[#ffb300]"
                  }`}
                  style={{
                    width: `${f.pct}%`,
                    boxShadow: `0 0 6px ${f.done ? "rgba(255,34,51,0.6)" : "rgba(255,179,0,0.6)"}`,
                  }}
                />
              </div>
            </div>
          );
        })}
        {files.length === 0 && (
          <p className="text-center text-[10px] text-muted-foreground py-3">
            scanning files ...
          </p>
        )}
      </div>

      {/* dismiss hint */}
      <p className="mt-3 text-center text-[9px] text-muted-foreground">
        دستور <span className="font-mono-hacker text-primary">evade</span> در ترمینال رو بزن تا متوقف کنی
      </p>
    </section>
  );
}
