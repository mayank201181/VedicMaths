// test/audit.js
// FULL correctness audit. For a very large sample of generated questions it
// proves two things, the way a child actually experiences them:
//
//   1. ANSWER KEY is correct — an INDEPENDENT oracle re-computes the answer
//      purely from the DISPLAYED question text (never from the generator's
//      internals), so any text↔answer mismatch is caught.
//
//   2. GRADING is correct — the REAL grading the app uses is run against:
//        • the true answer (must be marked RIGHT)
//        • a battery of deliberately-wrong answers (must be marked WRONG)
//      for both multiple-choice (Basic) and typed (Intermediate/Advanced).
//
// Goal: zero "right marked wrong" and zero "wrong marked right".
// Run with:  node test/audit.js   (zero dependencies)

import { generate, TECHNIQUE_IDS } from '../js/vedic.js';
import { checkTyped } from '../js/generators.js';

const PER_COMBO = Number(process.env.PER_COMBO || 5000);
const LEVELS = [0, 1, 2, 3, 4];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---- INDEPENDENT ORACLE: compute the answer from the displayed text only ----
function truth(text) {
  const t = text.replace(/,/g, '');
  let m;
  if ((m = t.match(/^(\d+) \+ \? = (\d+)$/))) return +m[2] - +m[1];
  if ((m = t.match(/^Double (\d+)$/))) return 2 * +m[1];
  if ((m = t.match(/^Half of (\d+)$/))) return +m[1] / 2;
  if ((m = t.match(/^(\d+)% of (\d+)$/))) return (+m[1] * +m[2]) / 100;
  if ((m = t.match(/^Increase (\d+) by (\d+)%$/))) return (+m[1] * (100 + +m[2])) / 100;
  if ((m = t.match(/^Decrease (\d+) by (\d+)%$/))) return (+m[1] * (100 - +m[2])) / 100;
  if ((m = t.match(/^(\d+)²$/))) return +m[1] * +m[1];
  if ((m = t.match(/^(\d+)³$/))) return +m[1] * +m[1] * +m[1];
  if ((m = t.match(/^√(\d+)$/))) return Math.round(Math.sqrt(+m[1]));
  if ((m = t.match(/^∛(\d+)$/))) return Math.round(Math.cbrt(+m[1]));
  if ((m = t.match(/^(\d+) × (\d+)$/))) return +m[1] * +m[2];
  if ((m = t.match(/^(\d+) ÷ (\d+)$/))) return +m[1] / +m[2];
  if ((m = t.match(/^(\d+) \+ (\d+)$/))) return +m[1] + +m[2];
  if ((m = t.match(/^(\d+) − (\d+)$/))) return +m[1] - +m[2];
  if ((m = t.match(/^Is (\d+) divisible by (\d+)\?$/))) return +m[1] % +m[2] === 0 ? 'Yes' : 'No';
  if ((m = t.match(/^What day of the week is (\d+) (\w+) (\d+)\?$/))) {
    return DAYS[new Date(Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1])).getUTCDay()];
  }
  return undefined; // unparseable → audit fails (we require 100% coverage)
}

const eq = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);

// ---- EXACT replicas of how the app grades (see js/app.js) -------------------
const gradeMC = (choiceValue, q) => choiceValue === q.answer; // app: `c === q.answer`
const gradeTyped = (input, q) => checkTyped(input, q.accept, q.answer); // app: same call

// Deliberately-wrong answers a child might type.
function wrongTyped(ans) {
  if (typeof ans === 'string') {
    const pool = ['Yes', 'No', 'Maybe', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday', 'Noneday', '42', ''];
    return pool.filter((x) => x !== ans);
  }
  const w = new Set([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans * 2, ans + 100]);
  w.delete(ans);
  const out = [...w].filter((x) => Number.isFinite(x)).map(String);
  out.push(String(ans) + 'x'); // malformed: must NOT be read as the number
  out.push(String(ans) + '0'); // a different number
  return out;
}

let qChecked = 0;
let keyChecked = 0;
let gradeChecks = 0;
const fails = [];
const fail = (id, d, l, msg, q) => {
  if (fails.length < 50) fails.push(`[${id} d${d} L${l}] ${msg} :: text=${JSON.stringify(q.text)} answer=${JSON.stringify(q.answer)}`);
};

const t0 = Date.now();
for (const id of TECHNIQUE_IDS) {
  for (let d = 0; d <= 2; d++) {
    for (const l of LEVELS) {
      for (let i = 0; i < PER_COMBO; i++) {
        const q = generate(id, { difficulty: d, level: l });
        qChecked++;

        // (1) ANSWER KEY vs independent oracle
        const truthVal = truth(q.text);
        if (truthVal === undefined) {
          fail(id, d, l, 'oracle could not parse text (unverified!)', q);
          continue;
        }
        keyChecked++;
        if (!eq(truthVal, q.answer)) {
          fail(id, d, l, `ANSWER KEY WRONG: oracle=${truthVal}`, q);
          continue; // grading checks below would be meaningless
        }

        // (2) GRADING
        if (d === 0) {
          // multiple choice
          if (!Array.isArray(q.choices) || !q.choices.some((c) => eq(c, truthVal))) {
            fail(id, d, l, 'true answer not among choices', q);
          }
          const rightCount = q.choices.filter((c) => eq(c, truthVal)).length;
          if (rightCount !== 1) fail(id, d, l, `expected exactly 1 correct choice, got ${rightCount}`, q);
          for (const c of q.choices) {
            gradeChecks++;
            const shouldBeRight = eq(c, truthVal);
            if (gradeMC(c, q) !== shouldBeRight)
              fail(id, d, l, `MC mis-grade for choice ${JSON.stringify(c)} (expected ${shouldBeRight})`, q);
          }
        } else {
          // typed: true answer (and tidy variants) accepted
          gradeChecks++;
          if (!gradeTyped(String(q.answer), q)) fail(id, d, l, 'TYPED rejected the true answer', q);
          if (typeof q.answer === 'number') {
            for (const ok of [` ${q.answer} `, `${q.answer}.0`, `0${q.answer}`]) {
              gradeChecks++;
              if (!gradeTyped(ok, q)) fail(id, d, l, `TYPED rejected valid form ${JSON.stringify(ok)}`, q);
            }
          }
          // deliberately-wrong answers rejected
          for (const bad of wrongTyped(q.answer)) {
            gradeChecks++;
            if (gradeTyped(bad, q)) fail(id, d, l, `TYPED accepted WRONG answer ${JSON.stringify(bad)}`, q);
          }
        }
      }
    }
  }
}

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(
  `Audited ${qChecked.toLocaleString()} questions in ${secs}s\n` +
    `  • answer keys verified by independent oracle: ${keyChecked.toLocaleString()}\n` +
    `  • grading decisions checked (right + wrong): ${gradeChecks.toLocaleString()}`
);
if (fails.length) {
  console.error(`\n❌ ${fails.length} problem(s) found (showing up to 50):`);
  fails.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log('\n✅ 100% consistent: every answer key is correct, and grading never mis-marked right↔wrong.');
