// api/player.js — Vercel serverless function: GET/POST /api/player/:name
// vercel.json rewrites /api/player/:name  ->  /api/player?name=:name
import { handlePlayerGet, handlePlayerPost } from '../server/core.js';

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
  const url = new URL(req.url, 'http://localhost');
  const name = url.searchParams.get('name') || '';
  res.setHeader('Content-Type', 'application/json');
  let out;
  if (req.method === 'POST') {
    out = await handlePlayerPost(name, await readBody(req));
  } else {
    out = await handlePlayerGet(name);
  }
  res.status(out.status).send(JSON.stringify(out.json));
}
