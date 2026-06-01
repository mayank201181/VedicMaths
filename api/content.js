// api/content.js — Vercel serverless function: GET /api/content
import { handleContent } from '../server/core.js';

export default function handler(req, res) {
  const out = handleContent();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=300');
  res.status(out.status).send(JSON.stringify(out.json));
}
