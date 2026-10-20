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
