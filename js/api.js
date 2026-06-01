// js/api.js
// Thin client between the browser and the serverless API. Every call falls back
// gracefully so the app keeps working offline (local cache only).

import { ensureShape } from './state.js';
import { saveLocal, loadLocal } from './storage.js';

const TIMEOUT = 4000;

async function req(path, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(path, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Load a player: try the server, fall back to the local cache, else null.
export async function loadPlayer(name) {
  try {
    const data = await req('/api/player/' + encodeURIComponent(name));
    if (data && data.player) {
      const p = ensureShape(data.player);
      saveLocal(p);
      return p;
    }
  } catch (_) {
    /* offline — use local */
  }
  const local = loadLocal(name);
  return local ? ensureShape(local) : null;
}

// Save a player: always write local immediately; sync to server best-effort.
export async function savePlayer(player) {
  const p = ensureShape(player);
  saveLocal(p);
  try {
    await req('/api/player/' + encodeURIComponent(p.name), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
  } catch (_) {
    /* will sync next time we're online */
  }
  return p;
}

// Optional: fetch app content/config from the server (used as a health check).
export async function getContent() {
  try {
    return await req('/api/content');
  } catch (_) {
    return null;
  }
}
