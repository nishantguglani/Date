import { toggleIn, canProceed } from './logic.js';

export function restartAnimation(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// Wires a set of aria-pressed buttons plus a free-text input to state[listKey] / state[otherKey].
export function bindMultiSelect({ buttons, input, nextBtn, state, listKey, otherKey, signal, onChange = () => {} }) {
  const sync = () => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(state[listKey].includes(b.dataset.id))));
    nextBtn.hidden = !canProceed(state[listKey], state[otherKey]);
    onChange();
  };
  buttons.forEach(b => b.addEventListener('click', () => { toggleIn(state[listKey], b.dataset.id); sync(); }, { signal }));
  input.value = state[otherKey];
  input.addEventListener('input', () => { state[otherKey] = input.value; sync(); }, { signal });
  sync();
}
