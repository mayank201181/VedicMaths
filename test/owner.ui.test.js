// test/owner.ui.test.js
// Headless test of the hidden #owner flow: login → dashboard → disable toggle.
// Run with: node test/owner.ui.test.js  (after `npm i jsdom`)

import assert from 'node:assert';
import { JSDOM } from 'jsdom';

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));
const resp = (status, json) => ({ ok: status < 400, status, json: async () => json });

const dom = new JSDOM('<!doctype html><html><body><main id="app"></main></body></html>', {
  url: 'http://localhost/#owner',
  pretendToBeVisual: true,
});
const { window } = dom;
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
window.scrollTo = () => {};
window.speechSynthesis = { cancel() {}, speak() {} };
global.SpeechSynthesisUtterance = class {};
window.AudioContext = class {};

let lastList = [{ name: 'Aria', band: '7-8', disabled: false, createdAt: Date.now(), lastActive: Date.now(), answered: 5, crowns: 1 }];
global.fetch = async (url, opts) => {
  if (url !== '/api/owner') throw new Error('unexpected fetch ' + url);
  const body = JSON.parse(opts.body);
  if (body.key !== 'letmein') return resp(401, { error: 'unauthorized' });
  if (body.action === 'list') return resp(200, { backend: 'kv', players: lastList });
  if (body.action === 'setDisabled') return resp(200, { player: { name: body.name, band: '7-8', disabled: body.disabled, answered: 5, crowns: 1 } });
  return resp(400, {});
};

await import('../js/app.js');
await tick();

const $ = (s) => window.document.querySelector(s);
const $$ = (s) => [...window.document.querySelectorAll(s)];

// Login screen shown for #owner
assert.ok($('#key'), 'owner passcode prompt shown');

// Wrong passcode
$('#key').value = 'nope';
$('#go').click();
await tick();
assert.match($('#msg').textContent, /Wrong/, 'wrong passcode reported');

// Right passcode → dashboard
$('#key').value = 'letmein';
$('#go').click();
await tick();
assert.ok($('.owner-table'), 'owner dashboard renders');
const row = $$('.owner-table tbody tr')[0];
assert.ok(row && row.textContent.includes('Aria'), 'lists the player name');
const btn = row.querySelector('.mini-btn');
assert.equal(btn.textContent, 'Disable', 'starts enabled');

// Disable toggle
btn.click();
await tick();
assert.equal(btn.textContent, 'Enable', 'toggles to Enable after disabling');
assert.ok(row.classList.contains('row-disabled'), 'row marked disabled');

console.log('✅ Owner UI test passed (login → dashboard → disable toggle).');
process.exit(0);
