// server/store.js
// Storage with two backends, chosen automatically:
//   • Vercel KV / Upstash Redis  — when KV_REST_API_URL + KV_REST_API_TOKEN exist
//     (gives cross-device sync)
//   • a local JSON file          — otherwise (great for `node server.js`)
//
// Zero npm dependencies: uses global fetch (Node 18+) and node:fs.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const useKV = Boolean(KV_URL && KV_TOKEN);

const KEY = (name) => 'magicmaths:player:' + String(name).trim().toLowerCase();
const INDEX_KEY = 'magicmaths:index';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'players.json');

export const backend = useKV ? 'kv' : 'file';

// ---- Upstash/Vercel KV via REST -------------------------------------------
async function kvCmd(cmd) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error('KV ' + res.status);
  const data = await res.json();
  return data.result;
}

// ---- JSON file -------------------------------------------------------------
async function readFileDB() {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}
async function writeFileDB(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// ---- Public API ------------------------------------------------------------
export async function getPlayer(name) {
  if (useKV) {
    const raw = await kvCmd(['GET', KEY(name)]);
    return raw ? JSON.parse(raw) : null;
  }
  const db = await readFileDB();
  return db[KEY(name)] || null;
}

export async function setPlayer(name, player) {
  if (useKV) {
    await kvCmd(['SET', KEY(name), JSON.stringify(player)]);
    await kvCmd(['SADD', INDEX_KEY, KEY(name)]);
    return player;
  }
  const db = await readFileDB();
  db[KEY(name)] = player;
  await writeFileDB(db);
  return player;
}

export async function listPlayers() {
  if (useKV) {
    const keys = (await kvCmd(['SMEMBERS', INDEX_KEY])) || [];
    const out = [];
    for (const k of keys) {
      const raw = await kvCmd(['GET', k]);
      if (raw) out.push(JSON.parse(raw));
    }
    return out;
  }
  const db = await readFileDB();
  return Object.values(db);
}
