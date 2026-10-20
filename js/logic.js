// Pure functions only. No DOM access, so everything here runs under node --test.
import { config } from './config.js';

const S = config.SLIDER;
export const minutesFor = i => S.startMinutes + i * S.stepMinutes;

export function timeLabel(i) {
  const m = minutesFor(i);
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h = ((h24 + 11) % 12) + 1;
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
}

export function captionFor(i, copy) {
  const m = minutesFor(i);
  const c = copy.s6.captions;
  if (m < 12 * 60) return c.morning;
  if (m < 16 * 60) return c.lunch;
  if (m < 18 * 60 + 30) return c.golden;
  if (m < 19 * 60 + 30) return c.sunset;
  return c.night;
}

// Sky stops as slider indices: morning 10:00, afternoon 14:00, sunset 18:30, night 20:30.
const SKY = [0, 16, 34, 42];

export function skyWeights(i) {
  const w = [0, 0, 0, 0];
  if (i <= SKY[0]) { w[0] = 1; return w; }
  if (i >= SKY[3]) { w[3] = 1; return w; }
  for (let k = 0; k < 3; k++) {
    if (i <= SKY[k + 1]) {
      const t = (i - SKY[k]) / (SKY[k + 1] - SKY[k]);
      w[k] = 1 - t;
      w[k + 1] = t;
      return w;
    }
  }
  return w;
}

export const starsVisible = i => minutesFor(i) >= 19 * 60;

export function dodgeScales(n) {
  return { yes: Math.min(1.08 ** n, 1.8), no: Math.max(0.92 ** n, 0.55) };
}

export function noLabel(n, s1) {
  return n === 0 ? s1.no : s1.noSteps[Math.min(n, s1.noSteps.length) - 1];
}

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// Random top-left point for a box of `size` inside `bounds` that does not overlap `avoid`.
export function pickSpot(bounds, size, avoid, rand = Math.random) {
  const maxX = Math.max(bounds.left, bounds.right - size.w);
  const maxY = Math.max(bounds.top, bounds.bottom - size.h);
  const box = (x, y) => ({ left: x, top: y, right: x + size.w, bottom: y + size.h });
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(bounds.left + rand() * (maxX - bounds.left));
    const y = Math.floor(bounds.top + rand() * (maxY - bounds.top));
    if (!overlaps(box(x, y), avoid)) return { x, y };
  }
  const corners = [[bounds.left, bounds.top], [maxX, bounds.top], [bounds.left, maxY], [maxX, maxY]];
  const [x, y] = corners.find(([cx, cy]) => !overlaps(box(cx, cy), avoid)) ?? corners[3];
  return { x: Math.floor(x), y: Math.floor(y) };
}

export function toggleIn(list, id) {
  const i = list.indexOf(id);
  if (i === -1) list.push(id); else list.splice(i, 1);
  return i === -1;
}

export const canProceed = (list, other) => list.length > 0 || other.trim() !== '';
