// server/core.js
// Shared request logic used by BOTH the local server (server.js) and the Vercel
// serverless functions (api/*.js), so behaviour is identical everywhere.

import { APP, TECHNIQUES, BANDS, DIFFICULTIES, REGIONS } from '../js/content.js';
import { generate } from '../js/vedic.js';
import { ensureShape } from '../js/state.js';
import { getPlayer, setPlayer, listPlayers, backend } from './store.js';

const ok = (json) => ({ status: 200, json });
const bad = (msg) => ({ status: 400, json: { error: msg } });

// GET /api/content — app config + technique metadata (and a health check).
export function handleContent() {
  return ok({
    app: { name: APP.name, tagline: APP.tagline, version: APP.version },
    backend,
    bands: BANDS,
    difficulties: DIFFICULTIES,
    regions: REGIONS,
    techniques: TECHNIQUES.map((t) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      sutra: t.sutra,
      tagline: t.tagline,
      crownGoal: t.crownGoal,
    })),
  });
}

// GET /api/question?topic=&difficulty=&level=
export function handleQuestion(query = {}) {
  const topic = query.topic || query.technique;
  if (!topic) return bad('missing topic');
  const difficulty = Number(query.difficulty || 0);
  const level = Number(query.level || 0);
  try {
    return ok({ topic, difficulty, level, question: generate(topic, { difficulty, level }) });
  } catch (e) {
    return bad(e.message);
  }
}

// GET /api/player/:name
export async function handlePlayerGet(name) {
  if (!name) return bad('missing name');
  const player = await getPlayer(name);
  return ok({ player: player || null });
}

// POST /api/player/:name  (body = full player object)
export async function handlePlayerPost(name, body) {
  if (!name) return bad('missing name');
  if (!body || typeof body !== 'object') return bad('missing body');
  const player = ensureShape({ ...body, name });
  await setPlayer(name, player);
  return ok({ player });
}

// GET /api/players  (used by the grown-ups overview if ever served)
export async function handlePlayerList() {
  const players = await listPlayers();
  return ok({ players });
}
