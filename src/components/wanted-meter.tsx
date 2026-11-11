"use client";

import { useGameStore, MAX_WANTED } from "@/lib/game-store";
import { Skull } from "lucide-react";

export default function WantedMeter() {
  const wanted = useGameStore((s) => s.wanted);
  return (
    <div
      className="flex items-center gap-1"
      title={`سطح تحت‌تعقیب: ${wanted} از ${MAX_WANTED}`}
      aria-label={`سطح تحت‌تعقیب: ${wanted} از ${MAX_WANTED}`}
      dir="ltr"
    >
      {Array.from({ length: MAX_WANTED }).map((_, i) => (
        <Skull
          key={i}
          className={`h-3.5 w-3.5 transition-all ${
            i < wanted
              ? "text-destructive text-glow-red"
              : "text-muted-foreground/35"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
