import { useGameStore } from "@/lib/game-store";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (
          window as unknown as {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  when = 0
) {
  if (!useGameStore.getState().soundOn) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const keyClick = () => tone(150 + Math.random() * 130, 0.035, "square", 0.022);
export const tickBeep = () => tone(980, 0.09, "sawtooth", 0.07);
export const deniedBuzz = () => {
  tone(180, 0.18, "sawtooth", 0.06);
  tone(130, 0.24, "sawtooth", 0.06, 0.13);
};
export const successChime = () =>
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, "sine", 0.055, i * 0.09));
export const alarmBlast = () => {
  tone(720, 0.28, "square", 0.045);
  tone(540, 0.28, "square", 0.045, 0.3);
};

// SCARY SOUNDS
export const heartbeat = () => {
  tone(58, 0.12, "sine", 0.18);
  tone(50, 0.16, "sine", 0.14, 0.22);
};

export const droneAlarm = () => {
  if (!useGameStore.getState().soundOn) return;
  const c = getCtx();
  if (!c) return;
  const o1 = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o1.type = "sawtooth";
  o2.type = "sine";
  o1.frequency.setValueAtTime(180, c.currentTime);
  o1.frequency.linearRampToValueAtTime(60, c.currentTime + 0.8);
  o2.frequency.setValueAtTime(740, c.currentTime);
  o2.frequency.linearRampToValueAtTime(220, c.currentTime + 0.8);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.09, c.currentTime + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.9);
  o1.connect(g);
  o2.connect(g);
  g.connect(c.destination);
  o1.start();
  o2.start();
  o1.stop(c.currentTime + 1);
  o2.stop(c.currentTime + 1);
};

export const digitalScream = () => {
  if (!useGameStore.getState().soundOn) return;
  const c = getCtx();
  if (!c) return;
  const dur = 1.6;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(1200, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(80, c.currentTime + dur);
  o.frequency.exponentialRampToValueAtTime(900, c.currentTime + dur * 0.6);
  f.type = "bandpass";
  f.frequency.setValueAtTime(800, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(200, c.currentTime + dur);
  f.Q.value = 6;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(f);
  f.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur + 0.1);
};

export const whisperNoise = () => {
  if (!useGameStore.getState().soundOn) return;
  const c = getCtx();
  if (!c) return;
  const dur = 0.5;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.5 * Math.sin(t * 40);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1500;
  f.Q.value = 8;
  const g = c.createGain();
  g.gain.value = 0.08;
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
};

export const glitchBlip = () => {
  tone(220 + Math.random() * 800, 0.04, "square", 0.05);
  tone(140 + Math.random() * 400, 0.06, "sawtooth", 0.04, 0.04);
};

export function explosion() {
  if (!useGameStore.getState().soundOn) return;
  const c = getCtx();
  if (!c) return;
  const dur = 1.3;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(0.3, c.currentTime);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(850, c.currentTime);
  src.connect(f);
  f.connect(g);
  g.connect(c.destination);
  src.start();
}
