// Ready-made training programs. All follow the Push → Pull → Legs rotation;
// they differ in goal, rep ranges, volume and how many days a week you train.
const x = (id, sets, lo, hi = lo) => ({ id, sets, lo, hi });

export const PROGRAMS = [
  {
    id: 'ppl-hypertrophy', name: 'PPL Muscle Builder', goal: 'Build muscle',
    blurb: 'The classic split: moderate weights for 8–15 reps, every muscle hit twice a week.',
    daysPerWeek: 6, restSec: 90, minutes: 50,
    plans: {
      Push: [x('db-bench-press', 4, 8, 10), x('db-incline-press', 3, 10, 12), x('db-shoulder-press', 3, 8, 10), x('db-lateral-raise', 3, 12, 15), x('db-overhead-triceps', 3, 10, 12)],
      Pull: [x('db-one-arm-row', 4, 8, 10), x('db-chest-row', 3, 10, 12), x('db-pullover', 3, 12), x('db-rear-delt-fly', 3, 15), x('db-hammer-curl', 3, 10, 12)],
      Legs: [x('goblet-squat', 4, 10, 12), x('db-rdl', 3, 8, 10), x('bulgarian-split-squat', 3, 10), x('db-hip-thrust', 3, 12), x('single-leg-calf-raise', 3, 15), x('db-weighted-crunch', 3, 12, 15)],
    },
  },
  {
    id: 'ppl-strength', name: 'PPL Strength', goal: 'Get stronger',
    blurb: 'Heavier dumbbells for 5–8 reps with longer rests. Fewer exercises, more sets on the big lifts.',
    daysPerWeek: 6, restSec: 150, minutes: 55,
    plans: {
      Push: [x('db-bench-press', 5, 5, 8), x('db-shoulder-press', 4, 6, 8), x('db-incline-press', 3, 6, 8), x('db-lateral-raise', 3, 10, 12), x('db-overhead-triceps', 3, 8, 10)],
      Pull: [x('db-one-arm-row', 5, 6, 8), x('db-chest-row', 4, 6, 8), x('db-rear-delt-fly', 3, 12), x('db-shrug', 3, 8, 10), x('db-hammer-curl', 3, 8)],
      Legs: [x('bulgarian-split-squat', 4, 6, 8), x('db-rdl', 4, 6, 8), x('goblet-squat', 3, 8, 10), x('db-hip-thrust', 3, 8), x('single-leg-calf-raise', 4, 10), x('db-weighted-crunch', 3, 10)],
    },
  },
  {
    id: 'ppl-beginner', name: 'PPL Beginner', goal: 'Learn the lifts',
    blurb: 'Three days a week, three or four exercises a day. Light enough to focus on form and build the habit.',
    daysPerWeek: 3, restSec: 90, minutes: 35,
    plans: {
      Push: [x('db-bench-press', 3, 10, 12), x('db-shoulder-press', 3, 10, 12), x('db-lateral-raise', 2, 12, 15), x('db-overhead-triceps', 2, 12)],
      Pull: [x('db-one-arm-row', 3, 10, 12), x('db-rear-delt-fly', 2, 12, 15), x('db-hammer-curl', 2, 10, 12)],
      Legs: [x('goblet-squat', 3, 10, 12), x('db-rdl', 3, 10, 12), x('single-leg-calf-raise', 2, 15), x('db-weighted-crunch', 2, 12, 15)],
    },
  },
  {
    id: 'ppl-express', name: 'PPL Express', goal: 'Short on time',
    blurb: 'About 30 minutes: the most useful lifts for each day with fewer sets. Good for busy weeks.',
    daysPerWeek: 6, restSec: 60, minutes: 30,
    plans: {
      Push: [x('db-bench-press', 3, 8, 10), x('db-shoulder-press', 3, 8, 10), x('db-lateral-raise', 2, 12, 15), x('db-overhead-triceps', 2, 10, 12)],
      Pull: [x('db-one-arm-row', 3, 8, 10), x('db-rear-delt-fly', 2, 15), x('db-hammer-curl', 3, 10)],
      Legs: [x('goblet-squat', 3, 10, 12), x('db-rdl', 3, 8, 10), x('single-leg-calf-raise', 2, 15), x('db-weighted-crunch', 2, 15)],
    },
  },
  {
    id: 'ppl-upper', name: 'PPL Upper-Body Focus', goal: 'Arms & shoulders',
    blurb: 'Extra shoulder and arm work on Push and Pull days; Legs days are kept short to maintain.',
    daysPerWeek: 6, restSec: 75, minutes: 55,
    plans: {
      Push: [x('db-incline-press', 4, 8, 10), x('db-arnold-press', 3, 10, 12), x('db-lateral-raise', 4, 12, 15), x('db-bench-press', 3, 10), x('db-skull-crusher', 3, 10, 12), x('db-overhead-triceps', 2, 12, 15)],
      Pull: [x('db-one-arm-row', 4, 8, 10), x('db-rear-delt-fly', 3, 15), x('db-chest-row', 3, 10, 12), x('db-biceps-curl', 3, 10, 12), x('db-incline-curl', 3, 10, 12), x('db-hammer-curl', 2, 12)],
      Legs: [x('goblet-squat', 3, 10, 12), x('db-rdl', 3, 8, 10), x('single-leg-calf-raise', 3, 15), x('db-weighted-crunch', 3, 12, 15)],
    },
  },
  {
    id: 'ppl-lower', name: 'PPL Lower-Body Focus', goal: 'Glutes & legs',
    blurb: 'A bigger Legs day with extra glute and single-leg work; Push and Pull cover the essentials.',
    daysPerWeek: 6, restSec: 90, minutes: 50,
    plans: {
      Push: [x('db-bench-press', 3, 8, 10), x('db-shoulder-press', 3, 8, 10), x('db-lateral-raise', 3, 12, 15), x('db-overhead-triceps', 2, 10, 12)],
      Pull: [x('db-one-arm-row', 3, 8, 10), x('db-chest-row', 3, 10, 12), x('db-rear-delt-fly', 2, 15), x('db-hammer-curl', 2, 10, 12)],
      Legs: [x('db-hip-thrust', 4, 8, 12), x('bulgarian-split-squat', 3, 8, 10), x('db-rdl', 3, 8, 10), x('goblet-squat', 3, 10, 12), x('db-step-up', 2, 10), x('single-leg-calf-raise', 3, 15), x('db-weighted-crunch', 3, 12, 15)],
    },
  },
];

export const programById = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
export const DEFAULT_PROGRAM = PROGRAMS[0];
export const DEFAULT_PLANS = DEFAULT_PROGRAM.plans;
export const copyPlans = (plans) => JSON.parse(JSON.stringify(plans));
