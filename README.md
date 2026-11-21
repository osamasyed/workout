# PPL Tracker

A dumbbell-only Push / Pull / Legs workout tracker that runs as a website you can add to your phone's home screen.
No account and no server: your workouts are saved on your phone, and it works offline.

## What it does
- **Rotation, not a calendar.** Push → Pull → Legs → repeat, continuing from whatever you finished last, even if it's been 10 days.
  You can swap today's day; the rotation follows what you actually did.
- **Workout logging.** Weight (lb) and reps per set, a check to mark each set done, a rest timer (vibrates/beeps), add/remove sets and exercises.
  It pre-fills last time's weight and suggests going up when you hit the top of your rep range.
- **Form pictures.** Start, finish and common-mistake pictures with numbered checkpoints, from front, ¾ or side.
  17 of the 25 exercises have pictures so far (all 15 in the default plans).
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
Covers the rotation, strength estimates, weight suggestions, weekly stats, personal bests and backup import.

## Code map
| File | What's in it |
|---|---|
| `js/app.js` | Screens, navigation and button handling |
| `js/exercises.js` | Exercise library, form cues, mistakes, picture poses and default plans |
| `js/figure.js` | Draws the 3D mannequin and benches as SVG from a pose |
| `js/logic.js` | Rotation, estimated 1RM, suggestions and stats (no UI) |
| `js/store.js` | Saving to the phone, backup export / import |
| `js/charts.js` | Line and bar charts |
| `sw.js`, `manifest.webmanifest` | Offline support and home-screen install |
| `design/` | The earlier concept mockups |
