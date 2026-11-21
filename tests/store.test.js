import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, defaultState, exportJSON, importJSON } from '../js/store.js';

test('normalize fills missing pieces with defaults', () => {
  const s = normalize({ settings: { restSec: 120 }, plans: { Push: [{ id: 'nope' }] } });
  assert.equal(s.settings.restSec, 120);
  assert.equal(s.settings.unit, 'lb');
  assert.ok(s.plans.Push.length > 0, 'invalid plan replaced by default');
  assert.deepEqual(s.sessions, []);
});

test('normalize drops malformed sessions', () => {
  const s = normalize({ sessions: [{ id: 'a', day: 'Push', exercises: [] }, { id: 'b', day: 'Chest', exercises: [] }, null] });
  assert.deepEqual(s.sessions.map((x) => x.id), ['a']);
});

test('backup round-trips and rejects other files', () => {
  const st = defaultState();
  st.sessions.push({ id: 'x', day: 'Legs', startedAt: 1, finishedAt: 2, exercises: [] });
  assert.deepEqual(importJSON(exportJSON(st)).sessions, st.sessions);
  assert.throws(() => importJSON('{"foo":1}'), /backup/);
  assert.throws(() => importJSON('not json'), /JSON/);
});
