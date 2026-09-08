type Tone = "beep" | "laser" | "sonar" | "rip" | "confirm";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

export function playTone(type: Tone) {
  try {
    const audio = getCtx();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;

    if (type === "beep") {
      osc.frequency.setValueAtTime(650, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.stop(now + 0.15);
    } else if (type === "laser") {
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.stop(now + 0.3);
    } else if (type === "sonar") {
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.setValueAtTime(560, now + 0.08);
      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.stop(now + 0.35);
    } else if (type === "rip") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.stop(now + 0.4);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.stop(now + 0.22);
    }

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
  } catch {
    // Audio is optional feedback.
  }
}
