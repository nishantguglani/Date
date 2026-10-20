import { config } from './config.js';
import { copy } from './copy.js';
import { gnome } from './art.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const layer = () => document.getElementById('fx');

/* ---------- Audio ---------- */
let ac = null;
let music = null;
let gain = null;
let muted = false;
let playing = false;

function audioCtx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    // Safari 16.4+: play through the silent switch, like a video would.
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    ac = new AC();
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function syncMute() {
  const b = document.getElementById('mute');
  if (!b) return;
  b.setAttribute('aria-pressed', String(muted));
  b.setAttribute('aria-label', muted ? copy.chrome.unmute : copy.chrome.mute);
  b.classList.toggle('spinning', playing && !muted);
}

// Call from a tap: that tap is what unlocks audio on iOS.
export function startMusic() {
  if (muted) { syncMute(); return; }
  const a = audioCtx();
  if (!music) {
    music = new Audio(config.MUSIC_SRC);
    music.loop = true;
    if (a) {
      gain = a.createGain();
      gain.gain.value = 0;
      a.createMediaElementSource(music).connect(gain).connect(a.destination);
    }
  }
  Promise.resolve(music.play()).then(() => {
    playing = true;
    if (gain) {
      const t = a.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(config.MUSIC_VOLUME, t + config.MUSIC_FADE_MS / 1000);
    } else {
      music.volume = config.MUSIC_VOLUME;
    }
    syncMute();
  }).catch(() => {
    playing = false;
    muted = true;
    syncMute();
  });
}

export function toggleMute() {
  muted = !muted;
  if (muted) {
    music?.pause();
    playing = false;
    syncMute();
  } else {
    startMusic();
  }
}

// Crème brûlée crack: three short filtered noise snaps.
export function crack() {
  const a = audioCtx();
  if (!a) return;
  const t = a.currentTime;
  [0, 0.06, 0.11].forEach((off, i) => {
    const len = Math.floor(a.sampleRate * 0.05);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len) ** 3;
    const src = a.createBufferSource();
    src.buffer = buf;
    const bp = a.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600 - i * 600;
    bp.Q.value = 0.8;
    const g = a.createGain();
    g.gain.value = 0.9 - i * 0.2;
    src.connect(bp).connect(g).connect(a.destination);
    src.start(t + off);
  });
}

/* ---------- Visual effects ---------- */
export function heartBurst(el, n = 14) {
  if (reduced()) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst-heart';
    s.textContent = i % 3 ? '💖' : '❤️';
    const ang = (i / n) * Math.PI * 2;
    const dist = 70 + Math.random() * 60;
    s.style.cssText = `--x:${r.left + r.width / 2}px;--y:${r.top + r.height / 2}px;--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist}px`;
    s.addEventListener('animationend', () => s.remove());
    layer().append(s);
  }
}

export function confetti(n = 46) {
  if (reduced()) return;
  const bits = ['💖', '🎟️', '❤️', '🎞️', '✨'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = bits[i % bits.length];
    const rnd = (a, b) => a + Math.random() * (b - a);
    s.style.cssText = `--x:${rnd(0, 100)}vw;--s:${rnd(18, 34)}px;--d:${rnd(2.6, 4.4)}s;--delay:${rnd(0, 1.2)}s;--drift:${rnd(-60, 60)}px;--r:${rnd(-540, 540)}deg`;
    s.addEventListener('animationend', () => s.remove());
    layer().append(s);
  }
}

// Scene index 1..7 gets a corner; the envelope (0) has no gnome.
const CORNERS = [null, 'tl', 'bl', 'tr', 'bl', 'tr', 'bl', 'tr'];
export function placeGnome(index) {
  const g = document.getElementById('gnome');
  const corner = CORNERS[index];
  if (!corner) { g.hidden = true; return; }
  g.hidden = false;
  g.dataset.corner = corner;
  g.innerHTML = gnome(copy.gnome[index - 1]);
}

export function safeInsets() {
  const cs = getComputedStyle(document.querySelector('.safe-probe'));
  return {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
}
