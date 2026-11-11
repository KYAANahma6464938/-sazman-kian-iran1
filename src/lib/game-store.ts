import { create } from "zustand";
import { toast } from "@/hooks/use-toast";

export const ACHIEVEMENTS = {
  first_hack: { title: "نفوذ اول", desc: "اولین نفوذ موفق انجام شد." },
  nuker: { title: "نابودگر", desc: "دکمه قرمز را زدی. خیانت بزرگی بود." },
  ghost: { title: "شبح", desc: "از ردیابی معکوس فرار کردی." },
  keysmith: { title: "قلاب‌باز", desc: "یک رمز عبور را شکستی." },
  watcher: { title: "چشم همه‌جا", desc: "همه دوربین‌ها هک شدند." },
  godmode: { title: "خداوند سایبری", desc: "کد مخفی قدیمی را پیدا کردی." },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

export const MAX_WANTED = 5;

interface GameState {
  wanted: number;
  alertActive: boolean;
  evading: boolean;
  exposed: boolean;
  nukeActive: boolean;
  godMode: boolean;
  soundOn: boolean;
  hackedActive: boolean;
  bloodMode: boolean;
  achievements: AchievementId[];
  addWanted: (n?: number) => void;
  startEvade: () => void;
  finishEvade: () => void;
  triggerExposed: () => void;
  clearAlert: () => void;
  setNuke: (v: boolean) => void;
  activateGodMode: () => void;
  toggleSound: () => void;
  unlock: (id: AchievementId) => void;
  triggerHacked: (reason?: string) => void;
  clearHacked: () => void;
  toggleBlood: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  wanted: 0,
  alertActive: false,
  evading: false,
  exposed: false,
  nukeActive: false,
  godMode: false,
  soundOn: true,
  hackedActive: false,
  bloodMode: false,
  achievements: [],

  addWanted: (n = 1) => {
    const w = Math.min(MAX_WANTED, get().wanted + n);
    set({ wanted: w });
    if (w >= MAX_WANTED && !get().alertActive) set({ alertActive: true });
  },
  startEvade: () => {
    if (get().alertActive && !get().evading && !get().exposed) {
      set({ evading: true });
    }
  },
  finishEvade: () => set({ wanted: 0, alertActive: false, evading: false }),
  triggerExposed: () => set({ exposed: true }),
  clearAlert: () =>
    set({ exposed: false, alertActive: false, evading: false, wanted: 0 }),
  setNuke: (v) => set({ nukeActive: v }),
  activateGodMode: () => {
    if (get().godMode) return;
    set({ godMode: true, wanted: 0, alertActive: false });
    get().unlock("godmode");
  },
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  triggerHacked: (_reason?: string) => {
    if (get().hackedActive || get().godMode) return;
    set({ hackedActive: true, alertActive: true, wanted: MAX_WANTED });
  },
  clearHacked: () => set({ hackedActive: false, alertActive: false, wanted: 0 }),
  toggleBlood: () => set((s) => ({ bloodMode: !s.bloodMode })),
  unlock: (id) => {
    if (get().achievements.includes(id)) return;
    set((s) => ({ achievements: [...s.achievements, id] }));
    toast({
      title: `دستاورد باز شد: ${ACHIEVEMENTS[id].title}`,
      description: ACHIEVEMENTS[id].desc,
    });
  },
}));
