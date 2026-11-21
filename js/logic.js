// Pure workout logic: rotation, strength estimates, progress stats. No DOM here.
import { DAYS } from './exercises.js';

const DAY_MS = 86400000;

/** Push → Pull → Legs → repeat, continuing from the last finished workout regardless of dates. */
export function nextDay(sessions) {
  const last = lastSession(sessions);
  if (!last) return DAYS[0];
  return DAYS[(DAYS.indexOf(last.day) + 1) % DAYS.length];
}

export function lastSession(sessions) {
  let best = null;
  for (const s of sessions) if (s.finishedAt && (!best || s.finishedAt > best.finishedAt)) best = s;
  return best;
}

export function daysBetween(a, b) {
  const d = (t) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
  return Math.round((d(b) - d(a)) / DAY_MS);
}

/** Estimated one-rep max (Epley). */
export function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

const doneSets = (ex) => (ex.sets || []).filter((s) => s.done && s.reps > 0);

/** Sessions (oldest → newest) that include a completed set of this exercise. */
export function exerciseSessions(sessions, exId) {
  return sessions
    .filter((s) => s.finishedAt && s.exercises.some((e) => e.id === exId && doneSets(e).length))
    .sort((a, b) => a.finishedAt - b.finishedAt);
}

/** Completed sets from the most recent session with this exercise (before `before`, if given). */
export function lastPerformance(sessions, exId, before = Infinity) {
  const list = exerciseSessions(sessions, exId).filter((s) => s.finishedAt < before);
  const s = list[list.length - 1];
  if (!s) return null;
  return { date: s.finishedAt, sets: doneSets(s.exercises.find((e) => e.id === exId)) };
}

export function bestSetOf(sets) {
  let best = null;
  for (const s of sets) if (!best || e1rm(s.w, s.reps) > e1rm(best.w, best.reps)) best = s;
  return best;
}

/** Per-session best estimated 1RM for an exercise: [{date, e1rm, set}]. */
export function e1rmHistory(sessions, exId) {
  return exerciseSessions(sessions, exId).map((s) => {
    const set = bestSetOf(doneSets(s.exercises.find((e) => e.id === exId)));
    return { date: s.finishedAt, e1rm: e1rm(set.w, set.reps), set };
  });
}

export function allTimeBest(sessions, exId, before = Infinity) {
  let best = null;
  for (const h of e1rmHistory(sessions, exId)) if (h.date < before && (!best || h.e1rm > best.e1rm)) best = h;
  return best;
}

/**
 * Weight to try next time. If every completed set last time reached the top of the
 * rep range, add one increment; otherwise repeat the weight.
 */
export function suggestWeight(last, plan, unitStep = 5) {
  if (!last || !last.sets.length) return null;
  const top = Math.max(...last.sets.map((s) => s.w));
  const atTop = last.sets.filter((s) => s.w === top);
  const hitAll = atTop.every((s) => s.reps >= (plan ? plan.hi : Infinity));
  const step = top < 25 ? Math.max(2.5, unitStep / 2) : unitStep;
  return { weight: hitAll ? top + step : top, increase: hitAll };
}

export function sessionVolume(s) {
  let v = 0;
  for (const e of s.exercises) for (const set of doneSets(e)) v += set.w * set.reps * (e.perSide ? 2 : 1);
  return v;
}

export function startOfWeek(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  return d.getTime() - dow * DAY_MS;
}

/** Total lifted per week for the last `weeks` weeks (oldest first). */
export function weeklyVolume(sessions, weeks, now = Date.now()) {
  const thisWeek = startOfWeek(now);
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(thisWeek);
    ws.setDate(ws.getDate() - i * 7);
    out.push({ start: ws.getTime(), volume: 0 });
  }
  for (const s of sessions) {
    if (!s.finishedAt) continue;
    const ws = startOfWeek(s.finishedAt);
    const b = out.find((o) => o.start === ws);
    if (b) b.volume += sessionVolume(s);
  }
  return out;
}

/** Completed sets per day type in the last `days` days. */
export function setsByDay(sessions, days, now = Date.now()) {
  const out = Object.fromEntries(DAYS.map((d) => [d, 0]));
  for (const s of sessions) {
    if (!s.finishedAt || now - s.finishedAt > days * DAY_MS) continue;
    for (const e of s.exercises) out[s.day] += doneSets(e).length;
  }
  return out;
}

/** New personal bests (estimated 1RM) set in this session vs everything before it. */
export function findPRs(sessions, session) {
  const prs = [];
  for (const e of session.exercises) {
    const sets = doneSets(e);
    if (!sets.length) continue;
    const best = bestSetOf(sets);
    const prior = allTimeBest(sessions.filter((s) => s.id !== session.id), e.id, session.finishedAt);
    if (prior && e1rm(best.w, best.reps) > prior.e1rm + 0.01) prs.push({ id: e.id, set: best, e1rm: e1rm(best.w, best.reps), prev: prior.e1rm });
  }
  return prs;
}

/** Recent PRs across all sessions, newest first. */
export function recentPRs(sessions, limit = 5) {
  const out = [];
  const sorted = sessions.filter((s) => s.finishedAt).sort((a, b) => a.finishedAt - b.finishedAt);
  const best = {};
  for (const s of sorted) {
    for (const e of s.exercises) {
      const sets = doneSets(e);
      if (!sets.length) continue;
      const b = bestSetOf(sets), v = e1rm(b.w, b.reps);
      if (best[e.id] !== undefined && v > best[e.id] + 0.01) out.push({ id: e.id, date: s.finishedAt, set: b, e1rm: v });
      if (best[e.id] === undefined || v > best[e.id]) best[e.id] = v;
    }
  }
  return out.reverse().slice(0, limit);
}
