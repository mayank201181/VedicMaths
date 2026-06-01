// js/vedic.js
// Procedural question generators for every Vedic / mental-maths technique.
// Questions are GENERATED, never stored — so "add 25 more" is infinite and
// each harder batch simply scales the numbers up.
//
// Every generator has the signature  gen({ difficulty, level }) -> question
//   difficulty: 0 Basic (multiple choice) | 1 Intermediate (typed) | 2 Advanced (typed)
//   level:      0,1,2,…  bumps the numbers up within the same skill
//
// Returned question shape:
//   { text, visual?, answer, accept[], choices[]|null, hint, explanation, speak }
//
// This file is imported UNCHANGED by both the browser (js/app.js) and Node
// (api/question.js + the validation sweep), so it must stay free of browser
// or Node specific APIs.

import { rand, pick, shuffle, numChoices, commafy } from './generators.js';

const isMC = (d) => d === 0;

// A small standard envelope so each generator stays short.
// For numeric answers, multiple-choice options are built automatically; for
// text answers (Yes/No, day names) pass an explicit `choices` array.
function make({
  text,
  answer,
  difficulty,
  hint,
  explanation,
  visual = null,
  choiceOpts = {},
  choices = null,
  accept = [],
}) {
  const base = { text, visual, answer, hint, explanation, speak: text };
  if (isMC(difficulty)) {
    base.choices = choices ? shuffle(choices.slice()) : numChoices(answer, choiceOpts);
    base.accept = [String(answer)];
  } else {
    base.choices = null;
    base.accept = [String(answer), ...(typeof answer === 'number' ? [commafy(answer)] : []), ...accept];
  }
  return base;
}

// Pick a base (10 / 100 / 1000 …) that grows with difficulty + level.
const growExp = (difficulty, level, max = 4) =>
  Math.min(1 + difficulty + Math.floor(level / 2), max);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const dayName = (y, m, d) => DAYS[new Date(Date.UTC(y, m, d)).getUTCDay()];
const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

// ---------------------------------------------------------------------------
const GEN = {
  // ----- Friends of 10 / 100 / 1000 ---------------------------------------
  friends10({ difficulty, level }) {
    const base = Math.pow(10, growExp(difficulty, level));
    const a = rand(base / 10, base - 1);
    const answer = base - a;
    const digitWork =
      base === 10
        ? `${base} − ${a} = ${answer}.`
        : `Take each digit from 9 and the last from 10: ${a} + ${answer} = ${base}.`;
    return make({
      difficulty,
      text: `${a} + ? = ${base}`,
      answer,
      hint: base === 10 ? 'What is left to reach 10?' : 'All from 9, the last from 10.',
      explanation: `The friend of ${a} that makes ${base} is ${answer}. ${digitWork}`,
      choiceOpts: { spread: base === 10 ? 4 : 12, min: 0 },
    });
  },

  // ----- Doubling & Halving -----------------------------------------------
  double({ difficulty, level }) {
    const hi = [20, 60, 400][difficulty] + level * 6;
    const halving = difficulty > 0 && Math.random() < 0.45;
    if (halving) {
      const n = rand(6, hi) * 2; // guaranteed even
      const answer = n / 2;
      return make({
        difficulty,
        text: `Half of ${n}`,
        answer,
        hint: 'Halve the tens and the units separately.',
        explanation: `Split ${n}: half of each part adds up to ${answer}.`,
        choiceOpts: { spread: 6 },
      });
    }
    const n = rand(2, hi);
    const answer = n * 2;
    return make({
      difficulty,
      text: `Double ${n}`,
      answer,
      hint: 'Add the number to itself.',
      explanation: `${n} + ${n} = ${answer}. (Double the tens, double the units, then add.)`,
      choiceOpts: { spread: 6 },
    });
  },

  // ----- Quick Adding (left to right) -------------------------------------
  quickadd({ difficulty, level }) {
    let a, b;
    if (difficulty === 0) {
      a = rand(11, 49) + level;
      b = rand(2, 9);
    } else if (difficulty === 1) {
      a = rand(15, 89) + level * 2;
      b = rand(15, 89) + level * 2;
    } else {
      a = rand(120, 880) + level * 10;
      b = rand(25, 95);
    }
    const answer = a + b;
    const ta = Math.floor(a / 10) * 10;
    const tb = Math.floor(b / 10) * 10;
    return make({
      difficulty,
      text: `${a} + ${b}`,
      answer,
      hint: 'Add the tens first, then the units.',
      explanation: `Tens: ${ta} + ${tb} = ${ta + tb}. Units: ${a - ta} + ${b - tb} = ${a - ta + b - tb}. Together: ${answer}.`,
      choiceOpts: { spread: 8 },
    });
  },

  // ----- Clever Subtracting (round then adjust) ---------------------------
  cleversub({ difficulty, level }) {
    let a, b;
    if (difficulty === 0) {
      a = rand(15, 60) + level;
      b = rand(2, 9);
    } else if (difficulty === 1) {
      b = rand(2, 5) * 10 - rand(1, 2); // e.g. 18, 19, 28, 29
      a = b + rand(15, 60);
    } else {
      b = rand(1, 3) * 100 - rand(1, 3); // e.g. 97, 98, 198, 199
      a = b + rand(30, 200);
    }
    const answer = a - b;
    const round = Math.ceil(b / 10) * 10;
    const give = round - b;
    return make({
      difficulty,
      text: `${a} − ${b}`,
      answer,
      hint: `Round ${b} up to ${round}, then add ${give} back.`,
      explanation: `${a} − ${round} = ${a - round}, then + ${give} = ${answer}.`,
      choiceOpts: { spread: 6, min: 0 },
    });
  },

  // ----- × 10 / 100 / 1000 ------------------------------------------------
  times10({ difficulty, level }) {
    const mult = [10, 100, 1000][difficulty];
    const n = [rand(2, 30) + level, rand(11, 99), rand(20, 999)][difficulty];
    const answer = n * mult;
    const zeros = String(mult).length - 1;
    return make({
      difficulty,
      text: `${n} × ${commafy(mult)}`,
      answer,
      hint: `Add ${zeros} zero${zeros > 1 ? 's' : ''}.`,
      explanation: `Keep the ${n}, then add ${zeros} zero${zeros > 1 ? 's' : ''} → ${commafy(answer)}.`,
      choiceOpts: { spread: mult, min: 0 },
    });
  },

  // ----- The 5 trick (×10, halve) -----------------------------------------
  times5({ difficulty, level }) {
    const n = [rand(2, 20), rand(12, 60) + level, rand(40, 180) + level * 5][difficulty];
    const answer = n * 5;
    return make({
      difficulty,
      text: `${n} × 5`,
      answer,
      hint: 'Times 10, then take half.',
      explanation: `${n} × 10 = ${n * 10}, then half of ${n * 10} = ${answer}.`,
      choiceOpts: { spread: 10, min: 0 },
    });
  },

  // ----- The 9 trick (×10, subtract one lot) ------------------------------
  times9({ difficulty, level }) {
    const n = [rand(2, 20), rand(12, 40) + level, rand(20, 130) + level * 4][difficulty];
    const answer = n * 9;
    return make({
      difficulty,
      text: `${n} × 9`,
      answer,
      hint: 'Times 10, then take one lot away.',
      explanation: `${n} × 10 = ${n * 10}, then − ${n} = ${answer}.`,
      choiceOpts: { spread: 9, min: 0 },
    });
  },

  // ----- The 11 trick (add the neighbours) --------------------------------
  times11({ difficulty, level }) {
    if (difficulty === 0) {
      const n = rand(2, 19);
      return make({
        difficulty,
        text: `${n} × 11`,
        answer: n * 11,
        hint: 'Write the digit twice (it just doubles into both places).',
        explanation: `${n} × 11 = ${n * 11}.`,
        choiceOpts: { spread: 9, min: 0 },
      });
    }
    let t, u;
    if (difficulty === 1) {
      t = rand(1, 8);
      u = rand(0, 9 - t); // no carry
    } else {
      t = rand(2, 9);
      u = rand(0, 9); // carry allowed
    }
    const n = t * 10 + u;
    const mid = t + u;
    const answer = n * 11;
    const carryNote =
      mid >= 10
        ? ` The middle is ${mid}, which is 10 or more, so carry the 1: ${t} becomes ${t + 1}.`
        : '';
    return make({
      difficulty,
      text: `${n} × 11`,
      answer,
      hint: 'Split the two digits and add them in the middle.',
      explanation: `Split ${t} and ${u}, add the neighbours ${t} + ${u} = ${mid} in the middle → ${answer}.${carryNote}`,
    });
  },

  // ----- Squares ending in 5 (Ekādhikena) ---------------------------------
  square5({ difficulty, level }) {
    const front = [rand(1, 9), rand(1, 9), rand(10, 19)][difficulty];
    const n = front * 10 + 5;
    const answer = n * n;
    return make({
      difficulty,
      text: `${n}²`,
      answer,
      hint: 'Front part × (front part + 1), then write 25.',
      explanation: `${front} × ${front + 1} = ${front * (front + 1)}, then put 25 on the end → ${commafy(answer)}.`,
      choiceOpts: { spread: 50, min: 0 },
    });
  },

  // ----- Near a Base (Nikhilam) -------------------------------------------
  nikhilam({ difficulty, level }) {
    const baseVal = difficulty <= 1 ? (difficulty === 0 ? 10 : 100) : level > 0 ? 1000 : 100;
    const lo = baseVal === 10 ? 5 : baseVal === 100 ? 86 : 988;
    const a = rand(lo, baseVal - 1);
    const b = rand(lo, baseVal - 1);
    const da = baseVal - a;
    const db = baseVal - b;
    const answer = a * b;
    const left = a - db; // = b - da
    const right = da * db;
    const width = String(baseVal).length - 1;
    const carry = right >= baseVal ? ` (the right part ${right} is too big, so carry into the left)` : '';
    return make({
      difficulty,
      text: `${a} × ${b}`,
      answer,
      hint: `Both are near ${baseVal}. Cross-subtract, then multiply the gaps.`,
      explanation:
        `Gaps from ${baseVal}: ${da} and ${db}. Left: ${a} − ${db} = ${left}. ` +
        `Right: ${da} × ${db} = ${right} (${width} digits). Join → ${commafy(answer)}${carry}.`,
      choiceOpts: { spread: baseVal === 10 ? 8 : 40, min: 0 },
    });
  },

  // ----- Vertically & Crosswise (Ūrdhva) ----------------------------------
  urdhva({ difficulty, level }) {
    if (difficulty === 0) {
      const a = rand(11, 29);
      const b = rand(2, 9);
      return make({
        difficulty,
        text: `${a} × ${b}`,
        answer: a * b,
        hint: 'Multiply the units, then the tens, and add the crosswise bits.',
        explanation: `${a} × ${b} = ${a * b}. Units ${a % 10}×${b}, tens ${Math.floor(a / 10)}×${b} (×10).`,
        choiceOpts: { spread: 12, min: 0 },
      });
    }
    if (difficulty === 1) {
      const a = rand(11, 49) + level;
      const b = rand(11, 49) + level;
      const [a1, a0] = [Math.floor(a / 10), a % 10];
      const [b1, b0] = [Math.floor(b / 10), b % 10];
      const units = a0 * b0;
      const cross = a1 * b0 + a0 * b1;
      const tens = a1 * b1;
      return make({
        difficulty,
        text: `${a} × ${b}`,
        answer: a * b,
        hint: 'Units×units, then crosswise, then tens×tens — carrying as you go.',
        explanation:
          `Units: ${a0}×${b0} = ${units}. Crosswise: ${a1}×${b0} + ${a0}×${b1} = ${cross}. ` +
          `Tens: ${a1}×${b1} = ${tens}. Combine with carries → ${commafy(a * b)}.`,
      });
    }
    const a = rand(101, 899);
    const b = rand(11, 99);
    return make({
      difficulty,
      text: `${a} × ${b}`,
      answer: a * b,
      hint: 'Break it up: multiply by the tens and the units, then add.',
      explanation: `${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${commafy(a * (b - (b % 10)))} + ${commafy(a * (b % 10))} = ${commafy(a * b)}.`,
    });
  },

  // ----- Square any 2-digit (friendly base) -------------------------------
  squareany({ difficulty, level }) {
    const n = [rand(11, 29), rand(21, 79), rand(21, 99)][difficulty];
    const baseTen = Math.round(n / 10) * 10;
    const s = n - baseTen; // surplus (can be negative)
    const answer = n * n;
    const partial = baseTen * (n + s);
    return make({
      difficulty,
      text: `${n}²`,
      answer,
      hint: `Use the nearest ten (${baseTen}).`,
      explanation:
        `Nearest ten is ${baseTen}, off by ${s}. ${baseTen} × ${n + s} = ${commafy(partial)}, ` +
        `then + ${s}² = ${s * s} → ${commafy(answer)}.`,
      choiceOpts: { spread: 60, min: 0 },
    });
  },

  // ----- Easy percentages --------------------------------------------------
  percent({ difficulty, level }) {
    if (difficulty === 0) {
      const base = rand(2, 19) * 10 + level * 10;
      return make({
        difficulty,
        text: `10% of ${base}`,
        answer: base / 10,
        hint: 'Divide by 10.',
        explanation: `10% means a tenth: ${base} ÷ 10 = ${base / 10}.`,
        choiceOpts: { spread: 6, min: 0 },
      });
    }
    if (difficulty === 1) {
      const pct = pick([10, 20, 50]);
      const base = rand(3, 12) * 10;
      const answer = (base * pct) / 100;
      return make({
        difficulty,
        text: `${pct}% of ${base}`,
        answer,
        hint: 'Find 10% first (divide by 10), then build it up.',
        explanation:
          pct === 50
            ? `50% is half: ${base} ÷ 2 = ${answer}.`
            : `10% of ${base} = ${base / 10}. ${pct}% = ${pct / 10} lots = ${answer}.`,
        choiceOpts: { spread: 8, min: 0 },
      });
    }
    const pct = pick([5, 15, 25, 30]);
    const base = rand(2, 10) * 20 + level * 20;
    const answer = (base * pct) / 100;
    return make({
      difficulty,
      text: `${pct}% of ${base}`,
      answer,
      hint: 'Build it from 10% and 5%.',
      explanation:
        pct === 25
          ? `25% is a quarter: ${base} ÷ 4 = ${answer}.`
          : `10% of ${base} = ${base / 10}, 5% = ${base / 20}. ${pct}% = ${answer}.`,
      choiceOpts: { spread: 10, min: 0 },
    });
  },

  // ----- Multiply Any Numbers (general Ūrdhva) ----------------------------
  bigmult({ difficulty, level }) {
    let a, b;
    if (difficulty === 0) {
      a = rand(11, 99);
      b = rand(2, 9);
    } else if (difficulty === 1) {
      a = rand(21, 99) + level;
      b = rand(21, 99) + level;
    } else {
      a = rand(111, 999) + level * 7;
      b = rand(12, 99);
    }
    const tens = b - (b % 10);
    return make({
      difficulty,
      text: `${a} × ${b}`,
      answer: a * b,
      hint: 'Split the smaller number into tens and units, then add.',
      explanation:
        b % 10 === 0 || tens === 0
          ? `${a} × ${b} = ${commafy(a * b)}.`
          : `${a} × ${b} = ${a} × ${tens} + ${a} × ${b % 10} = ${commafy(a * tens)} + ${commafy(a * (b % 10))} = ${commafy(a * b)}.`,
      choiceOpts: { spread: Math.max(12, Math.floor((a * b) / 12)), min: 0 },
    });
  },

  // ----- Difference of squares: (a−b)(a+b) = a²−b² ------------------------
  diffsquares({ difficulty, level }) {
    const mid = [rand(2, 8) * 10, rand(2, 9) * 10, rand(3, 20) * 10 + level * 10][difficulty];
    const d = [rand(1, 5), rand(1, 9), rand(2, 12)][difficulty];
    const a = mid - d;
    const b = mid + d;
    return make({
      difficulty,
      text: `${a} × ${b}`,
      answer: a * b,
      hint: `Both numbers are ${d} away from ${mid}.`,
      explanation: `${mid}² − ${d}² = ${commafy(mid * mid)} − ${d * d} = ${commafy(a * b)}.`,
      choiceOpts: { spread: 40, min: 0 },
    });
  },

  // ----- Cubes ------------------------------------------------------------
  cubes({ difficulty, level }) {
    const n = [rand(2, 15), rand(2, 20) + level, rand(11, 30) + level][difficulty];
    return make({
      difficulty,
      text: `${n}³`,
      answer: n * n * n,
      hint: 'Square it first, then multiply by the number once more.',
      explanation: `${n}² = ${n * n}, then × ${n} = ${commafy(n * n * n)}.`,
      choiceOpts: { spread: Math.max(20, n * n), min: 0 },
    });
  },

  // ----- Square roots of perfect squares ----------------------------------
  sqrt({ difficulty, level }) {
    const k = [rand(2, 20), rand(10, 30) + level, rand(20, 60) + level][difficulty];
    const n = k * k;
    return make({
      difficulty,
      text: `√${n}`,
      answer: k,
      hint: 'Which number times itself gives this?',
      explanation: `${k} × ${k} = ${commafy(n)}, so √${commafy(n)} = ${k}.`,
      choiceOpts: { spread: 5, min: 1 },
    });
  },

  // ----- Divisibility tricks (Yes/No) -------------------------------------
  divisible({ difficulty, level }) {
    const div = [pick([2, 5, 10, 3]), pick([3, 4, 9, 6]), pick([4, 9, 11, 6])][difficulty];
    const size = [rand(20, 200), rand(100, 999), rand(1000, 9999) + level][difficulty];
    // Make a "Yes" roughly half the time by snapping to a multiple.
    const n = Math.random() < 0.5 ? Math.round(size / div) * div : size;
    const yes = n % div === 0;
    const answer = yes ? 'Yes' : 'No';
    const tests = {
      2: 'check the last digit is even',
      3: 'add the digits and see if that divides by 3',
      4: 'check the last two digits make a multiple of 4',
      5: 'check it ends in 0 or 5',
      6: 'it must work for both 2 and 3',
      9: 'add the digits and see if that divides by 9',
      10: 'check it ends in 0',
      11: 'alternately add and subtract the digits',
    };
    const digitSum = String(n).split('').reduce((s, c) => s + +c, 0);
    const extra =
      div === 3 || div === 9
        ? ` Digit sum = ${digitSum}.`
        : div === 4
        ? ` Last two digits = ${String(n).slice(-2)}.`
        : '';
    return make({
      difficulty,
      text: `Is ${commafy(n)} divisible by ${div}?`,
      answer,
      choices: ['Yes', 'No'],
      accept: yes ? ['yes', 'y'] : ['no', 'n'],
      hint: `To test for ${div}, ${tests[div]}.`,
      explanation: `${commafy(n)} ÷ ${div} ${yes ? 'is exact' : 'leaves a remainder'}, so the answer is ${answer}.${extra}`,
    });
  },

  // ----- Cube roots of perfect cubes --------------------------------------
  cuberoot({ difficulty, level }) {
    const k = [rand(2, 12), rand(11, 30), rand(31, 70) + level][difficulty];
    const n = k * k * k;
    const lastMap = { 0: 0, 1: 1, 8: 2, 7: 3, 4: 4, 5: 5, 6: 6, 3: 7, 2: 8, 9: 9 };
    const lastDigit = n % 10;
    return make({
      difficulty,
      text: `∛${n}`,
      answer: k,
      hint: 'The last digit of the answer comes from the last digit of the number.',
      explanation: `${k} × ${k} × ${k} = ${commafy(n)}. It ends in ${lastDigit}, so the root ends in ${lastMap[lastDigit]} → ${k}.`,
      choiceOpts: { spread: 4, min: 1 },
    });
  },

  // ----- Quick dividing by 5 / 25 / 50 ------------------------------------
  quickdiv({ difficulty, level }) {
    const div = [5, pick([5, 25]), pick([25, 50])][difficulty];
    const q = [rand(2, 20), rand(4, 40) + level, rand(6, 80) + level][difficulty];
    const n = q * div;
    const recipe =
      div === 5
        ? `× 2 = ${n * 2}, ÷ 10 = ${q}`
        : div === 25
        ? `× 4 = ${commafy(n * 4)}, ÷ 100 = ${q}`
        : `× 2 = ${commafy(n * 2)}, ÷ 100 = ${q}`;
    return make({
      difficulty,
      text: `${commafy(n)} ÷ ${div}`,
      answer: q,
      hint: div === 5 ? 'Double it, then divide by 10.' : `Multiply by ${100 / div}, then divide by 100.`,
      explanation: `${commafy(n)} ÷ ${div}: ${recipe}.`,
      choiceOpts: { spread: 8, min: 0 },
    });
  },

  // ----- Day of the week --------------------------------------------------
  calendar({ difficulty, level }) {
    const year = [rand(2001, 2030), rand(1950, 2050), rand(1900, 2099)][difficulty];
    const m = rand(0, 11);
    const d = rand(1, daysInMonth(year, m));
    const answer = dayName(year, m, d);
    const others = shuffle(DAYS.filter((x) => x !== answer)).slice(0, 3);
    return make({
      difficulty,
      text: `What day of the week is ${d} ${MONTHS[m]} ${year}?`,
      answer,
      choices: [answer, ...others],
      accept: [answer.toLowerCase(), answer.slice(0, 3).toLowerCase()],
      hint: 'Find the nearest doomsday for the year, then step across in 7s.',
      explanation: `${d} ${MONTHS[m]} ${year} falls on a ${answer}.`,
    });
  },

  // ----- Discounts & percentage changes -----------------------------------
  percentchange({ difficulty, level }) {
    const up = Math.random() < 0.5;
    const pct = [pick([10, 50]), pick([20, 25]), pick([15, 25, 30, 40])][difficulty];
    const base = [rand(2, 9) * 10, rand(2, 12) * 20, rand(3, 15) * 20 + level * 20][difficulty];
    const piece = (base * pct) / 100;
    const answer = up ? base + piece : base - piece;
    return make({
      difficulty,
      text: `${up ? 'Increase' : 'Decrease'} ${base} by ${pct}%`,
      answer,
      hint: `First find ${pct}% of ${base}, then ${up ? 'add it on' : 'take it off'}.`,
      explanation: `${pct}% of ${base} = ${piece}. ${base} ${up ? '+' : '−'} ${piece} = ${answer}.`,
      choiceOpts: { spread: 12, min: 0 },
    });
  },
};

// Public dispatcher used by the client and the API.
export function generate(techniqueId, { difficulty = 0, level = 0 } = {}) {
  const gen = GEN[techniqueId];
  if (!gen) throw new Error(`Unknown technique: ${techniqueId}`);
  const d = Math.max(0, Math.min(2, difficulty | 0));
  return gen({ difficulty: d, level: Math.max(0, level | 0) });
}

export const TECHNIQUE_IDS = Object.keys(GEN);
