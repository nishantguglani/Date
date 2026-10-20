# For Parche 💌: date invitation site (design spec)

**Date:** 2026-10-20 · **Status:** approved in brainstorming, pending written-spec review

A mobile-first, single-page interactive invitation that asks Parche out on a first date, styled as "a handwritten love letter meets a vintage movie", with quiet nods to *Amélie* (her favourite film). Static site, hosted free on GitHub Pages.

## 1. Goals and constraints

- Feels friendly, fun and a little romantic; copy is either clean English or natural spoken Hinglish, never awkward half-and-half.
- Opened on her phone: works on iOS Safari and Android Chrome, big tap targets, no horizontal scroll; still looks good on desktop.
- Plain HTML, CSS and vanilla JS (ES modules). No build step, no backend, no paid services, no accounts.
- Total page weight under ~3 MB (target ~1.5 MB).
- No copyrighted film stills, posters or soundtrack audio. No Family Guy material (saved for a future date).
- **Privacy:** the repo and site are public, so:
  - The only names that appear anywhere (code, copy, commits, preview card) are "Parche" and "Nish".
  - No phone number is stored anywhere.
  - No analytics or tracking.
  - `<meta name="robots" content="noindex, nofollow">`.
- Live URL: `https://nishantguglani.github.io/Date/` (repo `nishantguglani/Date`, `main` branch, root).

## 2. Visual direction: "A · Aged paper letter"

- Every screen is the letter itself: cream aged paper (`#f4ead5`) with faint red ruled lines, a subtle film-grain overlay and a soft brown vignette.
- Palette (CSS custom properties):
  - deep red `#9b1c1c` (ink, primary buttons)
  - bottle green `#3d5a2a`
  - mustard gold `#d4a017`
  - cream `#f4ead5`
  - ink brown `#3b2a1f`
  - film black `#2b2b2b`
- Fonts (Google Fonts, preconnect + preload, `display=swap`):
  - **Caveat** for handwriting (questions, captions, buttons)
  - **Special Elite** for typewriter "movie" bits (clapper headers, ticket text)
- Persistent chrome on every scene:
  - a film-strip progress bar at the top (one frame per scene; done and current frames are gold)
  - a clapper header "SCENE N · TAKE 1"
  - a ← Back button (Scene 2 onwards)
  - a vinyl-record mute/unmute toggle, bottom-right
  - the travelling gnome, in a different corner each scene
- Scene transition: a clapper snap plus a horizontal film-frame slide, ~450 ms.
- Artwork is hand-drawn inline SVG made for this project: envelope, wax seal, gnome and his polaroids, chalk arrows, doodled hearts, film tickets, plate, favicon.
- Contrast: body text and buttons meet WCAG AA against cream. The minimum font size on a 375 px phone is 16 px; handwriting text is ≥ 22 px.

### Amélie nods (no copyrighted material)

1. **Travelling gnome with polaroids:** in each scene the gnome holds a tiny polaroid of himself at a Delhi spot: India Gate, Sunder Nursery, Hauz Khas, Qutub Minar, a Nirula's cup, Lodhi Garden, and so on.
2. **Blue chalk arrows:** every nudge is a hand-drawn blue chalk arrow (pointing at "Dono? 😏", and at "Next").
3. **Crème brûlée crack:** breaking the wax seal plays a crack sound (synthesised with Web Audio, no file) and a crack animation on the seal.
4. **Café des 2 Moulins:** the Scene 4 menu card is headed "Café des 2 Moulins · Menu du jour".
5. **Film quote:** a tiny footer on the envelope screen: *"Les temps sont durs pour les rêveurs."*
6. **French finale title:** "Ce n'est que le début ✨".

## 3. Architecture

```
Date/
├── index.html            meta/OG tags, font preloads, film strip, mute button, <main id="stage">
├── .nojekyll
├── css/style.css         theme tokens, paper/grain/vignette, components, transitions, reduced-motion
├── js/
│   ├── config.js         event dates, slider range/step/default, music volume, event duration, site URL
│   ├── copy.js           every user-facing string, one object grouped by scene
│   ├── state.js          answers object + get/set/reset
│   ├── app.js            scene router: order, show(n), back(), transitions, film-strip progress
│   ├── fx.js             confetti (hearts + tickets), gnome placement, audio + mute, seal-crack sound
│   ├── logic.js          pure functions: time↔slider, caption band, WhatsApp text, calendar URL, sequel flag
│   ├── ticket.js         draws the ADMIT TWO ticket on <canvas> (1080×1350) → PNG blob
│   └── scenes/
│       ├── envelope.js  s1-question.js  s2-day.js  s3-activities.js
│       └── s4-food.js   s5-dessert.js   s6-time.js  finale.js
├── assets/
│   ├── music.mp3         royalty-free waltz (~1 MB)
│   ├── success-kid.jpg   ~40 KB, supplied by Nish
│   ├── og-image.png      1200×630, generated from assets/og-image.svg
│   ├── og-image.svg
│   └── favicon.svg       heart
├── tests/logic.test.js   node --test
└── README.md             editing copy, config, music source + licence, deploy notes
```

**Contracts**
- Each scene module exports `render(stage, ctx)`, where `ctx = { state, copy, config, next, fx }`. It builds its own DOM inside `stage`, wires up its own events, and calls `ctx.next()` when done. Scenes never import each other.
- `app.js` owns the scene order: `envelope → s1 → s2 → s3 → s4 → s5 → s6 → finale`. It tears down the previous scene (removing listeners) before rendering the next one, and keeps a history stack for Back.
- `logic.js` has no DOM access, so it can be tested in Node.
- **State** (in memory only, nothing persisted; a refresh starts over):
  ```js
  { day: null | 'sat' | 'sun',
    activities: [],  activityOther: '',
    food: [],        foodOther: '',
    dessert: null | 'yes' | 'obviously',
    time: 32 }        // slider index = (minutes after 10:00 AM) / 15; 32 = 6:00 PM
  ```
- Back re-renders the earlier scene with her previous answers pre-selected.

## 4. Flow and interactions

### Envelope
- A sealed envelope with "For Parche 💌" handwritten on it, a "tap to open" hint, and the film quote as a footer.
- First tap:
  - crème brûlée crack sound and the seal cracks
  - the flap opens and the letter slides up
  - music starts: volume fades from 0 to 0.4 over 2 s, looping. This tap is what unlocks audio on iOS.
- The letter reads: "Ek chhoti si film banayi hai... sirf tumhare liye 🎬", with a "Roll camera →" button.

### Scene 1: The big question
- **Question:** "Parche, will you go on a date with me? 😊". **Buttons:** "Yes! 💖" and "No".
- **"No" dodges:**
  - On touch it moves on `pointerdown`/`touchstart` (with `preventDefault`), so no click ever registers.
  - On desktop it moves when the pointer comes within ~80 px.
  - Its new position is random, clamped inside the viewport (respecting safe-area insets), and never overlapping "Yes".
- **Each dodge:**
  - "Yes" grows ×1.08 (capped at ×1.8) and "No" shrinks ×0.92 (floor ×0.55).
  - The "No" label steps through: "Are you sure?" → "Think again 🥺" → "Wrong button, Parche" → "Dil tod dogi? 💔" → "Arre yaar..." → "Ab toh maan jao 🙏", then stays on the last one.
- **Keyboard:** "No" has `aria-disabled="true"` and shakes on Enter/Space.
- **On "Yes":**
  - a heart burst, then the **Success Kid** image pops in with a stamp-bounce (no text)
  - it advances automatically after ~1.8 s

### Scene 2: Saturday or Sunday?
- **Question:** "Saturday or Sunday? 🗓️".
- Two flip cards: **SAT 24 OCT** and **SUN 25 OCT**.
  - Tapping one flips it. Saturday reads "Saturday it is! Weekend starts with you ✨"; Sunday reads "Sunday it is! Lazy, lovely, perfect ☕".
- **Nudge:** after her first pick, "Dono? 😏" pulses, a blue chalk arrow points at it, and the hint reads "psst... ek aur option hai 👀".
  - Tapping Dono wiggles it, shows "Lalchi... pehle ek toh chuno 😂", un-flips both cards, and clears `day`.
  - Her next pick shows "Next" straight away.
  - If she never taps Dono, "Next" appears 4 s after a pick anyway.
- Only one day can be chosen. Picking the other card un-flips the first.

### Scene 3: What should we do? (multi-select)
- **Question:** "What should we do? 🎟️".
- **Tickets (vintage tear-off stubs):** 🎬 Movie · 🧺 Picnic in the park · 🏛️ Museum date · 🌿 Walk in Sunder Nursery · ✨ Surprise me.
  - Selecting one plays a small tear animation and a red "ADMIT ✓" stamp. Tapping again deselects it.
- **Input:** "Something else? Write it here ✍️" (handwriting font, max 60 characters).
- "Next" appears once at least one ticket is selected or the trimmed input isn't empty.

### Scene 4: Kya khaogi? (multi-select)
- **Question:** "Kya khaogi? 😋".
- **Menu card** "Café des 2 Moulins · Menu du jour": 🍛 Butter Chicken · 🍜 Asian · 🍕 Pizza · 🥥 South Indian · 🥐 Vol-au-vent · ✨ Surprise me.
- **Input:** "Craving something else? ✍️" (max 60 characters).
- Selected dishes animate onto a plate drawn at the bottom; deselecting removes them.
- "Next" shows on the same rule as Scene 3.

### Scene 5: Nirula's dessert
- **Question:** "And dessert at Nirula's? 🍨 (Hot Chocolate Fudge, obviously)".
- **Buttons:** "Yes" and "Obviously yes" (each sets `dessert` and advances).
- A tiny "No": tapping it plays a melting animation and it turns into a "Yes" button.

### Scene 6: Pick-up time (copy unchanged)
- **Question:** "Kitne baje lene aaun? 🚗".
- A native `<input type="range">` with a large custom thumb: min 0, max 44, step 1 (10:00 AM to 9:00 PM in 15-minute steps), default 32 (6:00 PM).

- The selected time is shown in large handwritten numerals, e.g. "6:15 PM".
- The sky behind crossfades through four stops: morning sun → golden afternoon → pink sunset → navy night. Stars twinkle from 7:00 PM.
- **Caption bands:**

  | Time | Caption |
  |---|---|
  | 10:00–11:45 | "Subah subah? Wow, dedication 😮" |
  | 12:00–15:45 | "Lunch date vibes 🌤️" |
  | 16:00–18:15 | "Golden hour 😍" |
  | 18:30–19:15 | "Sunset aur tum 🌅" |
  | 19:30–21:00 | "Raat ki taaron mein ✨" |

- "Next" is always visible here.

### Finale
- **Title:** "Ce n'est que le début ✨", with "(it's only the beginning)" handwritten underneath.
- Heart and film-ticket confetti.
- **ADMIT TWO ticket** prints in. It reads "Starring Parche & Nish" and includes:
  - day and date
  - activities (plus the custom one)
  - food (plus the custom one)
  - dessert
  - pick-up time
- **If `day === 'sat'`:**
  - the ticket gets a "Coming soon: Sunday 🎞️" line
  - under the ticket: *"Picture abhi baaki hai mere dost" 🎬 Sunday ka sequel? We'll plan it together 😉*
- **Rolling credits:** "Starring: Parche · Written & Directed by: Nish · Produced by: Bahut saari himmat 😅".
- **Exactly two buttons:**
  1. **"Send on WhatsApp 💌"** opens `https://wa.me/?text=<encoded>` (no number), so WhatsApp's share sheet lets her pick Nish. The message is a formatted summary with emojis and line breaks, built by `logic.whatsAppText(state)`.
  2. **"Save the ticket 🎟️"**, all in the same tap:
     - triggers a PNG download of the pre-rendered ticket canvas (`for-parche-ticket.png`)
     - opens Google Calendar in a new tab via `window.open`:
       `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Date%20with%20Nish%20%F0%9F%92%96&dates=<start>/<end>&ctz=Asia/Kolkata&details=<plans>`
       - start = chosen day and pick-up time; end = start + 4 h (`config.EVENT_HOURS`)
       - `details` lists activities, food and dessert
     - The canvas is drawn when the finale loads (after `document.fonts.ready`), so the tap does no async work before `window.open` and the popup isn't blocked.

### Removed from the original brief
- The "Our song 🎵" button and `SONG_URL`.
- The "Phir se dekhna hai? 🔁" replay link.
- The `WHATSAPP_NUMBER` constant.
- "The End... ya shuruaat?".
- "Mujhe pata tha 😌" (replaced by Success Kid).
- The likes/dislikes narrator card.
- Family Guy references.

## 5. Audio

- **Music:** a royalty-free accordion or piano waltz from Pixabay Music (Pixabay Content License: free reuse, no attribution required; credited in the README anyway). Re-encoded to roughly 1 MB, looped, volume 0.4.
  - **Before downloading, confirm the exact track, URL and size with Nish.**
- **Mute toggle:** on every screen, with `aria-pressed`. The vinyl spins while music plays.
- If `audio.play()` rejects, the page carries on silently and the toggle shows muted.

## 6. Motion and accessibility

- Animations use CSS transforms and opacity, with JS only to trigger them.
- `prefers-reduced-motion: reduce`:
  - flips, slides, confetti and the melt become ≤ 150 ms fades
  - "No" still relocates, but without animating
  - the sky changes without the crossfade
- Every control is a real `<button>`, `<input>` or `<label>`, with visible focus rings. Multi-select tickets and dishes are `<button aria-pressed>`.
- The page language is `lang="en"`, and Hinglish lines are left as they are.

## 7. Link preview and meta

- `og:title`: "For Parche 💌".
- `og:description`: "Ek chhoti si film, sirf tumhare liye 🎬 Tap to open."
- `og:image`: absolute URL `https://nishantguglani.github.io/Date/assets/og-image.png`, 1200×630. Hand-made SVG of the sealed envelope with a small clapperboard, rendered to PNG. No Success Kid.
- Also: `og:type website`, `og:url`, `twitter:card summary_large_image`, `theme-color #f4ead5`, the viewport meta with `viewport-fit=cover`, and an SVG heart favicon plus an apple-touch-icon PNG.

## 8. Testing

- **`node --test tests/`** covers `logic.js`:
  - slider index → time label (0 → 10:00 AM, 32 → 6:00 PM, 44 → 9:00 PM)
  - caption band edges
  - WhatsApp text: includes custom answers, is URL-encoded and round-trips through `decodeURIComponent`
  - calendar URL: Sat/Sun dates, `ctz=Asia/Kolkata`, +4 h end, details
  - the sequel flag is true only for Saturday
- **Browser-pane run** at 375×667 (iPhone SE) and 412×915 (large Android) with touch emulation:
  - the full flow end to end
  - "No" never accepts a tap, stays on screen and doesn't overlap "Yes"
  - the Dono loop
  - Back keeps her answers
  - multi-select and custom inputs
  - the melting "No"
  - dragging the slider through all bands
  - the decoded WhatsApp link
  - the PNG blob (1080×1350, inspected visually)
  - the calendar URL
  - no horizontal overflow, no console errors, total transfer < 3 MB
- **Not covered here:** real iOS Safari and Android devices. The README includes a 2-minute checklist to run on Nish's own phone before sharing.

## 9. Deployment

- Commits are pushed to `nishantguglani/Date` (`main`) as work progresses.
- **GitHub Pages stays off until Nish approves the local preview.** Then enable Pages with source `main`, root `/` (`gh api -X POST repos/nishantguglani/Date/pages -f "source[branch]=main" -f "source[path]=/"`) and verify the live URL.
- Send the link to yourself first to check the WhatsApp preview, after the final tweaks, because WhatsApp caches previews.
