// js/content.js
// All the human-readable content: age bands, swappable word-banks, the
// currency/region table, and a guide (with an SVG diagram) for every technique.
// No generator logic lives here — see js/vedic.js for that.

export const APP = {
  name: 'Magic Maths',
  tagline: 'Vedic & Mental Maths for every age',
  version: 8, // bump when state shape or content changes (drives ensureShape)
};

// Age bands set the *starting* difficulty when someone opens a technique, and
// which dashboard tier opens first.
// 0 = Basic (multiple choice), 1 = Intermediate (typed), 2 = Advanced (typed).
export const BANDS = [
  { id: '5-6', label: '5–6', emoji: '🐣', startDifficulty: 0, tier: 'starter' },
  { id: '7-8', label: '7–8', emoji: '🦊', startDifficulty: 0, tier: 'starter' },
  { id: '9-10', label: '9–10', emoji: '🦉', startDifficulty: 1, tier: 'junior' },
  { id: '11-12', label: '11–12', emoji: '🚀', startDifficulty: 2, tier: 'junior' },
  { id: '13-16', label: '13–16', emoji: '🎓', startDifficulty: 2, tier: 'teen' },
  { id: '16+', label: '16+', emoji: '🧠', startDifficulty: 2, tier: 'master' },
];

// Dashboard tiers — techniques are grouped under these so the map stays tidy as
// it grows. The tier matching the player's band opens first; the rest are
// one tap away.
export const TIERS = [
  { id: 'starter', label: 'Starter', emoji: '🌱', blurb: 'Ages 5–8' },
  { id: 'junior', label: 'Junior', emoji: '🚀', blurb: 'Ages 9–12' },
  { id: 'teen', label: 'Teen', emoji: '🎓', blurb: 'Ages 13–16' },
  { id: 'master', label: 'Master', emoji: '🧠', blurb: '16+ / Grown-ups' },
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
        { q: '6 + ? = 10', work: '10 − 6 = 4.' },
        { q: '63 + ? = 100', work: '9−6 = 3 (tens), 10−3 = 7 (units) → 37. Check: 63 + 37 = 100.' },
        { q: '45 + ? = 100', work: '9−4 = 5, 10−5 = 5 → 55.' },
        { q: '28 + ? = 100', work: '9−2 = 7, 10−8 = 2 → 72.' },
        { q: '486 + ? = 1000', work: '9−4 = 5, 9−8 = 1, 10−6 = 4 → 514.' },
      ],
      whyItWorks:
        'Each pair of digits adds up to 9, and only the very last pair adds to 10. That extra 1 rolls all the way up so the whole sum becomes a tidy 10, 100 or 1000.',
      mistakes:
        'Don’t take the last digit from 9 — the units always come from 10 (for 63 it is 10−3 = 7, not 9−3).',
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
        { q: 'Double 9', work: '9 + 9 = 18.' },
        { q: 'Double 34', work: 'double 30 = 60, double 4 = 8 → 68.' },
        { q: 'Double 47', work: 'double 40 = 80, double 7 = 14 → 80 + 14 = 94.' },
        { q: 'Half of 58', work: 'half of 50 (25) + half of 8 (4) = 29.' },
        { q: 'Half of 86', work: 'half of 80 (40) + half of 6 (3) = 43.' },
      ],
      whyItWorks:
        'Breaking a number into tens and units keeps each piece small. Doubling (or halving) the pieces separately and adding them back always rebuilds the correct answer.',
      mistakes:
        'When doubling, remember to carry: double 47 is 80 + 14 = 94, not “8” and “14” written side by side.',
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
        { q: '47 + 36', work: 'tens 40 + 30 = 70, units 7 + 6 = 13 → 70 + 13 = 83.' },
        { q: '58 + 27', work: '70 + 15 = 85.' },
        { q: '64 + 19', work: 'add 20 then take 1 back → 84 − 1 = 83.' },
        { q: '125 + 40', work: '120 + 40 = 160, then + 5 = 165.' },
        { q: '236 + 58', work: '236 + 60 = 296, then − 2 = 294.' },
      ],
      whyItWorks:
        'Adding the big parts first gets you close to the answer straight away; the units only ever nudge it a little, so there’s much less to juggle in your head.',
      mistakes:
        'Don’t forget the carry from the units — 7 + 6 = 13 means one extra ten goes back into the tens column.',
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
        { q: '64 − 38', work: '64 − 40 = 24, then + 2 = 26.' },
        { q: '91 − 47', work: '91 − 50 = 41, then + 3 = 44.' },
        { q: '145 − 98', work: '145 − 100 = 45, then + 2 = 47.' },
        { q: '233 − 196', work: '233 − 200 = 33, then + 4 = 37.' },
      ],
      whyItWorks:
        'A round number like 30 or 100 is far easier to take away. Because you removed a little too much, you simply hand that little bit back at the end.',
      mistakes:
        'You add back, you don’t subtract: rounding 28 up to 30 means you took 2 too many, so you add 2.',
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
        { q: '24 × 10', work: 'add one zero → 240.' },
        { q: '36 × 100', work: 'add two zeros → 3600.' },
        { q: '80 × 100', work: 'add two zeros → 8000.' },
        { q: '15 × 1000', work: 'add three zeros → 15000.' },
        { q: '203 × 100', work: 'add two zeros → 20300.' },
      ],
      whyItWorks:
        'Multiplying by ten slides every digit one place to the left (units → tens → hundreds). The new zeros are just placeholders filling the empty spots.',
      mistakes:
        'Count the zeros carefully — × 100 adds two zeros, × 1000 adds three. One zero too few or too many changes the answer hugely.',
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
        { q: '8 × 5', work: '80 → half → 40.' },
        { q: '18 × 5', work: '180 → half → 90.' },
        { q: '24 × 5', work: '240 → half → 120.' },
        { q: '33 × 5', work: '330 → half → 165.' },
        { q: '46 × 5', work: '460 → half → 230.' },
      ],
      whyItWorks:
        'Five is exactly half of ten. Multiplying by ten is effortless, and halving a tidy “×10” number is easy too.',
      mistakes:
        'Multiply by 10 first, then halve — not the other way round.',
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
        { q: '8 × 9', work: '80 − 8 = 72.' },
        { q: '12 × 9', work: '120 − 12 = 108.' },
        { q: '14 × 9', work: '140 − 14 = 126.' },
        { q: '23 × 9', work: '230 − 23 = 207.' },
        { q: '35 × 9', work: '350 − 35 = 315.' },
      ],
      whyItWorks:
        'Nine is one less than ten, so nine lots of a number = ten lots minus one lot of it.',
      mistakes:
        'Subtract the whole number, not 1 — 7 × 9 is 70 − 7, not 70 − 1.',
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
        { q: '4 × 11', work: 'the digit just doubles into both places → 44.' },
        { q: '35 × 11', work: '3 (3+5) 5 = 385.' },
        { q: '72 × 11', work: '7 (7+2) 2 = 792.' },
        { q: '63 × 11', work: '6 (6+3) 3 = 693.' },
        { q: '76 × 11', work: '7 (13) 6 → carry the 1 → 836.' },
        { q: '85 × 11', work: '8 (13) 5 → carry → 935.' },
      ],
      whyItWorks:
        'Times 11 is times 10 plus one more copy. Lined up, the two copies overlap so the digit-sum drops neatly into the middle place.',
      mistakes:
        'If the middle sum reaches 10 or more, carry the 1 to the left: 76 × 11, the middle is 13, so the 7 becomes 8 → 836.',
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
        { q: '15²', work: '1 × 2 = 2 → 225.' },
        { q: '25²', work: '2 × 3 = 6 → 625.' },
        { q: '35²', work: '3 × 4 = 12 → 1225.' },
        { q: '45²', work: '4 × 5 = 20 → 2025.' },
        { q: '85²', work: '8 × 9 = 72 → 7225.' },
        { q: '95²', work: '9 × 10 = 90 → 9025.' },
      ],
      whyItWorks:
        'A number ending in 5 is (10n + 5). Squaring gives 100·n·(n+1) + 25 — literally “n times the next number” followed by 25.',
      mistakes:
        'Multiply the front part by the NEXT number up, not by itself, and always tack on 25.',
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
        { q: '9 × 8 (base 10)', work: 'deficits 1 & 2 → 9−2 = 7, 1×2 = 2 → 72.' },
        { q: '97 × 96 (base 100)', work: 'deficits 3 & 4 → 93 | 12 = 9312.' },
        { q: '98 × 94 (base 100)', work: 'deficits 2 & 6 → 92 | 12 = 9212.' },
        { q: '95 × 97 (base 100)', work: 'deficits 5 & 3 → 92 | 15 = 9215.' },
        { q: '88 × 97 (base 100)', work: 'deficits 12 & 3 → 85 | 36 = 8536.' },
      ],
      whyItWorks:
        'Writing each number as “base minus a small gap”, the multiplication (B−a)(B−b) tidily splits into a left part (cross-subtraction) and a right part (the gaps multiplied).',
      mistakes:
        'The right part must fill the right number of digits (two for base 100). If it overflows, carry the extra into the left part.',
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
        { q: '21 × 3', work: 'units 1×3 = 3, tens 2×3 = 6 → 63.' },
        { q: '12 × 13', work: 'units 2×3 = 6, cross 1×3+2×1 = 5, tens 1×1 = 1 → 156.' },
        { q: '23 × 41', work: 'units 3, cross 14 (write 4 carry 1), tens 8+1 = 9 → 943.' },
        { q: '34 × 21', work: 'units 4, cross 11 (write 1 carry 1), tens 6+1 = 7 → 714.' },
        { q: '14 × 15', work: 'units 20 (0 carry 2), cross 9+2 = 11 (1 carry 1), tens 1+1 = 2 → 210.' },
        { q: '32 × 24', work: 'units 8, cross 12+4 = 16 (6 carry 1), tens 6+1 = 7 → 768.' },
      ],
      whyItWorks:
        'The three little products are exactly the units, the “cross-over” tens, and the hundreds of the answer — gathered up with the usual carries.',
      mistakes:
        'Carry from right to left as you combine the three parts, just like a normal sum — you just never write the rows out.',
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
        { q: '13²', work: '10 × 16 = 160, + 3² = 169.' },
        { q: '32²', work: '30 × 34 = 1020, + 2² = 1024.' },
        { q: '41²', work: '40 × 42 = 1680, + 1² = 1681.' },
        { q: '48²', work: '50 × 46 = 2300, + 2² = 2304 (rounded up to 50).' },
        { q: '67²', work: '70 × 64 = 4480, + 3² = 4489 (rounded up to 70).' },
      ],
      whyItWorks:
        'It uses n² = (n−d)(n+d) + d². Choosing d so one side lands on a round ten makes that first product something you can do instantly.',
      mistakes:
        'Always add d² back on — and when you round UP (48 → 50), d still squares to a positive number.',
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
        { q: '10% of 80', work: '80 ÷ 10 = 8.' },
        { q: '20% of 90', work: '10% = 9, doubled = 18.' },
        { q: '50% of 64', work: 'half → 32.' },
        { q: '25% of 60', work: 'a quarter → 60 ÷ 4 = 15.' },
        { q: '15% of 80', work: '10% = 8, 5% = 4 → 8 + 4 = 12.' },
      ],
      whyItWorks:
        'Percent means “out of 100”. Once you have 10% (just a tenth), every other percentage is a few easy steps from it.',
      mistakes:
        'For 20% take two lots of 10% — don’t divide 10% again.',
      tip: '50% = half, 25% = a quarter, 1% = divide by 100.',
      diagram: svg(
        `<text x="20" y="55" font-size="24" font-weight="700" fill="#495057">10% of 80 = 8</text>
         <text x="20" y="95" font-size="22" fill="#2b8a3e">20% = 8 + 8 = 16</text>
         <text x="20" y="135" font-size="22" fill="#2b8a3e">5% = 8 ÷ 2 = 4</text>
         <text x="20" y="170" font-size="22" font-weight="800" fill="#d6336c">15% = 12</text>`
      ),
    },
  },

  // ===== TEEN (13–16) =======================================================
  {
    id: 'bigmult',
    name: 'Multiply Any Numbers',
    emoji: '✳️',
    color: '#ffe3e3',
    sutra: 'Ūrdhva-Tiryagbhyām for everything',
    tagline: 'Crosswise multiplication scales up to any size.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'The vertically-and-crosswise sutra is not just for two digits — it multiplies numbers ' +
        'of any size in a single line. You sweep through pairs of digits, carrying as you go.',
      steps: [
        'For 3-digit × 2-digit, line them up and take crosswise products column by column.',
        'Or split the smaller number: 234 × 12 = 234 × 10 + 234 × 2.',
        '= 2340 + 468 = 2808.',
      ],
      examples: [
        { q: '23 × 4', work: '20 × 4 + 3 × 4 = 80 + 12 = 92.' },
        { q: '23 × 47', work: '23 × 40 + 23 × 7 = 920 + 161 = 1081.' },
        { q: '234 × 12', work: '234 × 10 + 234 × 2 = 2340 + 468 = 2808.' },
        { q: '125 × 24', work: '125 × 20 + 125 × 4 = 2500 + 500 = 3000.' },
        { q: '312 × 21', work: '312 × 20 + 312 × 1 = 6240 + 312 = 6552.' },
        { q: '45 × 67', work: '45 × 60 + 45 × 7 = 2700 + 315 = 3015.' },
      ],
      whyItWorks:
        'Breaking the smaller number into tens and units turns one hard multiplication into two easy ones that you simply add together.',
      mistakes:
        'Line the parts up by place value when you add: 2340 + 468, not 2340 + 4680.',
      tip: 'Splitting by tens and units is the same idea written more simply — use whichever is faster.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">234 × 12</text>
         <text x="20" y="95" font-size="20" fill="#1c7ed6">234 × 10 = 2340</text>
         <text x="20" y="125" font-size="20" fill="#e8590c">234 × 2 = 468</text>
         <text x="20" y="160" font-size="22" font-weight="800" fill="#2f9e44">2340 + 468 = 2808</text>`
      ),
    },
  },
  {
    id: 'diffsquares',
    name: 'Difference of Squares',
    emoji: '🔷',
    color: '#d0bfff',
    sutra: '(a − b)(a + b) = a² − b²',
    tagline: 'Multiply numbers either side of a round number, fast.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'When two numbers sit the same distance either side of a round number, their product is ' +
        'just that round number squared minus the gap squared.',
      steps: [
        '47 × 53 sit either side of 50 (3 away each).',
        'Middle squared: 50² = 2500.',
        'Minus the gap squared: 2500 − 3² = 2500 − 9 = 2491.',
      ],
      examples: [
        { q: '18 × 22', work: '20² − 2² = 400 − 4 = 396.' },
        { q: '47 × 53', work: '50² − 3² = 2500 − 9 = 2491.' },
        { q: '28 × 32', work: '30² − 2² = 900 − 4 = 896.' },
        { q: '17 × 23', work: '20² − 3² = 400 − 9 = 391.' },
        { q: '59 × 61', work: '60² − 1² = 3600 − 1 = 3599.' },
        { q: '96 × 104', work: '100² − 4² = 10000 − 16 = 9984.' },
      ],
      whyItWorks:
        '(m − d)(m + d) always equals m² − d². If the two numbers sit the same distance either side of a round number m, the product is just m² minus the gap squared.',
      mistakes:
        'It only works when both numbers are the SAME distance from the middle number — check the midpoint first.',
      tip: 'It only works when the two numbers share the same midpoint — spot the round number in the middle.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">47 × 53  (around 50)</text>
         <text x="20" y="100" font-size="22" fill="#7048e8">50² − 3²</text>
         <text x="20" y="140" font-size="22" font-weight="800" fill="#2f9e44">2500 − 9 = 2491</text>`
      ),
    },
  },
  {
    id: 'cubes',
    name: 'Cubes',
    emoji: '🧊',
    color: '#a5d8ff',
    sutra: 'Multiply three times — smartly',
    tagline: 'Raise numbers to the third power without long sums.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'A cube is a number times itself three times. Build it in two easy hops: square first, ' +
        'then multiply by the number once more.',
      steps: [
        'For 7³, first square: 7² = 49.',
        'Then multiply by 7 again: 49 × 7 = 343.',
        'So 7³ = 343.',
      ],
      examples: [
        { q: '4³', work: '4² = 16, × 4 = 64.' },
        { q: '5³', work: '5² = 25, × 5 = 125.' },
        { q: '7³', work: '7² = 49, × 7 = 343.' },
        { q: '9³', work: '9² = 81, × 9 = 729.' },
        { q: '11³', work: '11² = 121, × 11 = 1331.' },
        { q: '12³', work: '12² = 144, × 12 = 1728.' },
      ],
      whyItWorks:
        'A cube is the square multiplied by the number one more time, so a strong knowledge of squares makes cubes only one step further.',
      mistakes:
        'Square first, then multiply by the number again — that’s three of the number multiplied in total.',
      tip: 'Knowing your squares makes cubes one extra step away.',
      diagram: svg(
        `<text x="20" y="60" font-size="24" font-weight="700" fill="#495057">7³</text>
         <text x="20" y="105" font-size="22" fill="#1c7ed6">7 × 7 = 49</text>
         <text x="20" y="145" font-size="22" font-weight="800" fill="#2f9e44">49 × 7 = 343</text>`
      ),
    },
  },
  {
    id: 'sqrt',
    name: 'Square Roots',
    emoji: '√',
    color: '#c3fae8',
    sutra: 'What times itself makes this?',
    tagline: 'Find the square root of a perfect square in your head.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'A square root undoes a square. For a perfect square you can pin it down from two clues: ' +
        'how big it is, and what its last digit is.',
      steps: [
        'Size: 1225 is between 30² (900) and 40² (1600), so the root is in the 30s.',
        'Last digit: it ends in 5, and only 5² ends in 5 → the root ends in 5.',
        'Put it together: √1225 = 35.',
      ],
      examples: [
        { q: '√144', work: '12 × 12 = 144 → 12.' },
        { q: '√169', work: 'ends in 9 (root ends 3 or 7), just above 13² → 13.' },
        { q: '√625', work: 'ends in 5 → root ends 5, in the 20s → 25.' },
        { q: '√784', work: 'between 20² and 30², ends in 4 (2 or 8) → 28.' },
        { q: '√1225', work: 'between 30² and 40², ends in 5 → 35.' },
        { q: '√1764', work: 'between 40² and 50², ends in 4 (2 or 8) → 42.' },
      ],
      whyItWorks:
        'For a perfect square the overall size pins down the tens digit, and the last digit pins down the units digit — together they leave only one answer.',
      mistakes:
        'Two units digits can give the same ending (4 → 2 or 8). Use the size of the number to pick the right one.',
      tip: 'Last digits: 1→1/9, 4→2/8, 9→3/7, 6→4/6, 5→5, 0→0. The size tells you which.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">√1225</text>
         <text x="20" y="95" font-size="20" fill="#1c7ed6">30² = 900, 40² = 1600 → 30s</text>
         <text x="20" y="130" font-size="20" fill="#e8590c">ends in 5 → root ends in 5</text>
         <text x="20" y="165" font-size="22" font-weight="800" fill="#2f9e44">= 35</text>`
      ),
    },
  },
  {
    id: 'divisible',
    name: 'Divisibility Tricks',
    emoji: '🔍',
    color: '#ffec99',
    sutra: 'Tests without dividing',
    tagline: 'Tell instantly if a number divides exactly.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'You can check whether a number divides exactly without doing the division — each divisor ' +
        'has its own quick test.',
      steps: [
        'By 3 or 9: add up all the digits. If that total divides by 3 (or 9), so does the number.',
        'By 4: look only at the last two digits — if they make a multiple of 4, it works.',
        'By 11: alternately add and subtract the digits; if the result is 0 or a multiple of 11, yes.',
      ],
      examples: [
        { q: 'Is 738 divisible by 9?', work: '7+3+8 = 18, divisible by 9 → Yes.' },
        { q: 'Is 451 divisible by 3?', work: '4+5+1 = 10, not a multiple of 3 → No.' },
        { q: 'Is 1316 divisible by 4?', work: 'last two digits 16, a multiple of 4 → Yes.' },
        { q: 'Is 234 divisible by 6?', work: 'even, and 2+3+4 = 9 (÷3) → Yes.' },
        { q: 'Is 2728 divisible by 11?', work: '2−7+2−8 = −11 → Yes.' },
        { q: 'Is 5283 divisible by 9?', work: '5+2+8+3 = 18 → Yes.' },
      ],
      whyItWorks:
        'The digit-sum tests work because 10, 100, 1000 … are all one more than a multiple of 3 and 9. The alternating sum works the same way for 11.',
      mistakes:
        'For 4, only the last two digits matter. For 6, the number must pass BOTH the 2-test and the 3-test.',
      tip: 'By 6 means divisible by both 2 and 3.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">738 ÷ 9?</text>
         <text x="20" y="95" font-size="20" fill="#1c7ed6">7 + 3 + 8 = 18</text>
         <text x="20" y="130" font-size="20" fill="#2f9e44">18 ÷ 9 = 2 ✓</text>
         <text x="20" y="165" font-size="22" font-weight="800" fill="#d6336c">Yes!</text>`
      ),
    },
  },

  // ===== MASTER (16+ / grown-ups) ==========================================
  {
    id: 'cuberoot',
    name: 'Cube Roots',
    emoji: '∛',
    color: '#bac8ff',
    sutra: 'Last digit gives it away',
    tagline: 'Cube roots of perfect cubes — almost instantly.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'For a perfect cube, the LAST digit of the answer is fixed by the last digit of the number, ' +
        'and the FIRST digit comes from the leading group. Two digits, no division.',
      steps: [
        'Split off the last three digits. The front part of 50653 is 50.',
        'First digit: 3³ = 27 ≤ 50 < 64 = 4³, so it starts with 3.',
        'Last digit: the cube ends in 3, and only 7³ ends in 3 → ends in 7. Answer 37.',
      ],
      examples: [
        { q: '∛729', work: 'ends in 9 → root ends 9; one group → 9.' },
        { q: '∛2197', work: 'front 2 → starts 1; ends 7 → ends 3 → 13.' },
        { q: '∛9261', work: 'front 9 → starts 2; ends 1 → ends 1 → 21.' },
        { q: '∛17576', work: 'front 17 → starts 2; ends 6 → ends 6 → 26.' },
        { q: '∛32768', work: 'front 32 → starts 3; ends 8 → ends 2 → 32.' },
        { q: '∛50653', work: 'front 50 → starts 3; ends 3 → ends 7 → 37.' },
      ],
      whyItWorks:
        'The last digit of a perfect cube uniquely fixes the last digit of its root, while the leading group (everything before the last three digits) fixes the first digit.',
      mistakes:
        'Split off the LAST THREE digits before reading the front group — 50653 → front is 50, not 506.',
      tip: 'Last-digit map: 1→1, 8→2, 7→3, 4→4, 5→5, 6→6, 3→7, 2→8, 9→9, 0→0.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">∛50653</text>
         <text x="20" y="95" font-size="20" fill="#1c7ed6">50 → starts with 3</text>
         <text x="20" y="130" font-size="20" fill="#e8590c">ends 3 → ends in 7</text>
         <text x="20" y="165" font-size="22" font-weight="800" fill="#2f9e44">= 37</text>`
      ),
    },
  },
  {
    id: 'quickdiv',
    name: 'Quick Dividing',
    emoji: '➗',
    color: '#b2f2bb',
    sutra: 'Turn division into easy multiplication',
    tagline: 'Divide by 5, 25 or 50 by multiplying instead.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Dividing by 5, 25 or 50 is awkward — but each is a tidy fraction of a power of ten, so you ' +
        'can multiply and shift instead.',
      steps: [
        '÷ 5  is the same as × 2 then ÷ 10.   240 ÷ 5 = 480 ÷ 10 = 48.',
        '÷ 25 is the same as × 4 then ÷ 100.  900 ÷ 25 = 3600 ÷ 100 = 36.',
        '÷ 50 is the same as × 2 then ÷ 100.  900 ÷ 50 = 1800 ÷ 100 = 18.',
      ],
      examples: [
        { q: '240 ÷ 5', work: '× 2 = 480, ÷ 10 = 48.' },
        { q: '135 ÷ 5', work: '× 2 = 270, ÷ 10 = 27.' },
        { q: '900 ÷ 25', work: '× 4 = 3600, ÷ 100 = 36.' },
        { q: '350 ÷ 25', work: '× 4 = 1400, ÷ 100 = 14.' },
        { q: '1300 ÷ 50', work: '× 2 = 2600, ÷ 100 = 26.' },
        { q: '4200 ÷ 50', work: '× 2 = 8400, ÷ 100 = 84.' },
      ],
      whyItWorks:
        '5, 25 and 50 are tidy fractions of 10 and 100, so dividing by them becomes a quick multiply followed by sliding the digits.',
      mistakes:
        'Match the trick to the divisor: ÷5 is ×2 then ÷10; ÷25 is ×4 then ÷100; ÷50 is ×2 then ÷100.',
      tip: 'It works because 5 = 10⁄2, 25 = 100⁄4 and 50 = 100⁄2.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">240 ÷ 5</text>
         <text x="20" y="95" font-size="20" fill="#2b8a3e">240 × 2 = 480</text>
         <text x="20" y="135" font-size="22" font-weight="800" fill="#2f9e44">480 ÷ 10 = 48</text>`
      ),
    },
  },
  {
    id: 'calendar',
    name: 'Day of the Week',
    emoji: '📅',
    color: '#ffd8a8',
    sutra: 'Every date has an anchor day',
    tagline: 'Work out the weekday of any date — a classic mental feat.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Every year has an "anchor" weekday that certain easy dates always land on. Find the nearest ' +
        'anchor, then count the days across to your date. With practice it is almost instant.',
      steps: [
        'Each year has a doomsday — dates like 4/4, 6/6, 8/8, 10/10, 12/12 all fall on it.',
        'For the 2000s, 2000 started on a Tuesday; add the year plus its leap-years and reduce by 7.',
        'Step from the nearest doomsday to your date, counting weekdays.',
      ],
      examples: [
        { q: 'What day is 1 January 2000?', work: 'Saturday.' },
        { q: 'What day is 15 August 1947?', work: 'Friday.' },
        { q: 'What day is 26 January 1950?', work: 'Thursday.' },
        { q: 'What day is 1 January 2025?', work: 'Wednesday.' },
        { q: 'What day is 4 July 2026?', work: 'the 2026 doomsday is Saturday; 4 July lands on it → Saturday.' },
        { q: 'What day is 25 December 2025?', work: 'step from 12/12 (a Friday) → Thursday.' },
      ],
      whyItWorks:
        'Anchoring to a known weekday in the year and stepping in sevens reaches any date, because the days of the week repeat every 7 days.',
      mistakes:
        'Remember leap years add an extra day from March onwards — they shift dates later in the year by one.',
      tip: 'It is fine to count forwards or backwards in 7s — weekdays repeat every 7 days.',
      diagram: svg(
        `<text x="20" y="50" font-size="20" font-weight="700" fill="#495057">Doomsdays land on:</text>
         <text x="20" y="85" font-size="18" fill="#1c7ed6">4/4 · 6/6 · 8/8 · 10/10 · 12/12</text>
         <text x="20" y="125" font-size="18" fill="#e8590c">find the nearest one…</text>
         <text x="20" y="160" font-size="20" font-weight="800" fill="#2f9e44">…then step to your date</text>`
      ),
    },
  },
  {
    id: 'percentchange',
    name: 'Discounts & Changes',
    emoji: '🏷️',
    color: '#d8f5a2',
    sutra: 'Build the change from 10%',
    tagline: 'Add or knock off a percentage — sales, tips and tax.',
    crownGoal: CROWN_GOAL,
    guide: {
      intro:
        'Real-life percentages are about increasing or decreasing an amount. Find the percentage ' +
        'piece (built from 10%), then add it on or take it off.',
      steps: [
        'Decrease 80 by 25%: 25% of 80 = 20.',
        'Take it off: 80 − 20 = 60.',
        'To increase instead, you would add the piece on: 80 + 20 = 100.',
      ],
      examples: [
        { q: 'Decrease 80 by 25%', work: '25% = 20, 80 − 20 = 60.' },
        { q: 'Increase 200 by 15%', work: '15% = 30, 200 + 30 = 230.' },
        { q: 'Decrease 50 by 10%', work: '10% = 5, 50 − 5 = 45.' },
        { q: 'Increase 60 by 50%', work: '50% = 30, 60 + 30 = 90.' },
        { q: 'Decrease 120 by 20%', work: '20% = 24, 120 − 24 = 96.' },
        { q: 'Increase 40 by 25%', work: '25% = 10, 40 + 10 = 50.' },
      ],
      whyItWorks:
        'You find the percentage “piece” from 10% (and 5%), then add it on for an increase or take it off for a decrease.',
      mistakes:
        'A 20% rise followed by a 20% fall does NOT return to the start — each percentage acts on a different amount.',
      tip: 'A 20% tip on a bill: find 10%, double it. A 25% sale: take off a quarter.',
      diagram: svg(
        `<text x="20" y="55" font-size="22" font-weight="700" fill="#495057">Decrease 80 by 25%</text>
         <text x="20" y="100" font-size="22" fill="#2b8a3e">25% of 80 = 20</text>
         <text x="20" y="140" font-size="22" font-weight="800" fill="#2f9e44">80 − 20 = 60</text>`
      ),
    },
  },
];

// Which dashboard tier each technique belongs to.
const TIER_OF = {
  friends10: 'starter', double: 'starter', quickadd: 'starter', cleversub: 'starter',
  times10: 'starter', times5: 'starter', times9: 'starter', times11: 'starter',
  square5: 'junior', nikhilam: 'junior', urdhva: 'junior', squareany: 'junior', percent: 'junior',
  bigmult: 'teen', diffsquares: 'teen', cubes: 'teen', sqrt: 'teen', divisible: 'teen',
  cuberoot: 'master', quickdiv: 'master', calendar: 'master', percentchange: 'master',
};
TECHNIQUES.forEach((t) => {
  t.tier = TIER_OF[t.id] || 'starter';
});

export const TECHNIQUE_INDEX = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));
