// Small hand-made SVG charts.
const f = (n) => n.toFixed(1);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Line chart. points: [{x: label, y: number}] oldest → newest. */
export function lineChart(points, { color = '#FF9A4D', label = '', unit = '' } = {}) {
  const W = 326, H = 160, L = 8, R = 318, T = 18, B = 132;
  if (points.length === 0) return '';
  const ys = points.map((p) => p.y);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (hi - lo < 4) { lo -= 2; hi += 2; }
  const step = niceStep((hi - lo) / 3);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const X = (i) => (points.length === 1 ? (L + R) / 2 : L + (i * (R - L)) / (points.length - 1));
  const Y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`;
  for (let v = lo + step; v < hi + 0.001; v += step) {
    s += `<line x1="${L}" y1="${f(Y(v))}" x2="${R}" y2="${f(Y(v))}" stroke="#262B33"/>`;
    s += `<text x="${L}" y="${f(Y(v) - 4)}" class="ax">${Math.round(v)}</text>`;
  }
  const pts = points.map((p, i) => `${f(X(i))} ${f(Y(p.y))}`);
  if (points.length > 1) {
    s += `<path d="M${pts.join(' L')} L${f(X(points.length - 1))} ${B} L${f(X(0))} ${B} Z" fill="${color}" opacity="0.12"/>`;
    s += `<path d="M${pts.join(' L')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  points.forEach((p, i) => { if (i === points.length - 1 || points.length < 12) s += `<circle cx="${f(X(i))}" cy="${f(Y(p.y))}" r="${i === points.length - 1 ? 5 : 3}" fill="#0E1013" stroke="${color}" stroke-width="2"/>`; });
  const last = points[points.length - 1];
  s += `<text x="${f(Math.min(X(points.length - 1), R - 4))}" y="${f(Y(last.y) - 10)}" text-anchor="end" class="val">${Math.round(last.y)}${unit}</text>`;
  s += `<text x="${L}" y="${H - 6}" class="ax">${esc(points[0].x)}</text>`;
  if (points.length > 1) s += `<text x="${R}" y="${H - 6}" text-anchor="end" class="ax">${esc(last.x)}</text>`;
  return s + '</svg>';
}

/** Bar chart. bars: [{label, value}], last bar highlighted. */
export function barChart(bars, { color = '#C8F05A', label = '', fmt = (v) => v } = {}) {
  const W = 326, H = 150, B = 124, T = 18;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = W / bars.length, bw = Math.min(28, slot * 0.64);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><line x1="0" y1="${B}" x2="${W}" y2="${B}" stroke="#2A2F37"/>`;
  bars.forEach((b, i) => {
    const h = (b.value / max) * (B - T), x = i * slot + (slot - bw) / 2, last = i === bars.length - 1;
    if (b.value > 0) s += `<rect x="${f(x)}" y="${f(B - h)}" width="${f(bw)}" height="${f(h)}" rx="4" fill="${last ? color : '#3A404A'}"/>`;
    if (last && b.value > 0) s += `<text x="${f(x + bw / 2)}" y="${f(B - h - 5)}" text-anchor="middle" class="val">${esc(fmt(b.value))}</text>`;
    s += `<text x="${f(x + bw / 2)}" y="${H - 8}" text-anchor="middle" class="ax">${esc(b.label)}</text>`;
  });
  return s + '</svg>';
}

function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.5))));
  for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * p) return m * p;
  return 10 * p;
}
