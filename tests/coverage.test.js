import { test } from 'node:test';
import assert from 'node:assert/strict';
import { muscleCoverage, coverageReport, recommendFor, calendarMonth, muscleStatus } from '../js/logic.js';
import { PROGRAMS, DEFAULT_PLANS, copyPlans } from '../js/programs.js';
import { EXERCISES, MUSCLES, byId } from '../js/exercises.js';

test('every exercise lists the muscles it trains, using known muscle ids', () => {
  const ids = new Set(MUSCLES.map((m) => m.id));
  for (const e of EXERCISES) {
    assert.ok(e.work.p.length > 0, `${e.id} has a main muscle`);
    for (const m of [...e.work.p, ...e.work.s]) assert.ok(ids.has(m), `${e.id}: unknown muscle ${m}`);
  }
});

test('every built-in program trains every muscle and only uses real exercises', () => {
  for (const p of PROGRAMS) {
    for (const d of Object.keys(p.plans)) for (const x of p.plans[d]) assert.ok(byId[x.id], `${p.id}: ${x.id}`);
    assert.deepEqual(coverageReport(p.plans, p.daysPerWeek).missed, [], p.id);
  }
});

test('coverage counts main sets fully, helper sets by half, scaled by days per week', () => {
  const plans = { Push: [{ id: 'db-bench-press', sets: 4, lo: 8, hi: 10 }], Pull: [], Legs: [] };
  assert.equal(muscleCoverage(plans, 3).chest, 4);
  assert.equal(muscleCoverage(plans, 6).chest, 8);
  assert.equal(muscleCoverage(plans, 3).triceps, 2);
  assert.equal(muscleStatus(0), 'missed');
  assert.equal(muscleStatus(2), 'low');
  assert.equal(muscleStatus(6), 'good');
});

test('removing the only calf exercise flags calves and recommends one', () => {
  const plans = copyPlans(DEFAULT_PLANS);
  plans.Legs = plans.Legs.filter((p) => p.id !== 'single-leg-calf-raise');
  const r = coverageReport(plans, 6);
  assert.deepEqual(r.missed, ['calves']);
  assert.deepEqual(r.recs.calves, { id: 'single-leg-calf-raise', day: 'Legs' });
  assert.equal(recommendFor('chest', DEFAULT_PLANS).day, 'Push', 'suggests an unused chest exercise for Push');
});

test('calendar month has whole Monday-start weeks and places workouts on their day', () => {
  const at = new Date(2026, 10, 9, 18).getTime();
  const weeks = calendarMonth(2026, 10, [{ id: 'a', day: 'Pull', finishedAt: at, exercises: [] }], new Date(2026, 10, 21).getTime());
  assert.ok(weeks.every((w) => w.length === 7));
  assert.equal(new Date(weeks[0][0].date).getDay(), 1);
  const cells = weeks.flat();
  assert.equal(cells.find((c) => c.inMonth && c.day === 9).sessions.length, 1);
  assert.ok(cells.find((c) => c.inMonth && c.day === 21).today);
  assert.equal(cells.filter((c) => c.inMonth).length, 30);
});
