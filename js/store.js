// Saves everything on this device (localStorage). Nothing leaves the phone.
import { DEFAULT_PLANS, DAYS, byId } from './exercises.js';

const KEY = 'ppl-tracker';
const VERSION = 1;

export function defaultState() {
  return {
    version: VERSION,
    settings: { unit: 'lb', restSec: 90, step: 5 },
    plans: JSON.parse(JSON.stringify(DEFAULT_PLANS)),
    sessions: [],
    active: null,
  };
}

/** Bring older or partial data up to the current shape. */
export function normalize(data) {
  const base = defaultState();
  if (!data || typeof data !== 'object') return base;
  const out = {
    version: VERSION,
    settings: { ...base.settings, ...(data.settings || {}) },
    plans: {},
    sessions: Array.isArray(data.sessions) ? data.sessions.filter(validSession) : [],
    active: data.active && validSession(data.active) ? data.active : null,
  };
  for (const d of DAYS) {
    const p = data.plans && Array.isArray(data.plans[d]) ? data.plans[d].filter((x) => x && byId[x.id]) : null;
    out.plans[d] = p && p.length ? p : base.plans[d];
  }
  return out;
}

function validSession(s) {
  return s && typeof s.id === 'string' && DAYS.includes(s.day) && Array.isArray(s.exercises);
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportJSON(state) {
  return JSON.stringify({ app: 'ppl-tracker', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

/** Parse a backup file. Throws with a readable message if it isn't one. */
export function importJSON(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file isn’t valid JSON.'); }
  if (!data || data.app !== 'ppl-tracker') throw new Error('That file isn’t a PPL Tracker backup.');
  return normalize(data);
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Ask the browser not to clear our data when space is low (best effort). */
export function requestPersistence() {
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch { /* ignore */ }
}
