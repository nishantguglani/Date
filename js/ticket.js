// Draws the ADMIT TWO ticket at 1080×1350. `p` is the object from logic.planLists().
const W = 1080;
const H = 1350;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrap(g, text, maxW, maxLines) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const t = line ? `${line} ${word}` : word;
    if (g.measureText(t).width <= maxW) { line = t; continue; }
    if (line) { lines.push(line); line = ''; }
    // A single token wider than maxW gets broken by character.
    let rest = word;
    while (rest && g.measureText(rest).width > maxW) {
      let n = rest.length - 1;
      while (n > 1 && g.measureText(rest.slice(0, n)).width > maxW) n--;
      lines.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    line = rest;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && g.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

export function drawTicket(canvas, p, copy) {
  const c = copy.finale;
  const g = canvas.getContext('2d');
  const x = 70, y = 70, w = W - 140, h = H - 140;
  const perf = y + 275;

  g.clearRect(0, 0, W, H);
  g.fillStyle = '#f4ead5';
  g.fillRect(0, 0, W, H);

  g.fillStyle = '#fffaf0';
  roundRect(g, x, y, w, h, 28);
  g.fill();
  g.strokeStyle = '#9b1c1c';
  g.lineWidth = 8;
  g.stroke();
  g.lineWidth = 3;
  roundRect(g, x + 22, y + 22, w - 44, h - 44, 18);
  g.stroke();

  // Side notches and the tear line.
  g.fillStyle = '#f4ead5';
  for (const nx of [x, x + w]) { g.beginPath(); g.arc(nx, perf, 34, 0, Math.PI * 2); g.fill(); }
  g.setLineDash([18, 14]);
  g.strokeStyle = '#c9b98f';
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(x + 50, perf); g.lineTo(x + w - 50, perf); g.stroke();
  g.setLineDash([]);

  g.textAlign = 'center';
  g.fillStyle = '#9b1c1c';
  g.font = '96px "Special Elite", "Courier New", monospace';
  g.fillText(c.admit, W / 2, y + 140);
  g.fillStyle = '#3b2a1f';
  g.font = '700 72px Caveat, cursive';
  g.fillText(c.starring, W / 2, y + 225);

  const rows = [
    ['📅', p.day],
    ['🚗', p.time],
    ['🎟️', p.activities.join(', ') || copy.summary.surprise],
    ['🍽️', p.food.join(', ') || copy.summary.surprise],
    ['🍨', p.dessert],
  ];
  let ty = perf + 95;
  g.textAlign = 'left';
  for (const [icon, text] of rows) {
    g.fillStyle = '#3b2a1f';
    g.font = '50px sans-serif';
    g.fillText(icon, x + 70, ty);
    g.font = '700 52px Caveat, cursive';
    const lines = wrap(g, text, w - 260, 2);
    lines.forEach((ln, i) => g.fillText(ln, x + 150, ty + i * 58));
    ty += lines.length * 58 + 28;
  }

  g.textAlign = 'center';
  if (p.sequel) {
    g.fillStyle = '#3d5a2a';
    g.font = '700 56px Caveat, cursive';
    g.fillText(c.comingSoon, W / 2, ty + 20);
  }
  g.fillStyle = '#9b1c1c';
  g.font = '700 60px Caveat, cursive';
  g.fillText(c.title, W / 2, y + h - 95);
  g.fillStyle = '#3b2a1f';
  g.font = '30px "Special Elite", "Courier New", monospace';
  g.fillText(c.serial, W / 2, y + h - 45);
}
