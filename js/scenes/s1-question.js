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
    const size = { w: no.offsetWidth * s.no, h: no.offsetHeight * s.no };
    // Keep below the question too, but never squeeze out more than the top half of the screen.
    const qBottom = stage.querySelector('.q').getBoundingClientRect().bottom + 8;
    const top = Math.max(84 + inset.top, Math.min(qBottom, vh / 2));
    const bounds = { left: 12 + inset.left, top, right: vw - 12 - inset.right, bottom: vh - 76 - inset.bottom };
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
    if (document.activeElement === no) yes.focus();
    no.hidden = true;
    stage.querySelector('.kid').hidden = false;
    after(config.YES_ADVANCE_MS, next);
  }, { signal });
}
