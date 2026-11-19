# Dumbbell PPL Tracker — design concepts

Concept screens for a dumbbell-only Push / Pull / Legs workout tracker.
Live, clickable canvas: https://claude.ai/artifact/64V7yxQx5H3gnCG6s3Xbgu (private to the owner)

The files in `mockups/` are the canvas sources (Design Component `.dc.html` files plus `canvas.json` layout).

## Screens
1. **Today** (`Main.dc.html`): rotation-based schedule. Push → Pull → Legs → repeat, continuing from the last
   completed workout regardless of how many days have passed. Tap another day to swap.
2. **Library** (`Library.dc.html`): 25 dumbbell exercises, filterable by Push / Pull / Legs.
3. **Exercise** (`Exercise.dc.html`): full-body 3D-projected figure doing a seated DB shoulder press; Front / ¾ / Side
   views, Correct form vs Common mistakes, tempo phases, pause and 0.5× speed.
4. **Log** (`Log.dc.html`): set / rep logging with steppers, completion checks, rest timer, live volume and est. 1RM.
5. **Progress** (`Progress.dc.html`): est. 1RM trend, weekly volume, sets by day type, recent PRs.

All data shown is sample data; weights are in lb.

## Open decisions
- Units: lb, kg, or a toggle
- Platform: native app vs. installable web app (PWA)
- Form animations: hand-built figures (current) vs. licensed 3D animations or demo videos

## Known rough spots
- Mistakes mode, side view: the lumbar arch reads like a belly bulge, the near arm crosses the face, and the dumbbell reads as a small circle.
- Switching camera views jumps instead of rotating smoothly.
