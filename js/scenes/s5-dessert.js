export function render(stage, { state, copy, next, signal, after }) {
  const c = copy.s5;
  stage.innerHTML = `
    <h1 class="q" tabindex="-1">${c.question}</h1>
    <p class="aside">${c.aside}</p>
    <div class="sundae" aria-hidden="true">🍨</div>
    <div class="dessert-row">
      <button class="btn" type="button" data-v="yes">${c.yes}</button>
      <button class="btn gold" type="button" data-v="obviously">${c.obviously}</button>
      <button class="tiny-no" type="button">${c.no}</button>
    </div>`;

  const choose = v => { state.dessert = v; next(); };
  stage.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => choose(b.dataset.v), { signal }));

  const tiny = stage.querySelector('.tiny-no');
  tiny.addEventListener('click', () => {
    if (tiny.classList.contains('melted')) { choose('yes'); return; }
    if (tiny.classList.contains('melt')) return;
    tiny.classList.add('melt');
    after(650, () => {
      tiny.className = 'btn melted';
      tiny.textContent = c.yes;
    });
  }, { signal });
}
