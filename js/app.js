import { EXERCISES, byId, DAYS, DEFAULT_PLANS } from './exercises.js';
import { renderExerciseStills } from './figure.js';
import { load, save, exportJSON, importJSON, uid, requestPersistence, defaultState } from './store.js';
import {
  nextDay, lastSession, daysBetween, e1rm, lastPerformance, suggestWeight, e1rmHistory, allTimeBest,
  weeklyVolume, setsByDay, findPRs, recentPRs, sessionVolume, bestSetOf,
} from './logic.js';
import { lineChart, barChart } from './charts.js';

const COLORS = { Push: '#FF9A4D', Pull: '#5AB0FF', Legs: '#B79CFF' };
const TINTS = { Push: '#2B2118', Pull: '#16232F', Legs: '#221D2E' };

let state = load();
const ui = { pick: null, libDay: 'All', q: '', img: 'start', views: {}, range: '12W', progEx: null, restEnd: 0, restDone: 0, toast: null };
const app = document.getElementById('app');

// ---------------------------------------------------------------- helpers
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtW = (w) => (w ? (Math.round(w * 10) / 10).toString() : '0');
const unit = () => state.settings.unit;
const fmtDate = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtDay = (t) => new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
function rel(t) {
  const d = daysBetween(t, Date.now());
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}
const target = (p) => `${p.sets} × ${p.lo === p.hi ? p.lo : `${p.lo}–${p.hi}`}`;
const setsText = (sets) => sets.map((s) => `${fmtW(s.w)}×${s.reps}`).join(', ');
function commit() { save(state); render(); }
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function toast(msg) { ui.toast = { msg, until: Date.now() + 3500 }; }
const icon = {
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"/></svg>',
  lib: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  prog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 16l4-5 4 3 6-8"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M7 4.5v15l12-7.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  pic: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.2"/><path d="M12 8v7M8 11l4-2 4 2M9 21l3-6 3 6"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

// ---------------------------------------------------------------- router
function route() {
  const [path, qs] = location.hash.replace(/^#/, '').split('?');
  const parts = (path || '/').split('/').filter(Boolean);
  return { name: parts[0] || 'today', arg: parts[1] ? decodeURIComponent(parts[1]) : null, query: new URLSearchParams(qs || '') };
}

function render() {
  const r = route();
  const views = { today: viewToday, library: viewLibrary, exercise: viewExercise, workout: viewWorkout, progress: viewProgress, session: viewSession, settings: viewSettings };
  const view = views[r.name] || viewToday;
  if (r.name === 'workout' && !state.active) { location.replace('#/'); return; }
  const tab = { today: 'today', library: 'library', exercise: 'library', progress: 'progress', session: 'progress', settings: 'today' }[r.name];
  let html = '';
  if (ui.toast && ui.toast.until > Date.now()) html += `<div class="toast" role="status">${esc(ui.toast.msg)}</div>`;
  if (state.active && r.name !== 'workout') {
    html += `<a class="resume" href="#/workout">${icon.play}<span><b>${esc(state.active.day)} workout in progress</b><small>Tap to continue logging</small></span></a>`;
  }
  html += `<main class="page ${r.name === 'workout' ? 'with-rest' : ''}" id="main">${view(r)}</main>`;
  if (tab) html += tabbar(tab);
  html += restBar();
  app.innerHTML = html;
  document.title = { today: 'Today', library: 'Library', exercise: 'Exercise', workout: 'Workout', progress: 'Progress', session: 'Workout', settings: 'Settings' }[r.name] + ' · PPL Tracker';
}

function tabbar(active) {
  const t = (id, href, ic, label) => `<a href="${href}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${ic}<span>${label}</span></a>`;
  return `<nav class="tabbar" aria-label="Main">${t('today', '#/', icon.today, 'Today')}${t('library', '#/library', icon.lib, 'Library')}${t('progress', '#/progress', icon.prog, 'Progress')}</nav>`;
}

// ---------------------------------------------------------------- Today
function viewToday() {
  const next = nextDay(state.sessions);
  const sel = ui.pick || next;
  const last = lastSession(state.sessions);
  const plan = state.plans[sel];
  const order = DAYS;
  const steps = order.map((d) => {
    const sub = last && d === last.day ? `Last done · ${fmtDate(last.finishedAt)}` : d === next ? 'Up next' : 'After that';
    return `<button class="step ${d === sel ? 'on' : ''} ${last && d === last.day ? 'was' : ''}" style="--c:${COLORS[d]};--t:${TINTS[d]}" data-act="pick" data-day="${d}" aria-pressed="${d === sel}">
      <b>${d}</b><small>${sub}</small></button>`;
  }).join('');
  const rows = plan.map((p, i) => {
    const ex = byId[p.id];
    const lp = lastPerformance(state.sessions, p.id);
    const best = lp ? bestSetOf(lp.sets) : null;
    const sug = suggestWeight(lp, p, state.settings.step);
    return `<a class="row" href="#/exercise/${p.id}">
      <span class="num" style="background:${TINTS[sel]};color:${COLORS[sel]}">${i + 1}</span>
      <span class="grow"><span class="t">${esc(ex.name)}</span><small>${target(p)}${ex.perSide ? ' each side' : ''}</small></span>
      <span class="last">${best ? `Last<br><b>${fmtW(best.w)} × ${best.reps}</b>${sug && sug.increase ? `<em>↑ try ${fmtW(sug.weight)}</em>` : ''}` : '<em class="new">New</em>'}</span></a>`;
  }).join('');
  const recent = state.sessions.filter((s) => s.finishedAt).sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 4);
  return `
  <header class="hd">
    <div><span class="eyebrow">${fmtDay(Date.now())} · ${sel === next ? 'Up next' : 'Swapped from ' + next}</span>
      <h1 style="color:${COLORS[sel]}">${sel} Day</h1>
      <p class="sub">${last ? `Last workout: <b style="color:${COLORS[last.day]}">${last.day}</b> · ${fmtDate(last.finishedAt)} (${rel(last.finishedAt)})` : 'No workouts yet — the rotation starts with Push.'}</p></div>
    <a class="iconbtn" href="#/settings" aria-label="Settings">${icon.gear}</a>
  </header>
  <section class="card">
    <div class="cardhd"><h2>Rotation</h2><small>Push → Pull → Legs → repeat</small></div>
    <div class="steps">${steps}</div>
    <p class="note">The rotation ignores the calendar: whatever you finish last, the next day is queued up — whether it’s been 1 day or 10. Tap another day to swap today.</p>
  </section>
  <section class="card">
    <div class="cardhd"><h2>${sel} plan</h2><a href="#/settings" class="link">Edit</a></div>
    ${rows}
  </section>
  ${state.active
    ? `<a class="cta" href="#/workout">${icon.play} Resume ${esc(state.active.day)} workout</a>`
    : `<button class="cta" data-act="start" data-day="${sel}">${icon.play} Start ${sel} workout</button>`}
  ${recent.length ? `<section><h2 class="sec">Recent workouts</h2><div class="chips4">${recent.map((s) => `<a href="#/session/${s.id}" class="mini"><b style="color:${COLORS[s.day]}">${s.day}</b><small>${fmtDate(s.finishedAt)}</small></a>`).join('')}</div></section>` : ''}`;
}

// ---------------------------------------------------------------- Library
function libraryItems() {
  const q = ui.q.trim().toLowerCase();
  const list = EXERCISES.filter((e) => (ui.libDay === 'All' || e.day === ui.libDay) && (!q || (e.name + ' ' + e.muscles).toLowerCase().includes(q)));
  if (!list.length) return '<p class="empty">No exercises match that search.</p>';
  return list.map((e) => `<li><a class="item" href="#/exercise/${e.id}">
    <span class="badge" style="background:${TINTS[e.day]};color:${COLORS[e.day]}">${e.figure ? icon.pic : icon.lib}</span>
    <span class="grow"><span class="t">${esc(e.name)}</span><small>${esc(e.muscles)}</small></span>
    <span class="tag" style="color:${COLORS[e.day]}">${e.day}</span>${icon.chev}</a></li>`).join('');
}
function viewLibrary() {
  const chips = ['All', ...DAYS].map((d) => `<button class="chip ${ui.libDay === d ? 'on' : ''}" style="--c:${d === 'All' ? '#C8F05A' : COLORS[d]}" data-act="libDay" data-day="${d}" aria-pressed="${ui.libDay === d}">${d}</button>`).join('');
  return `<h1 class="title">Library</h1>
  <label class="search">${'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'}
    <span class="sr">Search exercises</span><input type="search" placeholder="Search exercises or muscles" value="${esc(ui.q)}" data-input="search"></label>
  <div class="chips" role="group" aria-label="Filter by day">${chips}</div>
  <p class="count">${EXERCISES.filter((e) => e.figure).length} of ${EXERCISES.length} exercises have form pictures so far.</p>
  <ul class="list" id="lib-list">${libraryItems()}</ul>`;
}

// ---------------------------------------------------------------- Exercise detail
const stillCache = new Map();
function stills(ex, view) {
  const k = ex.id + '@' + view;
  if (!stillCache.has(k)) stillCache.set(k, renderExerciseStills(ex, view));
  return stillCache.get(k);
}
function viewExercise(r) {
  const ex = byId[r.arg];
  if (!ex) return '<p class="empty">Exercise not found.</p>';
  const sign = (ex.view || 90) < 0 ? -1 : 1;
  const view = ui.views[ex.id] ?? ex.view ?? 90;
  let figure = '';
  if (ex.figure) {
    const st = stills(ex, view);
    const tabs = [['start', 'Start'], ['end', 'Finish'], ['mistake', 'Mistake']].map(([k, l]) => `<button class="${ui.img === k ? 'on' : ''} ${k === 'mistake' ? 'bad' : ''}" data-act="img" data-img="${k}" aria-pressed="${ui.img === k}">${l}</button>`).join('');
    const views = [['Front', 0], ['¾', 40 * sign], ['Side', 90 * sign]].map(([l, v]) => `<button class="${view === v ? 'on' : ''}" data-act="view" data-id="${ex.id}" data-v="${v}" aria-pressed="${view === v}">${l}</button>`).join('');
    const mistake = ui.img === 'mistake';
    figure = `<div class="seg two" role="group" aria-label="Position">${tabs}</div>
    <figure class="fig ${mistake ? 'bad' : ''}">
      <span class="figbadge">${mistake ? 'Common mistake' : ui.img === 'end' ? 'Finish position' : 'Start position'}</span>
      ${st[ui.img] || st.start}
    </figure>
    <div class="figctl"><span>${esc(ex.tempo || '')}</span><div class="seg" role="group" aria-label="Camera angle">${views}</div></div>`;
  } else {
    figure = `<div class="fig placeholder">${icon.pic}<span>Form picture coming soon</span></div>`;
  }
  const cues = ex.cues.map((c, i) => `<li><span class="n good">${i + 1}</span><span>${esc(c.text)}${c.img === 'end' ? ' <small>(finish)</small>' : ''}</span></li>`).join('');
  const mistakes = ex.mistakes.map((m, i) => `<li><span class="n bad">${i + 1}</span><span><b>${esc(m.title)}</b><br>${esc(m.why)}</span></li>`).join('');
  const best = allTimeBest(state.sessions, ex.id);
  const lp = lastPerformance(state.sessions, ex.id);
  const inActive = state.active && state.active.exercises.some((e) => e.id === ex.id);
  return `<a class="back" href="#/library">${icon.back}Library</a>
  <h1 class="title">${esc(ex.name)}</h1>
  <div class="tags"><span class="tag" style="background:${TINTS[ex.day]};color:${COLORS[ex.day]}">${ex.day}</span>${ex.muscles.split(' · ').map((m) => `<span class="tag">${esc(m)}</span>`).join('')}${ex.perSide ? '<span class="tag">One side at a time</span>' : ''}</div>
  ${figure}
  <p class="setup">${esc(ex.setup)}</p>
  <section><h2 class="sec">${ui.img === 'mistake' ? 'What can hurt you' : 'Form checkpoints'}</h2>
    <ol class="cues">${ui.img === 'mistake' ? mistakes : cues}</ol>
    <p class="note">${ui.img === 'mistake' ? 'Numbers match the red markers.' : 'Numbers match the green markers on the start and finish pictures.'}</p></section>
  ${ui.img === 'mistake' ? '' : `<section><h2 class="sec">Avoid</h2><ul class="avoid">${ex.mistakes.map((m) => `<li><b>${esc(m.title)}</b> — ${esc(m.why)}</li>`).join('')}</ul></section>`}
  <section class="tiles">
    <div><small>Best set</small><b>${best ? `${fmtW(best.set.w)} × ${best.set.reps}` : '—'}</b></div>
    <div><small>Est. 1RM</small><b>${best ? `${Math.round(best.e1rm)} ${unit()}` : '—'}</b></div>
    <div><small>Last time</small><b>${lp ? fmtDate(lp.date) : '—'}</b></div>
  </section>
  ${state.active && !inActive ? `<button class="cta ghost" data-act="addEx" data-id="${ex.id}">Add to current workout</button>` : ''}
  ${best ? `<a class="cta ghost" href="#/progress?ex=${ex.id}">See progress</a>` : ''}`;
}

// ---------------------------------------------------------------- Workout logging
function startWorkout(day) {
  const plan = state.plans[day];
  state.active = {
    id: uid(), day, startedAt: Date.now(),
    exercises: plan.map((p) => newWorkoutExercise(p.id, p)),
  };
  ui.pick = null;
  ui.restEnd = 0;
  requestPersistence();
  save(state);
  go('#/workout');
}
function newWorkoutExercise(id, p) {
  const ex = byId[id];
  p = p || { sets: 3, lo: 8, hi: 12 };
  const lp = lastPerformance(state.sessions, id);
  const sug = suggestWeight(lp, p, state.settings.step);
  const w = sug ? sug.weight : 0;
  return { id, perSide: !!ex.perSide, target: { sets: p.sets, lo: p.lo, hi: p.hi }, sets: Array.from({ length: p.sets }, () => ({ w, reps: p.lo, done: false })) };
}

function viewWorkout() {
  const a = state.active;
  const cards = a.exercises.map((e, i) => {
    const ex = byId[e.id];
    const lp = lastPerformance(state.sessions, e.id);
    const sug = suggestWeight(lp, e.target, state.settings.step);
    const rows = e.sets.map((s, j) => `
      <div class="setrow ${s.done ? 'done' : ''}">
        <span class="sn">${j + 1}</span>
        <label class="w"><span class="sr">Set ${j + 1} weight</span><input type="number" inputmode="decimal" min="0" step="any" value="${s.w ? fmtW(s.w) : ''}" placeholder="0" data-change="w" data-i="${i}" data-j="${j}"><small>${unit()}</small></label>
        <span class="reps">
          <button data-act="reps" data-i="${i}" data-j="${j}" data-d="-1" aria-label="Fewer reps, set ${j + 1}">−</button>
          <b aria-label="${s.reps} reps">${s.reps}</b>
          <button data-act="reps" data-i="${i}" data-j="${j}" data-d="1" aria-label="More reps, set ${j + 1}">+</button>
        </span>
        <button class="chk" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="${s.done}" aria-label="Set ${j + 1} done">${icon.check}</button>
      </div>`).join('');
    const doneCount = e.sets.filter((s) => s.done).length;
    return `<section class="card ex ${doneCount === e.sets.length ? 'complete' : ''}">
      <div class="exhd">
        <div class="grow"><small class="exn" style="color:${COLORS[ex.day]}">Exercise ${i + 1} of ${a.exercises.length}</small>
          <h2><a href="#/exercise/${e.id}">${esc(ex.name)}</a></h2>
          <small>Target ${target(e.target)}${e.perSide ? ' each side' : ''} · ${doneCount}/${e.sets.length} done</small>
          ${lp ? `<small class="prev">Last (${fmtDate(lp.date)}): ${setsText(lp.sets)}${sug && sug.increase ? ` · <em>you hit the top of the range — try ${fmtW(sug.weight)} ${unit()}</em>` : ''}</small>` : '<small class="prev">First time — pick a weight you can do with good form.</small>'}
        </div>
        <a class="iconbtn" href="#/exercise/${e.id}" aria-label="Form pictures for ${esc(ex.name)}">${icon.pic}</a>
      </div>
      <div class="sethd"><span>Set</span><span>Weight</span><span>Reps</span><span>Done</span></div>
      ${rows}
      <div class="exbtns">
        <button class="ghostbtn" data-act="addSet" data-i="${i}">+ Add set</button>
        ${e.sets.length > 1 ? `<button class="ghostbtn" data-act="rmSet" data-i="${i}">− Remove set</button>` : ''}
        <button class="ghostbtn danger" data-act="rmEx" data-i="${i}" aria-label="Remove ${esc(ex.name)} from this workout">${icon.x}</button>
      </div>
    </section>`;
  }).join('');
  const options = DAYS.map((d) => `<optgroup label="${d}">${EXERCISES.filter((e) => e.day === d && !a.exercises.some((x) => x.id === e.id)).map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</optgroup>`).join('');
  const done = a.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const total = a.exercises.reduce((n, e) => n + e.sets.length, 0);
  const vol = sessionVolume(a);
  return `<header class="wohd">
    <button class="textbtn" data-act="cancel">Cancel</button>
    <div><b style="color:${COLORS[a.day]}">${a.day} Day</b><small id="elapsed">${elapsed(a.startedAt)}</small></div>
    <button class="textbtn go" data-act="finish">Finish</button></header>
  <div class="tiles"><div><small>Sets done</small><b>${done} / ${total}</b></div><div><small>Volume</small><b>${Math.round(vol).toLocaleString()} ${unit()}</b></div><div><small>Rest timer</small><b>${state.settings.restSec}s</b></div></div>
  ${cards}
  <label class="addex"><span>Add an exercise</span><select data-change="addEx"><option value="">Choose…</option>${options}</select></label>`;
}
function elapsed(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0') + ' elapsed';
}
function restBar() {
  const now = Date.now();
  if (ui.restEnd > now) {
    return `<div class="restbar" role="timer"><span><small>Rest</small><b id="rest-time">${mmss(ui.restEnd - now)}</b></span>
      <button data-act="rest" data-d="30">+30s</button><button class="go" data-act="rest" data-d="0">Skip</button></div>`;
  }
  if (ui.restDone > now) return '<div class="restbar ready" role="status"><b>Rest over — next set!</b></div>';
  return '';
}
const mmss = (ms) => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

function finishWorkout() {
  const a = state.active;
  const kept = a.exercises.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done && s.reps > 0) })).filter((e) => e.sets.length);
  if (!kept.length) {
    if (confirm('No sets are marked done. Discard this workout?')) { state.active = null; ui.restEnd = 0; commit(); go('#/'); }
    return;
  }
  const session = { id: a.id, day: a.day, startedAt: a.startedAt, finishedAt: Date.now(), exercises: kept };
  state.sessions.push(session);
  const prs = findPRs(state.sessions, session);
  session.prs = prs.map((p) => p.id);
  state.active = null;
  ui.restEnd = 0;
  if (prs.length) toast(`New personal best${prs.length > 1 ? 's' : ''}: ${prs.map((p) => byId[p.id].name).join(', ')}`);
  save(state);
  go('#/session/' + session.id);
}

// ---------------------------------------------------------------- Progress
function viewProgress(r) {
  const done = state.sessions.filter((s) => s.finishedAt);
  if (!done.length) {
    return `<h1 class="title">Progress</h1><div class="empty big">${icon.prog}<p>Finish your first workout and your strength trends, weekly volume and personal bests will show up here.</p><a class="cta" href="#/">Go to today’s workout</a></div>`;
  }
  const withHistory = EXERCISES.filter((e) => e1rmHistory(done, e.id).length);
  const qEx = r.query.get('ex');
  if (qEx && byId[qEx]) ui.progEx = qEx;
  if (!ui.progEx || !withHistory.some((e) => e.id === ui.progEx)) {
    const last = done.sort((a, b) => b.finishedAt - a.finishedAt)[0];
    ui.progEx = last.exercises[0].id;
  }
  const ex = byId[ui.progEx];
  const cutoff = { '4W': 28, '12W': 84, All: Infinity }[ui.range];
  let hist = e1rmHistory(done, ex.id).filter((h) => (Date.now() - h.date) / 86400000 <= cutoff);
  if (!hist.length) hist = e1rmHistory(done, ex.id).slice(-1);
  const first = hist[0], last = hist[hist.length - 1];
  const change = first.e1rm ? Math.round(((last.e1rm - first.e1rm) / first.e1rm) * 100) : 0;
  const best = allTimeBest(done, ex.id);
  const wv = weeklyVolume(done, 8);
  const sbd = setsByDay(done, 28);
  const maxSets = Math.max(1, ...Object.values(sbd));
  const prs = recentPRs(done, 5);
  const ranges = ['4W', '12W', 'All'].map((x) => `<button class="${ui.range === x ? 'on' : ''}" data-act="range" data-r="${x}" aria-pressed="${ui.range === x}">${x}</button>`).join('');
  const options = DAYS.map((d) => `<optgroup label="${d}">${withHistory.filter((e) => e.day === d).map((e) => `<option value="${e.id}" ${e.id === ex.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</optgroup>`).join('');
  const sessions = done.sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 20);
  return `<div class="hd"><h1 class="title">Progress</h1><div class="seg" role="group" aria-label="Time range">${ranges}</div></div>
  <label class="selectbox"><span class="sr">Exercise</span><span class="dot" style="background:${COLORS[ex.day]}"></span><select data-change="progEx">${options}</select></label>
  <div class="tiles">
    <div><small>Est. 1RM</small><b>${Math.round(last.e1rm)} ${unit()}</b><small class="${change >= 0 ? 'up' : 'downc'}">${hist.length > 1 ? `${change >= 0 ? '+' : ''}${change}% · ${ui.range}` : 'first log'}</small></div>
    <div><small>Best set</small><b>${fmtW(best.set.w)} × ${best.set.reps}</b><small>${fmtDate(best.date)}</small></div>
    <div><small>Sessions</small><b>${e1rmHistory(done, ex.id).length}</b><small>logged</small></div>
  </div>
  <figure class="card chart"><figcaption><b>Estimated 1-rep max</b><small>${unit()} · best set each workout</small></figcaption>
    ${lineChart(hist.map((h) => ({ x: fmtDate(h.date), y: h.e1rm })), { color: COLORS[ex.day], label: `Estimated one-rep max for ${ex.name}` })}</figure>
  <figure class="card chart"><figcaption><b>Weekly volume</b><small>all lifts · ${unit()} lifted</small></figcaption>
    ${barChart(wv.map((w) => ({ label: fmtDate(w.start).replace(/^(\w+) /, '$1 '), value: w.volume })), { label: 'Weekly volume, last 8 weeks', fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) })}</figure>
  <section class="card"><div class="cardhd"><h2>Sets by day · last 4 weeks</h2></div>
    <div class="hbars">${DAYS.map((d) => `<span style="color:${COLORS[d]}">${d}</span><span class="track" style="background:${TINTS[d]}"><span style="width:${(sbd[d] / maxSets) * 100}%;background:${COLORS[d]}"></span></span><span>${sbd[d]}</span>`).join('')}</div>
    ${balanceNote(sbd)}</section>
  ${prs.length ? `<section><h2 class="sec">Recent personal bests</h2>${prs.map((p) => `<a class="item" href="#/exercise/${p.id}"><span class="dot" style="background:${COLORS[byId[p.id].day]}"></span><span class="grow t">${esc(byId[p.id].name)}</span><b>${fmtW(p.set.w)} × ${p.set.reps}</b><small>${fmtDate(p.date)}</small></a>`).join('')}</section>` : ''}
  <section><h2 class="sec">Workout history</h2>${sessions.map((s) => `<a class="item" href="#/session/${s.id}"><span class="dot" style="background:${COLORS[s.day]}"></span><span class="grow"><span class="t">${s.day} Day</span><small>${fmtDay(s.finishedAt)} · ${s.exercises.length} exercises</small></span><small>${Math.round(sessionVolume(s)).toLocaleString()} ${unit()}</small>${icon.chev}</a>`).join('')}</section>`;
}
function balanceNote(sbd) {
  const vals = DAYS.map((d) => sbd[d]);
  const max = Math.max(...vals);
  if (!max) return '';
  const low = DAYS.filter((d) => sbd[d] < max * 0.7);
  return low.length ? `<p class="note">${low.join(' and ')} ${low.length > 1 ? 'are' : 'is'} trailing behind this month.</p>` : '<p class="note">Nicely balanced across all three days.</p>';
}

// ---------------------------------------------------------------- Single session
function viewSession(r) {
  const s = state.sessions.find((x) => x.id === r.arg);
  if (!s) return '<a class="back" href="#/progress">' + icon.back + 'Progress</a><p class="empty">Workout not found.</p>';
  const mins = Math.round((s.finishedAt - s.startedAt) / 60000);
  const prs = new Set(s.prs || []);
  return `<a class="back" href="#/progress">${icon.back}Progress</a>
  <h1 class="title" style="color:${COLORS[s.day]}">${s.day} Day</h1>
  <p class="sub">${fmtDay(s.finishedAt)} · ${mins} min</p>
  <div class="tiles"><div><small>Exercises</small><b>${s.exercises.length}</b></div><div><small>Sets</small><b>${s.exercises.reduce((n, e) => n + e.sets.length, 0)}</b></div><div><small>Volume</small><b>${Math.round(sessionVolume(s)).toLocaleString()}</b></div></div>
  ${s.exercises.map((e) => `<section class="card"><div class="cardhd"><h2><a href="#/exercise/${e.id}">${esc(byId[e.id].name)}</a></h2>${prs.has(e.id) ? '<span class="pr">New best</span>' : ''}</div>
    <p class="setsline">${e.sets.map((x, i) => `<span>${i + 1}. <b>${fmtW(x.w)}</b> ${unit()} × <b>${x.reps}</b></span>`).join('')}</p>
    <small class="muted">Est. 1RM ${Math.round(e1rm(bestSetOf(e.sets).w, bestSetOf(e.sets).reps))} ${unit()}</small></section>`).join('')}
  <a class="cta" href="#/">Back to today</a>
  <button class="ghostbtn danger wide" data-act="delSession" data-id="${s.id}">Delete this workout</button>`;
}

// ---------------------------------------------------------------- Settings
function viewSettings() {
  const planEditor = DAYS.map((d) => {
    const rows = state.plans[d].map((p, i) => `<div class="planrow">
      <span class="grow t">${esc(byId[p.id].name)}</span>
      <label><span class="sr">Sets</span><input type="number" inputmode="numeric" min="1" max="10" value="${p.sets}" data-change="plan" data-day="${d}" data-i="${i}" data-k="sets"></label>
      <span class="x">×</span>
      <label><span class="sr">Min reps</span><input type="number" inputmode="numeric" min="1" max="50" value="${p.lo}" data-change="plan" data-day="${d}" data-i="${i}" data-k="lo"></label>
      <span class="x">–</span>
      <label><span class="sr">Max reps</span><input type="number" inputmode="numeric" min="1" max="50" value="${p.hi}" data-change="plan" data-day="${d}" data-i="${i}" data-k="hi"></label>
      <button class="mini-btn" data-act="planMove" data-day="${d}" data-i="${i}" data-d="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${icon.up}</button>
      <button class="mini-btn" data-act="planRm" data-day="${d}" data-i="${i}" aria-label="Remove ${esc(byId[p.id].name)}">${icon.x}</button>
    </div>`).join('');
    const opts = EXERCISES.filter((e) => !state.plans[d].some((p) => p.id === e.id)).map((e) => `<option value="${e.id}">${esc(e.name)} (${e.day})</option>`).join('');
    return `<section class="card"><div class="cardhd"><h2 style="color:${COLORS[d]}">${d} plan</h2><button class="link" data-act="planReset" data-day="${d}">Reset</button></div>
      <div class="planhd"><span>Exercise</span><span>Sets × reps</span></div>${rows}
      <label class="addex"><span>Add exercise</span><select data-change="planAdd" data-day="${d}"><option value="">Choose…</option>${opts}</select></label></section>`;
  }).join('');
  const sel = (k, vals, fmt) => `<select data-change="setting" data-k="${k}">${vals.map((v) => `<option value="${v}" ${state.settings[k] == v ? 'selected' : ''}>${fmt(v)}</option>`).join('')}</select>`;
  return `<a class="back" href="#/">${icon.back}Today</a><h1 class="title">Settings</h1>
  <section class="card form">
    <label><span>Rest timer</span>${sel('restSec', [45, 60, 90, 120, 150, 180], (v) => (v < 60 ? v + 's' : `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`))}</label>
    <label><span>Weight jump when you hit the top of your rep range</span>${sel('step', [2.5, 5, 10], (v) => v + ' lb')}</label>
  </section>
  ${planEditor}
  <section class="card form"><div class="cardhd"><h2>Your data</h2></div>
    <p class="note">Everything is saved on this phone only. Export a backup now and then so you don’t lose your history if you clear your browser or switch phones.</p>
    <button class="ghostbtn wide" data-act="export">Export backup</button>
    <label class="ghostbtn wide filebtn">Import backup<input type="file" accept="application/json,.json" data-change="import"></label>
    <button class="ghostbtn danger wide" data-act="wipe">Erase all data</button>
  </section>
  <section class="card"><div class="cardhd"><h2>Install on your phone</h2></div>
    <p class="note"><b>iPhone:</b> open this site in Safari, tap Share, then “Add to Home Screen”.<br><b>Android:</b> in Chrome, tap ⋮ then “Install app”.<br>It works offline once installed.</p></section>`;
}

// ---------------------------------------------------------------- events
const actions = {
  pick: (d) => { ui.pick = d.day === nextDay(state.sessions) ? null : d.day; render(); },
  start: (d) => startWorkout(d.day),
  libDay: (d) => { ui.libDay = d.day; render(); },
  img: (d) => { ui.img = d.img; render(); },
  view: (d) => { ui.views[d.id] = Number(d.v); render(); },
  reps: (d) => { const s = state.active.exercises[d.i].sets[d.j]; s.reps = Math.max(0, s.reps + Number(d.d)); commit(); },
  done: (d) => {
    const s = state.active.exercises[d.i].sets[d.j];
    s.done = !s.done;
    if (s.done) { ui.restEnd = Date.now() + state.settings.restSec * 1000; ui.restDone = 0; }
    commit();
  },
  addSet: (d) => {
    const e = state.active.exercises[d.i];
    const last = e.sets[e.sets.length - 1] || { w: 0, reps: e.target.lo };
    e.sets.push({ w: last.w, reps: last.reps, done: false });
    commit();
  },
  rmSet: (d) => { const e = state.active.exercises[d.i]; if (e.sets.length > 1) e.sets.pop(); commit(); },
  rmEx: (d) => {
    const e = state.active.exercises[d.i];
    if (confirm(`Remove ${byId[e.id].name} from this workout?`)) { state.active.exercises.splice(d.i, 1); commit(); }
  },
  addEx: (d) => {
    if (!state.active.exercises.some((e) => e.id === d.id)) state.active.exercises.push(newWorkoutExercise(d.id));
    save(state); go('#/workout');
  },
  rest: (d) => {
    if (Number(d.d) === 0) ui.restEnd = 0; else ui.restEnd += Number(d.d) * 1000;
    render();
  },
  cancel: () => { if (confirm('Discard this workout? Nothing will be saved.')) { state.active = null; ui.restEnd = 0; save(state); go('#/'); } },
  finish: () => finishWorkout(),
  range: (d) => { ui.range = d.r; render(); },
  delSession: (d) => {
    if (confirm('Delete this workout from your history? This can’t be undone.')) {
      state.sessions = state.sessions.filter((s) => s.id !== d.id);
      save(state); go('#/progress');
    }
  },
  planMove: (d) => { const p = state.plans[d.day], i = Number(d.i); [p[i - 1], p[i]] = [p[i], p[i - 1]]; commit(); },
  planRm: (d) => {
    const p = state.plans[d.day];
    if (p.length <= 1) { alert('A day needs at least one exercise.'); return; }
    p.splice(Number(d.i), 1); commit();
  },
  planReset: (d) => { if (confirm(`Reset the ${d.day} plan to the default exercises?`)) { state.plans[d.day] = JSON.parse(JSON.stringify(DEFAULT_PLANS[d.day])); commit(); } },
  export: () => {
    const blob = new Blob([exportJSON(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ppl-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  wipe: () => {
    if (confirm('Erase ALL workouts and settings on this phone? Export a backup first if you might want them.') && confirm('Really erase everything?')) {
      state = defaultState(); commit(); go('#/');
    }
  },
};

const changes = {
  w: (el) => {
    const e = state.active.exercises[el.dataset.i], j = Number(el.dataset.j);
    const old = e.sets[j].w, w = Math.max(0, parseFloat(el.value) || 0);
    e.sets[j].w = w;
    // carry the new weight to later sets that still had the old weight and aren't done
    for (let k = j + 1; k < e.sets.length; k++) if (!e.sets[k].done && e.sets[k].w === old) e.sets[k].w = w;
    commit();
  },
  addEx: (el) => { if (el.value) actions.addEx({ id: el.value }); },
  progEx: (el) => { ui.progEx = el.value; history.replaceState(null, '', '#/progress'); render(); },
  plan: (el) => {
    const p = state.plans[el.dataset.day][el.dataset.i];
    const v = Math.max(1, Math.min(50, parseInt(el.value, 10) || 1));
    p[el.dataset.k] = v;
    if (p.lo > p.hi) { if (el.dataset.k === 'lo') p.hi = p.lo; else p.lo = p.hi; }
    commit();
  },
  planAdd: (el) => { if (el.value) { state.plans[el.dataset.day].push({ id: el.value, sets: 3, lo: 8, hi: 12 }); commit(); } },
  setting: (el) => { state.settings[el.dataset.k] = Number(el.value); commit(); },
  import: (el) => {
    const file = el.files && el.files[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const next = importJSON(text);
        if (confirm(`Replace the data on this phone with this backup (${next.sessions.length} workouts)?`)) { state = next; commit(); toast('Backup restored'); go('#/'); }
      } catch (err) { alert(err.message); }
    });
  },
};

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) { ev.preventDefault(); fn(el.dataset, el); }
});
app.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-change]');
  if (el && changes[el.dataset.change]) changes[el.dataset.change](el);
});
app.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-input="search"]');
  if (!el) return;
  ui.q = el.value;
  const list = document.getElementById('lib-list');
  if (list) list.innerHTML = libraryItems();
});
// Enter in a weight box moves on instead of submitting anything
app.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.matches('input[data-change="w"]')) ev.target.blur(); });

window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/exercise')) ui.img = 'start'; render(); window.scrollTo(0, 0); });
window.addEventListener('storage', () => { state = load(); render(); });

// timers: elapsed clock, rest countdown, toast expiry
setInterval(() => {
  const el = document.getElementById('elapsed');
  if (el && state.active) el.textContent = elapsed(state.active.startedAt);
  const now = Date.now();
  if (ui.restEnd) {
    const rt = document.getElementById('rest-time');
    if (ui.restEnd <= now) {
      ui.restEnd = 0; ui.restDone = now + 4000;
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch { /* ignore */ }
      beep();
      render();
    } else if (rt) rt.textContent = mmss(ui.restEnd - now);
  } else if (ui.restDone && ui.restDone <= now) { ui.restDone = 0; render(); }
  if (ui.toast && ui.toast.until <= now) { ui.toast = null; const t = document.querySelector('.toast'); if (t) t.remove(); }
}, 500);

let audio;
function beep() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = 880; g.gain.value = 0.08;
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.25);
  } catch { /* ignore */ }
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
