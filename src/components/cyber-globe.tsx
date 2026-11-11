"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { Activity, Crosshair, Skull, Zap } from "lucide-react";

/* Procedural land-detection for a recognizable world map.
 * Returns true if the given lat/lng is on a major landmass.
 */
function isLand(lat: number, lng: number): boolean {
  // Antarctica
  if (lat < -65) return true;
  // Greenland
  if (lat > 60 && lat < 84 && lng > -55 && lng < -15) return true;
  // Iceland
  if (lat > 63 && lat < 67 && lng > -25 && lng < -13) return true;

  // North America
  if (lat > 25 && lat < 75 && lng > -170 && lng < -50) {
    if (lat > 50 && lng > -140 && lng < -55) return true; // Canada mainland
    if (lat > 30 && lat < 50 && lng > -125 && lng < -67) return true; // USA mainland
    if (lat > 25 && lat < 40 && lng > -110 && lng < -90) return true; // southern US
    if (lat > 60 && lng > -170 && lng < -130) return true; // Alaska
    if (lat > 65 && lng > -110 && lng < -75) return true; // Arctic islands
  }
  // Central America
  if (lat > 8 && lat < 25 && lng > -110 && lng < -77) return true;
  // South America
  if (lat > -55 && lat < 12) {
    if (lat > -5 && lat < 12 && lng > -80 && lng < -50) return true; // north (Colombia/Venezuela/Guyana)
    if (lat > -20 && lat < -5 && lng > -75 && lng < -45) return true; // central Brazil
    if (lat > -35 && lat < -20 && lng > -72 && lng < -50) return true; // southern Brazil/Paraguay
    if (lat > -55 && lat < -35 && lng > -75 && lng < -55) return true; // Argentina/Chile
  }
  // Europe
  if (lat > 36 && lat < 71 && lng > -10 && lng < 45) {
    if (lat > 36 && lat < 60 && lng > -10 && lng < 28) return true; // Western/Southern Europe
    if (lat > 50 && lat < 71 && lng > 5 && lng < 45) return true; // Northern Europe / Russia west
    if (lat > 50 && lat < 60 && lng > -10 && lng < 2) return true; // UK & Ireland
    if (lat > 55 && lat < 71 && lng > 5 && lng < 32) return true; // Scandinavia
  }
  // Africa
  if (lat > -35 && lat < 37 && lng > -18 && lng < 52) {
    if (lat > 12 && lat < 37 && lng > -18 && lng < 50) return true; // North Africa (Sahara)
    if (lat > -5 && lat < 18 && lng > -18 && lng < 50) return true; // Central Africa
    if (lat > -35 && lat < -5 && lng > 10 && lng < 42) return true; // Southern Africa
  }
  // Middle East
  if (lat > 12 && lat < 42 && lng > 25 && lng < 65) return true;
  // Russia / Siberia
  if (lat > 50 && lat < 75 && lng > 30 && lng < 180) return true;
  // East Asia (China, Korea)
  if (lat > 18 && lat < 55 && lng > 75 && lng < 135) return true;
  // Japan
  if (lat > 30 && lat < 46 && lng > 128 && lng < 146) return true;
  // India
  if (lat > 8 && lat < 36 && lng > 68 && lng < 92) return true;
  // SE Asia mainland
  if (lat > 8 && lat < 25 && lng > 92 && lng < 110) return true;
  // Indonesia / Philippines
  if (lat > -10 && lat < 8 && lng > 95 && lng < 142) return true;
  // Australia
  if (lat > -39 && lat < -10 && lng > 113 && lng < 154) return true;
  // New Zealand
  if (lat > -47 && lat < -34 && lng > 166 && lng < 179) return true;
  return false;
}

// Cache the land grid so we don't recompute every frame
const GRID_COLS = 80;
const GRID_ROWS = 36;
const LAND_GRID: boolean[][] = (() => {
  const g: boolean[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: boolean[] = [];
    const lat = 85 - (r / (GRID_ROWS - 1)) * 170;
    for (let c = 0; c < GRID_COLS; c++) {
      const lng = -180 + (c / (GRID_COLS - 1)) * 360;
      row.push(isLand(lat, lng));
    }
    g.push(row);
  }
  return g;
})();

type City = { name: string; lat: number; lng: number; code: string };

const IRAN_CITIES: City[] = [
  { name: "تهران", lat: 35.69, lng: 51.39, code: "TEH" },
  { name: "مشهد", lat: 36.3, lng: 59.6, code: "MHD" },
  { name: "اصفهان", lat: 32.65, lng: 51.67, code: "ISF" },
  { name: "شیراز", lat: 29.59, lng: 52.58, code: "SHZ" },
  { name: "تبریز", lat: 38.08, lng: 46.29, code: "TBZ" },
  { name: "اهواز", lat: 31.32, lng: 48.7, code: "AWZ" },
  { name: "کرج", lat: 35.84, lng: 50.99, code: "KJ" },
  { name: "قم", lat: 34.64, lng: 50.88, code: "QOM" },
  { name: "کرمانشاه", lat: 34.32, lng: 47.07, code: "KSH" },
  { name: "ارومیه", lat: 37.55, lng: 45.08, code: "ORM" },
  { name: "رشت", lat: 37.28, lng: 49.58, code: "RSH" },
  { name: "زاهدان", lat: 29.5, lng: 60.86, code: "ZAH" },
  { name: "کرمان", lat: 30.28, lng: 57.08, code: "KRN" },
  { name: "اراک", lat: 34.09, lng: 49.7, code: "ARK" },
  { name: "بندرعباس", lat: 27.19, lng: 56.27, code: "BND" },
  { name: "یزد", lat: 31.9, lng: 54.37, code: "YZD" },
  { name: "اردبیل", lat: 38.25, lng: 48.3, code: "ARD" },
  { name: "گرگان", lat: 36.84, lng: 54.44, code: "GRG" },
  { name: "ساری", lat: 36.56, lng: 53.06, code: "SRY" },
  { name: "قزوین", lat: 36.27, lng: 50.0, code: "QZV" },
  { name: "خرم‌آباد", lat: 33.49, lng: 48.35, code: "KHR" },
  { name: "سنندج", lat: 35.31, lng: 46.99, code: "SNJ" },
  { name: "بجنورد", lat: 37.47, lng: 57.33, code: "BJN" },
  { name: "بیرجند", lat: 32.87, lng: 59.22, code: "BJR" },
  { name: "ایلام", lat: 33.64, lng: 46.42, code: "ILM" },
  { name: "بوشهر", lat: 28.97, lng: 50.84, code: "BSH" },
  { name: "گنبدکاووس", lat: 37.25, lng: 55.16, code: "GND" },
  { name: "سلفچگان", lat: 34.5, lng: 50.45, code: "SLF" },
  { name: "ملارد", lat: 35.68, lng: 50.96, code: "MLR" },
  { name: "فیروزکوه", lat: 35.76, lng: 52.78, code: "FRZ" },
];

const WORLD_CITIES: City[] = [
  ...IRAN_CITIES.slice(0, 6),
  { name: "توکیو", lat: 35.68, lng: 139.69, code: "JP" },
  { name: "نیویورک", lat: 40.71, lng: -74.0, code: "US" },
  { name: "مسکو", lat: 55.76, lng: 37.62, code: "RU" },
  { name: "پکن", lat: 39.9, lng: 116.4, code: "CN" },
  { name: "لندن", lat: 51.51, lng: -0.13, code: "UK" },
  { name: "پاریس", lat: 48.85, lng: 2.35, code: "FR" },
  { name: "برلین", lat: 52.52, lng: 13.4, code: "DE" },
  { name: "سیدنی", lat: -33.87, lng: 151.21, code: "AU" },
  { name: "دبی", lat: 25.27, lng: 55.3, code: "AE" },
  { name: "استانبول", lat: 41.01, lng: 28.98, code: "TR" },
  { name: "ریکیاویک", lat: 64.13, lng: -21.82, code: "IS" },
  { name: "قاهره", lat: 30.04, lng: 31.24, code: "EG" },
  { name: "بمبئی", lat: 19.08, lng: 72.88, code: "IN" },
];

const ATTACK_TYPES = [
  "DDoS",
  "تزریق SQL",
  "Brute Force",
  "XSS",
  "باج‌افزار",
  "روز صفر",
  "فیشینگ",
  "بات‌نت",
  "MITM",
  "تروجان",
  "جاسوسی",
  "حملات سایبری",
];

type Attack = {
  id: number;
  from: City;
  to: City;
  type: string;
  t: number; // 0..1 progress along arc
  duration: number; // ms
  startedAt: number;
};

type LogEntry = {
  id: number;
  text: string;
  type: string;
  severity: "low" | "med" | "high" | "critical";
};

const SEVERITY_COLOR = {
  low: "#00ff41",
  med: "#ffb300",
  high: "#ff6644",
  critical: "#ff2233",
};

function severityFor(type: string): LogEntry["severity"] {
  if (type === "Ransomware" || type === "Zero-Day") return "critical";
  if (type === "DDoS" || type === "Botnet") return "high";
  if (type === "Brute Force" || type === "Trojan") return "med";
  return "low";
}

// Mercator projection: lat/lng -> x/y in [0,1] x [0,1]
function project(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  // mercator y
  const latRad = (lat * Math.PI) / 180;
  const merc = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // clamp y so it fits in [0,1] (roughly)
  const maxLat = 2.4;
  const y = 0.5 - (merc / (2 * maxLat));
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
}

// Iran-focused projection: zoom into Iran region
const IRAN_BOUNDS = { latMin: 24, latMax: 40, lngMin: 44, lngMax: 63 };
function projectIran(lat: number, lng: number) {
  const x = (lng - IRAN_BOUNDS.lngMin) / (IRAN_BOUNDS.lngMax - IRAN_BOUNDS.lngMin);
  const y = (IRAN_BOUNDS.latMax - lat) / (IRAN_BOUNDS.latMax - IRAN_BOUNDS.latMin);
  // padding 0.1
  return {
    x: Math.max(0.05, Math.min(0.95, x)),
    y: Math.max(0.05, Math.min(0.95, y)),
  };
}

function pickCity(pool: City[], exclude?: City): City {
  let c = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (exclude && c.name === exclude.name && guard < 10) {
    c = pool[Math.floor(Math.random() * pool.length)];
    guard++;
  }
  return c;
}

export default function CyberGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const attacksRef = useRef<Attack[]>([]);
  const idCounter = useRef(0);
  const rotationRef = useRef(0);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [topAttackers, setTopAttackers] = useState<
    { code: string; name: string; count: number }[]
  >([]);
  const [totalAttacks, setTotalAttacks] = useState(0);
  const [paused, setPaused] = useState(false);
  const [iranMode, setIranMode] = useState(true); // default: ایران تک
  const pausedRef = useRef(false);
  const iranModeRef = useRef(true);
  pausedRef.current = paused;
  iranModeRef.current = iranMode;

  const godMode = useGameStore((s) => s.godMode);
  const bloodMode = useGameStore((s) => s.bloodMode);
  const nukeActive = useGameStore((s) => s.nukeActive);

  // Attack ticker
  useEffect(() => {
    const spawn = () => {
      if (pausedRef.current) return;
      const pool = iranModeRef.current ? IRAN_CITIES : WORLD_CITIES;
      const from = pickCity(pool);
      const to = pickCity(pool, from);
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      const id = idCounter.current++;
      const duration = 2400 + Math.random() * 2600;
      attacksRef.current.push({
        id,
        from,
        to,
        type,
        t: 0,
        duration,
        startedAt: performance.now(),
      });
      if (attacksRef.current.length > 18)
        attacksRef.current = attacksRef.current.slice(-18);

      const entry: LogEntry = {
        id,
        text: `${from.name} → ${to.name} :: ${type}`,
        type,
        severity: severityFor(type),
      };
      setLogs((prev) => [entry, ...prev].slice(0, 9));
      setTotalAttacks((n) => n + 1);
      setTopAttackers((prev) => {
        const next = [...prev];
        const existing = next.find((x) => x.code === from.code);
        if (existing) existing.count++;
        else next.push({ code: from.code, name: from.name, count: 1 });
        return next.sort((a, b) => b.count - a.count).slice(0, 6);
      });
    };

    const iv = setInterval(spawn, 650 + Math.random() * 700);
    return () => clearInterval(iv);
  }, []);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const baseColor = bloodMode ? "#ff2233" : godMode ? "#00e5ff" : "#00ff41";

    const draw = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      if (!pausedRef.current) rotationRef.current += dt * 0.00003;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // background grid (graticule)
      ctx.strokeStyle = bloodMode ? "rgba(255,34,51,0.07)" : "rgba(0,255,65,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < 12; i++) {
        const y = (i / 12) * h;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      for (let i = 1; i < 24; i++) {
        const x = (i / 24) * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // world map dots — using procedural land grid
      const cellW = w / GRID_COLS;
      const cellH = h / GRID_ROWS;
      const rotation = rotationRef.current;
      const iranActive = iranModeRef.current;
      if (iranActive) {
        // In Iran mode, draw Iran silhouette with denser dots
        // Use finer grid for Iran zoom (lat 24-40, lng 44-63)
        const IRAN_GRID_COLS = 60;
        const IRAN_GRID_ROWS = 30;
        for (let r = 0; r < IRAN_GRID_ROWS; r++) {
          for (let c = 0; c < IRAN_GRID_COLS; c++) {
            const lat = IRAN_BOUNDS.latMax - (r / (IRAN_GRID_ROWS - 1)) * (IRAN_BOUNDS.latMax - IRAN_BOUNDS.latMin);
            const lng = IRAN_BOUNDS.lngMin + (c / (IRAN_GRID_COLS - 1)) * (IRAN_BOUNDS.lngMax - IRAN_BOUNDS.lngMin);
            // Iran shape test (rough boundaries)
            const isIran = (
              // Caspian coast north
              (lat > 36 && lat < 40 && lng > 48 && lng < 56) ||
              // North-West Azerbaijan region
              (lat > 35 && lat < 39 && lng > 44 && lng < 49) ||
              // Central Iran (Tehran, Isfahan, Qom)
              (lat > 31 && lat < 36 && lng > 49 && lng < 56) ||
              // South-West (Khuzestan, Lorestan)
              (lat > 30 && lat < 34 && lng > 47 && lng < 52) ||
              // South (Fars, Bushehr)
              (lat > 27 && lat < 31 && lng > 50 && lng < 56) ||
              // South-East (Hormozgan, Kerman)
              (lat > 25 && lat < 30 && lng > 54 && lng < 62) ||
              // East (Sistan, South Khorasan)
              (lat > 25 && lat < 33 && lng > 58 && lng < 63) ||
              // North-East (Khorasan, Golestan)
              (lat > 35 && lat < 38 && lng > 54 && lng < 61) ||
              // North central (Mazandaran, Gilan)
              (lat > 35 && lat < 38 && lng > 48 && lng < 55)
            );
            if (!isIran) continue;
            const p = projectIran(lat, lng);
            const cx = p.x * w;
            const cy = p.y * h;
            const alpha = 0.55 + 0.25 * Math.sin(time * 0.001 + (r + c));
            const landColor = bloodMode
              ? `rgba(255,68,68,${alpha})`
              : godMode
                ? `rgba(0,229,255,${alpha})`
                : `rgba(0,255,65,${alpha})`;
            ctx.fillStyle = landColor;
            ctx.fillRect(cx - 1, cy - 1, 3, 3);
          }
        }
      } else {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (!LAND_GRID[r][c]) continue;
            const cx = ((c / GRID_COLS + rotation) % 1) * w;
            const cy = (r / GRID_ROWS) * h + cellH / 2;
            const alpha = 0.45 + 0.25 * Math.sin(time * 0.001 + (r + c));
            const landColor = bloodMode
              ? `rgba(255,68,68,${alpha})`
              : godMode
                ? `rgba(0,229,255,${alpha})`
                : `rgba(0,255,65,${alpha})`;
            ctx.fillStyle = landColor;
            ctx.fillRect(cx - 1, cy - 1, 3, 3);
            if (cx > w - 4) {
              ctx.fillRect(cx - w - 1, cy - 1, 3, 3);
            } else if (cx < 4) {
              ctx.fillRect(cx + w - 1, cy - 1, 3, 3);
            }
          }
        }
      }

      // city markers
      const cityPool = iranActive ? IRAN_CITIES : WORLD_CITIES;
      cityPool.forEach((city) => {
        let x: number;
        let y: number;
        if (iranActive) {
          const p = projectIran(city.lat, city.lng);
          x = p.x * w;
          y = p.y * h;
        } else {
          const p = project(city.lat, city.lng);
          x = ((p.x + rotation) % 1) * w;
          y = p.y * h;
        }
        const isHot = topAttackers.find((t) => t.code === city.code);
        ctx.fillStyle = isHot ? "#ff6644" : baseColor;
        ctx.beginPath();
        ctx.arc(x, y, isHot ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
        if (isHot && isHot.count > 2) {
          // pulse ring
          const ringR = 4 + (Math.sin(time * 0.005 + city.lat) + 1) * 4;
          ctx.strokeStyle = `rgba(255,102,68,${0.5 - ringR / 24})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // attack arcs
      const now = time;
      attacksRef.current = attacksRef.current.filter((a) => {
        const elapsed = now - a.startedAt;
        a.t = Math.min(1, elapsed / a.duration);
        if (a.t >= 1) return false;
        let x1: number, y1: number, x2: number, y2: number;
        if (iranActive) {
          const fromP = projectIran(a.from.lat, a.from.lng);
          const toP = projectIran(a.to.lat, a.to.lng);
          x1 = fromP.x * w;
          y1 = fromP.y * h;
          x2 = toP.x * w;
          y2 = toP.y * h;
        } else {
          const fromP = project(a.from.lat, a.from.lng);
          const toP = project(a.to.lat, a.to.lng);
          x1 = ((fromP.x + rotation) % 1) * w;
          y1 = fromP.y * h;
          x2 = ((toP.x + rotation) % 1) * w;
          y2 = toP.y * h;
          // handle wrap-around: pick nearest x2 to x1
          if (Math.abs(x2 - x1) > w / 2) {
            x2 = x2 + (x2 < x1 ? w : -w);
          }
        }
        // parabolic arc with peak above midpoint
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.25 - 30;
        const sev = severityFor(a.type);
        const col =
          sev === "critical"
            ? "#ff2233"
            : sev === "high"
              ? "#ff6644"
              : sev === "med"
                ? "#ffb300"
                : baseColor;

        // trail
        const steps = 24;
        ctx.lineWidth = 1.2;
        for (let s = 0; s < steps; s++) {
          const tt = (s / steps) * a.t;
          const px =
            (1 - tt) * (1 - tt) * x1 + 2 * (1 - tt) * tt * mx + tt * tt * x2;
          const py =
            (1 - tt) * (1 - tt) * y1 + 2 * (1 - tt) * tt * my + tt * tt * y2;
          const alpha = (s / steps) * 0.65;
          ctx.fillStyle =
            sev === "critical"
              ? `rgba(255,34,51,${alpha})`
              : sev === "high"
                ? `rgba(255,102,68,${alpha})`
                : sev === "med"
                  ? `rgba(255,179,0,${alpha})`
                  : `rgba(0,255,65,${alpha})`;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
        // packet head
        const px = (1 - a.t) * (1 - a.t) * x1 + 2 * (1 - a.t) * a.t * mx + a.t * a.t * x2;
        const py = (1 - a.t) * (1 - a.t) * y1 + 2 * (1 - a.t) * a.t * my + a.t * a.t * y2;
        ctx.fillStyle = col;
        ctx.shadowBlur = 10;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [godMode, bloodMode, topAttackers, iranMode]);

  // nuke: spawn massive attack burst
  useEffect(() => {
    if (!nukeActive) return;
    const burst = setInterval(() => {
      const from = pickCity();
      const to = pickCity(from);
      const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      const id = idCounter.current++;
      attacksRef.current.push({
        id,
        from,
        to,
        type,
        t: 0,
        duration: 1600 + Math.random() * 1200,
        startedAt: performance.now(),
      });
    }, 90);
    return () => clearInterval(burst);
  }, [nukeActive]);

  return (
    <section
      id="globe"
      className="relative z-10 mx-auto max-w-6xl px-4 py-14"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Crosshair className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
              {iranMode ? "نقشه‌ی زنده‌ی حملات سایبری ایران" : "نقشه‌ی زنده‌ی حملات سایبری جهان"}
            </h2>
            <p
              className="font-mono-hacker text-[10px] text-muted-foreground"
              dir="ltr"
            >
              {iranMode ? "IRAN LIVE CYBER ATTACK MAP — REAL-TIME" : "LIVE GLOBAL CYBER ATTACK MAP — REAL-TIME"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono-hacker text-[10px] text-primary" dir="ltr">
          <span className="flex items-center gap-1.5">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-destructive" />
            LIVE
          </span>
          <button
            onClick={() => setIranMode((m) => !m)}
            className={`rounded-sm border px-2 py-1 ${iranMode ? "border-[#ffb300] text-[#ffb300]" : "border-border text-primary/80"} hover:bg-[#08170c]`}
            aria-label="تغییر حالت نقشه"
            title={iranMode ? "نقشه ایران فعال" : "نقشه جهان فعال"}
          >
            {iranMode ? "🇮🇷 ایران تک" : "🌍 جهان"}
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-sm border border-border px-2 py-1 text-primary/80 hover:bg-[#08170c] hover:text-primary"
            aria-label={paused ? "ادامه" : "توقف"}
          >
            {paused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* globe */}
        <div className="lg:col-span-3 hacker-panel corner-brackets rounded-sm p-2 sm:p-3">
          <div ref={wrapRef} className="globe-canvas relative h-[280px] sm:h-[420px] overflow-hidden">
            <canvas ref={canvasRef} className="block h-full w-full" />
            {/* corner HUD */}
            <div
              className="pointer-events-none absolute left-2 top-2 font-mono-hacker text-[9px] text-primary/80"
              dir="ltr"
            >
              <p>SAT-FEED :: KIAN-EYE-01</p>
              <p>RES: 4096x2048 :: ENC: AES-256</p>
            </div>
            <div
              className="pointer-events-none absolute right-2 top-2 font-mono-hacker text-[9px] text-primary/80 text-right"
              dir="ltr"
            >
              <p>TRACKING {attacksRef.current.length} ACTIVE</p>
              <p className={totalAttacks > 50 ? "text-destructive" : ""}>
                TOTAL: {totalAttacks.toLocaleString("en-US")}
              </p>
            </div>
            <div
              className="pointer-events-none absolute bottom-2 left-2 font-mono-hacker text-[9px] text-muted-foreground"
              dir="ltr"
            >
              &gt; scanning 247 countries ...
            </div>
            <div
              className="pointer-events-none absolute bottom-2 right-2 font-mono-hacker text-[9px] text-muted-foreground text-right"
              dir="ltr"
            >
              &gt; nodes online: 12,847
            </div>
          </div>
        </div>

        {/* side panel */}
        <div className="space-y-4">
          {/* top attackers */}
          <div className="hacker-panel rounded-sm p-3">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Skull className="h-4 w-4 text-destructive" aria-hidden="true" />
              <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
                TOP ATTACKERS
              </h3>
            </div>
            <div className="space-y-1.5" dir="ltr">
              {topAttackers.length === 0 && (
                <p className="font-mono-hacker text-[10px] text-muted-foreground">
                  waiting for data ...
                </p>
              )}
              {topAttackers.map((a, i) => (
                <div key={a.code} className="flex items-center gap-2">
                  <span className="font-mono-hacker text-[10px] text-muted-foreground w-3">
                    {i + 1}
                  </span>
                  <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] font-bold text-[#ffb300]">
                    {a.code}
                  </span>
                  <span className="flex-1 font-mono-hacker text-[10px] text-foreground truncate">
                    {a.name}
                  </span>
                  <span
                    className={`font-mono-hacker text-[10px] font-bold ${i === 0 ? "text-destructive" : "text-primary"}`}
                  >
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* live feed */}
          <div className="hacker-panel rounded-sm p-3">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
                ATTACK FEED
              </h3>
            </div>
            <div className="space-y-1 font-mono-hacker text-[10px]" dir="ltr">
              {logs.length === 0 && (
                <p className="text-muted-foreground">waiting ...</p>
              )}
              {logs.map((l) => (
                <p
                  key={l.id}
                  className="fade-up truncate"
                  style={{ color: SEVERITY_COLOR[l.severity] }}
                >
                  <span className="text-muted-foreground">[{l.severity.toUpperCase()}]</span>{" "}
                  {l.text}
                </p>
              ))}
            </div>
          </div>

          {/* legend */}
          <div className="hacker-panel rounded-sm p-3">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-[#ffb300]" aria-hidden="true" />
              <h3 className="font-mono-hacker text-xs font-bold" dir="ltr">
                SEVERITY
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono-hacker text-[10px]" dir="ltr">
              {(["low", "med", "high", "critical"] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-sm"
                    style={{ background: SEVERITY_COLOR[s] }}
                  />
                  <span style={{ color: SEVERITY_COLOR[s] }}>{s.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        تمام داده‌ها تصادفی و شبیه‌سازی‌شده‌اند — صرفاً برای نمایش دراماتیک. هیچ
        حمله‌ی واقعی در کار نیست.
      </p>
    </section>
  );
}
