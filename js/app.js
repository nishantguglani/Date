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
