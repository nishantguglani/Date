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
