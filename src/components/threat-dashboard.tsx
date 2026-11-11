"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { deniedBuzz } from "@/lib/sound";
import { Activity, Bomb, Crosshair, Globe2, ShieldAlert, Zap } from "lucide-react";

const randIp = () =>
  `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 254) + 1}`;

const COUNTRIES = ["IR", "DE", "NL", "IS", "JP", "BR", "RU", "US", "KR", "FR"];
const ATTACK_TYPES = [
  "SQL Injection",
  "XSS Attack",
  "DDoS Attempt",
  "Port Scan",
  "Brute Force",
  "Phishing Probe",
  "MITM Attempt",
  "Zero-Day Probe",
];

const countryOf = (ip: string) =>
  COUNTRIES[
    ip.split(".").reduce((acc, part) => acc + (Number(part) || 0), 0) %
      COUNTRIES.length
  ];

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

function StatCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hacker-panel corner-brackets rounded-sm p-4">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="text-xs font-bold tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ThreatDashboard() {
  const mounted = useMounted();
  const [packets, setPackets] = useState(48210);
  const [blocked, setBlocked] = useState(13642);
  const [threat, setThreat] = useState(87);
  const [ips, setIps] = useState<string[]>([]);
  const [bars, setBars] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([
    "[12:04:11] SQL Injection @ 45.33.x.x — دفع شد",
    "[12:04:27] Port Scan @ 91.20.x.x — شناسایی شد",
    "[12:05:02] Brute Force on port 22 — مسدود شد",
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initId = requestAnimationFrame(() => {
      setIps(Array.from({ length: 6 }, randIp));
      setBars(Array.from({ length: 24 }, () => 20 + Math.random() * 80));
    });

    const iv1 = setInterval(() => {
      setPackets((p) => Math.max(10000, p + Math.floor((Math.random() - 0.42) * 4000)));
      setBars((b) => [...b.slice(1), 20 + Math.random() * 80]);
    }, 1200);

    const iv2 = setInterval(() => {
      setBlocked((b) => b + Math.floor(Math.random() * 4));
      setThreat(() => 62 + Math.floor(Math.random() * 37));
      setIps((prev) => [randIp(), ...prev.slice(0, 5)]);
    }, 2000);

    const iv3 = setInterval(() => {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      const verdict = Math.random() > 0.25 ? "دفع شد" : "در حال بررسی";
      setLogs((prev) =>
        [...prev.slice(-40), `[${t}] ${type} @ ${randIp()} — ${verdict}`].slice(-8)
      );
    }, 2600);

    return () => {
      cancelAnimationFrame(initId);
      clearInterval(iv1);
      clearInterval(iv2);
      clearInterval(iv3);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const threatLabel =
    threat > 85 ? "بحرانی" : threat > 65 ? "خطرناک" : threat > 40 ? "هشدار" : "پایدار";
  const threatColor = threat > 85 ? "#ff2233" : threat > 65 ? "#ff6644" : "#ffb300";

  return (
    <section id="dashboard" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
              مرکز عملیات سایبری
            </h2>
            <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              CYBER OPERATIONS CENTER — LIVE FEED
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            if (useGameStore.getState().nukeActive) return;
            deniedBuzz();
            useGameStore.getState().setNuke(true);
          }}
          size="sm"
          className="danger-breathe border border-[#5c0a12] bg-[#2a0409] font-black text-destructive hover:bg-[#3d050c] hover:text-destructive"
          aria-label="دکمه قرمز: فعال‌سازی توالی انهدام"
        >
          <Bomb className="ml-1.5 h-4 w-4" aria-hidden="true" />
          دکمه قرمز — نزن!
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* packets */}
        <StatCard icon={<Zap className="h-4 w-4" aria-hidden="true" />} title="ترافیک زنده">
          <p className="font-mono-hacker text-2xl font-bold text-primary" dir="ltr">
            {mounted ? packets.toLocaleString("en-US") : "—"}
          </p>
          <p className="mb-2 text-[11px] text-muted-foreground">پکت بر ثانیه</p>
          <div className="flex h-10 items-end gap-1" dir="ltr">
            {bars.slice(-16).map((b, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/70 transition-all duration-700"
                style={{
                  height: `${b}%`,
                  boxShadow: "0 0 6px rgba(0,255,65,0.4)",
                }}
              />
            ))}
          </div>
        </StatCard>

        {/* threat level */}
        <StatCard icon={<ShieldAlert className="h-4 w-4" aria-hidden="true" />} title="سطح تهدید">
          <p className="mb-2 font-mono-hacker text-2xl font-bold" style={{ color: threatColor }} dir="ltr">
            {threat}%
          </p>
          <div className="mb-2 h-3 w-full border border-border bg-[#030803]">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${threat}%`,
                background: `linear-gradient(90deg, #00ff41, ${threatColor})`,
                boxShadow: `0 0 12px ${threatColor}`,
              }}
            />
          </div>
          <p className="font-bold" style={{ color: threatColor }}>
            وضعیت: {threatLabel}
          </p>
        </StatCard>

        {/* blocked counter */}
        <StatCard icon={<Crosshair className="h-4 w-4" aria-hidden="true" />} title="حمله‌های دفع‌شده">
          <p className="font-mono-hacker text-2xl font-bold text-primary" dir="ltr">
            {mounted ? blocked.toLocaleString("en-US") : "—"}
          </p>
          <p className="mb-3 text-[11px] text-muted-foreground">از شروع امسال</p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">فایروال لایه ۷</span>
              <span className="text-primary" dir="ltr">99.97%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">تشخیص نفوذ</span>
              <span className="text-primary" dir="ltr">98.40%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">زمان واکنش</span>
              <span className="text-primary" dir="ltr">0.3ms</span>
            </div>
          </div>
        </StatCard>

        {/* tracked IPs */}
        <StatCard icon={<Globe2 className="h-4 w-4" aria-hidden="true" />} title="IPهای رهگیری‌شده">
          <div dir="ltr" className="space-y-1 font-mono-hacker text-[11px]">
            {(mounted ? ips : ["—", "—", "—", "—", "—", "—"]).map((ip, i) => (
              <p key={`${ip}-${i}`} className="flex justify-between animate-in fade-in-50">
                <span className={i === 0 ? "text-primary text-glow-dim" : "text-muted-foreground"}>
                  {ip}
                </span>
                <span className="rounded-sm border border-border px-1 text-[9px] text-[#ffb300]">
                  {countryOf(ip)}
                </span>
              </p>
            ))}
          </div>
        </StatCard>
      </div>

      {/* attack log */}
      <div className="hacker-panel mt-4 rounded-sm p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-destructive" />
          <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
            INTRUSION LOG — REALTIME
          </h3>
        </div>
        <div
          ref={logRef}
          dir="ltr"
          className="h-28 overflow-y-auto font-mono-hacker text-[11px] leading-5"
          aria-label="گزارش نفوذ"
        >
          {(mounted ? logs : []).map((l, i) => (
            <p
              key={i}
              className={l.includes("دفع شد") ? "text-primary" : "text-[#ffb300]"}
            >
              {l}
            </p>
          ))}
          {!mounted && <p className="text-muted-foreground">waiting for feed ...</p>}
        </div>
      </div>
    </section>
  );
}
