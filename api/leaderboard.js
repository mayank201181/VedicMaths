// api/leaderboard.js — Vercel serverless function: POST /api/leaderboard
// Public. Returns the Top-30 by coins using NICKNAMES only (no real names).
import { handleLeaderboard } from '../server/core.js';

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
  const body = req.method === 'POST' ? await readBody(req) : {};
  const out = await handleLeaderboard(body);
  res.status(out.status).send(JSON.stringify(out.json));
}
