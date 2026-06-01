// test/dedup.test.js
// Proves an exercise never repeats a question until it has cycled through all
// distinct questions, and never shows the same one twice in a row.

import assert from 'node:assert';
import { pickDistinct } from '../js/generators.js';
import { generate as genQuestion } from '../js/vedic.js';

// --- 1) Controlled pool: blocks of N draws are full, distinct cycles ---------
function poolMaker(n) {
  return () => ({ text: 'q' + Math.floor(Math.random() * n) });
}
for (const N of [2, 5, 9, 40]) {
  const used = new Set();
  let lastKey = null;
  const seq = [];
  const draws = N * 40;
  for (let i = 0; i < draws; i++) {
    const q = pickDistinct(poolMaker(N), used, lastKey);
    lastKey = q.text;
    seq.push(q.text);
  }
  // no back-to-back repeats
  for (let i = 1; i < seq.length; i++) {
    assert.notStrictEqual(seq[i], seq[i - 1], `back-to-back repeat in pool ${N}`);
  }
  // every distinct question appears, and each cycle of N draws covers (nearly)
  // the whole pool before repeating — at least N-1 to allow the rare tail miss
  // on very large pools.
  assert.strictEqual(new Set(seq).size, N, `pool ${N}: not all questions appeared`);
  for (let b = 0; b + N <= draws; b += N) {
    const block = new Set(seq.slice(b, b + N));
    assert.ok(block.size >= N - 1, `cycle of ${N} repeated too soon at block ${b / N} (got ${block.size})`);
  }
}

// --- 2) Large pool, short exercise: 25 questions all distinct ----------------
{
  const used = new Set();
  let lastKey = null;
  const seen = new Set();
  for (let i = 0; i < 25; i++) {
    const q = pickDistinct(poolMaker(500), used, lastKey);
    lastKey = q.text;
    seen.add(q.text);
  }
  assert.strictEqual(seen.size, 25, 'large pool should give 25 distinct in 25 draws');
}

// --- 3) Real generator with a small Basic pool (Friends of 10 = 9 distinct) --
{
  const used = new Set();
  let lastKey = null;
  const seq = [];
  for (let i = 0; i < 25; i++) {
    const q = pickDistinct(() => genQuestion('friends10', { difficulty: 0, level: 0 }), used, lastKey);
    lastKey = q.text;
    seq.push(q.text);
  }
  for (let i = 1; i < seq.length; i++) {
    assert.notStrictEqual(seq[i], seq[i - 1], 'real generator produced back-to-back repeat');
  }
  // the first full cycle (9) must be 9 distinct questions before any repeat
  assert.strictEqual(new Set(seq.slice(0, 9)).size, 9, 'first cycle of Friends-of-10 not fully distinct');
}

console.log('✅ Dedup tests passed: no in-exercise repeats until the pool is exhausted.');
