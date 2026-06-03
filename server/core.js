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
  try {
    const player = await getPlayer(name);
    return ok({ player: player || null });
  } catch (e) {
    // Storage hiccup — let the client fall back to its local copy instead of erroring.
    return ok({ player: null, warning: 'storage-unavailable' });
  }
}

// POST /api/player/:name  (body = full player object)
export async function handlePlayerPost(name, body) {
  if (!name) return bad('missing name');
  if (!body || typeof body !== 'object') return bad('missing body');
  const player = ensureShape({ ...body, name });
  try {
    // Owner control wins: a client save can never clear a disabled flag.
    const existing = await getPlayer(name);
    if (existing && existing.disabled) player.disabled = true;
    await setPlayer(name, player);
    return ok({ player });
  } catch (e) {
    // Never fail a child's session over a storage problem — they keep their
    // local copy; this one sync just didn't happen.
    return ok({ player, warning: 'not-synced' });
  }
}

// GET /api/players  (used by the grown-ups overview if ever served)
export async function handlePlayerList() {
  const players = await listPlayers();
  return ok({ players });
}

// POST /api/leaderboard  body = { name? }  — PUBLIC, shows nicknames only.
const crownsOf = (p) => Object.values(p.techniques || {}).reduce((a, b) => a + (b.crowns || 0), 0);
export async function handleLeaderboard(body = {}) {
  try {
    const players = await listPlayers();
    const ranked = players
      .filter((p) => p && p.nickname && !p.disabled)
      .map((p) => ({ nickname: p.nickname, coins: p.coins || 0, crowns: crownsOf(p) }))
      .sort((a, b) => b.coins - a.coins || b.crowns - a.crowns);
    const top = ranked.slice(0, 30);
    let you = null;
    if (body.name) {
      const me = players.find(
        (p) => p && p.name && p.name.toLowerCase() === String(body.name).toLowerCase()
      );
      if (me && me.nickname && !me.disabled) {
        const myCoins = me.coins || 0;
        you = { rank: ranked.filter((r) => r.coins > myCoins).length + 1, nickname: me.nickname, coins: myCoins };
      }
    }
    return ok({ top, you, total: ranked.length });
  } catch (e) {
    return ok({ top: [], you: null, total: 0, error: 'storage-unavailable' });
  }
}

// ---------------------------------------------------------------------------
// OWNER dashboard — passcode-protected via the OWNER_KEY environment variable.
// ---------------------------------------------------------------------------
function ownerAuthed(key) {
  const expected = process.env.OWNER_KEY;
  return Boolean(expected) && typeof key === 'string' && key.length > 0 && key === expected;
}

function summarise(p) {
  const techs = Object.values(p.techniques || {});
  return {
    name: p.name,
    band: p.band,
    disabled: Boolean(p.disabled),
    createdAt: p.createdAt || null,
    lastActive: p.updatedAt || null,
    stars: techs.reduce((a, b) => a + (b.stars || 0), 0),
    crowns: techs.reduce((a, b) => a + (b.crowns || 0), 0),
    answered: techs.reduce((a, b) => a + (b.attempts || 0), 0),
  };
}

// POST /api/owner  body = { key, action: 'list' | 'setDisabled', name?, disabled? }
export async function handleOwner(body = {}) {
  if (!process.env.OWNER_KEY) return { status: 503, json: { error: 'owner-not-configured' } };
  if (!ownerAuthed(body.key)) return { status: 401, json: { error: 'unauthorized' } };

  const action = body.action || 'list';
  try {
    if (action === 'list') {
      const players = await listPlayers();
      players.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return ok({ backend, players: players.map(summarise) });
    }
    if (action === 'setDisabled') {
      if (!body.name) return bad('missing name');
      const existing = await getPlayer(body.name);
      if (!existing) return bad('no such player');
      const player = ensureShape(existing);
      player.disabled = Boolean(body.disabled);
      await setPlayer(body.name, player);
      return ok({ player: summarise(player) });
    }
    return bad('unknown action');
  } catch (e) {
    return { status: 200, json: { backend, players: [], error: 'storage-unavailable' } };
  }
}
