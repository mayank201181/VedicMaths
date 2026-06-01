// js/content.js
// All the human-readable content: age bands, swappable word-banks, the
// currency/region table, and a guide (with an SVG diagram) for every technique.
// No generator logic lives here — see js/vedic.js for that.

export const APP = {
  name: 'Magic Maths',
  tagline: 'Vedic & Mental Maths for clever kids',
  version: 7, // bump when state shape or content changes (drives ensureShape)
};

// Age bands set the *starting* difficulty when a child opens a technique.
// 0 = Basic (multiple choice), 1 = Intermediate (typed), 2 = Advanced (typed).
export const BANDS = [
  { id: '5-6', label: '5–6', emoji: '🐣', startDifficulty: 0 },
  { id: '7-8', label: '7–8', emoji: '🦊', startDifficulty: 0 },
  { id: '9-10', label: '9–10', emoji: '🦉', startDifficulty: 1 },
  { id: '11-12', label: '11–12', emoji: '🚀', startDifficulty: 2 },
];

export const DIFFICULTIES = [
  { id: 0, key: 'basic', label: 'Basic', emoji: '🟢', mode: 'choice', note: 'Tap the answer' },
  { id: 1, key: 'intermediate', label: 'Intermediate', emoji: '🟡', mode: 'type', note: 'Type the answer' },
  { id: 2, key: 'advanced', label: 'Advanced', emoji: '🔴', mode: 'type', note: 'Type the answer' },
];

// Data-driven currency / region so it's trivial to localise.
export const REGIONS = {
  GBP: { symbol: '£', subunit: 'p', subunitPer: 100, distance: 'km', name: 'UK (£)' },
  USD: { symbol: '$', subunit: '¢', subunitPer: 100, distance: 'miles', name: 'US ($)' },
  INR: { symbol: '₹', subunit: 'p', subunitPer: 100, distance: 'km', name: 'India (₹)' },
};
export const DEFAULT_REGION = 'GBP';

// Neutral, swappable word-bank for the occasional word problem.
export const WORDBANK = {
  names: ['Mia', 'Leo', 'Ava', 'Noah', 'Zara', 'Kai', 'Ivy', 'Sam', 'Tara', 'Ben', 'Nina', 'Omar'],
  places: ['the park', 'the shop', 'school', 'the library', 'the garden', 'the zoo'],
  things: ['stickers', 'marbles', 'pencils', 'apples', 'sweets', 'coins', 'cards', 'crayons'],
};

const CROWN_GOAL = 5; // questions correct (this difficulty) to earn a crown

// ---------------------------------------------------------------------------
// Tiny SVG helpers so diagrams stay short and consistent.
// ---------------------------------------------------------------------------
const svg = (inner, vb = '0 0 320 180') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" class="diagram-svg">${inner}</svg>`;

// ---------------------------------------------------------------------------
// TECHNIQUES — order roughly easy → hard. All are shown on the dashboard and
// all are immediately playable; crowns/stars just track progress.
// ---------------------------------------------------------------------------
export const TECHNIQUES = [
  {
    id: 'friends10',
    name: 'Friends of 10 & 100',
    emoji: '🤝',
    color: '#ffd6e0',
    sutra: 'All from 9 and the last from 10',
    tagline: 'Number pairs that snap together to make 10, 100 or 1000.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Some numbers are best friends — they add up to a round number like 10 or 100. ' +
        'If you know one friend, you can find the other in your head instantly.',
      steps: [
        'To make 10: think "what is left to reach 10?" (e.g. 7 needs 3).',
        'To make 100: take ALL the digits from 9, and the LAST digit from 10.',
        'So 63 → 9−6 = 3 (tens), 10−3 = 7 (units) → 37. And 63 + 37 = 100!',
      ],
      examples: [
        { q: '8 + ? = 10', work: '10 − 8 = 2, so the friend is 2.' },
        { q: '45 + ? = 100', work: '9−4 = 5, 10−5 = 5 → 55.   Check: 45 + 55 = 100.' },
        { q: '486 + ? = 1000', work: '9−4=5, 9−8=1, 10−6=4 → 514.' },
      ],
      tip: 'The very last digit is the only one taken from 10 — all the rest come from 9.',
      diagram: svg(
        `<rect x="20" y="60" width="120" height="60" rx="12" fill="#fff" stroke="#ff8fab" stroke-width="3"/>
         <text x="80" y="98" font-size="34" text-anchor="middle" font-weight="700" fill="#d6336c">7</text>
         <text x="160" y="98" font-size="34" text-anchor="middle" font-weight="700" fill="#495057">+</text>
         <rect x="180" y="60" width="120" height="60" rx="12" fill="#fff" stroke="#74c0fc" stroke-width="3"/>
         <text x="240" y="98" font-size="34" text-anchor="middle" font-weight="700" fill="#1c7ed6">3</text>
         <path d="M80 55 C 120 20, 200 20, 240 55" fill="none" stroke="#69db7c" stroke-width="4" stroke-dasharray="6 6"/>
         <text x="160" y="40" font-size="24" text-anchor="middle" font-weight="700" fill="#2f9e44">= 10</text>`
      ),
    },
  },
  {
    id: 'double',
    name: 'Doubling & Halving',
    emoji: '✌️',
    color: '#fff3bf',
    sutra: 'Split, then put back together',
    tagline: 'Double by adding a number to itself; halve by sharing into two.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Doubling means adding a number to itself. Halving is the opposite — splitting it into ' +
        'two equal parts. Break the number into tens and units to make it easy.',
      steps: [
        'Double the tens, double the units, then add them together.',
        '34 → double 30 = 60, double 4 = 8 → 60 + 8 = 68.',
        'To halve, share the tens and units into two: half of 86 → half of 80 (40) + half of 6 (3) = 43.',
      ],
      examples: [
        { q: 'Double 6', work: '6 + 6 = 12.' },
        { q: 'Double 34', work: '60 + 8 = 68.' },
        { q: 'Half of 58', work: 'half of 50 (25) + half of 8 (4) = 29.' },
      ],
      tip: 'Doubling twice is the same as ×4. Halving twice is the same as ÷4.',
      diagram: svg(
        `<circle cx="70" cy="90" r="30" fill="#ffe066"/>
         <text x="70" y="100" font-size="28" text-anchor="middle" font-weight="700" fill="#e67700">6</text>
         <text x="135" y="100" font-size="30" text-anchor="middle" fill="#495057">→</text>
         <circle cx="210" cy="60" r="26" fill="#ffec99"/><text x="210" y="69" font-size="22" text-anchor="middle" font-weight="700" fill="#e67700">6</text>
         <circle cx="210" cy="120" r="26" fill="#ffec99"/><text x="210" y="129" font-size="22" text-anchor="middle" font-weight="700" fill="#e67700">6</text>
         <text x="285" y="100" font-size="26" text-anchor="middle" font-weight="700" fill="#2f9e44">12</text>`
      ),
    },
  },
  {
    id: 'quickadd',
    name: 'Quick Adding',
    emoji: '➕',
    color: '#d3f9d8',
    sutra: 'Add the big parts first',
    tagline: 'Add left-to-right: tens first, then units. No more carrying!',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Grown-ups add from the right and carry. In your head it is easier to add the ' +
        'BIG parts first (the tens), then the small parts (the units).',
      steps: [
        'Add the tens: 47 + 36 → 40 + 30 = 70.',
        'Add the units: 7 + 6 = 13.',
        'Put them together: 70 + 13 = 83.',
      ],
      examples: [
        { q: '23 + 5', work: '20 + (3 + 5) = 20 + 8 = 28.' },
        { q: '47 + 36', work: '70 + 13 = 83.' },
        { q: '58 + 27', work: '70 + 15 = 85.' },
      ],
      tip: 'Adding 9? Add 10 then take 1 away. Adding 19? Add 20 then take 1 away.',
      diagram: svg(
        `<text x="30" y="70" font-size="26" font-weight="700" fill="#2f9e44">40 + 30 = 70</text>
         <text x="30" y="115" font-size="26" font-weight="700" fill="#1c7ed6">7 + 6 = 13</text>
         <line x1="28" y1="130" x2="250" y2="130" stroke="#adb5bd" stroke-width="2"/>
         <text x="30" y="165" font-size="28" font-weight="800" fill="#d6336c">70 + 13 = 83</text>`
      ),
    },
  },
  {
    id: 'cleversub',
    name: 'Clever Subtracting',
    emoji: '➖',
    color: '#e5dbff',
    sutra: 'Round, then adjust',
    tagline: 'Take away a round number, then give a little back.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Taking away an awkward number is hard. Round it up to a tidy number, subtract that, ' +
        'then add back the little bit you took away too much.',
      steps: [
        'To do 53 − 28, round 28 up to 30.',
        '53 − 30 = 23.',
        'You took away 2 too many, so add 2 back: 23 + 2 = 25.',
      ],
      examples: [
        { q: '53 − 28', work: '53 − 30 = 23, then + 2 = 25.' },
        { q: '72 − 19', work: '72 − 20 = 52, then + 1 = 53.' },
        { q: '145 − 98', work: '145 − 100 = 45, then + 2 = 47.' },
      ],
      tip: 'Subtracting 9 is just − 10 + 1. Subtracting 98 is − 100 + 2.',
      diagram: svg(
        `<text x="20" y="60" font-size="24" font-weight="700" fill="#495057">53 − 28</text>
         <text x="120" y="60" font-size="22" fill="#7048e8">round 28 → 30</text>
         <text x="20" y="105" font-size="24" font-weight="700" fill="#1c7ed6">53 − 30 = 23</text>
         <text x="20" y="150" font-size="24" font-weight="800" fill="#2f9e44">23 + 2 = 25</text>`
      ),
    },
  },
  {
    id: 'times10',
    name: '× 10, 100, 1000',
    emoji: '🔟',
    color: '#c5f6fa',
    sutra: 'Slide the digits up',
    tagline: 'Multiplying by powers of ten just shifts the number along.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Multiplying by 10, 100 or 1000 is the easiest trick of all. The digits stay the same — ' +
        'they just slide to a bigger place and a zero fills the gap.',
      steps: [
        '× 10 → add one zero: 24 × 10 = 240.',
        '× 100 → add two zeros: 24 × 100 = 2400.',
        '× 1000 → add three zeros: 24 × 1000 = 24000.',
      ],
      examples: [
        { q: '7 × 10', work: 'add one zero → 70.' },
        { q: '36 × 100', work: 'add two zeros → 3600.' },
        { q: '15 × 1000', work: 'add three zeros → 15000.' },
      ],
      tip: 'Count the zeros in the 10/100/1000 — that is how many zeros you add.',
      diagram: svg(
        `<text x="20" y="80" font-size="30" font-weight="700" fill="#495057">24</text>
         <text x="70" y="80" font-size="26" fill="#0c8599">× 100 =</text>
         <text x="185" y="80" font-size="30" font-weight="800" fill="#d6336c">24</text>
         <text x="240" y="80" font-size="30" font-weight="800" fill="#69db7c">00</text>
         <text x="185" y="120" font-size="18" fill="#0c8599">same</text>
         <text x="238" y="120" font-size="18" fill="#2f9e44">+2 zeros</text>`
      ),
    },
  },
  {
    id: 'times5',
    name: 'The 5 Trick',
    emoji: '🖐️',
    color: '#ffe8cc',
    sutra: 'Times ten, then halve',
    tagline: 'Multiply by 10 and halve it — much easier than the 5 times table.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Five is half of ten. So to multiply by 5, multiply by 10 (easy!) and then halve the result.',
      steps: [
        '× 10 first: 18 × 10 = 180.',
        'Halve it: half of 180 = 90.',
        'So 18 × 5 = 90.',
      ],
      examples: [
        { q: '6 × 5', work: '6 × 10 = 60, half = 30.' },
        { q: '18 × 5', work: '180 → half → 90.' },
        { q: '24 × 5', work: '240 → half → 120.' },
      ],
      tip: 'If the number is odd, halving 10× still works: 7 × 5 → 70 → 35.',
      diagram: svg(
        `<text x="20" y="75" font-size="26" font-weight="700" fill="#495057">18 × 5</text>
         <text x="20" y="120" font-size="24" fill="#e8590c">18 × 10 = 180</text>
         <text x="20" y="160" font-size="24" font-weight="800" fill="#2f9e44">half of 180 = 90</text>`
      ),
    },
  },
  {
    id: 'times9',
    name: 'The 9 Trick',
    emoji: '9️⃣',
    color: '#d0ebff',
    sutra: 'Times ten, take one lot away',
    tagline: 'Nine is one less than ten, so × 9 = × 10 minus the number.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Nine is just one less than ten. So to multiply by 9, multiply by 10 and then subtract ' +
        'one lot of the number.',
      steps: [
        '× 10: 7 × 10 = 70.',
        'Take one 7 away: 70 − 7 = 63.',
        'So 7 × 9 = 63.',
      ],
      examples: [
        { q: '7 × 9', work: '70 − 7 = 63.' },
        { q: '14 × 9', work: '140 − 14 = 126.' },
        { q: '23 × 9', work: '230 − 23 = 207.' },
      ],
      tip: 'On the 9 times table the two digits always add up to 9 (e.g. 6×9=54, 5+4=9).',
      diagram: svg(
        `<text x="20" y="75" font-size="26" font-weight="700" fill="#495057">7 × 9</text>
         <text x="20" y="120" font-size="24" fill="#1c7ed6">7 × 10 = 70</text>
         <text x="20" y="160" font-size="24" font-weight="800" fill="#2f9e44">70 − 7 = 63</text>`
      ),
    },
  },
  {
    id: 'times11',
    name: 'The 11 Trick',
    emoji: '1️⃣1️⃣',
    color: '#ffd8a8',
    sutra: 'Add the neighbours',
    tagline: 'Split the digits and drop their sum in the middle.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'To multiply a two-digit number by 11, split its two digits apart and write their ' +
        'sum in the gap between them.',
      steps: [
        '35 × 11 → split: 3 _ 5.',
        'Add the neighbours: 3 + 5 = 8 → goes in the middle.',
        'Answer: 3 8 5 = 385.',
      ],
      examples: [
        { q: '35 × 11', work: '3 (3+5) 5 = 385.' },
        { q: '72 × 11', work: '7 (7+2) 2 = 792.' },
        { q: '76 × 11', work: '7 (13) 6 → carry the 1 → 836.' },
      ],
      tip: 'If the middle sum is 10 or more, carry the 1 to the left digit.',
      diagram: svg(
        `<text x="40" y="90" font-size="40" font-weight="800" fill="#d6336c">3</text>
         <text x="150" y="90" font-size="40" font-weight="800" fill="#d6336c">5</text>
         <text x="92" y="90" font-size="40" font-weight="800" fill="#2f9e44">8</text>
         <path d="M55 60 C 80 35, 120 35, 145 60" fill="none" stroke="#69db7c" stroke-width="3"/>
         <text x="100" y="40" font-size="18" text-anchor="middle" fill="#2f9e44">3 + 5</text>
         <text x="230" y="90" font-size="30" fill="#495057">= 385</text>`
      ),
    },
  },
  {
    id: 'square5',
    name: 'Squares Ending in 5',
    emoji: '⭐',
    color: '#fff0f6',
    sutra: 'Ekādhikena Pūrveṇa — one more than the one before',
    tagline: 'Any number ending in 5, squared, in one line.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'A real Vedic sutra! To square a number ending in 5, take the part before the 5, ' +
        'multiply it by the next number up, and stick 25 on the end.',
      steps: [
        '35² → the "before" part is 3.',
        'Multiply by one more: 3 × 4 = 12.',
        'Write 25 after it: 12|25 = 1225.',
      ],
      examples: [
        { q: '25²', work: '2 × 3 = 6 → 625.' },
        { q: '35²', work: '3 × 4 = 12 → 1225.' },
        { q: '85²', work: '8 × 9 = 72 → 7225.' },
      ],
      tip: 'Every answer ends in 25. Only the front part changes.',
      diagram: svg(
        `<text x="20" y="70" font-size="26" font-weight="700" fill="#495057">35² </text>
         <text x="90" y="70" font-size="22" fill="#d6336c">3 × (3+1) = 12</text>
         <rect x="20" y="95" width="80" height="45" rx="8" fill="#fff" stroke="#f783ac" stroke-width="3"/>
         <text x="60" y="126" font-size="26" font-weight="800" fill="#d6336c">12</text>
         <rect x="105" y="95" width="80" height="45" rx="8" fill="#fff" stroke="#69db7c" stroke-width="3"/>
         <text x="145" y="126" font-size="26" font-weight="800" fill="#2f9e44">25</text>
         <text x="205" y="126" font-size="24" fill="#495057">= 1225</text>`
      ),
    },
  },
  {
    id: 'nikhilam',
    name: 'Near a Base',
    emoji: '🎯',
    color: '#d8f5a2',
    sutra: 'Nikhilam — all from 9, last from 10',
    tagline: 'Multiply numbers close to 10, 100 or 1000 super fast.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'When two numbers are both close to a base like 100, find how far each is BELOW the base, ' +
        'then combine cleverly. This is the famous Nikhilam method.',
      steps: [
        '97 × 96, base 100. Deficits: 100−97 = 3 and 100−96 = 4.',
        'Left part: cross-subtract → 97 − 4 = 93 (same as 96 − 3).',
        'Right part: multiply the deficits → 3 × 4 = 12.',
        'Join them (two digits per 100): 93|12 = 9312.',
      ],
      examples: [
        { q: '8 × 7 (base 10)', work: 'deficits 2 & 3 → 8−3 = 5, 2×3 = 6 → 56.' },
        { q: '97 × 96 (base 100)', work: '93 | 12 = 9312.' },
        { q: '98 × 94 (base 100)', work: '92 | 12 = 9212.' },
      ],
      tip: 'The right part must fill the right number of digits (2 for base 100). Carry if it overflows.',
      diagram: svg(
        `<text x="20" y="45" font-size="22" font-weight="700" fill="#495057">97  (−3)</text>
         <text x="20" y="75" font-size="22" font-weight="700" fill="#495057">96  (−4)</text>
         <line x1="20" y1="88" x2="160" y2="88" stroke="#adb5bd" stroke-width="2"/>
         <text x="20" y="125" font-size="24" font-weight="800" fill="#1c7ed6">93</text>
         <text x="60" y="125" font-size="24" font-weight="800" fill="#495057">|</text>
         <text x="80" y="125" font-size="24" font-weight="800" fill="#2f9e44">12</text>
         <path d="M120 40 L 70 70" stroke="#fa5252" stroke-width="2"/>
         <path d="M120 70 L 70 40" stroke="#fa5252" stroke-width="2"/>
         <text x="180" y="125" font-size="22" fill="#495057">= 9312</text>`
      ),
    },
  },
  {
    id: 'urdhva',
    name: 'Vertically & Crosswise',
    emoji: '✖️',
    color: '#ffec99',
    sutra: 'Ūrdhva-Tiryagbhyām — vertically and crosswise',
    tagline: 'The all-purpose multiplication sutra for any numbers.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'The master multiplication method. For two two-digit numbers you do three little steps: ' +
        'units × units, the crosswise sum, then tens × tens.',
      steps: [
        '23 × 41. Units: 3 × 1 = 3.',
        'Crosswise: (2×1) + (3×4) = 2 + 12 = 14 → write 4, carry 1.',
        'Tens: 2 × 4 = 8, plus carry 1 = 9.',
        'Read it off: 9 4 3 = 943.',
      ],
      examples: [
        { q: '12 × 13', work: '6 | (1+? ) ... = 156.' },
        { q: '23 × 41', work: '9 | 4 | 3 = 943.' },
        { q: '34 × 21', work: '714.' },
      ],
      tip: 'Always carry from right to left, just like normal — but you never write rows out.',
      diagram: svg(
        `<text x="40" y="60" font-size="30" font-weight="700" fill="#495057">2  3</text>
         <text x="40" y="100" font-size="30" font-weight="700" fill="#495057">4  1</text>
         <line x1="35" y1="112" x2="120" y2="112" stroke="#adb5bd" stroke-width="2"/>
         <path d="M55 70 L 105 95" stroke="#fa5252" stroke-width="2"/>
         <path d="M105 70 L 55 95" stroke="#fa5252" stroke-width="2"/>
         <text x="150" y="60" font-size="18" fill="#1c7ed6">tens × tens</text>
         <text x="150" y="90" font-size="18" fill="#fa5252">crosswise</text>
         <text x="150" y="120" font-size="18" fill="#2f9e44">units × units</text>
         <text x="40" y="150" font-size="26" font-weight="800" fill="#d6336c">= 943</text>`
      ),
    },
  },
  {
    id: 'squareany',
    name: 'Square Any 2-Digit',
    emoji: '🟪',
    color: '#eebefa',
    sutra: 'Use a friendly base',
    tagline: 'Square any two-digit number by leaning on the nearest ten.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'To square a two-digit number, move to the nearest ten, multiply the "balanced" pair, ' +
        'and add the square of how far you moved.',
      steps: [
        '32². Nearest ten is 30, surplus = 2.',
        'Balance it: 30 × 34 = 1020 (one down by 2, one up by 2).',
        'Add the surplus squared: 2² = 4.',
        '1020 + 4 = 1024.',
      ],
      examples: [
        { q: '12²', work: '10 × 14 = 140, + 2² = 144.' },
        { q: '32²', work: '30 × 34 = 1020, + 4 = 1024.' },
        { q: '48²', work: '46 × 50 = 2300, + 2² = 2304.' },
      ],
      tip: 'It uses the rule n² = (n−d)(n+d) + d². Pick d so one side hits a round ten.',
      diagram: svg(
        `<text x="20" y="55" font-size="24" font-weight="700" fill="#495057">32²  (base 30, +2)</text>
         <text x="20" y="100" font-size="24" fill="#7048e8">30 × 34 = 1020</text>
         <text x="20" y="140" font-size="24" font-weight="800" fill="#2f9e44">1020 + 2² = 1024</text>`
      ),
    },
  },
  {
    id: 'percent',
    name: 'Easy Percentages',
    emoji: '％',
    color: '#b2f2bb',
    sutra: '10% is just a tenth',
    tagline: 'Find 10% first, then build any percentage from it.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Percent means "out of 100". The trick is to find 10% (divide by 10), because every ' +
        'other percentage is built from it.',
      steps: [
        '10% of 80 = 80 ÷ 10 = 8.',
        '20% = two lots of 10% = 16.   5% = half of 10% = 4.',
        '15% = 10% + 5% = 8 + 4 = 12.',
      ],
      examples: [
        { q: '10% of 50', work: '50 ÷ 10 = 5.' },
        { q: '20% of 90', work: '9 × 2 = 18.' },
        { q: '25% of 60', work: 'a quarter → 60 ÷ 4 = 15.' },
      ],
      tip: '50% = half, 25% = a quarter, 1% = divide by 100.',
      diagram: svg(
        `<text x="20" y="55" font-size="24" font-weight="700" fill="#495057">10% of 80 = 8</text>
         <text x="20" y="95" font-size="22" fill="#2b8a3e">20% = 8 + 8 = 16</text>
         <text x="20" y="135" font-size="22" fill="#2b8a3e">5% = 8 ÷ 2 = 4</text>
         <text x="20" y="170" font-size="22" font-weight="800" fill="#d6336c">15% = 12</text>`
      ),
    },
  },
];

export const TECHNIQUE_INDEX = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));
