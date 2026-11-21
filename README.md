# PPL Tracker

A dumbbell-only Push / Pull / Legs workout tracker that runs as a website you can add to your phone's home screen.
No account and no server: your workouts are saved on your phone, and it works offline.

## What it does
- **Rotation, not a calendar.** Push → Pull → Legs → repeat, continuing from whatever you finished last, even if it's been 10 days.
  You can swap today's day; the rotation follows what you actually did.
- **Workout logging.** Weight (lb) and reps per set, a check to mark each set done, a rest timer (vibrates/beeps), add/remove sets and exercises.
  It pre-fills last time's weight and suggests going up when you hit the top of your rep range.
- **Form pictures.** Start, finish and common-mistake pictures with numbered checkpoints, from front, ¾ or side.
  17 of the 27 exercises have pictures so far (all 15 in the original Muscle Builder plan).
- **Programs.** Six ready-made PPL programs (Muscle Builder, Strength, Beginner, Express, Upper-Body Focus, Lower-Body Focus),
  each with its own exercises, rep ranges, rest time and days per week. You can edit any day afterwards.
- **Muscle map.** Front and back body diagrams coloured by how many sets per week each muscle gets from your plan.
  If an edit leaves a muscle untrained, you get a caution (also on the Today screen) with a recommended exercise you can add in one tap.
- **Calendar.** A month view on the Progress tab showing which days you trained, coloured by Push / Pull / Legs; tap a day to open that workout.
- **Progress.** Estimated 1-rep max per exercise, weekly volume, Push/Pull/Legs balance, personal bests and workout history.
- **Your data.** Export / import a backup file from Settings.

## Run it locally
It's plain HTML, CSS and JavaScript with no build step. Serve the folder with any static server, for example:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

(Opening `index.html` directly from disk won't work, because browsers block JavaScript modules on `file://`.)

## Put it on your phone
Host the folder on any free static host, for example GitHub Pages (Settings → Pages → deploy from a branch, folder `/`),
Netlify or Cloudflare Pages. Then open the address on your phone:
- **iPhone:** Safari → Share → *Add to Home Screen*
- **Android:** Chrome → ⋮ → *Install app*

## Tests
```sh
npm test
```
Covers the rotation, strength estimates, weight suggestions, weekly stats, personal bests, muscle coverage, programs, the calendar and backup import.

## Code map
| File | What's in it |
|---|---|
| `js/app.js` | Screens, navigation and button handling |
| `js/exercises.js` | Exercise library, muscles worked, form cues, mistakes and picture poses |
| `js/figure.js` | Draws the 3D mannequin and benches as SVG from a pose |
| `js/logic.js` | Rotation, estimated 1RM, suggestions, stats, muscle coverage and calendar (no UI) |
| `js/programs.js` | The built-in training programs |
| `js/musclemap.js` | Front / back muscle diagram |
| `js/store.js` | Saving to the phone, backup export / import |
| `js/charts.js` | Line and bar charts |
| `sw.js`, `manifest.webmanifest` | Offline support and home-screen install |
| `design/` | The earlier concept mockups |
