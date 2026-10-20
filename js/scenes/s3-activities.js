import { bindMultiSelect } from '../ui.js';

export function render(stage, { state, copy, config, next, signal }) {
  const c = copy.s3;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <div class="stubs">${c.options.map(o => `
      <button class="stub" type="button" data-id="${o.id}" aria-pressed="false">
        <span>${o.emoji} ${o.label}</span><span class="stamp" aria-hidden="true">${c.stamp}</span>
      </button>`).join('')}
    </div>
    <label class="sr-only" for="act-other">${c.placeholder}</label>
    <input id="act-other" class="write" type="text" maxlength="${config.INPUT_MAX}" placeholder="${c.placeholder}" autocomplete="off" enterkeyhint="done">
    <button class="btn next" type="button" hidden>${copy.chrome.next}</button>`;

  bindMultiSelect({
    buttons: [...stage.querySelectorAll('.stub')],
    input: stage.querySelector('.write'),
    nextBtn: stage.querySelector('.next'),
    state, listKey: 'activities', otherKey: 'activityOther', signal,
  });
  stage.querySelector('.next').addEventListener('click', next, { signal });
}
