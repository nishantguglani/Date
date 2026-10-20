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
