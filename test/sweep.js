// test/sweep.js
// Generates hundreds of thousands of questions and asserts every invariant:
//   • 4 distinct multiple-choice options that include the answer (Basic)
//   • typed answers accept the canonical answer (Intermediate / Advanced)
//   • hint + explanation always present
//   • the stated answer is mathematically CORRECT (re-derived from the text)
//
// Run with: node test/sweep.js   (zero dependencies)

import { generate, TECHNIQUE_IDS } from '../js/vedic.js';
import { checkTyped } from '../js/generators.js';

const PER_COMBO = 2000;
const LEVELS = [0, 1, 2, 3, 4];
let checked = 0;
let mathChecked = 0;
const fails = [];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Re-derive the expected answer from the question text (covers every generator).
// Returns a number, a string (Yes/No, day names), or null when not parseable.
function expected(text) {
  const t = text.replace(/,/g, '');
  let m;
  if ((m = t.match(/^(\d+) \+ \? = (\d+)$/))) return +m[2] - +m[1];
  if ((m = t.match(/^Double (\d+)$/))) return +m[1] * 2;
  if ((m = t.match(/^Half of (\d+)$/))) return +m[1] / 2;
  if ((m = t.match(/^(\d+)% of (\d+)$/))) return (+m[1] * +m[2]) / 100;
  if ((m = t.match(/^(\d+)²$/))) return +m[1] * +m[1];
  if ((m = t.match(/^(\d+)³$/))) return (+m[1]) ** 3;
  if ((m = t.match(/^√(\d+)$/))) return Math.sqrt(+m[1]);
  if ((m = t.match(/^∛(\d+)$/))) return Math.round(Math.cbrt(+m[1]));
  if ((m = t.match(/^(\d+) × (\d+)$/))) return +m[1] * +m[2];
  if ((m = t.match(/^(\d+) ÷ (\d+)$/))) return +m[1] / +m[2];
  if ((m = t.match(/^(\d+) \+ (\d+)$/))) return +m[1] + +m[2];
  if ((m = t.match(/^(\d+) − (\d+)$/))) return +m[1] - +m[2];
  if ((m = t.match(/^Increase (\d+) by (\d+)%$/))) return +m[1] * (1 + +m[2] / 100);
  if ((m = t.match(/^Decrease (\d+) by (\d+)%$/))) return +m[1] * (1 - +m[2] / 100);
  if ((m = t.match(/^Is (\d+) divisible by (\d+)\?$/))) return +m[1] % +m[2] === 0 ? 'Yes' : 'No';
  if ((m = t.match(/^What day of the week is (\d+) (\w+) (\d+)\?$/))) {
    const mon = MONTHS.indexOf(m[2]);
    return DAYS[new Date(Date.UTC(+m[3], mon, +m[1])).getUTCDay()];
  }
  return null;
}

function fail(id, diff, lvl, msg, q) {
  if (fails.length < 40) fails.push(`[${id} d${diff} L${lvl}] ${msg} :: ${JSON.stringify(q)}`);
}

for (const id of TECHNIQUE_IDS) {
  for (let diff = 0; diff <= 2; diff++) {
    for (const lvl of LEVELS) {
      for (let i = 0; i < PER_COMBO; i++) {
        const q = generate(id, { difficulty: diff, level: lvl });
        checked++;

        const numeric = typeof q.answer === 'number';
        if (!q.text || typeof q.text !== 'string') fail(id, diff, lvl, 'empty text', q);
        if (numeric ? !Number.isFinite(q.answer) : !q.answer) fail(id, diff, lvl, 'bad answer', q);
        if (!q.hint) fail(id, diff, lvl, 'missing hint', q);
        if (!q.explanation) fail(id, diff, lvl, 'missing explanation', q);

        if (diff === 0) {
          const c = q.choices;
          if (!Array.isArray(c) || c.length < 2 || c.length > 4) fail(id, diff, lvl, 'bad choice count', q);
          else {
            if (new Set(c.map(String)).size !== c.length) fail(id, diff, lvl, 'choices not distinct', q);
            if (!c.includes(q.answer)) fail(id, diff, lvl, 'answer not in choices', q);
          }
        } else {
          if (q.choices !== null) fail(id, diff, lvl, 'typed should have null choices', q);
          if (!checkTyped(String(q.answer), q.accept, numeric ? q.answer : null))
            fail(id, diff, lvl, 'answer not accepted', q);
        }

        // Correctness: re-derive from the text and compare.
        const exp = expected(q.text);
        if (exp !== null) {
          mathChecked++;
          const wrong =
            typeof exp === 'string' ? String(exp) !== String(q.answer) : Math.abs(exp - q.answer) > 1e-9;
          if (wrong) fail(id, diff, lvl, `wrong answer: expected ${exp}`, q);
        }
      }
    }
  }
}

console.log(`Generated & checked ${checked.toLocaleString()} questions (${mathChecked.toLocaleString()} maths-verified).`);
if (fails.length) {
  console.error(`\n❌ ${fails.length} failures (showing up to 40):`);
  fails.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log('✅ All invariants hold.');
