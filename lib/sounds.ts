/* ─────────────────────────────────────────────────────────────
   sounds.ts — gerçekçi ses efektleri
   Yaklaşım: filtered noise katmanları, LFO veya pitch sweep yok.
   Elektronik osilatörler sadece alçak "thud" için (sub-bass).
───────────────────────────────────────────────────────────── */

function getCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/** White noise buffer */
function makeWhiteNoise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
  const frames = Math.ceil(ctx.sampleRate * duration);
  const buf     = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Brown (low-rumble) noise buffer */
function makeBrownNoise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
  const frames = Math.ceil(ctx.sampleRate * duration);
  const buf     = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data    = buf.getChannelData(0);
  let last      = 0;
  for (let i = 0; i < frames; i++) {
    const w = Math.random() * 2 - 1;
    last    = (last + 0.02 * w) / 1.02;
    data[i] = last * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

/* ──────────────────────────────────────────────────────────
   playKnockSound — kapıya yumruk vurma sesi
   3 adet darbe: her darbe = white noise burst + low sine thud
────────────────────────────────────────────────────────── */
export function playKnockSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  // 3 knock zamanlaması (saniye cinsinden offset)
  const knocks = [0, 0.21, 0.42];

  for (const dt of knocks) {
    const t = t0 + dt;

    /* --- Darbe gürültüsü: beyaz gürültü → lowpass → hızlı decay --- */
    const imp   = makeWhiteNoise(ctx, 0.07);
    const impLp = ctx.createBiquadFilter();
    impLp.type           = "lowpass";
    impLp.frequency.value = 900;            // parmak eti karakteri
    const impG = ctx.createGain();
    impG.gain.setValueAtTime(0.55, t);
    impG.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    imp.connect(impLp);
    impLp.connect(impG);
    impG.connect(ctx.destination);
    imp.start(t);
    imp.stop(t + 0.07);

    /* --- Ahşap rezonansı: alçak sinüs, hızlı decay --- */
    const thud = ctx.createOscillator();
    thud.type  = "sine";
    thud.frequency.setValueAtTime(170, t);
    thud.frequency.exponentialRampToValueAtTime(60, t + 0.14);
    const thudG = ctx.createGain();
    thudG.gain.setValueAtTime(0.45, t);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    thud.connect(thudG);
    thudG.connect(ctx.destination);
    thud.start(t);
    thud.stop(t + 0.17);

    /* --- Kapı titreşimi: filtrelenmiş brown noise burst --- */
    const vib   = makeBrownNoise(ctx, 0.12);
    const vibBp = ctx.createBiquadFilter();
    vibBp.type       = "bandpass";
    vibBp.frequency.value = 280;
    vibBp.Q.value    = 4;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0.18, t + 0.01);
    vibG.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    vib.connect(vibBp);
    vibBp.connect(vibG);
    vibG.connect(ctx.destination);
    vib.start(t + 0.01);
    vib.stop(t + 0.13);
  }

  setTimeout(() => ctx.close(), 900);
}

/* ──────────────────────────────────────────────────────────
   playDoorOpenSound — kapı açılma sesi
   3 aşama: direnç gıcırtısı → kapı yayı → hava "whoosh"
   Tamamen noise-based, LFO veya pitch sweep yok.
────────────────────────────────────────────────────────── */
export function playDoorOpenSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;

  /* ── Aşama 1: İlk direnç — yüksek frekanslı kısa gıcırtı (0.0–0.7s) ── */
  const n1   = makeBrownNoise(ctx, 0.8);
  const bp1  = ctx.createBiquadFilter();
  bp1.type   = "bandpass";
  // Frekans sabit değil ama LFO yok — sadece iki nokta arası lineer sweep
  bp1.frequency.setValueAtTime(1400, t0);
  bp1.frequency.linearRampToValueAtTime(320,  t0 + 0.7);
  bp1.Q.value = 18;   // yüksek Q = "singing" gürültü karakteri
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0,    t0);
  g1.gain.linearRampToValueAtTime(0.55, t0 + 0.04);  // hızlı başlıyor
  g1.gain.setValueAtTime(0.55, t0 + 0.45);
  g1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.75);
  n1.connect(bp1); bp1.connect(g1); g1.connect(ctx.destination);
  n1.start(t0); n1.stop(t0 + 0.82);

  /* ── Aşama 2: Kapı sallanıyor — orta frekans, uzun (0.5–2.0s) ── */
  const n2  = makeBrownNoise(ctx, 1.7);
  const bp2 = ctx.createBiquadFilter();
  bp2.type  = "bandpass";
  bp2.frequency.setValueAtTime(480,  t0 + 0.45);
  bp2.frequency.linearRampToValueAtTime(110,  t0 + 1.9);
  bp2.Q.value = 10;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0,    t0 + 0.45);
  g2.gain.linearRampToValueAtTime(0.38, t0 + 0.6);
  g2.gain.setValueAtTime(0.32, t0 + 1.5);
  g2.gain.exponentialRampToValueAtTime(0.001, t0 + 2.05);
  n2.connect(bp2); bp2.connect(g2); g2.connect(ctx.destination);
  n2.start(t0 + 0.45); n2.stop(t0 + 2.1);

  /* ── Aşama 3: Hava "whoosh" — düşük frekanslı akış hissi (0.3–1.8s) ── */
  const n3  = makeBrownNoise(ctx, 1.6);
  const lp3 = ctx.createBiquadFilter();
  lp3.type  = "lowpass";
  lp3.frequency.value = 110;
  const g3 = ctx.createGain();
  g3.gain.setValueAtTime(0,    t0 + 0.3);
  g3.gain.linearRampToValueAtTime(0.13, t0 + 0.85);
  g3.gain.exponentialRampToValueAtTime(0.001, t0 + 1.85);
  n3.connect(lp3); lp3.connect(g3); g3.connect(ctx.destination);
  n3.start(t0 + 0.3); n3.stop(t0 + 1.9);

  /* ── Alt vuruş: kapı kasaya çarpar gibi sub-bass thud (opsiyonel, hafif) ── */
  const sub  = ctx.createOscillator();
  sub.type   = "sine";
  sub.frequency.setValueAtTime(55, t0 + 0.05);
  sub.frequency.exponentialRampToValueAtTime(28, t0 + 0.5);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.1, t0 + 0.05);
  subG.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
  sub.connect(subG); subG.connect(ctx.destination);
  sub.start(t0 + 0.05); sub.stop(t0 + 0.6);

  setTimeout(() => ctx.close(), 2500);
}
