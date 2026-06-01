// api/owner.js — Vercel serverless function: POST /api/owner
// Passcode-protected (OWNER_KEY env var). Lists players and toggles disable.
import { handleOwner } from '../server/core.js';

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).send(JSON.stringify({ error: 'method-not-allowed' }));
  }
  const out = await handleOwner(await readBody(req));
  res.status(out.status).send(JSON.stringify(out.json));
}
