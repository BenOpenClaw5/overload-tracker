# OVERLOAD

Progressive overload tracker. Personal PWA for a 6-day PPL split trained to failure. Built mobile-first for iPhone Safari.

> **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Framer Motion · lucide-react · localStorage only.

## Design direction

Tactical telemetry (dark) × Swiss industrial. Dark substrate, monospace data type, Archivo Black display type, single blood-orange accent (`#FF3300`) reserved for PRs, alerts, and the timer complete state. Scanlines and low-opacity SVG noise on the root. Zero rounded corners. Visible 1px grid dividers via the `gap: 1px` technique.

Installed from `https://github.com/Leonxlnx/taste-skill` → `industrial-brutalist-ui`.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm start          # serve build
npm run gen-icons  # regenerate PWA icons from scripts/gen-icons.mjs
```

## Features

- Home: 6 day cards, last-session date, weekly volume chart.
- Workout: all exercises pre-loaded with live **Epley e1RM** grading (`★ PR`, `+/- %`) as you type weight × reps.
- Rest timer: auto-starts **2:30** (configurable) when you tap `DONE` on a set. Sticky overlay, progress bar, audio beeps on the final 10s, haptics, and a Notification fired when the screen is locked.
- History: sessions grouped by date with day-type color bars + all-time PRs sorted by e1RM.
- Settings: configurable rest duration, sound/vibration/notification toggles, JSON export/import, nuke-all.
- PWA: manifest, service worker (cache-first app shell, network-first HTML with offline fallback), Apple touch icon, install hint on first visit.

## Sensible defaults (tweak in `src/lib/`)

- **Rest:** 150s (2:30). Change in Settings.
- **Weight unit:** assumed `LB`. Swap the label in [ExerciseBlock.tsx](src/components/ExerciseBlock.tsx) if training in kg.
- **Data model:** exercises, sessions, and settings live entirely in `localStorage`. Key prefix: `overload.*.v1`. Export everything from Settings → EXPORT.
- **Priority flag (chest):** derived from `priority: true` on exercise objects in [src/lib/exercises.ts](src/lib/exercises.ts) — edit there to reprioritize.
- **Notification permission:** requested on first timer start.
- **Icons:** regenerate with `node scripts/gen-icons.mjs`.

## PWA install

iOS: open in Safari → Share → Add to Home Screen.
Android/desktop: use the browser's "Install app" option.

## Deploy

Vercel — zero-config. `vercel` CLI from project root.
