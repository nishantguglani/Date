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
