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
