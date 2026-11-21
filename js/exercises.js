// Exercise library. Every exercise uses dumbbells only.
// `figure` holds the poses the form pictures are drawn from (see figure.js).
// Cue / mistake `at` names the joint a numbered marker points to; `img` picks the picture.
import { flatBench, pad, block, rod } from './figure.js';

// mirrored helpers: S() for points/poles, T() for torso-relative points, HANG() for arms hanging
const S = (x, y, z) => ({ l: [-x, y, z], r: [x, y, z] });
const T = (x, u, f) => ({ l: { t: [-x, u, f] }, r: { t: [x, u, f] } });
const HANG = (dz = 2) => ({ l: { hang: dz }, r: { hang: dz } });
const SH = (dx, dy, dz) => ({ l: { sh: [-dx, dy, dz] }, r: { sh: [dx, dy, dz] } });

const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };

const uprightBench = () => [
  block(-17, 17, 40, 47, -16, 28),
  pad([0, 47, -17], nrm([0, 76, -5]), nrm([0, 5, 76]), 78, 16, 7),
  rod([0, 40, 6], [0, 2, 6]), rod([0, 2, -28], [0, 2, 36]), rod([-20, 2, -28], [20, 2, -28]), rod([-20, 2, 36], [20, 2, 36]),
];
const inclineBench = () => [
  block(-15, 15, 36, 43, -6, 32),
  pad([0, 41.2, -2.8], [0, 0.5, -0.866], [0, 0.866, 0.5], 82, 15, 7),
  rod([0, 52, -42], [0, 2, -42]), rod([0, 36, 14], [0, 2, 14]), rod([0, 2, -52], [0, 2, 30]),
];
const lying = { pelvis: [0, 57, 24], pitch: -90, ankles: S(24, 8, 64), knees: S(0.2, 1, 0.4) };
const seated = { pelvis: [0, 54, -3], pitch: -3, ankles: S(18, 8, 46), knees: S(0.2, 0.3, 1) };
const standing = { pelvis: [0, 96, 0], pitch: 0, ankles: S(13, 8, 2), knees: S(0, 0, 1) };

export const EXERCISES = [
  // ------------------------------------------------------------------ PUSH
  {
    id: 'db-bench-press', name: 'Flat DB Bench Press', day: 'Push', muscles: 'Chest · Triceps · Front delts',
    setup: 'Flat bench. Sit with the dumbbells on your thighs, then lie back and kick them up to your chest.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Feet flat on the floor, a little wider than your hips', at: 'toeL', dx: 8, dy: -10 },
      { text: 'Squeeze shoulder blades together and keep your butt on the bench', at: 'pelvis', dx: 0, dy: -16 },
      { text: 'Elbows about 45° from your body, dumbbells over mid-chest', at: 'elbowL', dx: 10, dy: 6 },
      { text: 'Press until your arms are nearly straight with the dumbbells over your chest — don’t slam the lockout or clank the bells', at: 'handL', img: 'end', dx: 12, dy: 0 },
      { text: 'Lower for 2 seconds until you feel a stretch across your chest' },
    ],
    mistakes: [
      { title: 'Elbows flared out to 90°', why: 'Pinches the front of the shoulder (impingement). Tuck elbows to about 45°.', at: 'elbowL', dx: 10, dy: 6 },
      { title: 'Butt lifting off the bench', why: 'Over-arches your lower back and moves strain onto the spine. Keep glutes down.', at: 'pelvis', dx: 0, dy: -18 },
    ],
    view: 90,
    figure: {
      props: flatBench(-75, 55), path: 'handL',
      start: { ...lying, hands: S(24, 72, -14), elbows: S(1, -1, 0.45), grip: 'x' },
      end: { ...lying, hands: S(15, 111, -20), elbows: S(1, -0.3, 0.3), grip: 'x' },
      mistake: { ...lying, pelvis: [0, 65, 24], arch: 7, hands: S(33, 72, -24), elbows: S(1, -0.6, 0), grip: 'x', warn: ['arms', 'spine', 'hips'] },
    },
  },
  {
    id: 'db-incline-press', name: 'Incline DB Press', day: 'Push', muscles: 'Upper chest · Front delts · Triceps',
    setup: 'Set the bench to 30–45°. Steeper than that turns it into a shoulder press.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Head, upper back and butt stay on the bench; feet planted', at: 'chest', dx: -4, dy: -18 },
      { text: 'Elbows about 45° from your body, under the dumbbells', at: 'elbowL', dx: 10, dy: 8 },
      { text: 'Press straight up (not toward your feet) until the dumbbells are over your shoulders, arms nearly straight', at: 'handL', img: 'end', dx: 12, dy: 0 },
      { text: 'Lower for 2 seconds to the sides of your upper chest' },
    ],
    mistakes: [
      { title: 'Elbows flared straight out', why: 'Loads the shoulder joint instead of the chest. Bring elbows back to ~45°.', at: 'elbowL', dx: 10, dy: 8 },
      { title: 'Lower back lifting off the pad', why: 'Flattens the incline and strains your lower back. Brace and keep it down.', at: 'mid', dx: 0, dy: -18 },
    ],
    view: 90,
    figure: {
      props: inclineBench(), path: 'handL',
      start: { pelvis: [0, 54, 0], pitch: -60, ankles: S(20, 8, 44), knees: S(0.2, 1, 0.6), hands: S(24, 87, -28), elbows: S(1, -1, 0.35), grip: 'x' },
      end: { pelvis: [0, 54, 0], pitch: -60, ankles: S(20, 8, 44), knees: S(0.2, 1, 0.6), hands: S(15, 129, -38), elbows: S(1, -0.3, 0.2), grip: 'x' },
      mistake: { pelvis: [0, 56, 0], pitch: -60, arch: 7, ankles: S(20, 8, 44), knees: S(0.2, 1, 0.6), hands: S(34, 86, -40), elbows: S(1, 0, 0), grip: 'x', warn: ['arms', 'spine'] },
    },
  },
  {
    id: 'db-shoulder-press', name: 'Seated DB Shoulder Press', day: 'Push', muscles: 'Shoulders · Triceps',
    setup: 'Bench upright (80–90°). Rest the dumbbells on your thighs and kick them up to shoulder height.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Back flat against the pad, ribs down', at: 'mid', dx: -16, dy: 0 },
      { text: 'Feet planted wide, knees over ankles', at: 'ankleL', dx: 10, dy: -6 },
      { text: 'Elbows slightly in front of your body, wrists stacked over elbows', at: 'elbowL', dx: 10, dy: 6 },
      { text: 'Press up and slightly in until arms are straight', at: 'handL', img: 'end', dx: 12, dy: 0 },
      { text: 'Lower for 2 seconds back to ear height' },
    ],
    mistakes: [
      { title: 'Lower back arching off the pad', why: 'Turns it into a leaning press and loads your lumbar spine. Use a weight you can press with your back flat.', at: 'mid', dx: 14, dy: 0 },
      { title: 'Elbows flared out and behind you', why: 'Pins the rotator cuff (impingement). Bring elbows slightly forward of your torso.', at: 'elbowL', dx: 10, dy: 6 },
    ],
    view: 90,
    figure: {
      props: uprightBench(), path: 'handL',
      start: { ...seated, hands: S(40, 112, 5), elbows: S(1, -0.6, 0.55), grip: 'x' },
      end: { ...seated, hands: S(13, 153, 1), elbows: S(1, 0, 0.35), grip: 'x' },
      mistake: { ...seated, pitch: -10, arch: 9, hands: S(46, 112, -9), elbows: S(1, -0.15, -0.8), grip: 'x', warn: ['spine', 'arms'] },
    },
  },
  {
    id: 'db-lateral-raise', name: 'DB Lateral Raise', day: 'Push', muscles: 'Side delts',
    setup: 'Stand tall with light dumbbells at your sides, palms facing in.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Shoulders down, away from your ears', at: 'shL', dx: -12, dy: -10 },
      { text: 'Slight bend in the elbows, kept the whole rep', at: 'elbowL', dx: -12, dy: 4 },
      { text: 'Raise out to the sides and slightly forward (about 20–30°), leading with the elbows', at: 'elbowL', img: 'end', dx: 0, dy: -14 },
      { text: 'Stop at or just below shoulder height', at: 'handL', img: 'end', dx: -6, dy: -14 },
    ],
    mistakes: [
      { title: 'Shrugging the weight up', why: 'Shifts work to your traps and can irritate the neck. Keep shoulders down.', at: 'shL', dx: -12, dy: -12 },
      { title: 'Swinging / leaning back', why: 'Momentum does the work and your lower back takes the strain. Go lighter.', at: 'mid', dx: 14, dy: 0 },
      { title: 'Raising above shoulder height', why: 'Pinches the shoulder joint with no extra benefit for the side delts.', at: 'handL', dx: -8, dy: -12 },
    ],
    view: 0,
    figure: {
      props: [], path: 'handL',
      start: { ...standing, pitch: 4, hands: S(24, 90, 10), elbows: S(0.3, 0, -1), grip: 'z' },
      end: { ...standing, pitch: 4, hands: S(66, 136, 25), elbows: S(0, 1, -0.3), grip: 'z' },
      mistake: { ...standing, pitch: -10, shrug: 5, hands: S(58, 160, 8), elbows: S(0, 1, -0.3), grip: 'z', warn: ['shoulders', 'spine', 'arms'] },
    },
  },
  {
    id: 'db-overhead-triceps', name: 'Overhead DB Triceps Ext.', day: 'Push', muscles: 'Triceps',
    setup: 'Sit on an upright bench. Hold one dumbbell overhead with both hands cupping the top plate.',
    tempo: '2s down · 1s up',
    cues: [
      { text: 'Elbows point up and stay close to your head', at: 'elbowL', dx: 12, dy: -6 },
      { text: 'Lower behind your head until you feel a stretch', at: 'handsMid', dx: -14, dy: 4 },
      { text: 'Straighten your arms fully without moving the elbows', at: 'handsMid', img: 'end', dx: 14, dy: 0 },
      { text: 'Brace your abs so your lower back stays on the pad', at: 'mid', dx: -16, dy: 0 },
    ],
    mistakes: [
      { title: 'Elbows flaring out wide', why: 'Takes tension off the triceps and stresses the elbow and shoulder.', at: 'elbowL', dx: 12, dy: -6 },
      { title: 'Arching the lower back', why: 'Compensates for tight shoulders and loads the spine. Go lighter and brace.', at: 'mid', dx: 14, dy: 0 },
    ],
    view: 90,
    figure: {
      props: uprightBench(),
      start: { ...seated, hands: S(3, 120, -20), elbows: S(0.15, 1, 0.2), bells: [{ at: 'mid', axis: 'y', off: [0, -7, 0] }] },
      end: { ...seated, hands: S(3, 154, -6), elbows: S(0.15, 1, 0.2), bells: [{ at: 'mid', axis: 'y', off: [0, -7, 0] }] },
      mistake: { ...seated, pitch: -10, arch: 8, hands: S(6, 118, -16), elbows: S(1, 0.3, 0), bells: [{ at: 'mid', axis: 'y', off: [0, -7, 0] }], warn: ['arms', 'spine'] },
    },
  },
  {
    id: 'db-floor-press', name: 'DB Floor Press', day: 'Push', muscles: 'Chest · Triceps',
    setup: 'Lie on the floor, knees bent. The floor stops your elbows, which protects the shoulders.',
    tempo: '1s up · 2s down, pause with elbows on the floor',
    cues: [{ text: 'Elbows about 45° from your body' }, { text: 'Let your upper arms touch the floor, pause, then press' }, { text: 'Press until arms are straight over your chest' }],
    mistakes: [{ title: 'Bouncing elbows off the floor', why: 'Jars the elbow and shoulder. Pause softly instead.' }],
  },
  {
    id: 'db-chest-fly', name: 'DB Chest Fly', day: 'Push', muscles: 'Chest',
    setup: 'Lie on a flat bench, dumbbells above your chest, palms facing each other.',
    tempo: '2s down · 1s up',
    cues: [{ text: 'Keep a fixed, soft bend in the elbows' }, { text: 'Open wide until you feel a chest stretch — not past shoulder level' }, { text: 'Bring the bells together in a hugging arc' }],
    mistakes: [{ title: 'Going too deep', why: 'Over-stretching the front of the shoulder under load is a common injury.' }, { title: 'Bending elbows into a press', why: 'Turns it into a press and loses the stretch.' }],
  },
  {
    id: 'db-arnold-press', name: 'Arnold Press', day: 'Push', muscles: 'Shoulders',
    setup: 'Seated upright, dumbbells in front of your shoulders, palms facing you.',
    tempo: '1s up with rotation · 2s down',
    cues: [{ text: 'Rotate palms forward as you press up' }, { text: 'Back flat on the pad' }, { text: 'Reverse the rotation on the way down' }],
    mistakes: [{ title: 'Arching the lower back', why: 'Loads the spine instead of the shoulders.' }],
  },
  {
    id: 'db-skull-crusher', name: 'DB Skull Crusher', day: 'Push', muscles: 'Triceps',
    setup: 'Lie on a flat bench, dumbbells above your shoulders, palms facing each other.',
    tempo: '2s down · 1s up',
    cues: [{ text: 'Upper arms stay still, tilted slightly back' }, { text: 'Bend only at the elbows, lowering beside your head' }, { text: 'Straighten fully at the top' }],
    mistakes: [{ title: 'Elbows drifting out', why: 'Stresses the elbow joint. Keep them shoulder-width.' }],
  },
  // ------------------------------------------------------------------ PULL
  {
    id: 'db-one-arm-row', name: 'One-Arm DB Row', day: 'Pull', muscles: 'Lats · Mid back · Biceps', perSide: true,
    setup: 'Left knee and left hand on a flat bench, right foot on the floor. Swap sides for the other arm.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Knee and hand on the bench, under your hip and shoulder', at: 'kneeL', dx: -10, dy: -12 },
      { text: 'Flat back, chest roughly parallel to the floor', at: 'mid', dx: 0, dy: -18 },
      { text: 'Let the dumbbell hang straight down for a full stretch', at: 'handR', dx: -12, dy: 4 },
      { text: 'Pull to your hip, elbow close to your side', at: 'handR', img: 'end', dx: -14, dy: 8 },
    ],
    mistakes: [
      { title: 'Rounded back', why: 'Puts your spine under load in a weak position. Keep it flat, chest up.', at: 'mid', dx: 0, dy: -18 },
      { title: 'Pulling to the chest, elbow flared', why: 'Shifts work to the shoulder and traps. Row toward your hip instead.', at: 'elbowR', dx: -12, dy: -8 },
    ],
    view: -90,
    figure: {
      props: flatBench(-62, 70, { x: -14 }), path: 'handR',
      start: { pelvis: [-2, 96, 0], pitch: 78, ankles: { l: [-14, 53, -42], r: [24, 8, -14] }, toes: { l: [-14, 51, -56] }, knees: { l: [0, -1, 0.3], r: [0.3, 0, 1] },
        hands: { l: [-16, 52, 52], r: { hang: 2 } }, elbows: { l: [-1, 0, 0], r: [0.2, 0, -1] }, grip: 'z', bells: ['r'] },
      end: { pelvis: [-2, 96, 0], pitch: 78, ankles: { l: [-14, 53, -42], r: [24, 8, -14] }, toes: { l: [-14, 51, -56] }, knees: { l: [0, -1, 0.3], r: [0.3, 0, 1] },
        hands: { l: [-16, 52, 52], r: [20, 93, 4] }, elbows: { l: [-1, 0, 0], r: [0.15, 1, -0.6] }, grip: 'z', bells: ['r'] },
      mistake: { pelvis: [-2, 96, 0], pitch: 72, arch: -9, ankles: { l: [-14, 53, -42], r: [24, 8, -14] }, toes: { l: [-14, 51, -56] }, knees: { l: [0, -1, 0.3], r: [0.3, 0, 1] },
        hands: { l: [-16, 52, 52], r: [28, 98, 38] }, elbows: { l: [-1, 0, 0], r: [1, 0.5, 0] }, grip: 'z', bells: ['r'], warn: ['spine', 'chest', 'armR'] },
    },
  },
  {
    id: 'db-chest-row', name: 'Chest-Supported DB Row', day: 'Pull', muscles: 'Upper back · Rear delts',
    setup: 'Set a bench to about 45° and lie chest-down on it, feet on the floor behind you.',
    tempo: '1s up · pause · 2s down',
    cues: [
      { text: 'Chest stays on the pad the whole set', at: 'chest', dx: 4, dy: -18 },
      { text: 'Arms hang straight down at the start', at: 'handL', dx: 12, dy: 0 },
      { text: 'Drive elbows back toward your hips', at: 'elbowL', img: 'end', dx: -6, dy: -14 },
      { text: 'Squeeze shoulder blades together at the top', at: 'shL', img: 'end', dx: 6, dy: -16 },
    ],
    mistakes: [
      { title: 'Chest lifting off the pad', why: 'Turns it into a standing row and loads the lower back.', at: 'chest', dx: 10, dy: -16 },
      { title: 'Shrugging toward your ears', why: 'Works the traps instead of the mid back and strains the neck.', at: 'shL', dx: 12, dy: -6 },
    ],
    view: 90,
    figure: {
      props: [pad([0, 74.2, 3.8], [0, 0.643, 0.766], [0, 0.766, -0.643], 50, 15, 7), rod([0, 86, 24], [0, 2, 24]), rod([0, 2, -10], [0, 2, 60])],
      path: 'handL',
      start: { pelvis: [0, 88, 0], pitch: 50, ankles: S(14, 8, -24), knees: S(0, 0, 1), hands: HANG(3), elbows: S(0.3, 0, -1), grip: 'z' },
      end: { pelvis: [0, 88, 0], pitch: 50, ankles: S(14, 8, -24), knees: S(0, 0, 1), hands: S(22, 104, 14), elbows: S(0.2, 1, -0.8), grip: 'z' },
      mistake: { pelvis: [0, 88, 0], pitch: 26, shrug: 5, ankles: S(14, 8, -24), knees: S(0, 0, 1), hands: S(22, 100, 24), elbows: S(0.3, 0.6, -1), grip: 'z', warn: ['chest', 'shoulders'] },
    },
  },
  {
    id: 'db-pullover', name: 'DB Pullover', day: 'Pull', muscles: 'Lats · Chest',
    setup: 'Lie on a flat bench holding one dumbbell over your chest, both hands cupping the top plate.',
    tempo: '2s down · 1s up',
    cues: [
      { text: 'Arms nearly straight with a slight bend locked in', at: 'elbowL', dx: 12, dy: -4 },
      { text: 'Keep ribs down and lower back on the bench', at: 'mid', dx: 0, dy: -18 },
      { text: 'Lower behind your head until you feel a stretch in your lats', at: 'handsMid', img: 'end', dx: -4, dy: -14 },
    ],
    mistakes: [
      { title: 'Bending the elbows a lot', why: 'Turns it into a triceps extension and takes the lats out of it.', at: 'elbowL', dx: 10, dy: -10 },
      { title: 'Ribs flaring / back arching', why: 'Fakes range by bending the spine instead of moving the shoulders.', at: 'mid', dx: 0, dy: -18 },
    ],
    view: 90,
    figure: {
      props: flatBench(-80, 55), path: 'handsMid',
      start: { ...lying, hands: S(3, 108, -20), elbows: S(1, 0, -0.2), bells: [{ at: 'mid', axis: 'y', off: [0, 7, 0] }] },
      end: { ...lying, hands: S(3, 66, -70), elbows: S(1, 0.3, 0), bells: [{ at: 'mid', axis: 'z', off: [0, 0, -7] }] },
      mistake: { ...lying, arch: 8, hands: S(3, 80, -48), elbows: S(0.3, 1, 0.3), bells: [{ at: 'mid', axis: 'z', off: [0, 0, -7] }], warn: ['arms', 'spine'] },
    },
  },
  {
    id: 'db-rear-delt-fly', name: 'Rear Delt Fly', day: 'Pull', muscles: 'Rear delts · Upper back',
    setup: 'Stand with light dumbbells, hinge forward at the hips until your torso is nearly parallel to the floor.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Hinge at the hips with a flat back', at: 'mid', dx: 0, dy: -18 },
      { text: 'Soft bend in the knees', at: 'kneeL', dx: 12, dy: 0 },
      { text: 'Raise arms out wide, leading with the elbows', at: 'elbowL', img: 'end', dx: -8, dy: -14 },
      { text: 'Stop when your arms are level with your body', at: 'handL', img: 'end', dx: -10, dy: -10 },
    ],
    mistakes: [
      { title: 'Rounded back', why: 'Loads the spine while bent over. Keep it flat; bend knees more if needed.', at: 'mid', dx: 0, dy: -18 },
      { title: 'Standing up and shrugging', why: 'Turns it into a trap shrug. Stay hinged and keep shoulders down.', at: 'shL', dx: 12, dy: -10 },
    ],
    view: 30,
    figure: {
      props: [], path: 'handL',
      start: { pelvis: [0, 90, -10], pitch: 70, ankles: S(14, 8, 4), knees: S(0, 0, 1), hands: HANG(3), elbows: S(0.4, 0, -1), grip: 'z' },
      end: { pelvis: [0, 90, -10], pitch: 70, ankles: S(14, 8, 4), knees: S(0, 0, 1), hands: S(68, 100, 36), elbows: S(0, 1, 0), grip: 'z' },
      mistake: { pelvis: [0, 92, -8], pitch: 45, arch: -9, shrug: 5, ankles: S(14, 8, 4), knees: S(0, 0, 1), hands: S(50, 112, 14), elbows: S(0.3, 1, -0.5), grip: 'z', warn: ['spine', 'shoulders'] },
    },
  },
  {
    id: 'db-hammer-curl', name: 'Hammer Curl', day: 'Pull', muscles: 'Biceps · Forearms',
    setup: 'Stand tall, dumbbells at your sides, palms facing each other.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Stand tall, elbows pinned to your sides', at: 'elbowL', dx: -14, dy: 0 },
      { text: 'Palms face each other the whole rep', at: 'handL', dx: 12, dy: 2 },
      { text: 'Curl up without the elbows drifting forward', at: 'handL', img: 'end', dx: 12, dy: -6 },
      { text: 'Lower all the way down slowly' },
    ],
    mistakes: [
      { title: 'Swinging / leaning back', why: 'Your lower back swings the weight instead of your arms. Go lighter.', at: 'mid', dx: 14, dy: 0 },
      { title: 'Elbows drifting forward', why: 'Front delts take over and the biceps get less work.', at: 'elbowL', dx: 12, dy: 4 },
    ],
    view: 90,
    figure: {
      props: [], path: 'handL',
      start: { ...standing, hands: HANG(4), elbows: S(0, 0, -1), grip: 'z' },
      end: { ...standing, hands: S(20, 124, 24), elbows: S(0.1, -1, -0.3), grip: 'z' },
      mistake: { ...standing, pitch: -12, shrug: 3, hands: S(20, 146, 26), elbows: S(0, -0.3, 1), grip: 'z', warn: ['spine', 'arms'] },
    },
  },
  {
    id: 'db-biceps-curl', name: 'DB Biceps Curl', day: 'Pull', muscles: 'Biceps',
    setup: 'Stand tall, dumbbells at your sides, palms facing forward.',
    tempo: '1s up · 2s down',
    cues: [
      { text: 'Elbows pinned to your sides', at: 'elbowL', dx: -14, dy: 0 },
      { text: 'Palms face forward', at: 'handL', dx: 12, dy: 2 },
      { text: 'Curl up and squeeze, elbows stay put', at: 'handL', img: 'end', dx: 12, dy: -6 },
    ],
    mistakes: [
      { title: 'Swinging / leaning back', why: 'Momentum and your lower back do the work. Go lighter.', at: 'mid', dx: 14, dy: 0 },
      { title: 'Elbows drifting forward', why: 'Shoulders take over and the biceps lose tension.', at: 'elbowL', dx: 12, dy: 4 },
    ],
    view: 90,
    figure: {
      props: [], path: 'handL',
      start: { ...standing, hands: HANG(4), elbows: S(0, 0, -1), grip: 'x' },
      end: { ...standing, hands: S(20, 124, 24), elbows: S(0.1, -1, -0.3), grip: 'x' },
      mistake: { ...standing, pitch: -12, shrug: 3, hands: S(20, 146, 26), elbows: S(0, -0.3, 1), grip: 'x', warn: ['spine', 'arms'] },
    },
  },
  {
    id: 'db-incline-curl', name: 'Incline DB Curl', day: 'Pull', muscles: 'Biceps (long head)',
    setup: 'Lie back on a bench set to 45–60°, arms hanging straight down.',
    tempo: '1s up · 2s down',
    cues: [{ text: 'Arms hang straight down, behind your torso' }, { text: 'Curl without moving the upper arm forward' }, { text: 'Lower all the way for the stretch' }],
    mistakes: [{ title: 'Going too heavy', why: 'The stretched position stresses the biceps tendon. Start light.' }],
  },
  {
    id: 'db-shrug', name: 'DB Shrug', day: 'Pull', muscles: 'Traps',
    setup: 'Stand tall, dumbbells at your sides.',
    tempo: '1s up · 1s pause · 2s down',
    cues: [
      { text: 'Arms straight and relaxed — they are just hooks', at: 'elbowL', dx: -14, dy: 0 },
      { text: 'Shrug straight up toward your ears and pause', at: 'shL', img: 'end', dx: 12, dy: -10 },
    ],
    mistakes: [{ title: 'Rolling the shoulders', why: 'Adds nothing and grinds the shoulder joint. Straight up, straight down.', at: 'shL', dx: 12, dy: -10 }],
    view: 90,
    figure: {
      props: [],
      start: { ...standing, hands: HANG(3), elbows: S(0, 0, -1), grip: 'z' },
      end: { ...standing, shrug: 7, hands: { l: { sh: [-1.5, -53.5, 3] }, r: { sh: [1.5, -53.5, 3] } }, elbows: S(0, 0, -1), grip: 'z' },
      mistake: { ...standing, shrug: 5, pitch: 6, hands: { l: { sh: [-1.5, -52, -10] }, r: { sh: [1.5, -52, -10] } }, elbows: S(0, 0, -1), grip: 'z', warn: ['shoulders'] },
    },
  },
  // ------------------------------------------------------------------ LEGS
  {
    id: 'goblet-squat', name: 'Goblet Squat', day: 'Legs', muscles: 'Quads · Glutes',
    setup: 'Hold one dumbbell vertically against your chest, hands cupping the top plate. Feet shoulder-width.',
    tempo: '2s down · 1s up',
    cues: [
      { text: 'Dumbbell held vertically, tight to your chest', at: 'handsMid', dx: 14, dy: -4 },
      { text: 'Feet shoulder-width, toes turned slightly out', at: 'toeL', dx: 10, dy: -8 },
      { text: 'Sit down between your heels; knees track over your toes', at: 'kneeL', img: 'end', dx: 12, dy: -8 },
      { text: 'Chest up, back flat', at: 'mid', img: 'end', dx: -16, dy: -6 },
    ],
    mistakes: [
      { title: 'Knees caving inward', why: 'Strains the inner knee ligaments. Push knees out over your toes.', at: 'kneeL', dx: 12, dy: -8 },
      { title: 'Heels lifting off the floor', why: 'Shifts load to the knees and throws off balance. Keep weight mid-foot.', at: 'ankleL', dx: 12, dy: 4 },
      { title: 'Chest dropping / back rounding', why: 'Loads the lower back. Hold the bell higher and keep the chest proud.', at: 'mid', dx: -16, dy: -6 },
    ],
    view: 35,
    figure: {
      props: [], path: 'pelvis',
      start: { ...standing, pitch: 2, ankles: S(18, 8, 0), knees: S(0.3, 0, 1), hands: T(5, 38, 17), elbows: S(0.4, -1, 0.2), bells: [{ at: { t: [0, 31, 18] }, axis: 'y' }] },
      end: { pelvis: [0, 52, -16], pitch: 28, ankles: S(18, 8, 0), knees: S(0.25, 0, 1), hands: T(5, 38, 17), elbows: S(0.4, -1, 0.2), bells: [{ at: { t: [0, 31, 18] }, axis: 'y' }] },
      mistake: { pelvis: [0, 56, -12], pitch: 50, arch: -6, ankles: S(18, 14, -2), knees: S(-0.9, 0, 0.6), hands: T(5, 34, 17), elbows: S(0.4, -1, 0.2), bells: [{ at: { t: [0, 27, 18] }, axis: 'y' }], warn: ['knees', 'spine', 'feet'] },
    },
  },
  {
    id: 'db-rdl', name: 'DB Romanian Deadlift', day: 'Legs', muscles: 'Hamstrings · Glutes',
    setup: 'Stand tall, dumbbells in front of your thighs, feet hip-width.',
    tempo: '2s down · 1s up',
    cues: [
      { text: 'Stand tall by squeezing your glutes at the top', at: 'pelvis', dx: -16, dy: -4 },
      { text: 'Soft knees; push your hips straight back', at: 'pelvis', img: 'end', dx: -12, dy: -12 },
      { text: 'Back flat, chest proud', at: 'mid', img: 'end', dx: 0, dy: -18 },
      { text: 'Dumbbells stay close, sliding down your legs; stop when you feel a hamstring stretch — usually just below the knees to mid-shin', at: 'handL', img: 'end', dx: 14, dy: 0 },
    ],
    mistakes: [
      { title: 'Rounded back', why: 'The most common way to hurt your lower back. Only go as low as you can stay flat.', at: 'mid', dx: 0, dy: -18 },
      { title: 'Dumbbells drifting away from your legs', why: 'Makes the weight act much heavier on your spine. Keep them close.', at: 'handL', dx: 14, dy: 0 },
    ],
    view: 90,
    figure: {
      props: [], path: 'handL',
      start: { ...standing, ankles: S(12, 8, 2), hands: SH(-4, -53, 8), elbows: S(0, 0, -1), grip: 'x' },
      end: { pelvis: [0, 86, -28], pitch: 60, ankles: S(12, 8, 2), knees: S(0, 0, 1), hands: S(14, 56, 9), elbows: S(0, 0, -1), grip: 'x' },
      mistake: { pelvis: [0, 84, -20], pitch: 64, arch: -11, ankles: S(12, 8, 2), knees: S(0, 0, 1), hands: SH(-4, -48, 18), elbows: S(0, 0, -1), grip: 'x', warn: ['spine', 'arms'] },
    },
  },
  {
    id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', day: 'Legs', muscles: 'Quads · Glutes', perSide: true,
    setup: 'Rear foot laces-down on a bench behind you, front foot about two feet ahead. Dumbbells at your sides.',
    tempo: '2s down · 1s up',
    cues: [
      { text: 'Rear foot laces-down on the bench', at: 'toeL', dx: 0, dy: -14 },
      { text: 'Front foot far enough forward that the knee stays over the foot', at: 'ankleR', dx: 12, dy: -6 },
      { text: 'Drop straight down until the back knee nearly touches the floor', at: 'kneeL', img: 'end', dx: -12, dy: 4 },
      { text: 'Torso tall with a slight forward lean', at: 'mid', img: 'end', dx: -16, dy: -4 },
    ],
    mistakes: [
      { title: 'Front knee caving inward', why: 'Strains the knee. Keep it pointing over your middle toes.', at: 'kneeR', dx: 12, dy: -8 },
      { title: 'Heel lifting, leaning far forward', why: 'Dumps the load onto the front knee and lower back.', at: 'mid', dx: -16, dy: -4 },
    ],
    view: 90,
    figure: {
      props: flatBench(-100, -45), path: 'pelvis',
      start: { pelvis: [0, 90, -6], pitch: 6, ankles: { l: [-10, 52, -64], r: [12, 8, 24] }, toes: { l: [-10, 50, -79] }, knees: { l: [0, -1, 0.2], r: [0, 0, 1] }, hands: HANG(2), elbows: S(0, 0, -1), grip: 'z' },
      end: { pelvis: [0, 56, -8], pitch: 14, ankles: { l: [-10, 52, -64], r: [12, 8, 24] }, toes: { l: [-10, 50, -79] }, knees: { l: [0, -1, 0], r: [0, 0, 1] }, hands: HANG(2), elbows: S(0, 0, -1), grip: 'z' },
      mistake: { pelvis: [0, 62, -2], pitch: 40, ankles: { l: [-10, 52, -64], r: [12, 15, 20] }, toes: { l: [-10, 50, -79] }, knees: { l: [0, -1, 0], r: [-1, 0, 0.6] }, hands: HANG(2), elbows: S(0, 0, -1), grip: 'z', warn: ['legR', 'spine'] },
    },
  },
  {
    id: 'db-hip-thrust', name: 'DB Hip Thrust', day: 'Legs', muscles: 'Glutes · Hamstrings',
    setup: 'Sit on the floor with your upper back against a bench edge, dumbbell across your hips (use a pad or towel).',
    tempo: '1s up · 1s squeeze · 2s down',
    cues: [
      { text: 'Upper back on the bench edge, just below the shoulder blades', at: 'shL', dx: -4, dy: -14 },
      { text: 'Feet flat, shins vertical at the top', at: 'ankleL', img: 'end', dx: 12, dy: -6 },
      { text: 'Drive through your heels until hips are level with knees', at: 'pelvis', img: 'end', dx: 0, dy: -18 },
      { text: 'Chin tucked, ribs down', at: 'head', img: 'end', dx: -8, dy: -14 },
    ],
    mistakes: [
      { title: 'Over-arching the lower back at the top', why: 'Lifting with your spine instead of your glutes. Stop when hips are level.', at: 'mid', dx: 0, dy: -18 },
      { title: 'Head thrown back', why: 'Strains the neck and encourages the arch. Look toward your knees.', at: 'head', dx: -8, dy: -14 },
    ],
    view: 90,
    figure: {
      props: [block(-45, 45, 38, 45, -64, -32), rod([-35, 38, -48], [-35, 2, -48]), rod([35, 38, -48], [35, 2, -48])],
      path: 'pelvis',
      start: { pelvis: [0, 26, -3], pitch: -46, headTilt: -10, ankles: S(18, 8, 56), knees: S(0, 1, 0.4), hands: T(10, 2, 16), elbows: S(1, 0.5, 0), bells: [{ at: { t: [0, 0, 15] }, axis: 'x' }] },
      end: { pelvis: [0, 60, 11], pitch: -90, headTilt: -30, ankles: S(18, 8, 56), knees: S(0, 1, 0.3), hands: T(10, 2, 16), elbows: S(1, 0.5, 0), bells: [{ at: { t: [0, 0, 15] }, axis: 'x' }] },
      mistake: { pelvis: [0, 64, 12], pitch: -98, arch: 9, headTilt: 30, ankles: S(18, 8, 62), knees: S(0, 1, 0.3), hands: T(10, 2, 16), elbows: S(1, 0.5, 0), bells: [{ at: { t: [0, 0, 15] }, axis: 'x' }], warn: ['spine', 'head'] },
    },
  },
  {
    id: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', day: 'Legs', muscles: 'Calves', perSide: true,
    setup: 'Stand on a step on one foot, dumbbell in the same-side hand, fingertips on a wall for balance.',
    tempo: '1s up · 1s pause · 2s down',
    cues: [
      { text: 'Ball of your foot on the step edge, heel hanging off', at: 'toeR', dx: -14, dy: 4 },
      { text: 'Lower slowly until you feel a stretch in the calf', at: 'ankleR', dx: 12, dy: 4 },
      { text: 'Rise as high as you can and pause for a second', at: 'ankleR', img: 'end', dx: 12, dy: -4 },
      { text: 'Fingertips on the wall for balance only', at: 'handL', dx: -12, dy: -10 },
    ],
    mistakes: [
      { title: 'Bending the knee and bouncing', why: 'Takes the calf out of it and jolts the Achilles tendon. Slow, straight-legged reps.', at: 'kneeR', dx: 14, dy: 0 },
    ],
    view: -90,
    figure: {
      props: [block(-30, 30, 0, 12, -10, 22), block(-45, 45, 0, 175, 56, 60)],
      path: 'ankleR',
      start: { pelvis: [0, 103, -2], pitch: 0, ankles: { l: [-10, 44, -24], r: [10, 13, 1] }, toes: { r: [11, 15.5, 15] }, knees: { l: [0, 0, 1], r: [0, 0, 1] },
        hands: { l: [-24, 128, 52], r: { hang: 2 } }, elbows: { l: [-0.5, -1, 0], r: [0, 0, -1] }, grip: 'z', bells: ['r'] },
      end: { pelvis: [0, 120, -2], pitch: 0, ankles: { l: [-10, 61, -24], r: [10, 30, 6] }, toes: { r: [11, 15.5, 15] }, knees: { l: [0, 0, 1], r: [0, 0, 1] },
        hands: { l: [-24, 140, 52], r: { hang: 2 } }, elbows: { l: [-0.5, -1, 0], r: [0, 0, -1] }, grip: 'z', bells: ['r'] },
      mistake: { pelvis: [0, 96, 4], pitch: 16, ankles: { l: [-10, 40, -20], r: [10, 20, 4] }, toes: { r: [11, 15.5, 15] }, knees: { l: [0, 0, 1], r: [0, 0, 1] },
        hands: { l: [-24, 124, 52], r: { hang: 2 } }, elbows: { l: [-0.5, -1, 0], r: [0, 0, -1] }, grip: 'z', bells: ['r'], warn: ['legR'] },
    },
  },
  {
    id: 'db-walking-lunge', name: 'DB Walking Lunge', day: 'Legs', muscles: 'Quads · Glutes',
    setup: 'Dumbbells at your sides, stand tall with room to walk forward.',
    tempo: 'Controlled steps',
    cues: [{ text: 'Long step; both knees bend to about 90°' }, { text: 'Front knee stays over the foot' }, { text: 'Torso tall' }],
    mistakes: [{ title: 'Front knee caving in', why: 'Strains the knee. Track it over your middle toes.' }],
  },
  {
    id: 'db-step-up', name: 'DB Step-Up', day: 'Legs', muscles: 'Quads · Glutes', perSide: true,
    setup: 'Box or bench around knee height. Dumbbells at your sides.',
    tempo: '1s up · 2s down',
    cues: [{ text: 'Whole foot on the box' }, { text: 'Drive through the top heel — don’t push off the back foot' }, { text: 'Lower slowly' }],
    mistakes: [{ title: 'Pushing off the floor foot', why: 'Takes the work away from the working leg.' }],
  },
  {
    id: 'db-sumo-squat', name: 'DB Sumo Squat', day: 'Legs', muscles: 'Adductors · Glutes',
    setup: 'Wide stance, toes turned out, one dumbbell hanging between your legs.',
    tempo: '2s down · 1s up',
    cues: [{ text: 'Knees push out over your toes' }, { text: 'Chest up, back flat' }, { text: 'Sit straight down' }],
    mistakes: [{ title: 'Knees caving inward', why: 'Strains the knees. Push them out.' }],
  },
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const DAYS = ['Push', 'Pull', 'Legs'];

export const DEFAULT_PLANS = {
  Push: [
    { id: 'db-bench-press', sets: 4, lo: 8, hi: 10 },
    { id: 'db-incline-press', sets: 3, lo: 10, hi: 12 },
    { id: 'db-shoulder-press', sets: 3, lo: 8, hi: 10 },
    { id: 'db-lateral-raise', sets: 3, lo: 12, hi: 15 },
    { id: 'db-overhead-triceps', sets: 3, lo: 10, hi: 12 },
  ],
  Pull: [
    { id: 'db-one-arm-row', sets: 4, lo: 8, hi: 10 },
    { id: 'db-chest-row', sets: 3, lo: 10, hi: 12 },
    { id: 'db-pullover', sets: 3, lo: 12, hi: 12 },
    { id: 'db-rear-delt-fly', sets: 3, lo: 15, hi: 15 },
    { id: 'db-hammer-curl', sets: 3, lo: 10, hi: 12 },
  ],
  Legs: [
    { id: 'goblet-squat', sets: 4, lo: 10, hi: 12 },
    { id: 'db-rdl', sets: 3, lo: 8, hi: 10 },
    { id: 'bulgarian-split-squat', sets: 3, lo: 10, hi: 10 },
    { id: 'db-hip-thrust', sets: 3, lo: 12, hi: 12 },
    { id: 'single-leg-calf-raise', sets: 3, lo: 15, hi: 15 },
  ],
};
