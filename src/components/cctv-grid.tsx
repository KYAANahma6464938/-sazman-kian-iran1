"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { keyClick, successChime } from "@/lib/sound";
import { Video, Loader2 } from "lucide-react";

type CamStatus = "enc" | "bypass" | "live";

const CAMS: { id: string; loc: string; scene: "vault" | "server" | "corridor" }[] = [
  { id: "CAM-01", loc: "خزانه اصلی — طبقه منفی ۳", scene: "vault" },
  { id: "CAM-02", loc: "اتاق سرورها — رک A", scene: "server" },
  { id: "CAM-03", loc: "راهرو شرقی — ورودی مخفی", scene: "corridor" },
  { id: "CAM-04", loc: "پارکینگ زیرزمینی — طبقه ۲", scene: "corridor" },
  { id: "CAM-05", loc: "دفتر مدیر — طبقه ۱۲", scene: "server" },
  { id: "CAM-06", loc: "??? — مکان نامشخص", scene: "vault" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function VaultScene() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0c]">
      <div
        className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full border-4 border-[#3a3a40]"
        style={{
          background:
            "conic-gradient(#4a4a52 0 25%, #2e2e34 25% 50%, #4a4a52 50% 75%, #2e2e34 75%)",
          animation: "dial-spin 16s linear infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute right-3 top-3 h-2 w-2 rounded-full bg-destructive"
        style={{ animation: "led-blink 1s steps(2) infinite" }}
        aria-hidden="true"
      />
    </div>
  );
}

function ServerScene() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#050a07]">
      <div className="grid grid-cols-8 gap-2" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary/80"
            style={{
              animation: `led-blink ${(0.5 + (i % 5) * 0.24).toFixed(2)}s steps(2) infinite`,
              animationDelay: `${((i % 7) * 0.13).toFixed(2)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CorridorScene() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-l from-[#101014] via-[#1c1c22] to-[#08080a]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(0,255,65,0.12), transparent 60%)",
          animation: "flicker-light 3.1s linear infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-2 h-11 w-4 rounded-t-full bg-black/95"
        style={{ animation: "walk-x 7s linear infinite" }}
        aria-hidden="true"
      />
    </div>
  );
}

function Scene({ name }: { name: (typeof CAMS)[number]["scene"] }) {
  if (name === "vault") return <VaultScene />;
  if (name === "server") return <ServerScene />;
  return <CorridorScene />;
}

export default function CctvGrid() {
  const [states, setStates] = useState<Record<string, CamStatus>>({});
  const [clock, setClock] = useState("--:--:--");
  const statesRef = useRef<Record<string, CamStatus>>({});
  const runLock = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const liveCount = Object.values(states).filter((s) => s === "live").length;

  useEffect(() => {
    if (liveCount === CAMS.length) {
      useGameStore.getState().unlock("watcher");
    }
  }, [liveCount]);

  const setStatus = (id: string, st: CamStatus) => {
    statesRef.current[id] = st;
    setStates((s) => ({ ...s, [id]: st }));
  };

  const hackOne = async () => {
    if (runLock.current) return;
    runLock.current = true;
    try {
      const target = CAMS.find((c) => statesRef.current[c.id] !== "live");
      if (!target) return;
      keyClick();
      setStatus(target.id, "bypass");
      await sleep(1300 + Math.random() * 900);
      setStatus(target.id, "live");
      useGameStore.getState().addWanted(1);
      successChime();
    } finally {
      runLock.current = false;
    }
  };

  const hackAll = async () => {
    if (runLock.current) return;
    runLock.current = true;
    try {
      for (const cam of CAMS) {
        if (statesRef.current[cam.id] === "live") continue;
        setStatus(cam.id, "bypass");
        await sleep(1100 + Math.random() * 700);
        setStatus(cam.id, "live");
        useGameStore.getState().addWanted(1);
        successChime();
        await sleep(220);
      }
    } finally {
      runLock.current = false;
    }
  };

  return (
    <section id="cctv" className="relative z-10 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Video className="h-7 w-7 text-primary text-glow" aria-hidden="true" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-primary text-glow">
              نفوذ به دوربین‌های مداربسته
            </h2>
            <p className="font-mono-hacker text-[10px] text-muted-foreground" dir="ltr">
              CCTV BACKDOOR — 6 FEEDS // UNAUTHORIZED
            </p>
          </div>
        </div>
        <Button
          onClick={hackAll}
          variant="outline"
          size="sm"
          className="border-primary/60 bg-transparent text-primary hover:bg-[#08170c] hover:text-primary"
        >
          هک همه دوربین‌ها
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMS.map((cam) => {
          const st = states[cam.id] ?? "enc";
          const live = st === "live";
          return (
            <div key={cam.id} className="hacker-panel corner-brackets overflow-hidden rounded-sm">
              <div
                className="flex items-center justify-between border-b border-border px-2.5 py-1.5 font-mono-hacker text-[9px]"
                dir="ltr"
              >
                <span className="text-muted-foreground">{cam.id}</span>
                {live ? (
                  <span className="flex items-center gap-1 text-destructive">
                    <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                    REC
                  </span>
                ) : (
                  <span className="text-[#ffb300]">ENCRYPTED</span>
                )}
              </div>

              <div className="relative h-36 sm:h-40">
                {st === "live" && <Scene name={cam.scene} />}
                {st === "bypass" && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#040904]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <p className="font-mono-hacker text-[10px] text-primary" dir="ltr">
                      BYPASSING AUTH ...
                    </p>
                  </div>
                )}
                {st === "enc" && (
                  <div className="static-noise h-full w-full bg-[#0a0d0a]">
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="rounded-sm border border-destructive/50 bg-[#160508]/90 px-2 py-1 font-mono-hacker text-[10px] text-destructive" dir="ltr">
                        SIGNAL ENCRYPTED
                      </span>
                    </div>
                  </div>
                )}
                <div className="cam-lines pointer-events-none absolute inset-0" aria-hidden="true" />
                <span
                  dir="ltr"
                  className="pointer-events-none absolute bottom-1.5 left-2 font-mono-hacker text-[9px] text-foreground/70"
                >
                  {clock}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="text-[11px] text-muted-foreground">{cam.loc}</span>
                {!live && (
                  <Button
                    size="sm"
                    onClick={() => void hackOne()}
                    disabled={st === "bypass"}
                    className="h-7 bg-primary px-2.5 text-[11px] font-bold text-[#02120a] hover:bg-[#00cc33] hover:text-[#02120a]"
                  >
                    نفوذ
                  </Button>
                )}
                {live && (
                  <span className="font-mono-hacker text-[10px] text-primary" dir="ltr">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        هر نفوذ، سطح تحت‌تعقیب تو را بالاتر می‌برد. مراقب باش.
      </p>
    </section>
  );
}
