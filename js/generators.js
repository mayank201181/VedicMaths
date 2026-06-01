// js/generators.js
// Shared, framework-free helpers used by every question generator.
// These are pure functions so the SAME file can run in the browser AND in Node
// (the serverless /api/question handler imports the very same generators).

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build N unique multiple-choice options that always include the correct answer.
// `spread` controls how far the distractors stray from the answer.
export function numChoices(correct, { spread = 6, n = 4, min = 0 } = {}) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < n && guard++ < 400) {
    const delta = rand(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const cand = correct + delta;
    if (min !== null && cand < min) continue;
    set.add(cand);
  }
  // Guarantee we reach n options even for tiny numbers near the floor.
  let extra = correct + spread + 1;
  while (set.size < n) set.add(extra++);
  return shuffle([...set]);
}

// Pretty-print a number with thousands separators (kept simple, locale-free).
export function commafy(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Normalise a typed answer so checking is lenient.
// Strips currency symbols, spaces, commas and a trailing "p" (pence),
// and collapses things like "1.50" -> "1.5".
export function normalizeAnswer(s) {
  let t = String(s).toLowerCase().trim();
  t = t.replace(/[£$₹,\s]/g, '');
  t = t.replace(/(pence|pennies|pounds|pound|dollars|dollar|rupees|rupee|cents|cent|p)$/i, '');
  // collapse trailing zeros in decimals: 1.50 -> 1.5, 2.00 -> 2
  if (/^\d*\.\d+$/.test(t)) {
    t = t.replace(/0+$/, '').replace(/\.$/, '');
  }
  return t;
}

// Draw a question that hasn't been seen yet in the current exercise.
// `make()` returns a fresh candidate each call; `used` is a Set of question
// texts already shown, `lastKey` is the previous question's text (to avoid an
// immediate back-to-back repeat). When the pool is exhausted (e.g. a Basic
// level with only a handful of distinct questions) we start a new cycle so
// every distinct question appears before any repeats.
export function pickDistinct(make, used, lastKey, maxTries = 300) {
  const round = (avoidUsed) => {
    let fb = null;
    for (let i = 0; i < maxTries; i++) {
      const cand = make();
      fb = cand;
      if (cand.text !== lastKey && (!avoidUsed || !used.has(cand.text))) return { chosen: cand, fb };
    }
    return { chosen: null, fb };
  };
  let { chosen, fb } = round(true);
  if (!chosen) {
    used.clear(); // pool exhausted — begin a fresh cycle (still avoid an immediate repeat)
    ({ chosen, fb } = round(false));
    if (!chosen) chosen = fb; // only reachable if the pool has a single question
  }
  used.add(chosen.text);
  return chosen;
}
// The numeric fallback only triggers when the WHOLE normalised input is a clean
// number, so loose input like "12x" can never be misread as 12.
export function checkTyped(input, accept = [], answer = null) {
  const norm = normalizeAnswer(input);
  if (norm === '') return false;
  for (const a of accept) {
    if (normalizeAnswer(a) === norm) return true;
  }
  if (answer !== null && /^-?\d+(?:\.\d+)?$/.test(norm)) {
    const numAns = Number(normalizeAnswer(String(answer)));
    if (Number.isFinite(numAns) && Math.abs(Number(norm) - numAns) < 1e-9) return true;
  }
  return false;
}
