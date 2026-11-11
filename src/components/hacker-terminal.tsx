"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import {
  deniedBuzz,
  keyClick,
  successChime,
  droneAlarm,
  heartbeat,
  whisperNoise,
  glitchBlip,
} from "@/lib/sound";

type Line = { text: string; cls?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const randIp = () =>
  `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 254) + 1}`;

const BOX_TOP = "╔" + "═".repeat(46) + "╗";
const BOX_BOT = "╚" + "═".repeat(46) + "╝";
const BOX_MID =
  "║" + "   KIAN TERMINAL v4.0.4  //  ROOT ACCESS".padEnd(46, " ") + "║";

const WELCOME: Line[] = [
  { text: BOX_TOP, cls: "text-primary text-glow-dim" },
  { text: BOX_MID, cls: "text-primary text-glow-dim" },
  { text: BOX_BOT, cls: "text-primary text-glow-dim" },
  { text: "اتصال برقرار شد. دسترسی: ROOT | رمزگذاری: AES-256", cls: "text-muted-foreground" },
  { text: "برای دیدن دستورات، عبارت help را تایپ کنید.", cls: "text-[#ffb300]" },
];

const HELP_LINES: Line[] = [
  { text: "--- دستورات موجود ---", cls: "text-[#ffb300] font-bold" },
  { text: "  help      نمایش همین راهنما", cls: "text-foreground" },
  { text: "  whoami    نمایش هویت فعلی", cls: "text-foreground" },
  { text: "  scan      اسکن پورت‌های یک هدف تصادفی", cls: "text-foreground" },
  { text: "  hack      نفوذ به یک سرور (شبیه‌سازی)", cls: "text-foreground" },
  { text: "  ddos      شبیه‌سازی حمله توزیع‌شده", cls: "text-foreground" },
  { text: "  decrypt   رمزگشایی یک پیام محرمانه", cls: "text-foreground" },
  { text: "  trace     ردیابی مسیر یک IP", cls: "text-foreground" },
  { text: "  inject    تزریق payload خشن به هدف (ترسناک)", cls: "text-[#ff6677]" },
  { text: "  dox       افشای هویت (شبیه‌سازی)", cls: "text-[#ff6677]" },
  { text: "  panic     اعلام خطر کاذب برای ایجاد ترس", cls: "text-[#ff6677]" },
  { text: "  haunt     احضار ارواح سایبری (این دستور را با احتیاط بزن)", cls: "text-[#ff6677]" },
  { text: "  scream    فریاد دیجیتال سرور را بلرزاند", cls: "text-[#ff6677]" },
  { text: "  blood     حالت خونین: تمام متن قرمز می‌شود", cls: "text-[#ff6677]" },
  { text: "  ransom    فعال‌سازی ماشین باج‌افزار (خطرناک)", cls: "text-[#ff6677]" },
  { text: "  summon    احضار یار شیطان سایبری", cls: "text-[#ff6677]" },
  { text: "  burn      سوزاندن کامل سرور (شبیه‌سازی)", cls: "text-[#ff6677]" },
  { text: "  identity  نمایش نام واقعی شما (احتیاط)", cls: "text-[#ff6677]" },
  { text: "  choke     خفه‌کردن اتصال اینترنت شما", cls: "text-[#ff6677]" },
  { text: "  files     پرش به سیستم‌فایل محرمانه", cls: "text-foreground" },
  { text: "  crack     پرش به آزمایشگاه رمزشکن", cls: "text-foreground" },
  { text: "  cctv      پرش به دوربین‌های مداربسته", cls: "text-foreground" },
  { text: "  globe     پرش به نقشه زنده حملات کره زمین", cls: "text-foreground" },
  { text: "  wanted    نمایش سطح تحت‌تعقیب", cls: "text-foreground" },
  { text: "  evade     فرار از ردیابی معکوس", cls: "text-foreground" },
  { text: "  nuke      فعال‌سازی توالی انهدام (خطرناک)", cls: "text-[#ff6677]" },
  { text: "  darkweb   پرش به بخش دارک وب", cls: "text-[#ff6677]" },
  { text: "  matrix    حالت ماتریس فشرده", cls: "text-foreground" },
  { text: "  clear     پاک‌کردن صفحه", cls: "text-foreground" },
  { text: "  exit      قطع اتصال", cls: "text-foreground" },
];

// Aggressive responses to unknown commands
const AGGRESSIVE_RESPONSES = [
  "دستوری که زدی وجود نداره. مطمئنی اینجا کار می‌کنی؟",
  "اشتباه زدی. حد می‌زنم استرس گرفتی.",
  "WHAT DO YOU WANT? واضح بنویس.",
  "بازم اشتباه. کی آدمو آورد اینجا؟",
  "ERROR: مغزت پیدا نشد. help رو بزن.",
  "این چی بود؟ برنامه‌نویس نیستی تو، شک نکن.",
  "STOP TYPING NONSENSE.",
  "اشتباه after اشتباه. حد می‌زنم ناراحت شدی.",
];

const SCARY_UNKNOWN = [
  "WARNING: دستور ناشناخته. فعالیت شما در حال لاگ شدن است.",
  "ALERT: IP شما در سیاه‌چاله افتاد. ادامه بده.",
  "SNIFFING: بسته‌های شما در حال رهگیری هستند.",
  "INTRUSION DETECTED: ولی نه از طرف ما. از طرف خودت.",
];

const HAUNT_LINES = [
  "احضار ارواح سایبری ...",
  "ارواح سرورهای مرده بیدار شدند ...",
  "صدای تایپ کردن از پشت سرت میاد ...",
  "یکی داره از مانیتور بهت نگاه می‌کنه ...",
  "نور قرمز چشمک می‌زنه. نگاه کن.",
  "نباید این دستور رو می‌زدی.",
  "حالا تنهایی.",
];

export default function HackerTerminal({
  onMatrix,
  onAccessFlash,
}: {
  onMatrix: () => void;
  onAccessFlash: (msg: string) => void;
}) {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bloodMode = useGameStore((s) => s.bloodMode);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (outRef.current) {
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  }, [lines]);

  const push = (text: string, cls?: string) => {
    if (!mountedRef.current) return;
    setLines((prev) => [...prev.slice(-200), { text, cls }]);
  };

  const replaceLast = (text: string, cls?: string) => {
    if (!mountedRef.current) return;
    setLines((prev) => {
      const next = [...prev];
      next[next.length - 1] = { text, cls };
      return next;
    });
  };

  const runScript = async (script: Line[], minDelay = 90, maxDelay = 260) => {
    setBusy(true);
    for (const l of script) {
      await sleep(minDelay + Math.random() * (maxDelay - minDelay));
      if (!mountedRef.current) return;
      push(l.text, l.cls);
    }
    setBusy(false);
  };

  const progressBar = async (label: string, cls: string, steps = 14) => {
    push(`${label} [${"-".repeat(steps)}]   0%`, cls);
    for (let i = 1; i <= steps; i++) {
      await sleep(90 + Math.random() * 220);
      if (!mountedRef.current) return;
      const filled = "#".repeat(i);
      const empty = "-".repeat(steps - i);
      const pct = Math.round((i / steps) * 100);
      replaceLast(`${label} [${filled}${empty}]  ${pct}%`, cls);
    }
  };

  const handleScan = async () => {
    const ip = randIp();
    push(`> nmap -sS -Pn ${ip}`, "text-muted-foreground");
    await runScript(
      [
        { text: `شروع اسکن پورت‌ها روی ${ip} ...`, cls: "text-foreground" },
        { text: "PORT      STATE   SERVICE", cls: "text-muted-foreground" },
        { text: "22/tcp    OPEN    ssh", cls: "text-[#ffb300]" },
        { text: "80/tcp    OPEN    http", cls: "text-[#ffb300]" },
        { text: "443/tcp   OPEN    https", cls: "text-[#ffb300]" },
        { text: "1337/tcp  OPEN    kian-backdoor", cls: "text-primary text-glow-dim" },
        { text: "3306/tcp  FILTERED mysql", cls: "text-muted-foreground" },
        { text: `اسکن کامل شد: ۴ پورت باز | سیستم‌عامل: Linux 5.x`, cls: "text-primary" },
      ],
      150,
      420
    );
  };

  const handleHack = async () => {
    const target = randIp();
    onAccessFlash("HACKING");
    await progressBar(`نفوذ به ${target}`, "text-primary", 16);
    await runScript(
      [
        { text: "[+] فایروال دور زده شد", cls: "text-primary" },
        { text: "[+] راه‌اندازی ریکرس شل ...", cls: "text-foreground" },
        { text: "[+] دسترسی root دریافت شد", cls: "text-primary text-glow-dim" },
        { text: "ACCESS GRANTED // دسترسی تایید شد", cls: "text-primary text-glow font-bold" },
        { text: "(این فقط یک شبیه‌ساز تفریحی است)", cls: "text-muted-foreground" },
      ],
      200,
      500
    );
  };

  const handleDdos = async () => {
    const target = randIp();
    onAccessFlash("OVERLOAD");
    push(`شروع سیل پکت‌ها به سمت ${target} ...`, "text-[#ff6677]");
    for (let i = 0; i < 8; i++) {
      await sleep(160);
      if (!mountedRef.current) return;
      const gbps = (Math.random() * 40 + 10).toFixed(1);
      push(`>>> ${gbps} Gbps | پکت‌های ارسالی: ${Math.floor(Math.random() * 900000 + 100000)}`, "text-[#ff6677]");
    }
    push("هدف از کار افتاد. حمله متوقف شد.", "text-[#ffb300]");
  };

  const handleDecrypt = async () => {
    const secret = "KIAN_OWNS_THE_NIGHT_2026";
    const chars = "!@#$%^&*ABCXYZ0123456789";
    push("پیام رمزگذاری‌شده دریافت شد. در حال رمزگشایی ...", "text-muted-foreground");
    for (let r = 0; r < 12; r++) {
      await sleep(80);
      if (!mountedRef.current) return;
      const shown = secret
        .split("")
        .map((c, i) =>
          i < (r * secret.length) / 12
            ? c
            : chars[Math.floor(Math.random() * chars.length)]
        )
        .join("");
      replaceLast(`> ${shown}`, "text-primary font-mono-hacker");
    }
    push("رمزگشایی کامل شد: KIAN_OWNS_THE_NIGHT_2026", "text-primary text-glow-dim");
  };

  const handleTrace = async () => {
    const ip = randIp();
    push(`traceroute به ${ip} ...`, "text-muted-foreground");
    const cities = ["تهران، ایران", "فرانکفورت، آلمان", "آمستردام، هلند", "ریکیاویک، ایسلند", "توکیو، ژاپن", "??? [پنهان]"];
    const hops = Math.floor(Math.random() * 3) + 4;
    for (let i = 1; i <= hops; i++) {
      await sleep(240);
      if (!mountedRef.current) return;
      const city = cities[Math.min(i - 1, cities.length - 1)];
      push(`  ${i}  ${randIp()}  ${city}  ${(Math.random() * 80 + 4).toFixed(1)}ms`, "text-foreground");
    }
    push("ردیابی در نود نهایی ناپدید شد. شما قابل ردیابی نیستید.", "text-primary text-glow-dim");
  };

  // SCARY NEW COMMANDS

  const handleInject = async () => {
    const target = randIp();
    onAccessFlash("INJECTING");
    push(`>> target locked: ${target}`, "text-destructive");
    await sleep(400);
    await runScript(
      [
        { text: "[+] در حال بارگذاری payload malicious.so", cls: "text-[#ff6677]" },
        { text: "[+] payload size: 4.2 MB", cls: "text-muted-foreground" },
        { text: "[+] تزریق از طریق آسیب‌پذیری CVE-2024-XXXX", cls: "text-[#ff6677]" },
        { text: "[+] payload اجرا شد ...", cls: "text-destructive text-glow-red" },
      ],
      240,
      600
    );
    // fake heartbeat audio
    heartbeat();
    await sleep(500);
    heartbeat();
    await progressBar("دستگیری کامل سیستم", "text-destructive", 18);
    await runScript(
      [
        { text: "[!] فایروال هدف غیرفعال شد", cls: "text-[#ffb300]" },
        { text: "[!] تمام فایل‌ها رمزگذاری شدند", cls: "text-[#ff6677]" },
        { text: "[!] وب‌کم هدف فعال شد — در حال ضبط", cls: "text-destructive text-glow-red" },
        { text: "TARGET OWNED. درخواست باج: 3 BTC تا ۴۸ ساعت.", cls: "text-destructive text-glow-red font-bold" },
        { text: "(این فقط یک شبیه‌سازی است. هیچ سیستم واقعی آسیب ندید.)", cls: "text-muted-foreground" },
      ],
      300,
      700
    );
    useGameStore.getState().addWanted(2);
  };

  const handleDox = async () => {
    onAccessFlash("DOXING");
    droneAlarm();
    push(">> شروع پروتکل افشای هویت (شبیه‌سازی)", "text-destructive text-glow-red");
    await sleep(400);
    const ip = randIp();
    await runScript(
      [
        { text: "[+] هدف: خودت", cls: "text-destructive" },
        { text: `[+] IP: ${ip}`, cls: "text-foreground" },
        { text: "[+] ISP: AS12345 — Tehran-Cloud-Net", cls: "text-foreground" },
        { text: "[+] CITY: تهران، ایران", cls: "text-foreground" },
        { text: "[+] BROWSER: رمزگشایی شد", cls: "text-foreground" },
        { text: "[+] OS: شناسایی شد", cls: "text-foreground" },
        { text: "[+] WEBCAM: ???", cls: "text-destructive" },
        { text: "[+] SCREEN: در حال ضبط ...", cls: "text-destructive" },
        { text: "INFO LEAKED — تموم شد.", cls: "text-destructive text-glow-red font-bold" },
        { text: "(شوخی بود. هیچ اطلاعاتی واقعاً جمع نشده.)", cls: "text-muted-foreground" },
      ],
      220,
      560
    );
    useGameStore.getState().addWanted(2);
  };

  const handlePanic = async () => {
    push(">> فعال‌سازی هشدار کاذب ...", "text-[#ffb300]");
    for (let i = 0; i < 3; i++) {
      await sleep(220);
      push("BEEP. BEEP. BEEP.", "text-destructive text-glow-red");
    }
    droneAlarm();
    await sleep(400);
    push("ترسیدی؟ خوبه. آرام باش، اشتباه بود.", "text-[#ffb300]");
    await sleep(500);
    push("البته شاید واقعاً نبود ...", "text-muted-foreground");
  };

  const handleHaunt = async () => {
    whisperNoise();
    for (const line of HAUNT_LINES) {
      await sleep(900);
      if (!mountedRef.current) return;
      whisperNoise();
      push(line, "text-destructive text-glow-red");
    }
    await sleep(1500);
    push("...", "text-muted-foreground");
  };

  const handleScream = async () => {
    onAccessFlash("AAAAA");
    push(">> فریاد دیجیتال در حال ارسال ...", "text-destructive text-glow-red");
    await sleep(200);
    for (let i = 0; i < 6; i++) {
      await sleep(160);
      glitchBlip();
      const chars = "AAAAAAAHHHH!!!";
      push(chars + " ".repeat(i * 2) + chars, "text-destructive text-glow-red scream-flicker");
    }
    push("سرور لرزید. ولی کسی نشنید.", "text-muted-foreground");
  };

  const handleBlood = async () => {
    const newMode = !useGameStore.getState().bloodMode;
    useGameStore.getState().toggleBlood();
    push(
      newMode
        ? "حالت خونین فعال. تمام صفحه در خون غرق شد."
        : "حالت خونین غیرفعال. آرامش بازگشت.",
      newMode ? "text-destructive text-glow-red font-bold" : "text-primary"
    );
    if (newMode) {
      droneAlarm();
      push("همه چیز قرمز است. ادامه بده، دیوونه.", "text-destructive");
    }
  };

  const handleRansom = async () => {
    onAccessFlash("ENCRYPTED");
    push(">> فعال‌سازی باج‌افزار KIAN-RANSOMWARE v3.0 ...", "text-destructive text-glow-red");
    droneAlarm();
    await sleep(800);
    await runScript(
      [
        { text: "[+] بارگذاری ماژول رمزگذاری AES-256-CBC", cls: "text-[#ff6677]" },
        { text: "[+] هدف: تمام فایل‌های لوکال", cls: "text-[#ff6677]" },
        { text: "[+] شروع رمزگذاری ...", cls: "text-destructive text-glow-red" },
        { text: "[+] family_photos.zip ... LOCKED", cls: "text-[#ffb300]" },
        { text: "[+] passport_scan.pdf ... LOCKED", cls: "text-[#ffb300]" },
        { text: "[+] passwords.txt ... LOCKED", cls: "text-[#ffb300]" },
        { text: "[+] wallet_seed_phrase.txt ... LOCKED", cls: "text-destructive" },
        { text: "[+] bank_statements.pdf ... LOCKED", cls: "text-destructive" },
        { text: "[!] تمام فایل‌ها رمزگذاری شدند", cls: "text-destructive text-glow-red font-bold" },
        { text: "[!] کلید رمزگشایی به سرور مخفی ارسال شد", cls: "text-[#ffb300]" },
        { text: ">>> باج: 3.00 BTC تا ۴۸ ساعت", cls: "text-[#ffb300] font-bold" },
        { text: ">>> پایین صفحه رو ببین. ماشین باج‌افزار فعال شده.", cls: "text-primary text-glow-dim" },
      ],
      250,
      650
    );
    // fire the ransom event so the panel becomes active
    window.dispatchEvent(new CustomEvent("kian:ransom"));
    useGameStore.getState().addWanted(2);
  };

  const handleSummon = async () => {
    whisperNoise();
    push(">> احضار یار شیطان سایبری ...", "text-destructive text-glow-red");
    await sleep(500);
    push("نگاه کن پشت سرت.", "text-destructive");
    await sleep(700);
    push("احضار شد. حالا تنها نیستی.", "text-[#ffb300]");
    await sleep(400);
    push("ولی این تنهایی بهتر از اینه.", "text-muted-foreground");
    await sleep(700);
    push("[!] اتصال برقرار: companion_kian.exe", "text-primary text-glow-dim");
    push("الان تو باهات حرف می‌زنه. گوش بده.", "text-foreground");
    // brief scary sequence
    for (let i = 0; i < 3; i++) {
      await sleep(900);
      glitchBlip();
      const phrases = [
        "الان نگاهت می‌کنم.",
        "خسته‌نباشی.",
        "نزدیک شدی.",
      ];
      push(`[${i + 1}/3] ${phrases[i]}`, "text-destructive text-glow-red");
    }
    useGameStore.getState().addWanted(1);
  };

  const handleBurn = async () => {
    onAccessFlash("BURNING");
    push(">> آغاز سوزاندن کامل سرور ...", "text-destructive text-glow-red");
    droneAlarm();
    await sleep(500);
    await runScript(
      [
        { text: "[+] rm -rf /var/log/*", cls: "text-[#ffb300]" },
        { text: "[+] shred -u /etc/passwd", cls: "text-[#ffb300]" },
        { text: "[+] dd if=/dev/zero of=/dev/sda", cls: "text-destructive" },
        { text: "[+] wiping database records ...", cls: "text-destructive" },
        { text: "[+] destroying backup servers ...", cls: "text-destructive" },
        { text: "[+] burning evidence ...", cls: "text-destructive text-glow-red" },
        { text: "تمام شد. هیچ ردی باقی نماند.", cls: "text-primary text-glow-dim font-bold" },
        { text: "(شوخی بود. هیچ چیزی واقعاً سوختنه نشده.)", cls: "text-muted-foreground" },
      ],
      280,
      650
    );
    useGameStore.getState().addWanted(2);
  };

  const handleIdentity = async () => {
    onAccessFlash("IDENTITY");
    push(">> جستجوی هویت واقعی شما ...", "text-destructive text-glow-red");
    whisperNoise();
    await sleep(600);
    const ua = navigator.userAgent;
    const browser =
      /edg/i.test(ua) ? "Microsoft Edge" :
      /chrome/i.test(ua) ? "Google Chrome" :
      /firefox/i.test(ua) ? "Mozilla Firefox" :
      /safari/i.test(ua) ? "Apple Safari" : "Unknown";
    const os =
      /windows/i.test(ua) ? "Windows" :
      /mac/i.test(ua) ? "macOS" :
      /linux/i.test(ua) ? "Linux" :
      /android/i.test(ua) ? "Android" :
      /iphone|ipad/i.test(ua) ? "iOS" : "Unknown";
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screen = `${window.screen.width}x${window.screen.height}`;
    await runScript(
      [
        { text: "[+] اسکن پایگاه داده‌ی ملی ...", cls: "text-[#ffb300]" },
        { text: "[+] تطبیق اثر انگشت دیجیتال ...", cls: "text-[#ffb300]" },
        { text: "[+] پیدات شد.", cls: "text-destructive text-glow-red" },
        { text: `BROWSER: ${browser}`, cls: "text-foreground" },
        { text: `OS: ${os}`, cls: "text-foreground" },
        { text: `LANG: ${lang}`, cls: "text-foreground" },
        { text: `TIMEZONE: ${tz}`, cls: "text-foreground" },
        { text: `SCREEN: ${screen}`, cls: "text-foreground" },
        { text: `NAME: [REDACTED — LAYER 5 ONLY]`, cls: "text-destructive text-glow-red" },
        { text: ">>> اگر اسم واقعیت رو می‌خوای، GOD MODE رو فعال کن.", cls: "text-muted-foreground" },
      ],
      200,
      500
    );
    useGameStore.getState().addWanted(2);
  };

  const handleChoke = async () => {
    onAccessFlash("CHOKING");
    push(">> خفه‌کردن اتصال اینترنت شما ...", "text-destructive text-glow-red");
    droneAlarm();
    await sleep(500);
    for (let i = 0; i < 6; i++) {
      await sleep(300);
      const speed = (Math.random() * 5 + 0.1).toFixed(2);
      push(`>>> throughput: ${speed} KB/s | latency: ${Math.floor(Math.random() * 8000 + 1000)}ms`, "text-[#ffb300]");
    }
    push("اتصالت نابود شد. هر صفحه‌ای ۶۰ ثانیه طول می‌کشه.", "text-destructive text-glow-red");
    await sleep(500);
    push("(شوخی بود. اینترنتت همون‌قدر سریعه.)", "text-muted-foreground");
    useGameStore.getState().addWanted(1);
  };

  const execute = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    push(`root@kian:~$ ${raw}`, "text-[#ffb300] font-mono-hacker");

    switch (cmd) {
      case "help":
      case "راهنما":
      case "?":
        await runScript(HELP_LINES, 40, 90);
        break;
      case "whoami":
        await runScript([
          { text: "root", cls: "text-primary text-glow-dim" },
          { text: "سازمان کیان | مدیر ارشد سیستم‌ها", cls: "text-foreground" },
          { text: "سطح دسترسی: GOD MODE", cls: "text-[#ffb300]" },
        ]);
        break;
      case "scan":
      case "اسکن":
        await handleScan();
        break;
      case "hack":
      case "هک":
        await handleHack();
        useGameStore.getState().addWanted(1);
        useGameStore.getState().unlock("first_hack");
        successChime();
        break;
      case "ddos":
        await handleDdos();
        useGameStore.getState().addWanted(1);
        break;
      case "decrypt":
      case "رمزگشایی":
        await handleDecrypt();
        break;
      case "trace":
      case "ردیابی":
        await handleTrace();
        break;
      case "inject":
      case "تزریق":
        await handleInject();
        break;
      case "dox":
      case "دکس":
        await handleDox();
        break;
      case "panic":
      case "وحشت":
        await handlePanic();
        break;
      case "haunt":
      case "احضار":
        await handleHaunt();
        break;
      case "scream":
      case "فریاد":
        await handleScream();
        break;
      case "blood":
      case "خون":
        await handleBlood();
        break;
      case "ransom":
      case "باج":
        await handleRansom();
        break;
      case "summon":
      case "احضار":
        await handleSummon();
        break;
      case "burn":
      case "سوزاندن":
        await handleBurn();
        break;
      case "identity":
      case "هویت":
        await handleIdentity();
        break;
      case "choke":
      case "خفه":
        await handleChoke();
        break;
      case "files":
      case "فایل‌ها":
      case "سیستم":
        push("در حال باز کردن سیستم‌فایل محرمانه ...", "text-primary");
        await sleep(400);
        document.getElementById("filesystem")?.scrollIntoView({ behavior: "smooth" });
        push("پوشه‌ها رو باز کن. ولی مراقب do_not_open باش.", "text-[#ff6677]");
        break;
      case "globe":
      case "کره":
      case "نقشه":
        push("در حال باز کردن نقشه‌ی زنده‌ی حملات کره زمین ...", "text-primary");
        await sleep(400);
        document.getElementById("globe")?.scrollIntoView({ behavior: "smooth" });
        push("۲۴۷ کشور زیر نظر. هر ثانیه یک حمله. تماشا کن.", "text-primary");
        break;
      case "darkweb":
      case "دارک وب":
        push("در حال انتقال به دروازه دارک وب ...", "text-[#ff6677]");
        await sleep(500);
        document.getElementById("darkweb")?.scrollIntoView({ behavior: "smooth" });
        push("انتقال انجام شد. مواظب باش، اونجا قانون حاکم نیست.", "text-[#ff6677]");
        break;
      case "crack":
      case "رمزشکن":
        push("در حال باز کردن آزمایشگاه رمزشکن ...", "text-primary");
        await sleep(400);
        document.getElementById("cracker")?.scrollIntoView({ behavior: "smooth" });
        push("آزمایشگاه آماده است. یک رمز بنویس و بشکنش.", "text-primary");
        break;
      case "cctv":
      case "دوربین":
        push("در حال اتصال به شبکه دوربین‌های مداربسته ...", "text-primary");
        await sleep(400);
        document.getElementById("cctv")?.scrollIntoView({ behavior: "smooth" });
        push("۶ فید رمزگذاری‌شده پیدا شد. هر کدوم رو که هک کنی، یک جمجمه بالای صفحه پر می‌شه.", "text-primary");
        break;
      case "wanted":
      case "تعقیب": {
        const w = useGameStore.getState().wanted;
        push(`سطح تحت‌تعقیب: ${w} از 5`, w >= 4 ? "text-destructive text-glow-red" : "text-[#ffb300]");
        if (w >= 4) push("فوری فرار کن! دستور evade را بزن", "text-destructive");
        else if (w === 0) push("تمیز و بی‌لاک. مثل اینکه اصلاً وجود نداری.", "text-primary");
        break;
      }
      case "evade":
      case "فرار":
        if (useGameStore.getState().alertActive) {
          push("شروع پروتکل فرار ...", "text-primary");
          useGameStore.getState().startEvade();
        } else {
          deniedBuzz();
          push("چیزی برای فرار کردن نیست؛ هنوز سایه‌ای.", "text-muted-foreground");
        }
        break;
      case "nuke":
      case "انهدام":
        push("هشدار: توالی انهدام سرور در حال فعال‌سازی است ...", "text-destructive text-glow-red");
        await sleep(700);
        push("RETREAT NOT POSSIBLE", "text-destructive font-bold");
        await sleep(500);
        useGameStore.getState().setNuke(true);
        break;
      case "god":
        if (useGameStore.getState().godMode) {
          successChime();
          push("GOD MODE فعال است. تو قانون این شبکه‌ای.", "text-[#ffb300] text-glow-dim");
        } else {
          deniedBuzz();
          push("دسترسی ممنوع. رمز مخفی رو پیدا کن.", "text-destructive");
          push("hint: قدیمی‌ترین کد تقلب بازی‌ها را جایی تایپ کن ...", "text-muted-foreground");
        }
        break;
      case "matrix":
      case "ماتریس":
        onMatrix();
        push("حالت ماتریس فعال شد. به تازگی بیدار شدی؟", "text-primary text-glow-dim");
        break;
      case "sudo":
        push("دسترسی sudo از قبل فعال است. تو رئیس خودت هستی.", "text-[#ffb300]");
        break;
      case "clear":
      case "cls":
        setLines([]);
        break;
      case "exit":
      case "خروج":
        await runScript([
          { text: "connection closed by foreign host.", cls: "text-muted-foreground" },
          { text: "شوخی کردم؛ نمی‌تونی بری جایی.", cls: "text-primary" },
        ]);
        break;
      default:
        deniedBuzz();
        // pick a random aggressive response
        const aggressive = AGGRESSIVE_RESPONSES[Math.floor(Math.random() * AGGRESSIVE_RESPONSES.length)];
        push(`> ${cmd}: ${aggressive}`, "text-[#ff6677]");
        // 30% chance to add a scary follow-up
        if (Math.random() < 0.3) {
          const scary = SCARY_UNKNOWN[Math.floor(Math.random() * SCARY_UNKNOWN.length)];
          await sleep(450);
          push(scary, "text-destructive text-glow-red");
          // tiny chance to trigger the hacked overlay after enough typos
          useGameStore.getState().addWanted(0);
        }
        push("help بزن تا یاد بگیری چطوری کار می‌کنه.", "text-muted-foreground");
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) keyClick();
    if (e.key === "Enter" && !busy) {
      const val = input;
      setInput("");
      if (val.trim()) {
        setHistory((h) => [val, ...h].slice(0, 50));
        setHistIdx(-1);
      }
      execute(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        const next = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(Math.max(next, -1));
      setInput(next >= 0 ? history[next] : "");
    }
  };

  return (
    <div className={`hacker-panel corner-brackets rounded-sm ${bloodMode ? "brutal-frame warn-flash" : ""}`}>
      {/* title bar */}
      <div className={`flex items-center gap-2 border-b border-border bg-[#041006] px-3 py-2 ${bloodMode ? "text-destructive" : ""}`} dir="ltr">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono-hacker text-xs text-muted-foreground">
          root@kian: ~/kian_core
        </span>
        <span className={`ml-auto flex items-center gap-1.5 font-mono-hacker text-[10px] ${bloodMode ? "text-destructive text-glow-red" : "text-primary"}`}>
          <span className={`pulse-dot inline-block h-2 w-2 rounded-full ${bloodMode ? "bg-destructive" : "bg-primary"}`} />
          {bloodMode ? "BLOOD MODE" : "SECURE SHELL"}
        </span>
      </div>

      {/* output */}
      <div
        ref={outRef}
        dir="ltr"
        className="h-[380px] overflow-y-auto px-4 py-3 font-mono-hacker text-xs sm:text-sm leading-6"
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-label="خروجی ترمینال"
      >
        {lines.map((l, i) => (
          <p
            key={i}
            dir="auto"
            className={`whitespace-pre-wrap break-all ${l.cls ?? "text-foreground"}`}
          >
            {l.text}
          </p>
        ))}
        {busy && <p className="text-muted-foreground cursor-blink">processing</p>}
      </div>

      {/* input */}
      <div
        dir="ltr"
        className="flex items-center gap-2 border-t border-border bg-[#041006] px-4 py-3 font-mono-hacker text-sm"
      >
        <span className="text-[#ffb300] shrink-0">root@kian:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={busy}
          className="w-full bg-transparent text-primary outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
          placeholder={busy ? "در حال اجرا ..." : "type a command ... (help)"}
          aria-label="ورودی ترمینال"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
