// test/ui.test.js
// Headless click-through of the whole UI with jsdom. Not part of `npm test`
// (jsdom is dev-only); run with: node test/ui.test.js  after `npm i jsdom`.

import assert from 'node:assert';
import { JSDOM } from 'jsdom';

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

// Re-derive the MC answer from the question text so we can click correctly.
function expected(text) {
  const t = text.replace(/,/g, '');
  let m;
  if ((m = t.match(/^(\d+) \+ \? = (\d+)$/))) return +m[2] - +m[1];
  if ((m = t.match(/^Double (\d+)$/))) return +m[1] * 2;
  if ((m = t.match(/^Half of (\d+)$/))) return +m[1] / 2;
  if ((m = t.match(/^(\d+)% of (\d+)$/))) return (+m[1] * +m[2]) / 100;
  if ((m = t.match(/^(\d+)²$/))) return +m[1] * +m[1];
  if ((m = t.match(/^(\d+) × (\d+)$/))) return +m[1] * +m[2];
  if ((m = t.match(/^(\d+) \+ (\d+)$/))) return +m[1] + +m[2];
  if ((m = t.match(/^(\d+) − (\d+)$/))) return +m[1] - +m[2];
  return null;
}

const dom = new JSDOM(
  `<!doctype html><html><body><main id="app"></main></body></html>`,
  { url: 'http://localhost/', pretendToBeVisual: true }
);
const { window } = dom;

// Wire jsdom globals + stub the browser-only bits app.js touches.
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
global.fetch = () => Promise.reject(new Error('offline')); // force local fallback
window.scrollTo = () => {};
let _speaking = false;
window.speechSynthesis = {
  get speaking() {
    return _speaking;
  },
  get pending() {
    return false;
  },
  speak() {
    _speaking = true;
  },
  cancel() {
    _speaking = false;
  },
};
global.SpeechSynthesisUtterance = class {};
window.AudioContext = class {
  createOscillator() {
    return { type: '', frequency: {}, connect() {}, start() {}, stop() {} };
  }
  createGain() {
    return { gain: { value: 0, exponentialRampToValueAtTime() {} }, connect() {} };
  }
  get currentTime() {
    return 0;
  }
  get destination() {
    return {};
  }
};

await import('../js/app.js');
await tick();

const $ = (sel) => window.document.querySelector(sel);
const $$ = (sel) => [...window.document.querySelectorAll(sel)];

// 1) Welcome
assert.ok($('#nameInput'), 'name input present');
const nameInput = $('#nameInput');
nameInput.value = 'Tester';
nameInput.dispatchEvent(new window.Event('input'));
$('.band-btn[data-band="7-8"]').click();
assert.ok(!$('#startBtn').disabled, 'start enabled after name + band');
$('#startBtn').click();
await tick(60);

// 2) Dashboard
assert.ok($('.hi').textContent.includes('Tester'), 'greeting shows name');
assert.ok($$('.tier-section').length >= 4, 'techniques grouped into tier sections');
assert.ok($('.tier-section.open'), 'a tier section opens by default');
assert.ok($$('.tech-card').length >= 20, 'all techniques (incl. teen + master) shown');
// A collapsed tier opens when its header is tapped.
const collapsed = $$('.tier-section').find((s) => !s.classList.contains('open'));
assert.ok(collapsed, 'has a collapsed tier');
collapsed.querySelector('.tier-head').click();
assert.ok(collapsed.classList.contains('open'), 'tapping a tier header expands it');
$$('.tech-card')[0].click();
await tick();

// 3) Guide (now tabbed: Guide / Practice)
assert.ok($('.diagram svg'), 'guide has an SVG diagram');
assert.ok($$('.tab-btn').length === 2, 'guide has Guide/Practice tabs');
assert.ok($('.hook'), 'guide opens with a real-life hook');
assert.ok($('.watchit') && $('.watch-btn'), 'guide has an interactive "Watch it work"');
assert.ok($$('.walk').length >= 2, 'guide shows written worked examples too');
assert.ok($('.why') && $('.watchout'), 'guide has why-it-works and watch-out sections');

// "Watch it work" reveals one step at a time.
const wbtn = $('.watch-btn');
wbtn.click();
assert.equal($$('.watch-line').length, 1, 'first tap reveals step 1');
wbtn.click();
assert.equal($$('.watch-line').length, 2, 'next tap reveals step 2');

// Guided hint shows before the answer.
const hintBtn = $$('.try-hint')[0];
assert.ok($$('.try-hintbox')[0].hidden, 'hint hidden initially');
hintBtn.click();
assert.ok(!$$('.try-hintbox')[0].hidden, 'tapping 💡 shows a hint');

// "Try these yourself" self-check set with reveal toggle.
assert.ok($$('.tryitem').length >= 3, 'guide has a Try-these-yourself set');
const tryBtn = $$('.try-reveal')[0];
assert.ok($$('.try-ans')[0].hidden, 'answer hidden before reveal');
tryBtn.click();
assert.ok(!$$('.try-ans')[0].hidden, 'tapping Check reveals the answer');
tryBtn.click();
assert.ok($$('.try-ans')[0].hidden, 'tapping again hides it');

// Read-aloud button is a real toggle: tap = start, tap again = stop.
window.speechSynthesis.cancel(); // clear any narration left from "Watch it work"
const speakBtn = $('.speak-btn');
speakBtn.click();
assert.equal(speakBtn.textContent, '⏹️', 'first tap starts read-aloud');
speakBtn.click();
assert.equal(speakBtn.textContent, '🔊', 'second tap stops read-aloud');

// Switch to the Practice tab, then start Basic (multiple choice).
$('.tab-btn[data-tab="practice"]').click();
await tick();
assert.ok($$('.diff-btn').length === 3, 'three difficulty buttons in Practice');
$('.diff-btn[data-diff="0"]').click();
await tick();

// 4) Quiz (Basic / MC) — answer several correctly to earn a crown
assert.ok($('.question-text'), 'question shown');
assert.ok($('.choice-grid'), 'multiple choice rendered for basic');
let sawCrown = false;
for (let i = 0; i < 6; i++) {
  const text = $('.question-text').textContent;
  const ans = expected(text);
  assert.ok(ans !== null, 'could parse question: ' + text);
  const btn = $$('.choice-btn').find((b) => Number(b.textContent.replace(/,/g, '')) === ans);
  assert.ok(btn, 'correct choice present for: ' + text);
  btn.click();
  await tick();
  assert.ok($('.feedback.right'), 'correct answer gives positive feedback');
  if ($('.crown-msg')) sawCrown = true;
  $('.next-btn').click();
  await tick();
}
assert.ok(sawCrown, 'crown awarded after reaching goal');

// 5) Quit back to guide, try a typed (Intermediate) question
$('.back-btn').click();
await tick();
$('.diff-btn[data-diff="1"]').click();
await tick();
assert.ok($('.type-row'), 'typed input rendered for intermediate');
const typedAns = expected($('.question-text').textContent);
const input = $('.answer-input');
input.value = String(typedAns);
$('.check-btn').click();
await tick();
assert.ok($('.feedback.right'), 'typed correct answer accepted');

console.log('✅ UI click-through passed (welcome → dashboard → guide → MC quiz → crown → typed quiz).');
process.exit(0);
