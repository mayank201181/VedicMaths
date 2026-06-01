// test/api.test.js
// Tests the shared core + the serverless handlers with mock req/res.
// Uses the file-store backend (no env vars), writing to a temp data dir.

import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Isolate the file store in a temp working dir before importing modules.
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mm-'));
process.chdir(tmp);

const { handleContent, handleQuestion } = await import('../server/core.js');
const contentFn = (await import('../api/content.js')).default;
const questionFn = (await import('../api/question.js')).default;
const playerFn = (await import('../api/player.js')).default;

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(c) {
      this.statusCode = c;
      return this;
    },
    send(b) {
      this.body = b;
      return this;
    },
  };
}

// --- core ---
const content = handleContent();
assert.equal(content.status, 200);
assert.ok(content.json.techniques.length >= 10, 'has techniques');
assert.ok(content.json.app.name, 'has app name');

const q = handleQuestion({ topic: 'times11', difficulty: 1, level: 0 });
assert.equal(q.status, 200);
assert.ok(q.json.question.text.includes('11'), 'question mentions 11');

const badQ = handleQuestion({ topic: 'nope' });
assert.equal(badQ.status, 400, 'unknown topic rejected');

// --- api/content handler ---
let res = mockRes();
contentFn({ url: '/api/content' }, res);
assert.equal(res.statusCode, 200);
assert.ok(JSON.parse(res.body).techniques.length >= 10);

// --- api/question handler ---
res = mockRes();
questionFn({ url: '/api/question?topic=square5&difficulty=2&level=1' }, res);
assert.equal(res.statusCode, 200);
const qd = JSON.parse(res.body);
assert.equal(qd.question.choices, null, 'advanced is typed');

// --- api/player round trip (GET empty, POST, GET back) ---
res = mockRes();
await playerFn({ method: 'GET', url: '/api/player?name=Tester' }, res);
assert.equal(JSON.parse(res.body).player, null, 'unknown player is null');

const sample = { name: 'Tester', band: '9-10', techniques: { times11: { stars: 3, crowns: 1 } } };
res = mockRes();
await playerFn(
  { method: 'POST', url: '/api/player?name=Tester', on: makeBodyEmitter(JSON.stringify(sample)) },
  res
);
assert.equal(res.statusCode, 200);
const saved = JSON.parse(res.body).player;
assert.equal(saved.name, 'Tester');
assert.equal(saved.techniques.times11.stars, 3, 'kept stars');
assert.ok(saved.techniques.friends10, 'ensureShape backfilled techniques');

res = mockRes();
await playerFn({ method: 'GET', url: '/api/player?name=Tester' }, res);
assert.equal(JSON.parse(res.body).player.band, '9-10', 'persisted band');

// helper: turn a string body into req.on('data'/'end') emitter
function makeBodyEmitter(str) {
  const handlers = {};
  setImmediate(() => {
    handlers.data && handlers.data(str);
    handlers.end && handlers.end();
  });
  return (event, cb) => {
    handlers[event] = cb;
  };
}

// cleanup
await fs.rm(tmp, { recursive: true, force: true });
console.log('✅ API tests passed.');
