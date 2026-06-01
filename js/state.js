// js/state.js
// The player-state shape plus a migration (ensureShape) so older saves keep
// working when new techniques or fields are added.

import { APP, TECHNIQUES, BANDS, DEFAULT_REGION } from './content.js';

export function newPlayer(name, band) {
  const p = {
    version: APP.version,
    name: name.trim(),
    band: band || '7-8',
    settings: { region: DEFAULT_REGION, sound: true, voice: true },
    techniques: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return ensureShape(p);
}

function blankTechnique() {
  return { crowns: 0, stars: 0, attempts: 0, correct: 0, bestStreak: 0, lastDifficulty: null };
}

// Backfill any missing fields / techniques so the app never crashes on an old save.
export function ensureShape(player) {
  if (!player || typeof player !== 'object') player = {};
  player.version = APP.version;
  player.name = typeof player.name === 'string' ? player.name : 'Friend';
  if (!BANDS.some((b) => b.id === player.band)) player.band = '7-8';
  player.settings = player.settings || {};
  if (!player.settings.region) player.settings.region = DEFAULT_REGION;
  if (typeof player.settings.sound !== 'boolean') player.settings.sound = true;
  if (typeof player.settings.voice !== 'boolean') player.settings.voice = true;
  player.techniques = player.techniques || {};
  for (const t of TECHNIQUES) {
    const cur = player.techniques[t.id] || {};
    player.techniques[t.id] = { ...blankTechnique(), ...cur };
  }
  player.createdAt = player.createdAt || Date.now();
  player.updatedAt = Date.now();
  return player;
}

export function bandStartDifficulty(player) {
  const band = BANDS.find((b) => b.id === player.band) || BANDS[1];
  return band.startDifficulty;
}
