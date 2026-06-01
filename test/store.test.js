// test/store.test.js
// The store must switch to Redis whether Vercel injects the legacy KV var names
// or the Upstash-for-Redis marketplace var names.
import assert from 'node:assert';

process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

const { backend } = await import('../server/store.js');
assert.equal(backend, 'kv', 'store should detect Upstash KV env vars and use Redis');

console.log('✅ Store detects Upstash/Vercel KV env vars.');
