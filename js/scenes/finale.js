import { planLists, whatsAppText, whatsAppUrl, calendarUrl } from '../logic.js';
import { drawTicket } from '../ticket.js';

export function render(stage, { state, copy, fx, signal }) {
  const c = copy.finale;
  const p = planLists(state, copy);
  stage.classList.add('finale');
  stage.innerHTML = `
    <h1 class="title" tabindex="-1">${c.title}</h1>
    <p class="subtitle">${c.subtitle}</p>
    <div class="ticket-wrap">
      <canvas class="ticket-canvas" width="1080" height="1350" role="img" aria-label="${c.ticketAlt}"></canvas>
    </div>
    ${p.sequel ? `<p class="sequel"><strong>${c.sequelQuote}</strong>${c.sequelLine}</p>` : ''}
    <div class="credits"><div class="credits-roll">${c.credits.map(l => `<p>${l}</p>`).join('')}</div></div>
    <div class="finale-actions">
      <a class="btn green" href="${whatsAppUrl(whatsAppText(state, copy))}" target="_blank" rel="noopener">${c.whatsapp}</a>
      <button class="btn gold save" type="button">${c.save}</button>
    </div>`;

  const canvas = stage.querySelector('canvas');
  // Draw now with whatever fonts are ready, then again once Caveat / Special Elite load.
  drawTicket(canvas, p, copy);
  Promise.all([document.fonts.load('700 72px Caveat'), document.fonts.load('48px "Special Elite"')])
    .catch(() => {})
    .then(() => { if (!signal.aborted) drawTicket(canvas, p, copy); });

  fx.confetti();

  // No awaits in here, so window.open still counts as part of the tap and isn't blocked.
  stage.querySelector('.save').addEventListener('click', () => {
    window.open(calendarUrl(state, copy), '_blank', 'noopener');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = c.ticketFile;
    document.body.append(a);
    a.click();
    a.remove();
  }, { signal });
}
