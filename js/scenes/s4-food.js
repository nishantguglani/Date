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
    <div class="plate-row">
      <div class="plate" aria-hidden="true">${plate}<div class="plate-items"></div></div>
      <button class="btn next" type="button" hidden>${copy.chrome.next}</button>
    </div>`;

  const items = stage.querySelector('.plate-items');
  let restoring = true; // first draw: whatever is already on the plate just sits there
  const drawPlate = () => {
    const emojis = c.options.filter(o => state.food.includes(o.id)).map(o => o.emoji);
    if (state.foodOther.trim()) emojis.push('✍️');
    const already = new Set([...items.children].map(s => s.textContent));
    items.replaceChildren(...emojis.map(e => {
      const s = document.createElement('span');
      s.textContent = e;
      if (restoring || already.has(e)) s.className = 'stay';
      return s;
    }));
    restoring = false;
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
