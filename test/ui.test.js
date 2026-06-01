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
window.speechSynthesis = { cancel() {}, speak() {} };
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
assert.ok($$('.tech-card').length >= 10, 'all techniques shown on dashboard');
$$('.tech-card')[0].click();
await tick();

// 3) Guide
assert.ok($('.diagram svg'), 'guide has an SVG diagram');
assert.ok($$('.diff-btn').length === 3, 'three difficulty buttons');
$('.diff-btn[data-diff="0"]').click(); // Basic = multiple choice
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
