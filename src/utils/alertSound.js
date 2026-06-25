let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function beep(ctx, freq, start, duration, volume = 0.25) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

/** Double bip audible pour attirer l'attention sur un rappel */
export function jouerSonRappel() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const t = ctx.currentTime;
    beep(ctx, 880, t, 0.15);
    beep(ctx, 660, t + 0.2, 0.2, 0.3);
  } catch {
    /* navigateur sans Web Audio */
  }
}
