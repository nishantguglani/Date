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
python -m http.server 8090
```

Open http://localhost:8090. Don't open `index.html` directly: modules and audio need http.

## Tests

```bash
npm test
```

## Music

"French Accordion Acoustic Guitar Paris Waltz" by Denis-Pavlov-Music, from Pixabay (https://pixabay.com/music/folk-french-accordion-acoustic-guitar-paris-waltz-241227/), used under the [Pixabay Content License](https://pixabay.com/service/license-summary/). It is trimmed to 2:30 and re-encoded to mono 56 kbps.

## Before sharing: 2-minute phone check

On your own phone (iPhone Safari and/or Android Chrome):

1. Open the link. The envelope shows and the page doesn't scroll sideways.
2. Tap the envelope. You hear the crack and the music fades in. (On iPhone, also try with the silent switch on.)
3. Try to tap "No" a few times. It runs away and never gets pressed.
4. Pick a day, tap "Dono?", see "Lalchi...", then pick again.
5. Finish the flow and tap **Send on WhatsApp**. WhatsApp opens with the summary, and you choose the contact.
6. Tap **Save the ticket**. Google Calendar opens with the right date and time, and the ticket PNG downloads (on iPhone and inside in-app browsers, long-press the ticket to save it instead).
7. Send the link to yourself on WhatsApp and check the preview card. WhatsApp caches previews, so do this last.

## Deploy

GitHub Pages serves `main` from the repo root (`.nojekyll` is included).
