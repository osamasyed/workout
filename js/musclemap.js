// Front / back body diagram with each muscle coloured by how much the plan trains it.
import { MUSCLES } from './exercises.js';
import { muscleStatus } from './logic.js';

export const STATUS_COLORS = { missed: '#FF5C61', low: '#8A9A55', good: '#C8F05A' };
const BODY = '#2A2F37', LINE = '#0E1013';

const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(100 - parseFloat(x)).toFixed(1)} ${y}`);
const both = (d) => [d, mirror(d)];

// Silhouette shared by both views (100 x 212 units).
const SILHOUETTE = [
  'M50 4 C57 4 61 10 61 17 C61 24 57 29 50 29 C43 29 39 24 39 17 C39 10 43 4 50 4 Z',
  'M45 27 L55 27 L56 36 L44 36 Z',
  'M30 37 Q50 31 70 37 L78 45 L73 100 L71 113 L29 113 L27 100 L22 45 Z',
  ...both('M22 44 L29 42 L28 86 L17 87 L14 50 Z'),
  ...both('M17 88 L28 87 L25 117 L14 117 Z'),
  ...both('M14 118 L25 118 L24 128 L14 127 Z'),
  ...both('M29 112 L50 112 L48 166 L33 166 Z'),
  ...both('M33 168 L48 168 L46 201 L36 201 Z'),
  ...both('M35 201 L47 201 L49 208 L33 208 Z'),
];

// muscle id -> list of paths, per view
const FRONT = {
  traps: both('M44 33 L46 36 L33 40 Q38 35 44 33 Z'),
  frontDelts: both('M26 41 Q32 39 34 44 L31 55 Q26 55 24 50 Z'),
  sideDelts: both('M22 45 Q24 41 26 41 L24 50 L22 56 Q20 50 22 45 Z'),
  chest: both('M34 44 Q42 40 49 43 L49 62 Q41 67 33 61 L31 55 Z'),
  biceps: both('M21 58 Q25 56 28 58 L27 82 Q22 84 19 80 Z'),
  forearms: both('M17 89 L27 88 L25 113 L15 113 Z'),
  abs: ['M41 66 L59 66 L58 104 Q50 108 42 104 Z'],
  quads: both('M31 116 L49 116 L47 160 Q40 164 34 160 Z'),
};
const BACK = {
  traps: ['M50 29 L64 39 L58 56 L50 62 L42 56 L36 39 Z'],
  rearDelts: both('M24 42 Q30 39 34 43 L31 54 Q26 54 23 50 Z'),
  upperBack: both('M37 50 L49 60 L49 76 L39 74 Z'),
  lats: both('M30 52 L37 52 L40 75 L48 80 L46 94 L36 98 L28 76 Z'),
  triceps: both('M20 57 Q25 55 28 57 L27 82 Q22 84 18 80 Z'),
  forearms: both('M17 89 L27 88 L25 113 L15 113 Z'),
  lowerBack: ['M43 82 L57 82 L59 104 L41 104 Z'],
  glutes: both('M30 106 L49 106 L49 126 Q38 130 30 124 Z'),
  hamstrings: both('M31 128 L49 128 L47 162 Q40 166 34 162 Z'),
  calves: both('M34 170 L48 170 L46 194 Q41 198 36 194 Z'),
};

function figure(view, sets, dx) {
  const regions = view === 'front' ? FRONT : BACK;
  let s = `<g transform="translate(${dx} 0)">`;
  s += SILHOUETTE.map((d) => `<path d="${d}" fill="${BODY}"/>`).join('');
  for (const [m, paths] of Object.entries(regions)) {
    const st = muscleStatus(sets[m] || 0);
    const name = MUSCLES.find((x) => x.id === m).name;
    for (const d of paths) {
      s += `<path d="${d}" fill="${STATUS_COLORS[st]}" stroke="${LINE}" stroke-width="0.8" stroke-linejoin="round"${st === 'missed' ? ' stroke-dasharray="2 1.5"' : ''}><title>${name}: ${Math.round(sets[m] || 0)} sets/week</title></path>`;
    }
  }
  s += `<text x="50" y="222" text-anchor="middle" font-size="9" fill="#9AA3AF" font-family="system-ui,sans-serif">${view === 'front' ? 'Front' : 'Back'}</text>`;
  return s + '</g>';
}

/** SVG string: front and back figures side by side. `sets` = weekly sets per muscle id. */
export function muscleMapSVG(sets, label = 'Muscles trained by your plan') {
  return `<svg viewBox="0 0 220 228" role="img" aria-label="${label}">${figure('front', sets, 0)}${figure('back', sets, 120)}</svg>`;
}
