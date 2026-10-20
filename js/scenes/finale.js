export function render(stage, { next, signal }) {
  stage.innerHTML = '<h1 class="q" tabindex="-1">Stub scene</h1><button class="btn next" type="button">Next →</button>';
  stage.querySelector('.next').addEventListener('click', next, { signal });
}
