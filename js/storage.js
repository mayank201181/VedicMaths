// js/storage.js
// Browser localStorage cache. Keeps the app fully usable offline and remembers
// which player was last active on this device.

const PREFIX = 'magicmaths:';
const LAST = PREFIX + 'last';

function keyFor(name) {
  return PREFIX + 'player:' + name.trim().toLowerCase();
}

export function saveLocal(player) {
  try {
    localStorage.setItem(keyFor(player.name), JSON.stringify(player));
    localStorage.setItem(LAST, player.name);
  } catch (_) {
    /* storage may be unavailable (private mode) — ignore */
  }
}

export function loadLocal(name) {
  try {
    const raw = localStorage.getItem(keyFor(name));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function lastPlayerName() {
  try {
    return localStorage.getItem(LAST) || null;
  } catch (_) {
    return null;
  }
}

export function listLocalPlayers() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + 'player:')) {
        const p = JSON.parse(localStorage.getItem(k));
        if (p && p.name) out.push(p);
      }
    }
  } catch (_) {
    /* ignore */
  }
  return out;
}

export function clearLast() {
  try {
    localStorage.removeItem(LAST);
  } catch (_) {
    /* ignore */
  }
}
