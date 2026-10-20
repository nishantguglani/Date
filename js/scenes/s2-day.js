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
