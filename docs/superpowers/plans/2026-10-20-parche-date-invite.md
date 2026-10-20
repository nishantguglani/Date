# For Parche 💌 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mobile-first, single-page "For Parche 💌" date invitation described in `docs/superpowers/specs/2026-10-20-parche-date-invite-design.md`, ready to serve from GitHub Pages.

**Architecture:** Static ES modules with no build step. `js/app.js` is a scene router. Each scene module exports `render(stage, ctx)` and builds its own DOM inside a fresh `<section class="scene">`. All strings live in `js/copy.js` and all tunables in `js/config.js`. The pure logic (times, captions, sky blend, the No-button spot, summaries, WhatsApp and Calendar URLs) lives in `js/logic.js` and is unit-tested with `node --test`. Visual effects and audio live in `js/fx.js`, and the hand-drawn SVGs in `js/art.js`.

**Tech Stack:**
- Code: HTML5, CSS (custom properties), vanilla JS ES modules.
- Audio: Web Audio API (seal crack, music gain).
- Ticket: Canvas 2D.
- Tests: Node 22+ `node --test`.
- Image tooling: Python PIL for the JPEG; `@resvg/resvg-js` (dev dependency) for SVG→PNG; `ffmpeg-static` (dev dependency) for the music re-encode only.
- Local preview: `python -m http.server`.

---

## Ground rules for every task

- **Working directory:** `E:\Claude projects\Date`, the repo `nishantguglani/Date` on branch `main`. Run commands in Git Bash from the repo root.
- **Names:** only "Parche" and "Nish" may appear in code, copy, commit messages or image text. Never add a phone number, analytics or tracking.
- **Commit messages:** end every one with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push after each task with `git push`.
- **Preview:** serve the site with `python -m http.server 8080`, configured in `.claude/launch.json` (Task 6) for the browser pane. Never open `index.html` from `file://`, because ES modules and Web Audio need http.
- **ctx contract:** the spec's `ctx = { state, copy, config, next, fx }` is extended with:
  - `signal`: an `AbortSignal` that is aborted when the scene is left. Pass it to every `addEventListener`.
  - `after(ms, fn)`: a `setTimeout` that is cancelled on abort. It returns a cancel function.

## File map

| File | Responsibility |
|---|---|
| `index.html` | Meta/OG tags, fonts, persistent chrome (film strip, clapper, back, gnome, mute, fx layer), `<main id="stage">` |
| `.nojekyll` | Stops GitHub Pages from running Jekyll |
| `package.json` | `"type": "module"`, test/images scripts, dev deps |
| `css/style.css` | Tokens, paper, chrome, buttons, transitions, one section per scene, reduced motion |
| `js/config.js` | Dates, slider, audio, event length, timings |
| `js/copy.js` | Every user-facing string |
| `js/state.js` | The answers object |
| `js/logic.js` | Pure functions (no DOM) |
| `js/art.js` | Inline SVG strings |
| `js/fx.js` | Audio, crack, confetti, heart burst, gnome, safe-area insets |
| `js/ui.js` | Shared DOM helpers: multi-select binding, restartAnimation |
| `js/app.js` | Router, chrome updates, Back, transitions |
| `js/ticket.js` | Draws the 1080×1350 ticket on a canvas |
| `js/scenes/*.js` | One file per scene |
| `assets/*` | success-kid.jpg, favicon.svg, apple-touch-icon.png, og-image.svg/.png, music.mp3 |
| `scripts/render-images.mjs` | SVG→PNG for the OG image and apple-touch-icon |
| `tests/logic.test.js` | Unit tests for `js/logic.js` |
| `README.md` | Editing guide, music licence, phone checklist, deploy |

---

### Task 1: Scaffold, config, copy and state

**Files:**
- Create: `.nojekyll`, `package.json`, `js/config.js`, `js/copy.js`, `js/state.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create the empty `.nojekyll` and `package.json`**

```bash
touch .nojekyll
```

`package.json`:

```json
{
  "name": "date",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/logic.test.js",
    "images": "node scripts/render-images.mjs",
    "serve": "python -m http.server 8080"
  }
}
```

- [ ] **Step 2: Add `.claude/` to `.gitignore`**

Append one line, so that `.gitignore` reads:

```
.superpowers/
node_modules/
.DS_Store
Thumbs.db
.claude/
```

- [ ] **Step 3: Create `js/config.js`**

```js
// Everything you might want to tweak lives here.
export const config = {
  DAYS: { sat: '2026-10-24', sun: '2026-10-25' },
  // Slider index i means 10:00 AM + i * 15 minutes. 0 = 10:00 AM, 32 = 6:00 PM, 44 = 9:00 PM.
  SLIDER: { min: 0, max: 44, step: 1, default: 32, startMinutes: 600, stepMinutes: 15 },
  EVENT_HOURS: 4,
  TIMEZONE: 'Asia/Kolkata',
  MUSIC_SRC: 'assets/music.mp3',
  MUSIC_VOLUME: 0.4,
  MUSIC_FADE_MS: 2000,
  YES_ADVANCE_MS: 1800,
  DONO_FALLBACK_MS: 4000,
  INPUT_MAX: 60,
  SITE_URL: 'https://nishantguglani.github.io/Date/',
};
```

- [ ] **Step 4: Create `js/copy.js`**

```js
// Every user-facing string. Edit freely; keep lines either clean English or natural Hinglish.
export const copy = {
  chrome: {
    clapper: n => `SCENE ${n} · TAKE 1`,
    finalClapper: 'FINAL SCENE · TAKE 1',
    back: '← Back',
    next: 'Next →',
    mute: 'Mute music',
    unmute: 'Play music',
  },
  // Polaroid captions for the travelling gnome, scenes 1..7 (finale is 7).
  gnome: ['India Gate', 'Hauz Khas', 'Sunder Nursery', 'Qutub Minar', "Nirula's", 'Lodhi Garden', "Humayun's Tomb"],
  envelope: {
    to: 'For Parche 💌',
    hint: 'tap to open',
    quote: 'Les temps sont durs pour les rêveurs.',
    letter: 'Ek chhoti si film banayi hai... sirf tumhare liye 🎬',
    roll: 'Roll camera →',
  },
  s1: {
    question: 'Parche, will you go on a date with me? 😊',
    yes: 'Yes! 💖',
    no: 'No',
    noSteps: ['Are you sure?', 'Think again 🥺', 'Wrong button, Parche', 'Dil tod dogi? 💔', 'Arre yaar...', 'Ab toh maan jao 🙏'],
    kidAlt: 'Success Kid, fist clenched in victory',
  },
  s2: {
    question: 'Saturday or Sunday? 🗓️',
    sat: { dow: 'SAT', date: '24', mon: 'OCT', flipped: 'Saturday it is! Weekend starts with you ✨' },
    sun: { dow: 'SUN', date: '25', mon: 'OCT', flipped: 'Sunday it is! Lazy, lovely, perfect ☕' },
    dono: 'Dono? 😏',
    hint: 'psst... ek aur option hai 👀',
    lalchi: 'Lalchi... pehle ek toh chuno 😂',
  },
  s3: {
    question: 'What should we do? 🎟️',
    options: [
      { id: 'movie', emoji: '🎬', label: 'Movie' },
      { id: 'picnic', emoji: '🧺', label: 'Picnic in the park' },
      { id: 'museum', emoji: '🏛️', label: 'Museum date' },
      { id: 'nursery', emoji: '🌿', label: 'Walk in Sunder Nursery' },
      { id: 'surprise', emoji: '✨', label: 'Surprise me' },
    ],
    placeholder: 'Something else? Write it here ✍️',
    stamp: 'ADMIT ✓',
  },
  s4: {
    question: 'Kya khaogi? 😋',
    menuTitle: 'Café des 2 Moulins',
    menuSub: 'Menu du jour',
    options: [
      { id: 'butter', emoji: '🍛', label: 'Butter Chicken' },
      { id: 'asian', emoji: '🍜', label: 'Asian' },
      { id: 'pizza', emoji: '🍕', label: 'Pizza' },
      { id: 'southindian', emoji: '🥥', label: 'South Indian' },
      { id: 'volauvent', emoji: '🥐', label: 'Vol-au-vent' },
      { id: 'surprise', emoji: '✨', label: 'Surprise me' },
    ],
    placeholder: 'Craving something else? ✍️',
  },
  s5: {
    question: "And dessert at Nirula's? 🍨",
    aside: '(Hot Chocolate Fudge, obviously)',
    yes: 'Yes',
    obviously: 'Obviously yes',
    no: 'No',
    dessert: {
      yes: "Nirula's Hot Chocolate Fudge",
      obviously: "Nirula's Hot Chocolate Fudge (obviously)",
    },
  },
  s6: {
    question: 'Kitne baje lene aaun? 🚗',
    label: 'Pick-up time',
    captions: {
      morning: 'Subah subah? Wow, dedication 😮',
      lunch: 'Lunch date vibes 🌤️',
      golden: 'Golden hour 😍',
      sunset: 'Sunset aur tum 🌅',
      night: 'Raat ki taaron mein ✨',
    },
  },
  days: { sat: 'Saturday, 24 Oct', sun: 'Sunday, 25 Oct' },
  summary: { pickup: 'Pick-up', plans: 'Plans', food: 'Food', dessert: 'Dessert', surprise: 'Surprise me ✨' },
  whatsapp: { heading: "Nish, it's a date! 💖" },
  calendar: { title: 'Date with Nish 💖' },
  finale: {
    title: "Ce n'est que le début ✨",
    subtitle: "(it's only the beginning)",
    admit: 'ADMIT TWO',
    starring: 'Starring Parche & Nish',
    comingSoon: 'Coming soon: Sunday 🎞️',
    sequelQuote: '"Picture abhi baaki hai mere dost" 🎬',
    sequelLine: "Sunday ka sequel? We'll plan it together 😉",
    credits: ['Starring: Parche', 'Written & Directed by: Nish', 'Produced by: Bahut saari himmat 😅'],
    whatsapp: 'Send on WhatsApp 💌',
    save: 'Save the ticket 🎟️',
    ticketFile: 'for-parche-ticket.png',
    ticketAlt: 'Your ADMIT TWO ticket with all the plans',
    serial: 'No. 2410 · Row 1 · Seats A & B',
  },
};
```

- [ ] **Step 5: Create `js/state.js`**

```js
import { config } from './config.js';

// Her answers. In memory only: a refresh starts over.
export const createState = () => ({
  day: null,          // null | 'sat' | 'sun'
  activities: [],
  activityOther: '',
  food: [],
  foodOther: '',
  dessert: null,      // null | 'yes' | 'obviously'
  time: config.SLIDER.default,
});

export const state = createState();
```

- [ ] **Step 6: Check that the modules load in Node**

Run: `node -e "import('./js/state.js').then(m => console.log(m.state.time)); import('./js/copy.js').then(m => console.log(m.copy.chrome.clapper(3)))"`

Expected output, in either order:

```
32
SCENE 3 · TAKE 1
```

- [ ] **Step 7: Commit**

```bash
git add .nojekyll package.json .gitignore js/config.js js/copy.js js/state.js
git commit -m "feat: scaffold config, copy and state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 2: logic.js, part 1 (time, captions, sky)

**Files:**
- Create: `js/logic.js`, `tests/logic.test.js`

- [ ] **Step 1: Write the failing tests**

`tests/logic.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copy } from '../js/copy.js';
import { timeLabel, captionFor, skyWeights, starsVisible } from '../js/logic.js';

test('timeLabel maps slider index to a 12-hour label', () => {
  assert.equal(timeLabel(0), '10:00 AM');
  assert.equal(timeLabel(1), '10:15 AM');
  assert.equal(timeLabel(8), '12:00 PM');
  assert.equal(timeLabel(32), '6:00 PM');
  assert.equal(timeLabel(33), '6:15 PM');
  assert.equal(timeLabel(44), '9:00 PM');
});

test('captionFor respects band edges', () => {
  const c = copy.s6.captions;
  assert.equal(captionFor(0, copy), c.morning);
  assert.equal(captionFor(7, copy), c.morning);   // 11:45
  assert.equal(captionFor(8, copy), c.lunch);     // 12:00
  assert.equal(captionFor(23, copy), c.lunch);    // 15:45
  assert.equal(captionFor(24, copy), c.golden);   // 16:00
  assert.equal(captionFor(33, copy), c.golden);   // 18:15
  assert.equal(captionFor(34, copy), c.sunset);   // 18:30
  assert.equal(captionFor(37, copy), c.sunset);   // 19:15
  assert.equal(captionFor(38, copy), c.night);    // 19:30
  assert.equal(captionFor(44, copy), c.night);    // 21:00
});

test('skyWeights blends adjacent stops and always sums to 1', () => {
  assert.deepEqual(skyWeights(0), [1, 0, 0, 0]);
  assert.deepEqual(skyWeights(16), [0, 1, 0, 0]);
  assert.deepEqual(skyWeights(25), [0, 0.5, 0.5, 0]);
  assert.deepEqual(skyWeights(34), [0, 0, 1, 0]);
  assert.deepEqual(skyWeights(44), [0, 0, 0, 1]);
  for (let i = 0; i <= 44; i++) {
    const sum = skyWeights(i).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `index ${i} sums to ${sum}`);
  }
});

test('stars appear from 7:00 PM', () => {
  assert.equal(starsVisible(35), false); // 6:45 PM
  assert.equal(starsVisible(36), true);  // 7:00 PM
});
```

- [ ] **Step 2: Run the tests and check that they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module` … `js/logic.js`

- [ ] **Step 3: Write the implementation**

`js/logic.js`:

```js
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
```

- [ ] **Step 4: Run the tests and check that they pass**

Run: `npm test`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: time labels, caption bands and sky blend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 3: logic.js, part 2 (runaway No and multi-select helpers)

**Files:**
- Modify: `js/logic.js` (append)
- Modify: `tests/logic.test.js` (append)

- [ ] **Step 1: Write the failing tests**

Change the logic import line at the top of `tests/logic.test.js` to:

```js
import { timeLabel, captionFor, skyWeights, starsVisible, dodgeScales, noLabel, pickSpot, toggleIn, canProceed } from '../js/logic.js';
```

Append:

```js
test('dodgeScales grows Yes and shrinks No within caps', () => {
  assert.deepEqual(dodgeScales(0), { yes: 1, no: 1 });
  assert.ok(Math.abs(dodgeScales(1).yes - 1.08) < 1e-9);
  assert.ok(Math.abs(dodgeScales(1).no - 0.92) < 1e-9);
  assert.deepEqual(dodgeScales(40), { yes: 1.8, no: 0.55 });
});

test('noLabel steps through the list and sticks on the last', () => {
  assert.equal(noLabel(0, copy.s1), 'No');
  assert.equal(noLabel(1, copy.s1), 'Are you sure?');
  assert.equal(noLabel(6, copy.s1), 'Ab toh maan jao 🙏');
  assert.equal(noLabel(99, copy.s1), 'Ab toh maan jao 🙏');
});

test('pickSpot stays in bounds and avoids the Yes box', () => {
  const bounds = { left: 0, top: 0, right: 300, bottom: 600 };
  const size = { w: 100, h: 40 };
  const avoid = { left: 50, top: 250, right: 250, bottom: 350 };
  const seq = [0.5, 0.5, 0, 0];              // first try lands on Yes, second is free
  const rand = () => seq.shift();
  assert.deepEqual(pickSpot(bounds, size, avoid, rand), { x: 0, y: 0 });

  for (let n = 0; n < 200; n++) {
    const { x, y } = pickSpot(bounds, size, avoid);
    assert.ok(x >= 0 && x + 100 <= 300 && y >= 0 && y + 40 <= 600, 'in bounds');
    const hit = x < 250 && x + 100 > 50 && y < 350 && y + 40 > 250;
    assert.equal(hit, false, 'does not overlap Yes');
  }
});

test('pickSpot falls back to a free corner when random tries keep hitting', () => {
  const bounds = { left: 0, top: 0, right: 300, bottom: 600 };
  const spot = pickSpot(bounds, { w: 100, h: 40 }, { left: 50, top: 250, right: 250, bottom: 350 }, () => 0.5);
  assert.deepEqual(spot, { x: 0, y: 0 });
});

test('toggleIn adds then removes', () => {
  const list = [];
  assert.equal(toggleIn(list, 'movie'), true);
  assert.deepEqual(list, ['movie']);
  assert.equal(toggleIn(list, 'movie'), false);
  assert.deepEqual(list, []);
});

test('canProceed needs a pick or non-blank text', () => {
  assert.equal(canProceed([], ''), false);
  assert.equal(canProceed([], '   '), false);
  assert.equal(canProceed(['pizza'], ''), true);
  assert.equal(canProceed([], 'Bowling'), true);
});
```

- [ ] **Step 2: Run the tests and check that they fail**

Run: `npm test`
Expected: FAIL with `does not provide an export named 'dodgeScales'`

- [ ] **Step 3: Write the implementation**

Append to `js/logic.js`:

```js
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
```

- [ ] **Step 4: Run the tests and check that they pass**

Run: `npm test`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: runaway-No maths and multi-select helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 4: logic.js, part 3 (summary, WhatsApp, Calendar)

**Files:**
- Modify: `js/logic.js` (append)
- Modify: `tests/logic.test.js` (append)

- [ ] **Step 1: Write the failing tests**

Change the logic import line to:

```js
import { timeLabel, captionFor, skyWeights, starsVisible, dodgeScales, noLabel, pickSpot, toggleIn, canProceed, isSequel, planLists, whatsAppText, whatsAppUrl, calendarDates, calendarUrl } from '../js/logic.js';
```

Append:

```js
const satState = () => ({
  day: 'sat', activities: ['museum', 'movie'], activityOther: '  Bowling ',
  food: ['pizza'], foodOther: '', dessert: 'obviously', time: 32,
});

test('isSequel is true only for Saturday', () => {
  assert.equal(isSequel({ day: 'sat' }), true);
  assert.equal(isSequel({ day: 'sun' }), false);
  assert.equal(isSequel({ day: null }), false);
});

test('planLists orders by menu, trims custom text and labels everything', () => {
  assert.deepEqual(planLists(satState(), copy), {
    day: 'Saturday, 24 Oct',
    time: '6:00 PM',
    activities: ['Movie', 'Museum date', 'Bowling'],
    food: ['Pizza'],
    dessert: "Nirula's Hot Chocolate Fudge (obviously)",
    sequel: true,
  });
});

test('whatsAppText builds the summary, with the sequel line on Saturday', () => {
  const expected = [
    "Nish, it's a date! 💖",
    '',
    '📅 Saturday, 24 Oct',
    '🚗 Pick-up: 6:00 PM',
    '🎟️ Plans: Movie, Museum date, Bowling',
    '🍽️ Food: Pizza',
    "🍨 Dessert: Nirula's Hot Chocolate Fudge (obviously)",
    'Coming soon: Sunday 🎞️',
    '',
    "Ce n'est que le début ✨",
  ].join('\n');
  assert.equal(whatsAppText(satState(), copy), expected);
  const sun = { ...satState(), day: 'sun' };
  assert.equal(whatsAppText(sun, copy).includes('Coming soon'), false);
});

test('whatsAppUrl has no number and round-trips', () => {
  const text = whatsAppText(satState(), copy);
  const url = whatsAppUrl(text);
  assert.ok(url.startsWith('https://wa.me/?text='));
  assert.equal(decodeURIComponent(url.slice('https://wa.me/?text='.length)), text);
  assert.equal(url.includes('\n'), false);
});

test('calendarDates uses the chosen day, start time and +4 h, rolling past midnight', () => {
  assert.equal(calendarDates({ day: 'sat', time: 32 }), '20261024T180000/20261024T220000');
  assert.equal(calendarDates({ day: 'sun', time: 0 }), '20261025T100000/20261025T140000');
  assert.equal(calendarDates({ day: 'sun', time: 44 }), '20261025T210000/20261026T010000');
});

test('calendarUrl carries title, dates, timezone and details', () => {
  const url = new URL(calendarUrl(satState(), copy));
  assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/render');
  const q = url.searchParams;
  assert.equal(q.get('action'), 'TEMPLATE');
  assert.equal(q.get('text'), 'Date with Nish 💖');
  assert.equal(q.get('dates'), '20261024T180000/20261024T220000');
  assert.equal(q.get('ctz'), 'Asia/Kolkata');
  assert.equal(q.get('details'), [
    'Pick-up: 6:00 PM',
    'Plans: Movie, Museum date, Bowling',
    'Food: Pizza',
    "Dessert: Nirula's Hot Chocolate Fudge (obviously)",
  ].join('\n'));
});
```

- [ ] **Step 2: Run the tests and check that they fail**

Run: `npm test`
Expected: FAIL with `does not provide an export named 'isSequel'`

- [ ] **Step 3: Write the implementation**

Append to `js/logic.js`:

```js
export const isSequel = state => state.day === 'sat';

function labels(ids, options, other) {
  const out = options.filter(o => ids.includes(o.id)).map(o => o.label);
  if (other.trim()) out.push(other.trim());
  return out;
}

// One summary object used by the ticket, WhatsApp and Calendar.
export function planLists(state, copy) {
  return {
    day: copy.days[state.day] ?? '',
    time: timeLabel(state.time),
    activities: labels(state.activities, copy.s3.options, state.activityOther),
    food: labels(state.food, copy.s4.options, state.foodOther),
    dessert: copy.s5.dessert[state.dessert ?? 'yes'],
    sequel: isSequel(state),
  };
}

const joinOr = (items, copy) => (items.length ? items.join(', ') : copy.summary.surprise);

export function whatsAppText(state, copy) {
  const p = planLists(state, copy);
  const s = copy.summary;
  const lines = [
    copy.whatsapp.heading,
    '',
    `📅 ${p.day}`,
    `🚗 ${s.pickup}: ${p.time}`,
    `🎟️ ${s.plans}: ${joinOr(p.activities, copy)}`,
    `🍽️ ${s.food}: ${joinOr(p.food, copy)}`,
    `🍨 ${s.dessert}: ${p.dessert}`,
  ];
  if (p.sequel) lines.push(copy.finale.comingSoon);
  lines.push('', copy.finale.title);
  return lines.join('\n');
}

export const whatsAppUrl = text => `https://wa.me/?text=${encodeURIComponent(text)}`;

const pad = n => String(n).padStart(2, '0');
// Local wall-clock stamp; Google reads it in the ctz timezone. UTC getters avoid the machine's own zone.
const stamp = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;

export function calendarDates(state) {
  const [y, mo, d] = config.DAYS[state.day].split('-').map(Number);
  const start = new Date(Date.UTC(y, mo - 1, d, 0, minutesFor(state.time)));
  const end = new Date(start.getTime() + config.EVENT_HOURS * 3600 * 1000);
  return `${stamp(start)}/${stamp(end)}`;
}

export function calendarUrl(state, copy) {
  const p = planLists(state, copy);
  const s = copy.summary;
  const details = [
    `${s.pickup}: ${p.time}`,
    `${s.plans}: ${joinOr(p.activities, copy)}`,
    `${s.food}: ${joinOr(p.food, copy)}`,
    `${s.dessert}: ${p.dessert}`,
  ].join('\n');
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: copy.calendar.title,
    dates: calendarDates(state),
    ctz: config.TIMEZONE,
    details,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
```

- [ ] **Step 4: Run the tests and check that they pass**

Run: `npm test`
Expected: `# pass 16`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/logic.js tests/logic.test.js
git commit -m "feat: plan summary, WhatsApp text and Calendar URL

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5: index.html, base CSS, art, fx and ui helpers

**Files:**
- Create: `index.html`, `css/style.css`, `js/art.js`, `js/fx.js`, `js/ui.js`

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>For Parche 💌</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#f4ead5">
  <meta name="description" content="Ek chhoti si film, sirf tumhare liye 🎬 Tap to open.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://nishantguglani.github.io/Date/">
  <meta property="og:title" content="For Parche 💌">
  <meta property="og:description" content="Ek chhoti si film, sirf tumhare liye 🎬 Tap to open.">
  <meta property="og:image" content="https://nishantguglani.github.io/Date/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Special+Elite&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Special+Elite&display=swap">
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="on-envelope">
  <div class="paper" aria-hidden="true"></div>
  <div class="filmstrip" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
  <div class="clapper" aria-hidden="true"></div>
  <button class="back" type="button" hidden>← Back</button>
  <div id="gnome" aria-hidden="true" hidden></div>
  <main id="stage"></main>
  <button id="mute" type="button" aria-pressed="false" aria-label="Mute music">
    <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25" fill="#111"/><circle cx="26" cy="26" r="20" fill="none" stroke="#333"/><circle cx="26" cy="26" r="15" fill="none" stroke="#333"/><circle cx="26" cy="26" r="9" fill="#d4a017"/><path d="M26 17a9 9 0 0 1 9 9" fill="none" stroke="#9b1c1c" stroke-width="2"/><circle cx="26" cy="26" r="2" fill="#111"/></svg>
  </button>
  <div id="fx" aria-hidden="true"></div>
  <div class="safe-probe" aria-hidden="true"></div>
  <noscript><p style="padding:2rem;font-size:22px">This little film needs JavaScript turned on 🎬</p></noscript>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/style.css` with the base layer**

```css
/* ============ Tokens ============ */
:root {
  --red: #9b1c1c; --red-dark: #7a1414;
  --green: #3d5a2a; --green-dark: #2a3f1d;
  --mustard: #d4a017; --mustard-dark: #a67c0f;
  --cream: #f4ead5; --paper-hi: #fffaf0;
  --ink: #3b2a1f; --film: #2b2b2b;
  --khaki: #c9b98f; --khaki-dark: #a8996f;
  --chalk: #2f6fb5;
  --hand: 'Caveat', 'Segoe Print', 'Bradley Hand', cursive;
  --type: 'Special Elite', 'Courier New', monospace;
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --chrome-h: 92px;
  --t: 450ms;
}

/* ============ Base ============ */
* { box-sizing: border-box; }
[hidden] { display: none !important; }
html, body { margin: 0; height: 100%; }
body {
  background: var(--cream); color: var(--ink);
  font: 22px/1.25 var(--hand);
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}
button, input { font: inherit; color: inherit; }
:focus-visible { outline: 3px dashed var(--chalk); outline-offset: 3px; }
h1:focus { outline: none; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.safe-probe {
  position: fixed; visibility: hidden; pointer-events: none;
  padding: var(--sat) var(--sar) var(--sab) var(--sal);
}

/* ============ Paper, grain, vignette ============ */
.paper {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: repeating-linear-gradient(transparent 0 31px, rgba(155, 28, 28, .08) 31px 32px);
}
.paper::before {
  content: ""; position: absolute; inset: 0; opacity: .22; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .23 0 0 0 0 .16 0 0 0 0 .12 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
.paper::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(60, 30, 10, .35) 100%);
}

/* ============ Chrome ============ */
.filmstrip {
  position: fixed; top: 0; left: 0; right: 0; z-index: 5;
  display: flex; gap: 4px;
  padding: calc(5px + var(--sat)) calc(10px + var(--sar)) 5px calc(10px + var(--sal));
  background: var(--film);
}
.filmstrip span { flex: 1; height: 14px; border-radius: 2px; background: var(--cream); opacity: .85; transition: background .3s; }
.filmstrip span.on { background: var(--mustard); opacity: 1; }
.clapper {
  position: fixed; top: calc(34px + var(--sat)); left: 50%; z-index: 5;
  transform: translateX(-50%); transform-origin: 0 100%;
  font: 16px var(--type); letter-spacing: 1px; white-space: nowrap;
  color: var(--cream); background: var(--film);
  padding: 8px 12px 5px;
  border-top: 6px solid transparent;
  border-image: repeating-linear-gradient(90deg, var(--film) 0 10px, var(--cream) 10px 20px) 6;
}
.clapper.snap { animation: snap .35s ease-out; }
@keyframes snap {
  0% { transform: translateX(-50%) rotate(-7deg); }
  60% { transform: translateX(-50%) rotate(2deg); }
  100% { transform: translateX(-50%); }
}
.back {
  position: fixed; top: calc(30px + var(--sat)); left: calc(6px + var(--sal)); z-index: 6;
  min-width: 48px; min-height: 48px; padding: 4px 10px;
  font-weight: 700; font-size: 24px; color: var(--red);
  background: transparent; border: 0; cursor: pointer;
}
body.night .back { color: var(--cream); }
body.on-envelope .filmstrip, body.on-envelope .clapper, body.on-envelope .back { display: none; }

/* ============ Stage and scene transitions ============ */
#stage { position: fixed; inset: 0; z-index: 2; overflow: hidden; }
.scene {
  position: absolute; inset: 0; isolation: isolate;
  overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: calc(var(--chrome-h) + var(--sat)) calc(18px + var(--sar)) calc(84px + var(--sab)) calc(18px + var(--sal));
  transition: transform var(--t) cubic-bezier(.2, .8, .2, 1), opacity var(--t);
}
body.on-envelope .scene { padding-top: calc(24px + var(--sat)); }
.scene.entering { transform: translateX(100%); }
.scene.entering.from-left { transform: translateX(-100%); }
.scene.leaving { pointer-events: none; opacity: 0; }
.scene.leaving.to-left { transform: translateX(-35%); }
.scene.leaving.to-right { transform: translateX(35%); }

.q {
  font: 700 34px/1.1 var(--hand); color: var(--red);
  margin: 8px 0 18px; max-width: 440px;
}

/* ============ Buttons ============ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .3em;
  min-height: 48px; padding: 10px 26px;
  font: 700 26px/1.1 var(--hand); text-decoration: none;
  color: var(--cream); background: var(--red);
  border: 0; border-radius: 999px; cursor: pointer;
  box-shadow: 0 3px 0 var(--red-dark);
  transition: transform .15s;
}
.btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--red-dark); }
.btn.ghost { color: var(--ink); background: var(--khaki); box-shadow: 0 3px 0 var(--khaki-dark); }
.btn.green { background: var(--green); box-shadow: 0 3px 0 var(--green-dark); }
.btn.gold { color: var(--film); background: var(--mustard); box-shadow: 0 3px 0 var(--mustard-dark); }
.next { margin-top: 22px; }

/* ============ Gnome ============ */
#gnome {
  position: fixed; z-index: 1; width: 66px; pointer-events: none;
  display: flex; flex-direction: column; align-items: center;
  animation: gnome-in .5s ease-out;
}
#gnome svg { width: 66px; height: auto; }
#gnome .gnome-cap { font-size: 16px; line-height: 1; white-space: nowrap; color: var(--ink); }
#gnome[data-corner="tl"] { top: calc(30px + var(--sat)); left: calc(8px + var(--sal)); }
#gnome[data-corner="tr"] { top: calc(30px + var(--sat)); right: calc(8px + var(--sar)); }
#gnome[data-corner="bl"] { bottom: calc(10px + var(--sab)); left: calc(8px + var(--sal)); }
@keyframes gnome-in { from { opacity: 0; transform: translateY(12px); } }

/* ============ Mute (vinyl) ============ */
#mute {
  position: fixed; right: calc(12px + var(--sar)); bottom: calc(12px + var(--sab)); z-index: 8;
  width: 52px; height: 52px; padding: 0; border: 0; border-radius: 50%;
  background: none; cursor: pointer;
}
#mute svg { width: 100%; height: 100%; display: block; }
#mute.spinning svg { animation: spin 3s linear infinite; }
#mute[aria-pressed="true"] svg { opacity: .55; }
#mute[aria-pressed="true"]::after {
  content: ""; position: absolute; left: 6px; right: 6px; top: 50%; height: 3px;
  background: var(--red); transform: rotate(-45deg);
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ============ FX layer ============ */
#fx { position: fixed; inset: 0; z-index: 20; pointer-events: none; overflow: hidden; }
.confetti {
  position: absolute; top: -48px; left: var(--x); font-size: var(--s);
  animation: fall var(--d) linear var(--delay) forwards;
}
@keyframes fall { to { transform: translate(var(--drift), 112vh) rotate(var(--r)); } }
.burst-heart {
  position: fixed; left: var(--x); top: var(--y); font-size: 24px;
  transform: translate(-50%, -50%);
  animation: burst .9s ease-out forwards;
}
@keyframes burst {
  to { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.4); opacity: 0; }
}
.chalk { display: inline-block; color: var(--chalk); }
.chalk svg { width: 100%; height: 100%; }

/* ============ Reduced motion (scene sections add their own below) ============ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 150ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 150ms !important;
  }
  .scene.entering, .scene.entering.from-left, .scene.leaving.to-left, .scene.leaving.to-right { transform: none; }
  .scene.entering { opacity: 0; }
  #mute.spinning svg { animation: none; }
}
```

- [ ] **Step 3: Create `js/art.js`**

```js
// Hand-drawn inline SVGs made for this project. Decorative, so they are all aria-hidden.

export const seal = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="32" r="27" fill="#9b1c1c" stroke="#7a1414" stroke-width="6" stroke-dasharray="5 3"/>
  <circle cx="32" cy="32" r="19" fill="none" stroke="#7a1414" stroke-width="2"/>
  <path d="M32 43s-11-6.5-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 43 29c0 7.5-11 14-11 14z" fill="#f4ead5"/>
  <path class="crack" d="M21 9l7 13-5 7 9 7-3 10 6 11" fill="none" stroke="#f4ead5" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

export const flap = `<svg viewBox="0 0 300 124" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 0h300L150 124z" fill="#d6c08c" stroke="#c4ab72" stroke-width="2"/>
</svg>`;

export const pocket = `<svg viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 0L150 112 300 0v200H0z" fill="#e8d9b5"/>
  <path d="M0 200L132 98M300 200L168 98" stroke="#c4ab72" stroke-width="2" fill="none"/>
</svg>`;

export const chalkArrow = `<svg viewBox="0 0 80 70" aria-hidden="true">
  <path d="M74 6C52 4 30 16 22 52" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M10 40l11 16 13-12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const plate = `<svg viewBox="0 0 200 110" aria-hidden="true">
  <ellipse cx="100" cy="60" rx="96" ry="46" fill="#fffaf0" stroke="#c9b98f" stroke-width="3"/>
  <ellipse cx="100" cy="60" rx="66" ry="30" fill="none" stroke="#e2d6b8" stroke-width="2"/>
</svg>`;

// The travelling gnome holding a polaroid of himself somewhere in Delhi.
export function gnome(caption) {
  return `<svg viewBox="0 0 80 110" aria-hidden="true">
    <path d="M22 52L40 4l18 48z" fill="#9b1c1c"/>
    <path d="M24 70h32l6 30H18z" fill="#3d5a2a"/>
    <rect x="20" y="98" width="16" height="8" rx="3" fill="#3b2a1f"/>
    <rect x="44" y="98" width="16" height="8" rx="3" fill="#3b2a1f"/>
    <circle cx="40" cy="57" r="11" fill="#f2c9a5"/>
    <path d="M27 61q13 34 26 0q-13 8-26 0z" fill="#fffaf0" stroke="#d8ccb0"/>
    <circle cx="44" cy="59" r="3" fill="#e39a8a"/>
    <g transform="translate(46 64) rotate(8)">
      <rect width="30" height="34" fill="#fff" stroke="#c9b98f"/>
      <rect x="3" y="3" width="24" height="20" fill="#9cc3d9"/>
      <path d="M5 23l8-11 6 6 4-4 4 9z" fill="#3d5a2a"/>
      <circle cx="21" cy="8" r="3" fill="#d4a017"/>
    </g>
  </svg><span class="gnome-cap">📍 ${caption}</span>`;
}
```

- [ ] **Step 4: Create `js/fx.js`**

```js
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
```

- [ ] **Step 5: Create `js/ui.js`**

```js
import { toggleIn, canProceed } from './logic.js';

export function restartAnimation(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// Wires a set of aria-pressed buttons plus a free-text input to state[listKey] / state[otherKey].
export function bindMultiSelect({ buttons, input, nextBtn, state, listKey, otherKey, signal, onChange = () => {} }) {
  const sync = () => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(state[listKey].includes(b.dataset.id))));
    nextBtn.hidden = !canProceed(state[listKey], state[otherKey]);
    onChange();
  };
  buttons.forEach(b => b.addEventListener('click', () => { toggleIn(state[listKey], b.dataset.id); sync(); }, { signal }));
  input.value = state[otherKey];
  input.addEventListener('input', () => { state[otherKey] = input.value; sync(); }, { signal });
  sync();
}
```

- [ ] **Step 6: Check that the tests still pass**

Run: `npm test`
Expected: `# pass 16`, `# fail 0`

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/art.js js/fx.js js/ui.js
git commit -m "feat: page shell, base styles, art, effects and audio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 6: Router, scene stubs and local preview

**Files:**
- Create: `js/app.js`, `.claude/launch.json`
- Create (stubs, replaced in later tasks): `js/scenes/envelope.js`, `s1-question.js`, `s2-day.js`, `s3-activities.js`, `s4-food.js`, `s5-dessert.js`, `s6-time.js`, `finale.js`

- [ ] **Step 1: Create the eight stub scenes**

Write this exact content into each of the eight files under `js/scenes/`. Each one is replaced by its real scene in Tasks 7–14.

```js
export function render(stage, { next, signal }) {
  stage.innerHTML = '<h1 class="q" tabindex="-1">Stub scene</h1><button class="btn next" type="button">Next →</button>';
  stage.querySelector('.next').addEventListener('click', next, { signal });
}
```

- [ ] **Step 2: Create `js/app.js`**

```js
import { config } from './config.js';
import { copy } from './copy.js';
import { state } from './state.js';
import * as fx from './fx.js';
import { restartAnimation } from './ui.js';
import * as envelope from './scenes/envelope.js';
import * as s1 from './scenes/s1-question.js';
import * as s2 from './scenes/s2-day.js';
import * as s3 from './scenes/s3-activities.js';
import * as s4 from './scenes/s4-food.js';
import * as s5 from './scenes/s5-dessert.js';
import * as s6 from './scenes/s6-time.js';
import * as finale from './scenes/finale.js';

const scenes = [envelope, s1, s2, s3, s4, s5, s6, finale];
const stage = document.getElementById('stage');
const frames = [...document.querySelectorAll('.filmstrip span')];
const clapper = document.querySelector('.clapper');
const backBtn = document.querySelector('.back');

let current = -1;
let controller = null;
const history = [];

function updateChrome(index) {
  document.body.classList.toggle('on-envelope', index === 0);
  frames.forEach((f, k) => f.classList.toggle('on', k < index));
  clapper.textContent = index === scenes.length - 1 ? copy.chrome.finalClapper : copy.chrome.clapper(index);
  if (index > 0) restartAnimation(clapper, 'snap');
  backBtn.hidden = index < 2;
  fx.placeGnome(index);
}

function show(index, { isBack = false } = {}) {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  if (!isBack && current >= 0) history.push(current);
  current = index;

  const old = stage.querySelector('.scene:not(.leaving)');
  const el = document.createElement('section');
  el.className = `scene entering${isBack ? ' from-left' : ''}`;
  stage.append(el);
  updateChrome(index);

  const ctx = {
    state, copy, config, fx, signal,
    next: () => { if (current === index) show(index + 1); },
    after: (ms, fn) => {
      const t = setTimeout(fn, ms);
      signal.addEventListener('abort', () => clearTimeout(t), { once: true });
      return () => clearTimeout(t);
    },
  };
  scenes[index].render(el, ctx);

  void el.offsetWidth;
  el.classList.remove('entering', 'from-left');
  if (old) {
    old.classList.add('leaving', isBack ? 'to-right' : 'to-left');
    setTimeout(() => old.remove(), 500);
  }
  el.querySelector('h1')?.focus({ preventScroll: true });
}

function back() {
  if (history.length) show(history.pop(), { isBack: true });
}

backBtn.textContent = copy.chrome.back;
backBtn.addEventListener('click', back);
document.getElementById('mute').addEventListener('click', fx.toggleMute);
show(0);
```

- [ ] **Step 3: Create `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "date-site",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8080"],
      "port": 8080
    }
  ]
}
```

- [ ] **Step 4: Preview the shell in the browser pane**

1. Start the `date-site` server with `preview_start`.
2. Resize the pane to 375×667 (`resize_window` width 375, height 667).
3. Check the envelope stub. Expected:
   - "Stub scene" with a Next button, and no film strip.
   - `read_console_messages` with `onlyErrors: true` returns nothing. A 404 for `assets/favicon.svg` is fine until Task 15.
4. Click Next seven times. Expected:
   - The film strip fills frame by frame.
   - The clapper reads "SCENE 1 · TAKE 1" through "SCENE 6 · TAKE 1", then "FINAL SCENE · TAKE 1".
   - "← Back" appears from Scene 2.
   - The gnome changes corner on each scene.
5. Click "← Back" twice. Expected: the scenes step back with the slide coming from the left.

- [ ] **Step 5: Commit**

```bash
git add js/app.js js/scenes
git commit -m "feat: scene router with film strip, clapper, back and stubs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 7: Envelope scene

**Files:**
- Modify (replace stub): `js/scenes/envelope.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/envelope.js`**

```js
import { seal, flap, pocket } from '../art.js';

export function render(stage, { copy, fx, next, signal, after }) {
  const c = copy.envelope;
  stage.classList.add('envelope-scene');
  stage.innerHTML = `
    <button class="envelope" type="button" aria-label="${c.to} (${c.hint})">
      <span class="env-back"></span>
      <span class="flap">${flap}</span>
      <span class="letter"></span>
      <span class="env-front">${pocket}</span>
      <span class="seal">${seal}</span>
    </button>
    <h1 class="env-to" tabindex="-1">${c.to}</h1>
    <p class="env-hint">${c.hint}</p>
    <div class="letter-card" hidden>
      <p class="letter-line">${c.letter}</p>
      <button class="btn roll" type="button">${c.roll}</button>
    </div>
    <p class="env-quote">${c.quote}</p>`;

  const env = stage.querySelector('.envelope');
  const card = stage.querySelector('.letter-card');
  env.addEventListener('click', () => {
    if (env.classList.contains('open')) return;
    fx.crack();
    fx.startMusic();
    env.classList.add('open');
    stage.querySelector('.env-hint').hidden = true;
    after(1300, () => {
      stage.classList.add('opened');
      card.hidden = false;
      card.querySelector('.roll').focus({ preventScroll: true });
    });
  }, { signal });
  stage.querySelector('.roll').addEventListener('click', next, { signal });
}
```

- [ ] **Step 2: Append the envelope styles to `css/style.css`**

```css
/* ============ Envelope ============ */
.envelope-scene { justify-content: center; }
.envelope {
  position: relative; width: min(300px, 80vw); aspect-ratio: 3 / 2; margin-top: 24px;
  padding: 0; border: 0; background: none; cursor: pointer; perspective: 900px;
}
.envelope > span { position: absolute; display: block; }
.envelope svg { display: block; width: 100%; height: 100%; }
.env-back { inset: 0; z-index: 0; background: #e2d0a4; border-radius: 6px; box-shadow: 0 8px 18px rgba(59, 42, 31, .25); }
.flap { left: 0; right: 0; top: 0; height: 62%; z-index: 4; transform-origin: top; transition: transform .6s ease-in-out, z-index 0s .3s; }
.letter {
  left: 7%; right: 7%; top: 8%; bottom: 8%; z-index: 2;
  background: var(--paper-hi) repeating-linear-gradient(transparent 0 13px, rgba(155, 28, 28, .12) 13px 14px);
  border-radius: 4px; transition: transform .9s .35s cubic-bezier(.2, .8, .2, 1);
}
.env-front { inset: 0; z-index: 3; pointer-events: none; }
.seal { left: 50%; top: 62%; width: 64px; height: 64px; z-index: 5; transform: translate(-50%, -50%); }
.seal .crack { opacity: 0; transition: opacity .1s; }
.envelope.open .seal .crack { opacity: 1; }
.envelope.open .seal { animation: seal-off .7s .15s forwards; }
.envelope.open .flap { transform: rotateX(180deg); z-index: 1; }
.envelope.open .letter { transform: translateY(-58%); }
@keyframes seal-off { to { transform: translate(-50%, 40%) rotate(25deg); opacity: 0; } }
.env-to { font-weight: 700; font-size: 42px; color: var(--red); margin: 26px 0 4px; }
.env-hint { font: 16px var(--type); opacity: .75; margin: 0; animation: breathe 2s ease-in-out infinite; }
@keyframes breathe { 50% { opacity: .35; } }
.env-quote {
  position: absolute; left: 0; right: 0; bottom: calc(18px + var(--sab));
  margin: 0; padding: 0 70px; font: italic 16px var(--type); opacity: .7;
}
.envelope-scene.opened .envelope, .envelope-scene.opened .env-to { display: none; }
.letter-card {
  width: 100%; max-width: 340px; padding: 30px 22px 26px;
  background: var(--paper-hi) repeating-linear-gradient(transparent 0 31px, rgba(155, 28, 28, .1) 31px 32px);
  border-radius: 6px; box-shadow: 0 8px 22px rgba(59, 42, 31, .25);
  transform: rotate(-1.5deg); animation: rise .6s cubic-bezier(.2, .8, .2, 1);
}
.letter-line { font-size: 30px; line-height: 1.2; margin: 0 0 22px; }
@keyframes rise { from { transform: translateY(40px) rotate(-1.5deg); opacity: 0; } }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

Reload the page, take a screenshot, then click the envelope and take another screenshot after 1.5 s. Expected:
- Before the tap: the sealed envelope, "For Parche 💌", a breathing "tap to open", and the quote footer.
- After the tap:
  - the seal cracks and drops, the flap opens and the letter slides up
  - then the letter card appears with "Ek chhoti si film banayi hai... sirf tumhare liye 🎬" and "Roll camera →"
  - the vinyl shows muted, because `music.mp3` doesn't exist yet (this is expected until Task 16)

Click "Roll camera →". Expected: the Scene 1 stub, with the film strip and the clapper.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/envelope.js css/style.css
git commit -m "feat: envelope scene with seal crack and letter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 8: Scene 1, the big question

**Files:**
- Modify (replace stub): `js/scenes/s1-question.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s1-question.js`**

```js
import { dodgeScales, noLabel, pickSpot } from '../logic.js';
import { restartAnimation } from '../ui.js';

export function render(stage, { copy, config, fx, next, signal, after }) {
  const c = copy.s1;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <div class="btn-row">
      <button class="btn yes" type="button">${c.yes}</button>
      <button class="btn ghost no" type="button" aria-disabled="true">${c.no}</button>
    </div>
    <img class="kid" src="assets/success-kid.jpg" alt="${c.kidAlt}" width="360" height="383" hidden>`;

  const yes = stage.querySelector('.yes');
  const no = stage.querySelector('.no');
  let dodges = 0;
  let lastDodge = 0;
  let done = false;

  function relocate() {
    const s = dodgeScales(dodges);
    if (!no.classList.contains('free')) {
      const r0 = no.getBoundingClientRect();
      no.classList.add('free');
      no.style.left = `${r0.left}px`;
      no.style.top = `${r0.top}px`;
    }
    // Yes scales around its centre; use its final size, not a mid-transition one.
    const yr = yes.getBoundingClientRect();
    const cx = yr.left + yr.width / 2;
    const cy = yr.top + yr.height / 2;
    const yw = yes.offsetWidth * s.yes;
    const yh = yes.offsetHeight * s.yes;
    const pad = 12;
    const avoid = { left: cx - yw / 2 - pad, right: cx + yw / 2 + pad, top: cy - yh / 2 - pad, bottom: cy + yh / 2 + pad };
    const inset = fx.safeInsets();
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const bounds = { left: 12 + inset.left, top: 84 + inset.top, right: vw - 12 - inset.right, bottom: vh - 76 - inset.bottom };
    const size = { w: no.offsetWidth * s.no, h: no.offsetHeight * s.no };
    const spot = pickSpot(bounds, size, avoid);
    no.style.left = `${spot.x}px`;
    no.style.top = `${spot.y}px`;
  }

  function dodge() {
    if (done) return;
    const now = performance.now();
    if (now - lastDodge < 250) return;
    lastDodge = now;
    dodges += 1;
    const s = dodgeScales(dodges);
    no.textContent = noLabel(dodges, c);
    yes.style.setProperty('--yes-scale', s.yes);
    no.style.setProperty('--no-scale', s.no);
    relocate();
  }

  // Touch: move before any click can register.
  no.addEventListener('pointerdown', e => { e.preventDefault(); dodge(); }, { signal });
  no.addEventListener('touchstart', e => { e.preventDefault(); dodge(); }, { signal, passive: false });
  // Keyboard (Enter/Space give detail 0): shake. A mouse click that slipped through: dodge. Never accept.
  no.addEventListener('click', e => {
    e.preventDefault();
    if (e.detail === 0) restartAnimation(no, 'shake'); else dodge();
  }, { signal });
  // Desktop: run away when the mouse gets within ~80 px.
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || done) return;
    const r = no.getBoundingClientRect();
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    if (Math.hypot(dx, dy) < 80) dodge();
  }, { signal });

  yes.addEventListener('click', () => {
    if (done) return;
    done = true;
    fx.heartBurst(yes);
    no.hidden = true;
    stage.querySelector('.kid').hidden = false;
    after(config.YES_ADVANCE_MS, next);
  }, { signal });
}
```

- [ ] **Step 2: Append the Scene 1 styles to `css/style.css`**

```css
/* ============ Scene 1 ============ */
.btn-row { display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; align-items: center; margin-top: 10px; }
.yes { transform: scale(var(--yes-scale, 1)); transition: transform .25s cubic-bezier(.3, 1.5, .5, 1); }
.no { transform: scale(var(--no-scale, 1)); transform-origin: 0 0; transition: transform .25s, left .25s, top .25s; touch-action: none; }
.no.free { position: fixed; z-index: 7; margin: 0; }
.no.shake { animation: shake .4s; }
@keyframes shake { 20%, 60% { translate: -6px 0; } 40%, 80% { translate: 6px 0; } }
.kid {
  width: min(220px, 60vw); height: auto; margin-top: 26px;
  border: 6px solid #fff; border-radius: 10px; box-shadow: 0 8px 20px rgba(59, 42, 31, .3);
  transform: rotate(-4deg); animation: stamp .5s cubic-bezier(.3, 1.6, .5, 1);
}
@keyframes stamp { from { transform: rotate(-4deg) scale(2.2); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .no.free { transition: none !important; } }
```

- [ ] **Step 3: Check it in the browser pane (375×667, touch emulation)**

1. Reload, open the envelope and roll camera. Expected: the question with "Yes! 💖" and "No".
2. Click "No" six times by `ref`. Expected after each click:
   - "No" moves and its label steps through the list; Yes grows.
   - Scene 1 never advances.
3. After each click, run this with `javascript_tool`:
   ```js
   const n = document.querySelector('.no').getBoundingClientRect(), y = document.querySelector('.yes').getBoundingClientRect();
   ({ inView: n.left >= 0 && n.top >= 0 && n.right <= innerWidth && n.bottom <= innerHeight,
      overlap: n.left < y.right && n.right > y.left && n.top < y.bottom && n.bottom > y.top })
   ```
   Expected: `{ inView: true, overlap: false }` every time.
4. Click "Yes! 💖". Expected: a heart burst, then the Success Kid frame stamps in. The image is broken until Task 15, which is expected here. The page advances to the Scene 2 stub after about 1.8 s.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s1-question.js css/style.css
git commit -m "feat: scene 1 with the runaway No and Success Kid

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 9: Scene 2, Saturday or Sunday

**Files:**
- Modify (replace stub): `js/scenes/s2-day.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s2-day.js`**

```js
import { chalkArrow } from '../art.js';
import { restartAnimation } from '../ui.js';

export function render(stage, { state, copy, config, next, signal, after }) {
  const c = copy.s2;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <div class="flips">${['sat', 'sun'].map(d => `
      <button class="flip" type="button" data-day="${d}" aria-pressed="false">
        <span class="flip-inner">
          <span class="face front">${c[d].dow}<b>${c[d].date}</b>${c[d].mon}</span>
          <span class="face back-face">${c[d].flipped}</span>
        </span>
      </button>`).join('')}
    </div>
    <div class="dono-wrap">
      <span class="chalk chalk-dono" hidden>${chalkArrow}</span>
      <button class="dono" type="button" hidden>${c.dono}</button>
      <p class="hint" hidden>${c.hint}</p>
      <p class="lalchi" role="status"></p>
    </div>
    <div class="next-wrap">
      <button class="btn next" type="button" hidden>${copy.chrome.next}</button>
      <span class="chalk chalk-next" hidden>${chalkArrow}</span>
    </div>`;

  const cards = [...stage.querySelectorAll('.flip')];
  const dono = stage.querySelector('.dono');
  const hint = stage.querySelector('.hint');
  const donoArrow = stage.querySelector('.chalk-dono');
  const lalchi = stage.querySelector('.lalchi');
  const nextBtn = stage.querySelector('.next');
  const nextArrow = stage.querySelector('.chalk-next');
  let donoUsed = false;
  let cancelFallback = null;

  const paint = () => cards.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.day === state.day)));
  const showNext = withArrow => { nextBtn.hidden = false; nextArrow.hidden = !withArrow; };

  function pick(day) {
    state.day = day;
    paint();
    lalchi.textContent = '';
    if (donoUsed) { showNext(true); return; }
    dono.hidden = false;
    dono.classList.add('pulse');
    hint.hidden = false;
    donoArrow.hidden = false;
    cancelFallback ??= after(config.DONO_FALLBACK_MS, () => showNext(false));
  }

  cards.forEach(b => b.addEventListener('click', () => pick(b.dataset.day), { signal }));

  dono.addEventListener('click', () => {
    donoUsed = true;
    cancelFallback?.();
    dono.classList.remove('pulse');
    restartAnimation(dono, 'wiggle');
    hint.hidden = true;
    donoArrow.hidden = true;
    lalchi.textContent = c.lalchi;
    state.day = null;
    paint();
    nextBtn.hidden = true;
    nextArrow.hidden = true;
  }, { signal });

  nextBtn.addEventListener('click', () => { if (state.day) next(); }, { signal });

  // Coming back via ← Back: keep her pick and let her move on.
  if (state.day) {
    donoUsed = true;
    dono.hidden = false;
    paint();
    showNext(false);
  }
}
```

- [ ] **Step 2: Append the Scene 2 styles to `css/style.css`**

```css
/* ============ Scene 2 ============ */
.flips { display: flex; gap: 16px; justify-content: center; width: 100%; max-width: 360px; }
.flip {
  flex: 1; max-width: 160px; aspect-ratio: 3 / 4; padding: 0;
  background: none; border: 0; cursor: pointer; perspective: 700px;
}
.flip-inner { position: relative; display: block; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .6s; }
.flip[aria-pressed="true"] .flip-inner { transform: rotateY(180deg); }
.face {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px; border: 3px solid var(--green); border-radius: 12px;
  -webkit-backface-visibility: hidden; backface-visibility: hidden;
}
.front { background: var(--paper-hi); font: 18px var(--type); color: var(--ink); }
.front b { font: 700 64px/1 var(--hand); color: var(--green); }
.back-face { background: var(--green); color: var(--cream); transform: rotateY(180deg); font-size: 24px; line-height: 1.1; }
.dono-wrap { position: relative; margin-top: 30px; min-height: 120px; }
.dono {
  min-height: 48px; padding: 8px 22px; cursor: pointer;
  font-weight: 700; font-size: 28px; color: var(--red);
  background: transparent; border: 2px dashed var(--red); border-radius: 999px;
}
.dono.pulse { animation: pulse 1.2s ease-in-out infinite; }
.dono.wiggle { animation: wiggle .5s; }
@keyframes pulse { 50% { transform: scale(1.1); } }
@keyframes wiggle { 25% { rotate: -8deg; } 75% { rotate: 8deg; } }
.hint { margin: 8px 0 0; font-size: 24px; }
.lalchi { margin: 10px 0 0; min-height: 1.2em; font-weight: 700; font-size: 28px; color: var(--red); }
.lalchi:empty { display: none; }
.chalk-dono { position: absolute; width: 64px; height: 56px; left: calc(50% + 70px); top: -40px; }
.next-wrap { position: relative; }
.chalk-next { position: absolute; width: 56px; height: 48px; right: -60px; top: -18px; }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

From Scene 2:
1. Tap SAT. Expected:
   - The card flips to "Saturday it is! Weekend starts with you ✨".
   - "Dono? 😏" pulses, with the chalk arrow and "psst... ek aur option hai 👀".
   - Next is hidden.
2. Tap Dono. Expected:
   - It wiggles and "Lalchi... pehle ek toh chuno 😂" appears.
   - Both cards un-flip and Next stays hidden.
3. Tap SUN. Expected: the card flips and Next appears straight away with a chalk arrow.
4. Reload and run the flow again, picking SAT and waiting 4 s without tapping Dono. Expected: Next appears.
5. Tap SAT and then SUN. Expected: only SUN stays flipped.
6. Tap Next, then ← Back. Expected: the picked card is still flipped and Next is visible.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s2-day.js css/style.css
git commit -m "feat: scene 2 flip cards with the Dono nudge

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 10: Scene 3, activities

**Files:**
- Modify (replace stub): `js/scenes/s3-activities.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s3-activities.js`**

```js
import { bindMultiSelect } from '../ui.js';

export function render(stage, { state, copy, config, next, signal }) {
  const c = copy.s3;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <div class="stubs">${c.options.map(o => `
      <button class="stub" type="button" data-id="${o.id}" aria-pressed="false">
        <span>${o.emoji} ${o.label}</span><span class="stamp" aria-hidden="true">${c.stamp}</span>
      </button>`).join('')}
    </div>
    <label class="sr-only" for="act-other">${c.placeholder}</label>
    <input id="act-other" class="write" type="text" maxlength="${config.INPUT_MAX}" placeholder="${c.placeholder}" autocomplete="off" enterkeyhint="done">
    <button class="btn next" type="button" hidden>${copy.chrome.next}</button>`;

  bindMultiSelect({
    buttons: [...stage.querySelectorAll('.stub')],
    input: stage.querySelector('.write'),
    nextBtn: stage.querySelector('.next'),
    state, listKey: 'activities', otherKey: 'activityOther', signal,
  });
  stage.querySelector('.next').addEventListener('click', next, { signal });
}
```

- [ ] **Step 2: Append the Scene 3 styles to `css/style.css`**

```css
/* ============ Scene 3 ============ */
.stubs { display: flex; flex-direction: column; gap: 10px; align-items: center; width: 100%; }
.stub {
  position: relative; width: 100%; max-width: 320px; min-height: 52px;
  padding: 10px 76px 10px 24px; text-align: left; cursor: pointer;
  font: 18px var(--type); color: var(--film); background: var(--mustard);
  border: 0; border-radius: 4px;
  -webkit-mask: radial-gradient(circle 9px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat,
                radial-gradient(circle 9px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 9px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat,
                radial-gradient(circle 9px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat;
}
.stub::before { content: ""; position: absolute; top: 6px; bottom: 6px; right: 66px; border-left: 2px dashed rgba(43, 43, 43, .4); }
.stub[aria-pressed="true"] { color: var(--cream); background: var(--red); animation: tear .35s; }
.stub[aria-pressed="true"]::before { border-color: rgba(244, 234, 213, .5); }
.stub .stamp {
  position: absolute; right: 8px; top: 50%; padding: 2px 4px;
  font-size: 12px; border: 2px solid currentColor;
  transform: translateY(-50%) rotate(-10deg) scale(0); opacity: 0;
  transition: transform .25s cubic-bezier(.3, 1.8, .5, 1), opacity .2s;
}
.stub[aria-pressed="true"] .stamp { transform: translateY(-50%) rotate(-10deg) scale(1); opacity: 1; }
@keyframes tear { 30% { transform: rotate(-1.5deg) translateX(-3px); } }
.write {
  width: 100%; max-width: 320px; margin-top: 16px; padding: 6px 4px;
  font-size: 24px; color: var(--ink); background: transparent;
  border: 0; border-bottom: 2px solid var(--ink); border-radius: 0;
}
.write::placeholder { color: rgba(59, 42, 31, .6); }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

1. Tap Movie and Museum date. Expected: both turn red with an "ADMIT ✓" stamp, and Next appears.
2. Tap Movie again. Expected: it deselects.
3. Tap Museum date to deselect it. Expected: Next hides.
4. Type "Bowling" in the input. Expected: Next appears.
5. Run `document.querySelector('.write').maxLength` with `javascript_tool`. Expected: `60`.
6. Tap Next, then ← Back. Expected: the selections and the typed text are still there.
7. Run `document.documentElement.scrollWidth <= innerWidth`. Expected: `true`.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s3-activities.js css/style.css
git commit -m "feat: scene 3 ticket-stub multi-select

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 11: Scene 4, food

**Files:**
- Modify (replace stub): `js/scenes/s4-food.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s4-food.js`**

```js
import { plate } from '../art.js';
import { bindMultiSelect } from '../ui.js';

export function render(stage, { state, copy, config, next, signal }) {
  const c = copy.s4;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <div class="menu">
      <p class="menu-title">${c.menuTitle}</p>
      <p class="menu-sub">${c.menuSub}</p>
      ${c.options.map(o => `
        <button class="dish" type="button" data-id="${o.id}" aria-pressed="false">
          <span>${o.emoji} ${o.label}</span><span class="tick" aria-hidden="true">✓</span>
        </button>`).join('')}
    </div>
    <label class="sr-only" for="food-other">${c.placeholder}</label>
    <input id="food-other" class="write" type="text" maxlength="${config.INPUT_MAX}" placeholder="${c.placeholder}" autocomplete="off" enterkeyhint="done">
    <div class="plate" aria-hidden="true">${plate}<div class="plate-items"></div></div>
    <button class="btn next" type="button" hidden>${copy.chrome.next}</button>`;

  const items = stage.querySelector('.plate-items');
  const drawPlate = () => {
    const emojis = c.options.filter(o => state.food.includes(o.id)).map(o => o.emoji);
    if (state.foodOther.trim()) emojis.push('✍️');
    const already = new Set([...items.children].map(s => s.textContent));
    items.replaceChildren(...emojis.map(e => {
      const s = document.createElement('span');
      s.textContent = e;
      if (already.has(e)) s.className = 'stay';
      return s;
    }));
  };

  bindMultiSelect({
    buttons: [...stage.querySelectorAll('.dish')],
    input: stage.querySelector('.write'),
    nextBtn: stage.querySelector('.next'),
    state, listKey: 'food', otherKey: 'foodOther', signal,
    onChange: drawPlate,
  });
  stage.querySelector('.next').addEventListener('click', next, { signal });
}
```

- [ ] **Step 2: Append the Scene 4 styles to `css/style.css`**

```css
/* ============ Scene 4 ============ */
.menu {
  width: 100%; max-width: 340px; padding: 16px 14px 10px;
  background: var(--paper-hi); border: 2px solid var(--ink); border-radius: 4px;
  outline: 1px solid var(--ink); outline-offset: -8px;
}
.menu-title { margin: 0; font: 20px var(--type); color: var(--red); }
.menu-sub { margin: 0 0 8px; font-size: 24px; }
.dish {
  display: flex; width: 100%; min-height: 48px; padding: 6px 8px;
  justify-content: space-between; align-items: center; gap: 8px; text-align: left;
  font-size: 26px; color: var(--ink); background: transparent; cursor: pointer;
  border: 0; border-bottom: 1px dashed var(--khaki);
}
.dish:last-child { border-bottom: 0; }
.dish .tick {
  display: inline-grid; place-items: center; flex: none; width: 28px; height: 28px;
  font-size: 18px; color: transparent; border: 2px solid var(--ink); border-radius: 50%;
}
.dish[aria-pressed="true"] { color: var(--red); }
.dish[aria-pressed="true"] .tick { color: var(--cream); background: var(--red); border-color: var(--red); }
.plate { position: relative; width: 200px; height: 110px; margin-top: 18px; }
.plate svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.plate-items {
  position: absolute; inset: 22px 36px; display: flex; flex-wrap: wrap; gap: 2px;
  justify-content: center; align-content: center; font-size: 26px; line-height: 1;
}
.plate-items span { animation: drop .4s cubic-bezier(.3, 1.6, .5, 1); }
.plate-items span.stay { animation: none; }
@keyframes drop { from { transform: translateY(-60px) scale(.6); opacity: 0; } }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

1. Check the menu heading. Expected: "Café des 2 Moulins" over "Menu du jour", with six dishes including 🥐 Vol-au-vent.
2. Tap Pizza and Vol-au-vent. Expected:
   - Both are ticked red.
   - 🍕 and 🥐 drop onto the plate.
   - Next appears.
3. Tap Pizza again. Expected: 🍕 leaves the plate and 🥐 does not re-animate.
4. Type "Momos". Expected: ✍️ joins the plate.
5. Scroll to the bottom. Expected: Next is reachable above the vinyl button and nothing scrolls horizontally.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s4-food.js css/style.css
git commit -m "feat: scene 4 Café des 2 Moulins menu with plate

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 12: Scene 5, Nirula's dessert

**Files:**
- Modify (replace stub): `js/scenes/s5-dessert.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s5-dessert.js`**

```js
export function render(stage, { state, copy, next, signal, after }) {
  const c = copy.s5;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <p class="aside">${c.aside}</p>
    <div class="sundae" aria-hidden="true">🍨</div>
    <div class="dessert-row">
      <button class="btn" type="button" data-v="yes">${c.yes}</button>
      <button class="btn gold" type="button" data-v="obviously">${c.obviously}</button>
      <button class="tiny-no" type="button">${c.no}</button>
    </div>`;

  const choose = v => { state.dessert = v; next(); };
  stage.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => choose(b.dataset.v), { signal }));

  const tiny = stage.querySelector('.tiny-no');
  tiny.addEventListener('click', () => {
    if (tiny.classList.contains('melted')) { choose('yes'); return; }
    if (tiny.classList.contains('melt')) return;
    tiny.classList.add('melt');
    after(650, () => {
      tiny.className = 'btn melted';
      tiny.textContent = c.yes;
    });
  }, { signal });
}
```

- [ ] **Step 2: Append the Scene 5 styles to `css/style.css`**

```css
/* ============ Scene 5 ============ */
.aside { margin: -8px 0 8px; font-size: 26px; }
.sundae { font-size: 72px; line-height: 1; margin: 6px 0 18px; animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-6px) rotate(3deg); } }
.dessert-row { display: flex; flex-direction: column; gap: 14px; align-items: center; }
.tiny-no {
  min-height: 44px; padding: 8px 14px; cursor: pointer;
  font: 16px var(--type); color: var(--ink); opacity: .65;
  background: transparent; border: 0; text-decoration: underline;
}
.tiny-no.melt { animation: melt .6s ease-in forwards; transform-origin: 50% 100%; }
@keyframes melt { to { transform: scaleY(.15) scaleX(1.6) translateY(20px); opacity: 0; filter: blur(2px); } }
.btn.melted { animation: pop .35s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes pop { from { transform: scale(.3); opacity: 0; } }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

1. Check the screen. Expected: "And dessert at Nirula's? 🍨", "(Hot Chocolate Fudge, obviously)", a bobbing 🍨, then "Yes", "Obviously yes" and a tiny "No".
2. Tap "No". Expected: it melts and then pops back as a red "Yes" button.
3. Tap that "Yes". Expected:
   - The page advances to the Scene 6 stub.
   - `javascript_tool`, after importing `./js/state.js`, shows `state.dessert === 'yes'`.
4. Go ← Back, tap "Obviously yes", then check `state.dessert`. Expected: `'obviously'`.

For the `javascript_tool` check, run `(await import('/js/state.js')).state.dessert`.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s5-dessert.js css/style.css
git commit -m "feat: scene 5 Nirula's with the melting No

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 13: Scene 6, pick-up time

**Files:**
- Modify (replace stub): `js/scenes/s6-time.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/scenes/s6-time.js`**

```js
import { timeLabel, captionFor, skyWeights, starsVisible } from '../logic.js';

export function render(stage, { state, copy, config, next, signal }) {
  const c = copy.s6;
  const S = config.SLIDER;
  stage.classList.add('s6');
  stage.innerHTML = `
    <div class="sky" aria-hidden="true">
      <div class="morning"></div><div class="afternoon"></div><div class="sunset"></div><div class="night"></div>
      <div class="stars"></div>
    </div>
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <p class="big-time" aria-hidden="true"></p>
    <p class="cap"></p>
    <label class="sr-only" for="time">${c.label}</label>
    <input id="time" class="slider" type="range" min="${S.min}" max="${S.max}" step="${S.step}">
    <button class="btn next" type="button">${copy.chrome.next}</button>`;

  const layers = [...stage.querySelectorAll('.sky > div:not(.stars)')];
  const stars = stage.querySelector('.stars');
  const big = stage.querySelector('.big-time');
  const cap = stage.querySelector('.cap');
  const slider = stage.querySelector('.slider');

  function paint() {
    const i = state.time;
    const label = timeLabel(i);
    const [hm, ap] = label.split(' ');
    big.innerHTML = `${hm} <small>${ap}</small>`;
    cap.textContent = captionFor(i, copy);
    slider.setAttribute('aria-valuetext', `${label}, ${cap.textContent}`);
    // Stack the layers so their visible mix equals the weights.
    const w = skyWeights(i);
    let acc = 0;
    w.forEach((wk, k) => { acc += wk; layers[k].style.opacity = acc > 0 ? wk / acc : 0; });
    stars.style.opacity = starsVisible(i) ? 1 : 0;
    const dark = w[3] > 0.45;
    stage.classList.toggle('dark', dark);
    document.body.classList.toggle('night', dark);
  }

  slider.value = state.time;
  slider.addEventListener('input', () => { state.time = Number(slider.value); paint(); }, { signal });
  signal.addEventListener('abort', () => document.body.classList.remove('night'), { once: true });
  stage.querySelector('.next').addEventListener('click', next, { signal });
  paint();
}
```

- [ ] **Step 2: Append the Scene 6 styles to `css/style.css`**

```css
/* ============ Scene 6 ============ */
.s6 > :not(.sky) { position: relative; z-index: 1; }
.sky { position: absolute; inset: 0; z-index: 0; }
.sky > div { position: absolute; inset: 0; transition: opacity .3s; }
.sky .morning { background: linear-gradient(#ffe8a3, #fff4d6 70%, var(--cream)); }
.sky .afternoon { background: linear-gradient(#f7c45c, #fbe2a0 70%, var(--cream)); }
.sky .sunset { background: linear-gradient(#f7a072, #e86a8a 60%, #f4d3c4); }
.sky .night { background: linear-gradient(#141c38, #1f2a4a 70%, #3a3f63); }
.sky .stars { opacity: 0; transition: opacity .6s; }
.sky .stars::before {
  content: ""; position: absolute; left: 0; top: 0; width: 3px; height: 3px; border-radius: 50%; background: #fff;
  box-shadow: 8vw 14vh #fff, 22vw 8vh #fff, 35vw 20vh #fff, 48vw 11vh #fff, 63vw 17vh #fff, 77vw 7vh #fff, 90vw 15vh #fff,
              14vw 30vh #fff, 41vw 33vh #fff, 70vw 28vh #fff, 85vw 36vh #fff, 5vw 44vh #fff, 57vw 42vh #fff, 94vw 48vh #fff;
  animation: twinkle 2.5s ease-in-out infinite alternate;
}
@keyframes twinkle { to { opacity: .4; } }
.s6.dark, .s6.dark .q { color: var(--cream); }
.big-time { margin: 18px 0 4px; font: 700 76px/1 var(--hand); }
.big-time small { font-size: 34px; }
.cap { margin: 0; min-height: 1.3em; font-size: 30px; }
.slider {
  -webkit-appearance: none; appearance: none;
  width: 100%; max-width: 340px; height: 14px; margin-top: 30px; border-radius: 7px;
  background: linear-gradient(90deg, #ffe8a3, #f7c45c, #e86a8a, #1f2a4a);
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 40px; height: 40px; border-radius: 50%;
  background: var(--red); border: 4px solid var(--cream); box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
}
.slider::-moz-range-thumb {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--red); border: 4px solid var(--cream); box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
}
@media (prefers-reduced-motion: reduce) { .sky > div { transition: none !important; } }
```

- [ ] **Step 3: Check it in the browser pane (375×667)**

1. Check the default. Expected: "6:00 PM" with "Golden hour 😍" on a gold-to-pink sky.
2. Run each of these with `javascript_tool`, then screenshot:
   - `const s=document.querySelector('.slider'); s.value=0; s.dispatchEvent(new Event('input'));`. Expected: "10:00 AM", "Subah subah? Wow, dedication 😮", a morning sky.
   - value 8. Expected: "12:00 PM", "Lunch date vibes 🌤️".
   - value 34. Expected: "6:30 PM", "Sunset aur tum 🌅", a pink sky, no stars.
   - value 38. Expected: "7:30 PM", "Raat ki taaron mein ✨", stars visible.
   - value 44. Expected: "9:00 PM", a navy sky, cream text, and a cream ← Back.
3. Tap Next, then ← Back. Expected: the slider is still at 44.

- [ ] **Step 4: Commit**

```bash
git add js/scenes/s6-time.js css/style.css
git commit -m "feat: scene 6 sky slider with caption bands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 14: Ticket canvas and finale

**Files:**
- Create: `js/ticket.js`
- Modify (replace stub): `js/scenes/finale.js`
- Modify: `css/style.css` (append)

- [ ] **Step 1: Write `js/ticket.js`**

```js
// Draws the ADMIT TWO ticket at 1080×1350. `p` is the object from logic.planLists().
const W = 1080;
const H = 1350;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrap(g, text, maxW, maxLines) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const t = line ? `${line} ${word}` : word;
    if (g.measureText(t).width <= maxW || !line) line = t;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && g.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

export function drawTicket(canvas, p, copy) {
  const c = copy.finale;
  const g = canvas.getContext('2d');
  const x = 70, y = 70, w = W - 140, h = H - 140;
  const perf = y + 275;

  g.clearRect(0, 0, W, H);
  g.fillStyle = '#f4ead5';
  g.fillRect(0, 0, W, H);

  g.fillStyle = '#fffaf0';
  roundRect(g, x, y, w, h, 28);
  g.fill();
  g.strokeStyle = '#9b1c1c';
  g.lineWidth = 8;
  g.stroke();
  g.lineWidth = 3;
  roundRect(g, x + 22, y + 22, w - 44, h - 44, 18);
  g.stroke();

  // Side notches and the tear line.
  g.fillStyle = '#f4ead5';
  for (const nx of [x, x + w]) { g.beginPath(); g.arc(nx, perf, 34, 0, Math.PI * 2); g.fill(); }
  g.setLineDash([18, 14]);
  g.strokeStyle = '#c9b98f';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(x + 50, perf); g.lineTo(x + w - 50, perf); g.stroke();
  g.setLineDash([]);

  g.textAlign = 'center';
  g.fillStyle = '#9b1c1c';
  g.font = '96px "Special Elite", "Courier New", monospace';
  g.fillText(c.admit, W / 2, y + 140);
  g.fillStyle = '#3b2a1f';
  g.font = '700 72px Caveat, cursive';
  g.fillText(c.starring, W / 2, y + 225);

  const rows = [
    ['📅', p.day],
    ['🚗', p.time],
    ['🎟️', p.activities.join(', ') || copy.summary.surprise],
    ['🍽️', p.food.join(', ') || copy.summary.surprise],
    ['🍨', p.dessert],
  ];
  let ty = perf + 95;
  g.textAlign = 'left';
  for (const [icon, text] of rows) {
    g.fillStyle = '#3b2a1f';
    g.font = '50px sans-serif';
    g.fillText(icon, x + 70, ty);
    g.font = '700 52px Caveat, cursive';
    const lines = wrap(g, text, w - 260, 2);
    lines.forEach((ln, i) => g.fillText(ln, x + 150, ty + i * 58));
    ty += lines.length * 58 + 28;
  }

  g.textAlign = 'center';
  if (p.sequel) {
    g.fillStyle = '#3d5a2a';
    g.font = '700 56px Caveat, cursive';
    g.fillText(c.comingSoon, W / 2, ty + 20);
  }
  g.fillStyle = '#9b1c1c';
  g.font = '700 60px Caveat, cursive';
  g.fillText(c.title, W / 2, y + h - 95);
  g.fillStyle = '#3b2a1f';
  g.font = '30px "Special Elite", "Courier New", monospace';
  g.fillText(c.serial, W / 2, y + h - 45);
}
```

- [ ] **Step 2: Write `js/scenes/finale.js`**

```js
import { planLists, whatsAppText, whatsAppUrl, calendarUrl } from '../logic.js';
import { drawTicket } from '../ticket.js';

export function render(stage, { state, copy, fx, signal }) {
  const c = copy.finale;
  const p = planLists(state, copy);
  stage.classList.add('finale');
  stage.innerHTML = `
    <h1 class="title" tabindex="-1">${c.title}</h1>
    <p class="subtitle">${c.subtitle}</p>
    <div class="ticket-wrap">
      <canvas class="ticket-canvas" width="1080" height="1350" role="img" aria-label="${c.ticketAlt}"></canvas>
    </div>
    ${p.sequel ? `<p class="sequel"><strong>${c.sequelQuote}</strong>${c.sequelLine}</p>` : ''}
    <div class="credits"><div class="credits-roll">${c.credits.map(l => `<p>${l}</p>`).join('')}</div></div>
    <div class="finale-actions">
      <a class="btn green" href="${whatsAppUrl(whatsAppText(state, copy))}" target="_blank" rel="noopener">${c.whatsapp}</a>
      <button class="btn gold save" type="button">${c.save}</button>
    </div>`;

  const canvas = stage.querySelector('canvas');
  // Draw now with whatever fonts are ready, then again once Caveat / Special Elite load.
  drawTicket(canvas, p, copy);
  Promise.all([document.fonts.load('700 72px Caveat'), document.fonts.load('48px "Special Elite"')])
    .catch(() => {})
    .then(() => { if (!signal.aborted) drawTicket(canvas, p, copy); });

  fx.confetti();

  // No awaits in here, so window.open still counts as part of the tap and isn't blocked.
  stage.querySelector('.save').addEventListener('click', () => {
    window.open(calendarUrl(state, copy), '_blank', 'noopener');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = c.ticketFile;
    document.body.append(a);
    a.click();
    a.remove();
  }, { signal });
}
```

- [ ] **Step 3: Append the finale styles to `css/style.css`**

```css
/* ============ Finale ============ */
.finale .title { margin: 4px 0 0; font: 700 40px/1.05 var(--hand); color: var(--red); }
.finale .subtitle { margin: 0 0 14px; font-size: 24px; }
.ticket-wrap { width: 100%; max-width: 340px; overflow: hidden; flex: none; }
.ticket-canvas {
  display: block; width: 100%; height: auto; border-radius: 6px;
  box-shadow: 0 6px 18px rgba(59, 42, 31, .25);
  animation: print 1.1s cubic-bezier(.2, .8, .2, 1);
}
@keyframes print { from { transform: translateY(-100%); } }
.sequel { max-width: 340px; margin: 16px 0 0; font-size: 24px; }
.sequel strong { display: block; color: var(--green); }
.credits {
  flex: none; width: 100%; max-width: 340px; height: 110px; margin: 14px 0; overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent, #000 25%, #000 75%, transparent);
          mask-image: linear-gradient(transparent, #000 25%, #000 75%, transparent);
}
.credits-roll { font: 16px/1.6 var(--type); animation: roll 9s linear infinite; }
.credits-roll p { margin: 0 0 6px; }
@keyframes roll { from { transform: translateY(110px); } to { transform: translateY(-100%); } }
.finale-actions { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; flex: none; }
@media (prefers-reduced-motion: reduce) {
  .credits { height: auto; -webkit-mask-image: none; mask-image: none; }
  .credits-roll { animation: none !important; }
}
```

- [ ] **Step 4: Check it in the browser pane (375×667)**

Run the full flow with Saturday, Movie plus "Bowling", Pizza, "Obviously yes" and 6:00 PM, then check each of these:

1. **The screen.** Expected:
   - "Ce n'est que le début ✨" and "(it's only the beginning)".
   - Confetti.
   - The ticket slides down, with ADMIT TWO, "Starring Parche & Nish", the five rows and "Coming soon: Sunday 🎞️".
   - The sequel quote and line under the ticket.
   - The credits roll.
   - Exactly two buttons.
2. **The WhatsApp link.** Run with `javascript_tool`:
   ```js
   decodeURIComponent(document.querySelector('.finale-actions a').href.split('text=')[1])
   ```
   Expected: the exact summary from Task 4, with "Movie, Bowling" and "Pizza".
3. **The ticket size.** Run `const cv=document.querySelector('canvas'); [cv.width, cv.height, cv.toDataURL().length > 50000]`. Expected: `[1080, 1350, true]`.
4. **The ticket image.** Open the data URL in a new browser tab and screenshot it. Expected: no text overlaps and every row is legible.
5. **The calendar link.** Run this before the tap:
   ```js
   window._opened = []; window.open = (u) => { window._opened.push(u); return null; };
   ```
   Click "Save the ticket 🎟️", then read `window._opened[0]`. Expected: a URL containing `dates=20261024T180000%2F20261024T220000` and `ctz=Asia%2FKolkata`.
6. **Sunday.** Repeat the flow with Sunday. Expected: no sequel lines on the ticket or under it.

- [ ] **Step 5: Commit**

```bash
git add js/ticket.js js/scenes/finale.js css/style.css
git commit -m "feat: finale with ADMIT TWO ticket, WhatsApp and Calendar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 15: Images (Success Kid, favicon, OG card, apple-touch-icon)

**Files:**
- Create: `assets/success-kid.jpg`, `assets/favicon.svg`, `assets/og-image.svg`, `assets/og-image.png`, `assets/apple-touch-icon.png`, `scripts/render-images.mjs`
- Modify: `package.json` (devDependency added by npm), `package-lock.json`

- [ ] **Step 1: Optimise the Success Kid image Nish supplied**

The source is the 536×571 PNG that Nish pasted into this session:

```bash
python -c "from PIL import Image; im=Image.open(r'C:/Users/nisha/AppData/Local/Temp/claude/E--Claude-projects-Date/eef06efc-7144-4cbc-9647-9934d8a1318a/images/1.png').convert('RGB'); im.thumbnail((360,400)); im.save('assets/success-kid.jpg', quality=78, optimize=True, progressive=True); print(im.size)"
ls -l assets/success-kid.jpg
```

Expected: `(360, 383)` and a file under 45 KB. If the file is bigger, re-run with `quality=70`.

- [ ] **Step 2: Create `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 56S6 40 6 22A13 13 0 0 1 32 15a13 13 0 0 1 26 7c0 18-26 34-26 34z" fill="#9b1c1c"/>
  <path d="M18 20a7 7 0 0 1 8-4" fill="none" stroke="#f4ead5" stroke-width="3" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Create `assets/og-image.svg` (1200×630, no emoji and no Success Kid)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="lines" width="1200" height="40" patternUnits="userSpaceOnUse">
      <rect width="1200" height="40" fill="#f4ead5"/>
      <rect y="39" width="1200" height="1.5" fill="#9b1c1c" fill-opacity=".09"/>
    </pattern>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#3c1e0a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#3c1e0a" stop-opacity=".35"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#lines)"/>
  <rect width="1200" height="44" fill="#2b2b2b"/>
  <g fill="#f4ead5">
    <rect x="20" y="12" width="150" height="20" rx="3"/><rect x="185" y="12" width="150" height="20" rx="3"/>
    <rect x="350" y="12" width="150" height="20" rx="3"/><rect x="515" y="12" width="150" height="20" rx="3"/>
    <rect x="680" y="12" width="150" height="20" rx="3"/><rect x="845" y="12" width="150" height="20" rx="3"/>
    <rect x="1010" y="12" width="170" height="20" rx="3"/>
  </g>
  <g fill="#d4a017"><rect x="20" y="12" width="150" height="20" rx="3"/></g>
  <!-- envelope -->
  <g transform="translate(170 150)">
    <rect width="480" height="320" rx="10" fill="#e2d0a4"/>
    <path d="M0 0L240 180 480 0v320H0z" fill="#e8d9b5"/>
    <path d="M0 320L210 160M480 320L270 160" stroke="#c4ab72" stroke-width="3" fill="none"/>
    <path d="M0 0h480L240 196z" fill="#d6c08c" stroke="#c4ab72" stroke-width="3"/>
    <circle cx="240" cy="196" r="48" fill="#9b1c1c" stroke="#7a1414" stroke-width="10" stroke-dasharray="8 5"/>
    <path d="M240 216s-18-11-18-23a10 10 0 0 1 18-5.5A10 10 0 0 1 258 193c0 12-18 23-18 23z" fill="#f4ead5"/>
  </g>
  <!-- clapperboard -->
  <g transform="translate(760 210) rotate(-6)">
    <rect y="46" width="270" height="170" rx="8" fill="#2b2b2b"/>
    <g transform="rotate(-12)">
      <rect width="270" height="44" fill="#2b2b2b"/>
      <path d="M20 0h30l-20 44H0zM90 0h30l-20 44H70zM160 0h30l-20 44h-30zM230 0h30l-20 44h-30z" fill="#f4ead5"/>
    </g>
    <text x="22" y="110" font-family="Courier New, monospace" font-size="26" fill="#f4ead5">SCENE 1</text>
    <text x="22" y="150" font-family="Courier New, monospace" font-size="26" fill="#f4ead5">TAKE 1</text>
    <text x="22" y="190" font-family="Courier New, monospace" font-size="20" fill="#d4a017">ROLL: PARCHE</text>
  </g>
  <text x="600" y="565" text-anchor="middle" font-family="Segoe Print, Bradley Hand, Georgia, serif" font-size="64" font-weight="700" fill="#9b1c1c">For Parche</text>
  <path d="M790 545s-22-13-22-27a12 12 0 0 1 22-6.5A12 12 0 0 1 812 518c0 14-22 27-22 27z" fill="#9b1c1c"/>
  <rect width="1200" height="630" fill="url(#vig)"/>
</svg>
```

- [ ] **Step 4: Install the renderer and write `scripts/render-images.mjs`**

```bash
npm install --save-dev @resvg/resvg-js
```

`scripts/render-images.mjs`:

```js
// SVG -> PNG for the link-preview card and the iOS home-screen icon.
import { Resvg } from '@resvg/resvg-js';
import { readFile, writeFile } from 'node:fs/promises';

const jobs = [
  ['assets/og-image.svg', 'assets/og-image.png', 1200],
  ['assets/favicon.svg', 'assets/apple-touch-icon.png', 180],
];

for (const [src, out, width] of jobs) {
  const svg = await readFile(src, 'utf8');
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: '#f4ead5',
    font: { loadSystemFonts: true, defaultFontFamily: 'Georgia' },
  }).render().asPng();
  await writeFile(out, png);
  console.log(`${out} ${png.length} bytes`);
}
```

- [ ] **Step 5: Render the PNGs and check them**

Run: `npm run images`

Expected: two lines, `assets/og-image.png …` (under 300 KB) and `assets/apple-touch-icon.png …`.

Then:
1. Open `assets/og-image.png` with the Read tool. Expected:
   - an envelope with a wax seal and a clapperboard
   - "For Parche" with a heart
   - no clipped text
2. Run: `python -c "from PIL import Image; print(Image.open('assets/og-image.png').size, Image.open('assets/apple-touch-icon.png').size)"`
   Expected: `(1200, 630) (180, 180)`

- [ ] **Step 6: Check in the browser pane**

1. Reload. Expected:
   - the heart favicon
   - no 404s in `read_network_requests`, except `music.mp3`
2. Tap Yes in Scene 1. Expected: the real Success Kid stamps in.

- [ ] **Step 7: Commit**

```bash
git add assets/success-kid.jpg assets/favicon.svg assets/og-image.svg assets/og-image.png assets/apple-touch-icon.png scripts/render-images.mjs package.json package-lock.json
git commit -m "feat: Success Kid, favicon, OG card and touch icon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 16: Music (gated on Nish's approval)

**Files:**
- Create: `assets/music.mp3`
- Modify: `package.json`, `package-lock.json` (adds the `ffmpeg-static` devDependency)

- [ ] **Step 1: Find a candidate track**

In the browser pane, search Pixabay Music (`https://pixabay.com/music/search/accordion%20waltz/`, and also `piano waltz french`).

Pick a gentle, French-café-style accordion or piano waltz with no vocals, under 3 minutes long. Note its title, artist, page URL, duration and download size.

- [ ] **Step 2: Ask Nish before downloading**

Ask in chat, with the title, artist, page URL, duration and size:

> "Okay to download '<title>' by <artist> (<duration>, <size>) from <page URL> under the Pixabay Content License, and re-encode it to about 1 MB?"

Wait for a clear yes. If Nish says no, try another track. If Nish wants no music, skip to Step 6: the site already copes, with the vinyl showing muted.

- [ ] **Step 3: Download into its own empty directory in the scratchpad**

```bash
mkdir -p "C:/Users/nisha/AppData/Local/Temp/claude/E--Claude-projects-Date/eef06efc-7144-4cbc-9647-9934d8a1318a/scratchpad/music-src"
curl -L -o "C:/Users/nisha/AppData/Local/Temp/claude/E--Claude-projects-Date/eef06efc-7144-4cbc-9647-9934d8a1318a/scratchpad/music-src/track.mp3" "<direct cdn.pixabay.com download URL from step 1>"
```

- [ ] **Step 4: Re-encode to about 1 MB**

The target is mono, 56 kbps, at most 150 s, with a 2 s fade-in and a 4 s fade-out so the loop is soft:

```bash
npm install --save-dev ffmpeg-static
FF=$(node -e "import('ffmpeg-static').then(m => console.log(m.default))")
SRC="C:/Users/nisha/AppData/Local/Temp/claude/E--Claude-projects-Date/eef06efc-7144-4cbc-9647-9934d8a1318a/scratchpad/music-src/track.mp3"
"$FF" -y -i "$SRC" -t 150 -ac 1 -b:a 56k -af "afade=t=in:d=2,afade=t=out:st=146:d=4" assets/music.mp3
ls -l assets/music.mp3
```

Expected: `assets/music.mp3` is between 0.6 and 1.2 MB. If the track is shorter than 150 s, change `st=146` to (duration − 4).

- [ ] **Step 5: Check playback in the browser pane**

1. Reload and tap the envelope. Expected:
   - The vinyl starts spinning.
   - `(await import('/js/fx.js'))` loads without errors.
   - The network panel shows `music.mp3` with status 200.
2. Tap the vinyl. Expected:
   - It stops spinning and shows a red slash.
   - `aria-pressed="true"`.
3. Tap the vinyl again. Expected: it spins again.

- [ ] **Step 6: Commit**

```bash
git add assets/music.mp3 package.json package-lock.json
git commit -m "feat: add the waltz (Pixabay Content License)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 17: Full QA in the browser pane at both phone sizes

**Files:**
- Modify: whichever files the checks below show need fixing

- [ ] **Step 1: Run the unit tests**

Run: `npm test`
Expected: `# pass 16`, `# fail 0`

- [ ] **Step 2: Walk the flow at 375×667 with the `mobile` preset (touch emulation)**

Run the full flow and tick off every item:

1. The envelope crack plays and the music fades in.
2. "No" never advances the page. It stays on screen and never overlaps Yes (use the Task 8 snippet after each dodge).
3. Yes plays the hearts and the Success Kid, then advances on its own.
4. The Dono loop works:
   - the nudge appears
   - Lalchi un-flips both cards
   - her re-pick shows Next immediately
   - the 4 s fallback works
5. Scenes 3 and 4:
   - multi-select toggles on and off
   - the custom text unlocks Next
   - the plate animates
6. The melting "No" becomes "Yes".
7. The slider passes through all five captions and four skies, and stars appear at 7:00 PM.
8. The finale has:
   - the right ticket for Saturday and for Sunday
   - a WhatsApp link that decodes correctly
   - the Calendar URL (captured with the `window.open` stub)
   - a 1080×1350 PNG
9. ← Back keeps every answer from Scene 2 to the finale.
10. After every scene, `document.documentElement.scrollWidth <= innerWidth` is `true`.
11. `read_console_messages` with `onlyErrors: true` is empty.

- [ ] **Step 3: Repeat at 412×915**

Repeat Step 2 at custom size 412×915 and take screenshots of every scene to check spacing.

- [ ] **Step 4: Check page weight**

Run with `javascript_tool` after the finale loads:

```js
performance.getEntriesByType('resource').reduce((t, r) => t + (r.transferSize || r.encodedBodySize || 0), 0) / 1024 / 1024
```

Expected: under 3 (MB), with a target of about 1.5.

- [ ] **Step 5: Check reduced motion**

Run with `javascript_tool`: `matchMedia('(prefers-reduced-motion: reduce)').matches`. If the pane can't emulate the setting, check the CSS by reading the `@media (prefers-reduced-motion: reduce)` blocks. Expected:
- every scene's animations are covered
- `fx.confetti` and `fx.heartBurst` return early

- [ ] **Step 6: Reset the viewport and commit any fixes**

Call `resize_window` with preset `desktop`. If fixes were made:

```bash
git add -A
git commit -m "fix: QA fixes from phone-size walkthrough

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 18: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the contents of `README.md`**

The section headings and the phone-check items in the README stay fixed; fill the `<title>`, `<artist>` and `<page URL>` fields with the track from Task 16.

````markdown
# For Parche 💌

A little interactive date invitation, styled as a handwritten letter meets a vintage movie. Static HTML, CSS and vanilla JS, hosted on GitHub Pages.

Live: https://nishantguglani.github.io/Date/

## Edit it

- **Words:** every line on screen is in `js/copy.js`.
- **Dates, times, timings:** `js/config.js` (`DAYS`, `SLIDER`, `EVENT_HOURS`, `MUSIC_VOLUME`, …).
- **Looks:** colours and fonts are CSS variables at the top of `css/style.css`.
- **Images:** `assets/`. After editing `og-image.svg` or `favicon.svg`, run `npm install` once, then `npm run images`.

## Run it locally

```bash
python -m http.server 8080
```

Open http://localhost:8080. Don't open `index.html` directly: modules and audio need http.

## Tests

```bash
npm test
```

## Music

"<title>" by <artist>, from Pixabay (<page URL>), used under the [Pixabay Content License](https://pixabay.com/service/license-summary/). It is re-encoded to mono 56 kbps.

## Before sharing: 2-minute phone check

On your own phone (iPhone Safari and/or Android Chrome):

1. Open the link. The envelope shows and the page doesn't scroll sideways.
2. Tap the envelope. You hear the crack and the music fades in. (On iPhone, also try with the silent switch on.)
3. Try to tap "No" a few times. It runs away and never gets pressed.
4. Pick a day, tap "Dono?", see "Lalchi...", then pick again.
5. Finish the flow and tap **Send on WhatsApp**. WhatsApp opens with the summary, and you choose the contact.
6. Tap **Save the ticket**. Google Calendar opens with the right date and time, and the ticket PNG downloads.
7. Send the link to yourself on WhatsApp and check the preview card. WhatsApp caches previews, so do this last.

## Deploy

GitHub Pages serves `main` from the repo root (`.nojekyll` is included).
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with editing guide, music licence and phone check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 19: Nish's preview, then deploy (gated)

- [ ] **Step 1: Hand over the local preview**

1. Make sure the `date-site` server is running in the browser pane.
2. Tell Nish it's ready to try at `http://localhost:8080`.
3. Ask for feedback.
4. Apply any changes, re-run `npm test`, and commit and push each change.

- [ ] **Step 2: Enable GitHub Pages, only after Nish explicitly approves**

```bash
gh api -X POST repos/nishantguglani/Date/pages -f "source[branch]=main" -f "source[path]=/"
```

Expected: JSON containing `"html_url": "https://nishantguglani.github.io/Date/"`. If it says Pages already exists, run `gh api repos/nishantguglani/Date/pages` to confirm the source instead.

- [ ] **Step 3: Verify the live site**

1. Poll `gh api repos/nishantguglani/Date/pages/builds/latest --jq .status` until it returns `built`. This usually takes 1–2 minutes; check once a minute.
2. Open `https://nishantguglani.github.io/Date/` in the browser pane and run a quick pass. Expected:
   - the envelope opens
   - the music plays
   - the finale buttons work
3. Run `curl -sI https://nishantguglani.github.io/Date/assets/og-image.png`. Expected: `HTTP/2 200` and `content-type: image/png`.

- [ ] **Step 4: Hand over**

Give Nish the live URL and point them to the README's phone checklist. In particular, Nish should send the link to themself first to check the WhatsApp preview.
