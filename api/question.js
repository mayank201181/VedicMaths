// api/question.js — Vercel serverless function: GET /api/question?topic&difficulty&level
import { handleQuestion } from '../server/core.js';

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(url.searchParams.entries());
  const out = handleQuestion(query);
  res.setHeader('Content-Type', 'application/json');
  res.status(out.status).send(JSON.stringify(out.json));
}
