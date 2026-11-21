// Figure engine: builds a simple 3D mannequin from a pose description and
// renders it to an SVG string from any horizontal camera angle.
// Units are roughly centimetres. Axes: x = figure's right, y = up, z = forward.

const ARM = [28, 27];
const LEG = [44, 44];

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.sqrt(dot(a, a));
const nrm = (a) => mul(a, 1 / (len(a) || 1));
const lerp = (a, b, k) => add(a, mul(sub(b, a), k));

function ik(S, H, L1, L2, pole) {
  const D = sub(H, S);
  const d = Math.max(0.5, Math.min(len(D), L1 + L2 - 0.3));
  const dir = nrm(D);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  let pp = sub(pole, mul(dir, dot(pole, dir)));
  if (len(pp) < 1e-6) pp = [0, 1, 0];
  pp = nrm(pp);
  return { mid: add(add(S, mul(dir, a)), mul(pp, h)), end: add(S, mul(dir, d)) };
}

/** Turn a pose description into world-space joints. */
export function skeleton(pose) {
  const p = ((pose.pitch || 0) * Math.PI) / 180;
  const up = [0, Math.cos(p), Math.sin(p)];
  const facing = [0, -Math.sin(p), Math.cos(p)];
  const right = [1, 0, 0];
  const P0 = pose.pelvis;
  const arch = pose.arch || 0;
  const mid = add(add(P0, mul(up, 24)), mul(facing, arch));
  const neck = add(P0, mul(up, 49));
  const shrug = pose.shrug || 0;
  const shBase = add(neck, mul(up, -3 + shrug));
  const sh = { r: add(shBase, mul(right, 18)), l: add(shBase, mul(right, -18)) };
  const hip = { r: add(add(P0, mul(up, -2)), mul(right, 10)), l: add(add(P0, mul(up, -2)), mul(right, -10)) };
  const tilt = ((pose.headTilt || 0) * Math.PI) / 180;
  const hUp = add(mul(up, Math.cos(tilt)), mul(facing, -Math.sin(tilt)));
  const hFace = add(mul(facing, Math.cos(tilt)), mul(up, Math.sin(tilt)));

  const resolve = (spec, side) => {
    if (Array.isArray(spec)) return spec;
    if (spec.t) return add(add(add(P0, mul(right, spec.t[0])), mul(up, spec.t[1])), mul(facing, spec.t[2]));
    if (spec.hang !== undefined) return add(sh[side], [side === 'r' ? 1.5 : -1.5, -(ARM[0] + ARM[1] - 1.5), spec.hang]);
    if (spec.sh) return add(sh[side], spec.sh);
    throw new Error('bad spec');
  };

  const J = { pelvis: P0, mid, neck, up, facing, shL: sh.l, shR: sh.r, hipL: hip.l, hipR: hip.r };
  J.neckTop = add(neck, mul(hUp, 9));
  J.head = add(add(neck, mul(hUp, 20)), mul(hFace, 1));
  J.jaw = add(add(neck, mul(hUp, 14)), mul(hFace, 7));
  J.chest = add(neck, mul(up, -5));

  for (const s of ['l', 'r']) {
    const S = s.toUpperCase();
    if (pose.hands && pose.hands[s]) {
      const H = resolve(pose.hands[s], s);
      const r = ik(sh[s], H, ARM[0], ARM[1], pose.elbows ? pose.elbows[s] : [0, -1, 0]);
      J['elbow' + S] = r.mid;
      J['hand' + S] = r.end;
    }
    const A = resolve(pose.ankles[s], s);
    const r = ik(hip[s], A, LEG[0], LEG[1], pose.knees ? pose.knees[s] : [0, 0, 1]);
    J['knee' + S] = r.mid;
    J['ankle' + S] = r.end;
    if (pose.toes && pose.toes[s]) {
      J['toe' + S] = resolve(pose.toes[s], s);
    } else {
      const ank = r.end;
      const drop = Math.min(15.5, Math.max(0, ank[1] - 3.5));
      const fwd = Math.sqrt(Math.max(0, 16 * 16 - drop * drop));
      J['toe' + S] = [ank[0] + (s === 'r' ? 1 : -1), ank[1] - drop, ank[2] + fwd];
    }
  }
  J.handsMid = J.handL && J.handR ? lerp(J.handL, J.handR, 0.5) : J.handR || J.handL;
  J.resolve = resolve;
  return J;
}

const COL = {
  skin: '#E2D2C2', shirt: '#6F7B90', shorts: '#4E5869', shoe: '#C9CFD6',
  warn: '#C9474D', plate: '#5A6372', handle: '#9AA3AF',
  padTop: '#4A5361', padSide: '#353C47', padFront: '#3E4652', frame: '#5A6372',
};

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.min(255, Math.round(v * f));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** Body + dumbbells as 3D capsules: {a, b, w, col, group}. */
function bodyParts(pose, J) {
  const warn = new Set(pose.warn || []);
  const isWarn = (...g) => g.some((x) => warn.has(x));
  const out = [];
  const cap = (a, b, w, col, groups = []) => out.push({ a, b, w, col: isWarn(...groups) ? COL.warn : col });
  const side = Math.abs(J.facing[1]) > 0.7 ? 0 : 1; // used for torso depth

  cap(J.hipL, J.hipR, 17, COL.shorts, ['hips']);
  cap(J.pelvis, J.mid, 25, COL.shirt, ['spine']);
  cap(J.mid, J.chest, 29, COL.shirt, ['chest']);
  cap(J.shL, J.shR, 11, COL.shirt, ['shoulders']);
  cap(J.neck, J.neckTop, 9, COL.skin, ['head']);
  cap(J.head, J.head, 20, COL.skin, ['head']);
  cap(J.head, J.jaw, 13, COL.skin, ['head']);
  void side;

  for (const s of ['L', 'R']) {
    const lo = s.toLowerCase();
    cap(J['hip' + s], J['knee' + s], 13.5, COL.shorts, ['legs', 'leg' + s, 'knees']);
    cap(J['knee' + s], J['ankle' + s], 9.5, COL.skin, ['legs', 'leg' + s, 'knees']);
    cap(J['ankle' + s], J['toe' + s], 7.5, COL.shoe, ['feet', 'foot' + s]);
    if (J['hand' + s]) {
      const S = J['sh' + s], E = J['elbow' + s], H = J['hand' + s];
      cap(S, lerp(S, E, 0.45), 10, COL.shirt, ['arms', 'arm' + s, 'shoulders']);
      cap(lerp(S, E, 0.3), E, 8, COL.skin, ['arms', 'arm' + s]);
      cap(E, H, 7, COL.skin, ['arms', 'arm' + s, 'forearm' + s]);
      out.push({ a: H, b: H, w: 7.5, col: COL.skin, bias: 0.8 });
    }
    void lo;
  }

  const bells = pose.bells || ['l', 'r'];
  for (const b of bells) {
    let at, axis;
    if (typeof b === 'string') {
      at = J['hand' + b.toUpperCase()];
      axis = pose.grip || 'x';
      if (!at) continue;
    } else {
      at = b.at === 'mid' ? J.handsMid : J.resolve(b.at, 'r');
      if (b.off) at = add(at, b.off);
      axis = b.axis || 'x';
    }
    let dir;
    if (axis === 'x') dir = [1, 0, 0];
    else if (axis === 'y') dir = [0, 1, 0];
    else if (axis === 'z') dir = [0, 0, 1];
    else if (axis === 'fore') dir = nrm(sub(J.handsMid, lerp(J.elbowL, J.elbowR, 0.5)));
    else dir = nrm(axis);
    out.push({ a: add(at, mul(dir, -6)), b: add(at, mul(dir, 6)), w: 2.6, col: COL.handle, bias: -0.3 });
    out.push({ a: add(at, mul(dir, -10)), b: add(at, mul(dir, -7)), w: 12, col: COL.plate });
    out.push({ a: add(at, mul(dir, 7)), b: add(at, mul(dir, 10)), w: 12, col: COL.plate });
  }
  return out;
}

// ---- props (benches, steps) --------------------------------------------
/** A slab whose top surface starts at `o`, runs `length` along `along`, faces `normal`. */
export function pad(o, along, normal, length, halfWidth = 14, thick = 7) {
  const w = nrm([1, 0, 0]);
  const A = nrm(along), N = nrm(normal);
  const c = (s, t, n) => add(add(add(o, mul(A, s)), mul(w, t)), mul(N, n));
  return {
    box: [
      c(0, -halfWidth, -thick), c(0, halfWidth, -thick), c(0, halfWidth, 0), c(0, -halfWidth, 0),
      c(length, -halfWidth, -thick), c(length, halfWidth, -thick), c(length, halfWidth, 0), c(length, -halfWidth, 0),
    ],
  };
}
export function block(x0, x1, y0, y1, z0, z1) {
  return { box: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] };
}
export const rod = (a, b, w = 5) => ({ rod: [a, b], w });

export function flatBench(z0, z1, { x = 0, top = 45, hw = 14 } = {}) {
  return [
    { ...pad([x, top, z0], [0, 0, 1], [0, 1, 0], z1 - z0, hw), shrink: true },
    rod([x, top - 7, z0 + 12], [x, 2, z0 + 12]),
    rod([x, top - 7, z1 - 12], [x, 2, z1 - 12]),
    rod([x - hw - 4, 2, z0 + 12], [x + hw + 4, 2, z0 + 12]),
    rod([x - hw - 4, 2, z1 - 12], [x + hw + 4, 2, z1 - 12]),
  ];
}

// ---- projection + rendering ---------------------------------------------
function camera(deg) {
  const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  return (v) => ({ x: v[0] * c + v[2] * s, y: -v[1], d: v[2] * c - v[0] * s });
}

const FACES = [[0, 1, 2, 3, 'padFront'], [4, 5, 6, 7, 'padFront'], [0, 1, 5, 4, 'padSide'], [3, 2, 6, 7, 'padTop'], [0, 3, 7, 4, 'padSide'], [1, 2, 6, 5, 'padSide']];

/** Projected drawables for one pose: [{kind, d (svg path), stroke/fill, sw, z}] plus joints in 2D. */
export function project(pose, props, viewDeg) {
  const J = skeleton(pose);
  const P = camera(viewDeg);
  const items = [];
  const f = (n) => n.toFixed(1);
  for (const pr of props || []) {
    if (pr.box) {
      for (const F of FACES) {
        const q = F.slice(0, 4).map((i) => P(pr.box[i]));
        const z = q.reduce((a, o) => a + o.d, 0) / 4 - 16;
        items.push({ d: 'M' + q.map((o) => f(o.x) + ' ' + f(o.y)).join(' L') + ' Z', fill: COL[F[4]], stroke: COL[F[4]], sw: 0.5, z, pts: q });
      }
    } else if (pr.rod) {
      const a = P(pr.rod[0]), b = P(pr.rod[1]);
      items.push({ d: `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}`, stroke: COL.frame, sw: pr.w, z: (a.d + b.d) / 2 - 16, pts: [a, b] });
    }
  }
  const parts = bodyParts(pose, J);
  const ds = parts.map((pt) => (P(pt.a).d + P(pt.b).d) / 2);
  const dmin = Math.min(...ds), dmax = Math.max(...ds);
  parts.forEach((pt, i) => {
    const a = P(pt.a), b = P(pt.b);
    const same = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 0.05;
    const light = 0.72 + 0.28 * (dmax > dmin ? (ds[i] - dmin) / (dmax - dmin) : 1);
    items.push({
      d: `M${f(a.x)} ${f(a.y)} L${f(same ? a.x + 0.05 : b.x)} ${f(b.y)}`,
      stroke: shade(pt.col, light), sw: pt.w, z: ds[i] + (pt.bias || 0), pts: [a, b], r: pt.w / 2,
    });
  });
  items.sort((x, y) => x.z - y.z);
  const joints = {};
  for (const k of Object.keys(J)) if (Array.isArray(J[k]) && J[k].length === 3 && k !== 'up' && k !== 'facing') joints[k] = P(J[k]);
  return { items, joints };
}

export function bounds(projs) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pr of projs) for (const it of pr.items) for (const p of it.pts) {
    const r = it.r || 0;
    x0 = Math.min(x0, p.x - r); x1 = Math.max(x1, p.x + r);
    y0 = Math.min(y0, p.y - r); y1 = Math.max(y1, p.y + r);
  }
  return { x0, y0, x1, y1 };
}

/**
 * Render one pose to an SVG string.
 * opts: { box (shared bounds), markers: [{n, at, dx, dy, color}], path: {from, to, color}, label }
 */
export function renderSVG(proj, opts = {}) {
  const b = opts.box || bounds([proj]);
  const pad = 14;
  const vb = [b.x0 - pad, b.y0 - pad, b.x1 - b.x0 + pad * 2, Math.max(b.y1, 0) - b.y0 + pad * 2];
  const f = (n) => n.toFixed(1);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(f).join(' ')}" role="img" aria-label="${esc(opts.label || 'Exercise position')}">`;
  s += `<ellipse cx="${f((b.x0 + b.x1) / 2)}" cy="1" rx="${f((b.x1 - b.x0) / 2 + 6)}" ry="4" fill="#000" opacity="0.35"/>`;
  for (const it of proj.items) {
    s += `<path d="${it.d}" fill="${it.fill || 'none'}" stroke="${it.stroke}" stroke-width="${f(it.sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (opts.path) {
    const { from, to, color } = opts.path;
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    const ah = (a) => `${f(to.x - 6 * Math.cos(ang + a))} ${f(to.y - 6 * Math.sin(ang + a))}`;
    s += `<path d="M${f(from.x)} ${f(from.y)} L${f(to.x)} ${f(to.y)}" stroke="${color}" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>`;
    s += `<path d="M${ah(0.5)} L${f(to.x)} ${f(to.y)} L${ah(-0.5)}" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  for (const m of opts.markers || []) {
    const j = proj.joints[m.at];
    if (!j) continue;
    const x = j.x + (m.dx ?? 9), y = j.y + (m.dy ?? -9);
    s += `<line x1="${f(j.x)}" y1="${f(j.y)}" x2="${f(x)}" y2="${f(y)}" stroke="${m.color}" stroke-width="1"/>`;
    s += `<circle cx="${f(j.x)}" cy="${f(j.y)}" r="1.8" fill="${m.color}"/>`;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="${m.color}"/>`;
    s += `<text x="${f(x)}" y="${f(y + 2.9)}" text-anchor="middle" font-size="8" font-weight="700" font-family="system-ui,sans-serif" fill="#0E1013">${esc(String(m.n))}</text>`;
  }
  return s + '</svg>';
}

function esc(t) {
  return t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Render the start / end / mistake stills for an exercise from one camera angle. */
export function renderExerciseStills(ex, viewDeg) {
  const fig = ex.figure;
  const names = ['start', 'end', 'mistake'].filter((k) => fig[k]);
  const projs = Object.fromEntries(names.map((k) => [k, project(fig[k], fig.props, viewDeg)]));
  const box = bounds(Object.values(projs));
  const GOOD = '#C8F05A', BAD = '#FF5C61';
  const markersFor = (list, img, color) => (list || [])
    .map((c, i) => ({ ...c, n: i + 1 }))
    .filter((c) => c.at && (c.img || (img === 'mistake' ? 'mistake' : 'start')) === img)
    .map((c) => ({ n: c.n, at: c.at, dx: c.dx, dy: c.dy, color }));
  const out = {};
  for (const k of names) {
    const isMistake = k === 'mistake';
    const opts = {
      box,
      label: `${ex.name}: ${isMistake ? 'common mistake' : k + ' position'}`,
      markers: isMistake ? markersFor(ex.mistakes, 'mistake', BAD) : markersFor(ex.cues, k, GOOD),
    };
    if (k === 'end' && fig.path) {
      const j = fig.path;
      opts.path = { from: projs.start.joints[j], to: projs.end.joints[j], color: GOOD };
    }
    out[k] = renderSVG(projs[k], opts);
  }
  return out;
}
