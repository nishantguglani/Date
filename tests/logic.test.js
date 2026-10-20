import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copy } from '../js/copy.js';
import { timeLabel, captionFor, skyWeights, starsVisible, dodgeScales, noLabel, pickSpot, toggleIn, canProceed } from '../js/logic.js';

test('timeLabel maps slider index to a 12-hour label', () => {
  assert.equal(timeLabel(0), '10:00 AM');
  assert.equal(timeLabel(1), '10:15 AM');
  assert.equal(timeLabel(8), '12:00 PM');
  assert.equal(timeLabel(32), '6:00 PM');
  assert.equal(timeLabel(33), '6:15 PM');
  assert.equal(timeLabel(44), '9:00 PM');
});

test('captionFor respects band edges', () => {
  const c = copy.s6.captions;
  assert.equal(captionFor(0, copy), c.morning);
  assert.equal(captionFor(7, copy), c.morning);   // 11:45
  assert.equal(captionFor(8, copy), c.lunch);     // 12:00
  assert.equal(captionFor(23, copy), c.lunch);    // 15:45
  assert.equal(captionFor(24, copy), c.golden);   // 16:00
  assert.equal(captionFor(33, copy), c.golden);   // 18:15
  assert.equal(captionFor(34, copy), c.sunset);   // 18:30
  assert.equal(captionFor(37, copy), c.sunset);   // 19:15
  assert.equal(captionFor(38, copy), c.night);    // 19:30
  assert.equal(captionFor(44, copy), c.night);    // 21:00
});

test('skyWeights blends adjacent stops and always sums to 1', () => {
  assert.deepEqual(skyWeights(0), [1, 0, 0, 0]);
  assert.deepEqual(skyWeights(16), [0, 1, 0, 0]);
  assert.deepEqual(skyWeights(25), [0, 0.5, 0.5, 0]);
  assert.deepEqual(skyWeights(34), [0, 0, 1, 0]);
  assert.deepEqual(skyWeights(44), [0, 0, 0, 1]);
  for (let i = 0; i <= 44; i++) {
    const sum = skyWeights(i).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `index ${i} sums to ${sum}`);
  }
});

test('stars appear from 7:00 PM', () => {
  assert.equal(starsVisible(35), false); // 6:45 PM
  assert.equal(starsVisible(36), true);  // 7:00 PM
});

test('dodgeScales grows Yes and shrinks No within caps', () => {
  assert.deepEqual(dodgeScales(0), { yes: 1, no: 1 });
  assert.ok(Math.abs(dodgeScales(1).yes - 1.08) < 1e-9);
  assert.ok(Math.abs(dodgeScales(1).no - 0.92) < 1e-9);
  assert.deepEqual(dodgeScales(40), { yes: 1.8, no: 0.55 });
});

test('noLabel steps through the list and sticks on the last', () => {
  assert.equal(noLabel(0, copy.s1), 'No');
  assert.equal(noLabel(1, copy.s1), 'Are you sure?');
  assert.equal(noLabel(6, copy.s1), 'Ab toh maan jao 🙏');
  assert.equal(noLabel(99, copy.s1), 'Ab toh maan jao 🙏');
});

test('pickSpot stays in bounds and avoids the Yes box', () => {
  const bounds = { left: 0, top: 0, right: 300, bottom: 600 };
  const size = { w: 100, h: 40 };
  const avoid = { left: 50, top: 250, right: 250, bottom: 350 };
  const seq = [0.5, 0.5, 0, 0];              // first try lands on Yes, second is free
  const rand = () => seq.shift();
  assert.deepEqual(pickSpot(bounds, size, avoid, rand), { x: 0, y: 0 });

  for (let n = 0; n < 200; n++) {
    const { x, y } = pickSpot(bounds, size, avoid);
    assert.ok(x >= 0 && x + 100 <= 300 && y >= 0 && y + 40 <= 600, 'in bounds');
    const hit = x < 250 && x + 100 > 50 && y < 350 && y + 40 > 250;
    assert.equal(hit, false, 'does not overlap Yes');
  }
});

test('pickSpot falls back to a free corner when random tries keep hitting', () => {
  const bounds = { left: 0, top: 0, right: 300, bottom: 600 };
  const spot = pickSpot(bounds, { w: 100, h: 40 }, { left: 50, top: 250, right: 250, bottom: 350 }, () => 0.5);
  assert.deepEqual(spot, { x: 0, y: 0 });
});

test('toggleIn adds then removes', () => {
  const list = [];
  assert.equal(toggleIn(list, 'movie'), true);
  assert.deepEqual(list, ['movie']);
  assert.equal(toggleIn(list, 'movie'), false);
  assert.deepEqual(list, []);
});

test('canProceed needs a pick or non-blank text', () => {
  assert.equal(canProceed([], ''), false);
  assert.equal(canProceed([], '   '), false);
  assert.equal(canProceed(['pizza'], ''), true);
  assert.equal(canProceed([], 'Bowling'), true);
});
