"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アカサタナハマヤラワｱｲｳｴｵ0123456789KIAN<>[]{}/\\|=+*#$%&ابتثجچحخدذرزسشصضطظعغفقکگلمنوهی01";

export default function MatrixRain({
  intense = false,
  rainbow = false,
}: {
  intense?: boolean;
  rainbow?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intenseRef = useRef(intense);

  useEffect(() => {
    intenseRef.current = intense;
  }, [intense]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 15;
    let columns = Math.ceil(width / fontSize);
    let drops: number[] = Array.from(
      { length: columns },
      () => Math.random() * (height / fontSize)
    );

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / fontSize);
      drops = Array.from(
        { length: columns },
        () => Math.random() * (height / fontSize)
      );
    };
    window.addEventListener("resize", handleResize);

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      const speed = intenseRef.current ? 33 : 55;
      if (t - last < speed) return;
      last = t;

      ctx.fillStyle = "rgba(2, 4, 3, 0.12)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // bright head
        if (Math.random() > 0.975) {
          ctx.fillStyle = intenseRef.current
            ? "rgba(180, 255, 200, 0.95)"
            : "rgba(160, 255, 190, 0.9)";
        } else {
          ctx.fillStyle = intenseRef.current
            ? "rgba(0, 255, 65, 0.75)"
            : "rgba(0, 255, 65, 0.5)";
        }
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.976) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 opacity-45 ${rainbow ? "godmode-hue" : ""}`}
    />
  );
}
