// SVG -> PNG for the link-preview card and the iOS home-screen icon.
import { Resvg } from '@resvg/resvg-js';
import { readFile, writeFile } from 'node:fs/promises';

const jobs = [
  ['assets/og-image.svg', 'assets/og-image.png', 1200],
  ['assets/favicon.svg', 'assets/apple-touch-icon.png', 180],
];

for (const [src, out, width] of jobs) {
  const svg = await readFile(src, 'utf8');
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: '#f4ead5',
    font: { loadSystemFonts: true, defaultFontFamily: 'Georgia' },
  }).render().asPng();
  await writeFile(out, png);
  console.log(`${out} ${png.length} bytes`);
}
