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
      <img class="ticket-canvas" width="1080" height="1350" alt="${c.ticketAlt}">
    </div>
    <p class="ticket-tip" hidden></p>
    ${p.sequel ? `<p class="sequel"><strong>${c.sequelQuote}</strong>${c.sequelLine}</p>` : ''}
    <div class="credits"><div class="credits-roll">${c.credits.map(l => `<p>${l}</p>`).join('')}</div></div>
    <div class="finale-actions">
      <a class="btn green" href="${whatsAppUrl(whatsAppText(state, copy))}" target="_blank" rel="noopener">${c.whatsapp}</a>
      <button class="btn gold save" type="button">${c.save}</button>
    </div>`;

  // The canvas stays off-screen; the visible ticket is an <img> so it can be long-pressed to save.
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const img = stage.querySelector('.ticket-canvas');
  const draw = () => {
    drawTicket(canvas, p, copy);
    img.src = canvas.toDataURL('image/png');
  };
  // Draw now with whatever fonts are ready, then again once Caveat / Special Elite load.
  draw();
  (document.fonts
    ? Promise.all([document.fonts.load('700 72px Caveat'), document.fonts.load('48px "Special Elite"')])
    : Promise.resolve())
    .catch(() => {})
    .then(() => { if (!signal.aborted) draw(); });

  // iOS and in-app browsers ignore a[download], so point people at long-press.
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || /FBAN|FBAV|Instagram|WhatsApp|Line\//.test(ua)) {
    const tip = stage.querySelector('.ticket-tip');
    tip.textContent = 'Tip: long-press the ticket to save it 📲';
    tip.hidden = false;
  }

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
