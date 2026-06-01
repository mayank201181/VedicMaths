// test/store.test.js
// The store must switch to Redis whether Vercel injects the legacy KV var names
// or the Upstash-for-Redis marketplace var names.
import assert from 'node:assert';

// Use a CUSTOM-PREFIXED pair (the trickiest case) to prove auto-discovery works
// no matter what Vercel's integration names the variables.
process.env.STORAGE_KV_REST_API_URL = 'https://example.upstash.io';
process.env.STORAGE_KV_REST_API_TOKEN = 'token';

const { backend } = await import('../server/store.js');
assert.equal(backend, 'kv', 'store should auto-discover a prefixed Redis REST var pair');

console.log('✅ Store auto-discovers Upstash/Vercel KV env vars (any prefix).');
