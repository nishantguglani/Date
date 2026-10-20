import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copy } from '../js/copy.js';
import { timeLabel, captionFor, skyWeights, starsVisible } from '../js/logic.js';

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
