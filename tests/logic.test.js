import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextDay, e1rm, suggestWeight, lastPerformance, weeklyVolume, setsByDay, findPRs, recentPRs, daysBetween, startOfWeek } from '../js/logic.js';

const DAY = 86400000;
const t0 = new Date(2026, 10, 2, 18, 0).getTime(); // Mon Nov 2 2026
const sess = (id, day, at, exercises) => ({ id, day, startedAt: at - 3600000, finishedAt: at, exercises });
const ex = (id, sets, extra = {}) => ({ id, ...extra, sets: sets.map(([w, reps, done = true]) => ({ w, reps, done })) });

test('rotation starts with Push and follows the last finished workout, not the calendar', () => {
  assert.equal(nextDay([]), 'Push');
  const s = [sess('a', 'Push', t0, []), sess('b', 'Pull', t0 + DAY, [])];
  assert.equal(nextDay(s), 'Legs');
  s.push(sess('c', 'Legs', t0 + 2 * DAY, []));
  assert.equal(nextDay(s), 'Push');
  // ten days later is still Push; an unfinished workout does not count
  s.push({ id: 'd', day: 'Push', startedAt: t0 + 12 * DAY, exercises: [] });
  assert.equal(nextDay(s), 'Push');
});

test('rotation uses the most recent workout even if a different day was swapped in', () => {
  const s = [sess('a', 'Push', t0, []), sess('b', 'Legs', t0 + DAY, [])];
  assert.equal(nextDay(s), 'Push');
});

test('e1rm uses Epley and handles edge cases', () => {
  assert.equal(e1rm(0, 10), 0);
  assert.equal(e1rm(100, 1), 100);
  assert.ok(Math.abs(e1rm(70, 10) - 93.333) < 0.01);
});

test('suggests a weight increase only when every top set reached the top of the range', () => {
  const plan = { lo: 8, hi: 10 };
  assert.deepEqual(suggestWeight({ sets: [{ w: 70, reps: 10 }, { w: 70, reps: 10 }] }, plan), { weight: 75, increase: true });
  assert.deepEqual(suggestWeight({ sets: [{ w: 70, reps: 10 }, { w: 70, reps: 8 }] }, plan), { weight: 70, increase: false });
  assert.deepEqual(suggestWeight({ sets: [{ w: 20, reps: 15 }] }, { lo: 12, hi: 15 }), { weight: 22.5, increase: true });
  assert.equal(suggestWeight(null, plan), null);
});

test('last performance ignores undone sets and picks the latest session', () => {
  const s = [
    sess('a', 'Push', t0, [ex('bench', [[60, 10]])]),
    sess('b', 'Push', t0 + 3 * DAY, [ex('bench', [[65, 9], [65, 8, false]])]),
  ];
  const last = lastPerformance(s, 'bench');
  assert.equal(last.date, t0 + 3 * DAY);
  assert.deepEqual(last.sets.map((x) => x.w), [65]);
  assert.equal(lastPerformance(s, 'bench', t0 + 3 * DAY).sets[0].w, 60);
  assert.equal(lastPerformance(s, 'row'), null);
});

test('weekly volume buckets by Monday-start week and doubles per-side exercises', () => {
  const s = [
    sess('a', 'Push', t0, [ex('bench', [[50, 10]])]),
    sess('b', 'Pull', t0 + 8 * DAY, [ex('row', [[40, 10]], { perSide: true })]),
  ];
  const w = weeklyVolume(s, 3, t0 + 9 * DAY);
  assert.equal(w.length, 3);
  assert.equal(w[1].start, startOfWeek(t0));
  assert.equal(w[1].volume, 500);
  assert.equal(w[2].volume, 800);
});

test('sets by day counts only completed sets in the window', () => {
  const s = [
    sess('a', 'Push', t0, [ex('bench', [[50, 10], [50, 10, false]])]),
    sess('b', 'Legs', t0 - 40 * DAY, [ex('squat', [[50, 10]])]),
  ];
  assert.deepEqual(setsByDay(s, 28, t0 + DAY), { Push: 1, Pull: 0, Legs: 0 });
});

test('PRs compare against earlier sessions only', () => {
  const a = sess('a', 'Push', t0, [ex('bench', [[60, 10]])]);
  const b = sess('b', 'Push', t0 + 3 * DAY, [ex('bench', [[65, 10]])]);
  const c = sess('c', 'Push', t0 + 6 * DAY, [ex('bench', [[60, 8]])]);
  assert.equal(findPRs([a], a).length, 0, 'first time is not a PR');
  assert.equal(findPRs([a, b], b).length, 1);
  assert.equal(findPRs([a, b, c], c).length, 0);
  assert.deepEqual(recentPRs([a, b, c]).map((p) => p.id), ['bench']);
});

test('daysBetween counts calendar days', () => {
  assert.equal(daysBetween(t0, t0 + 10 * DAY), 10);
});
