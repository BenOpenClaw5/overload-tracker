import type { Session } from "./types";
import { allExercises } from "./exercises";
import { epley1RM } from "./pr";

export interface ExerciseProgression {
  exerciseId: string;
  name: string;
  dayId: string;
  dayTitle: string;
  points: Array<{ date: string; e1rm: number; weight: number; reps: number; ts: number }>;
  first: number;
  best: number;
  latest: number;
  deltaPct: number;
  sessions: number;
}

export function buildProgressions(sessions: Session[]): ExerciseProgression[] {
  const meta = new Map(
    allExercises().map(({ exercise, day }) => [
      exercise.id,
      { name: exercise.name, dayId: day.id, dayTitle: day.title },
    ]),
  );

  const byEx = new Map<string, ExerciseProgression>();
  const sorted = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
  for (const s of sorted) {
    for (const [exId, sets] of Object.entries(s.entries)) {
      if (!sets?.length) continue;
      let best = sets[0];
      let bestE = epley1RM(best.weight, best.reps);
      for (const set of sets) {
        const e = epley1RM(set.weight, set.reps);
        if (e > bestE) {
          best = set;
          bestE = e;
        }
      }
      const m = meta.get(exId) ?? { name: exId, dayId: s.dayId, dayTitle: s.dayId };
      let entry = byEx.get(exId);
      if (!entry) {
        entry = {
          exerciseId: exId,
          name: m.name,
          dayId: m.dayId,
          dayTitle: m.dayTitle,
          points: [],
          first: bestE,
          best: bestE,
          latest: bestE,
          deltaPct: 0,
          sessions: 0,
        };
        byEx.set(exId, entry);
      }
      entry.points.push({
        date: s.date,
        e1rm: bestE,
        weight: best.weight,
        reps: best.reps,
        ts: s.startedAt,
      });
      entry.latest = bestE;
      entry.best = Math.max(entry.best, bestE);
      entry.sessions += 1;
    }
  }

  const out = Array.from(byEx.values());
  for (const p of out) {
    p.first = p.points[0]?.e1rm ?? 0;
    p.deltaPct = p.first > 0 ? ((p.latest - p.first) / p.first) * 100 : 0;
  }
  out.sort((a, b) => b.deltaPct - a.deltaPct);
  return out;
}

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  dayTypes: string[];
  sessions: Session[];
}

export function buildCalendar(year: number, month: number, sessions: Session[]): {
  cells: CalendarCell[];
  start: Date;
  end: Date;
} {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  // Start on Sunday
  start.setDate(first.getDate() - first.getDay());
  const cells: CalendarCell[] = [];
  const todayIso = isoDate(new Date());
  const sessionsByDate = new Map<string, Session[]>();
  for (const s of sessions) {
    const arr = sessionsByDate.get(s.date) ?? [];
    arr.push(s);
    sessionsByDate.set(s.date, arr);
  }
  const cursor = new Date(start);
  for (let i = 0; i < 42; i++) {
    const iso = isoDate(cursor);
    const arr = sessionsByDate.get(iso) ?? [];
    cells.push({
      iso,
      day: cursor.getDate(),
      inMonth: cursor.getMonth() === month,
      isToday: iso === todayIso,
      dayTypes: Array.from(new Set(arr.map((s) => s.dayId))),
      sessions: arr,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const end = new Date(cursor);
  return { cells, start, end };
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function computeStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const dates = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const d = new Date();
  // walk backwards until gap > 1 day (allowing today's gap if not logged yet)
  const todayIncluded = dates.has(isoDate(d));
  if (!todayIncluded) {
    d.setDate(d.getDate() - 1);
  }
  while (dates.has(isoDate(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function sessionsInWeek(sessions: Session[], ref: Date = new Date()): Session[] {
  // Week: Mon-Sun, ISO-ish.
  const r = new Date(ref);
  const day = r.getDay(); // 0 Sun - 6 Sat
  const offsetToMon = (day + 6) % 7;
  const mon = new Date(r);
  mon.setDate(r.getDate() - offsetToMon);
  mon.setHours(0, 0, 0, 0);
  const nextMon = new Date(mon);
  nextMon.setDate(mon.getDate() + 7);
  return sessions.filter((s) => {
    const t = new Date(s.startedAt);
    return t >= mon && t < nextMon;
  });
}

export function sessionsInMonth(
  sessions: Session[],
  year: number,
  month: number,
): Session[] {
  return sessions.filter((s) => {
    const d = new Date(s.startedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function totalSetsInSession(s: Session): number {
  return Object.values(s.entries).reduce((sum, list) => sum + list.length, 0);
}

export function totalVolumeInSession(s: Session): number {
  let v = 0;
  for (const list of Object.values(s.entries)) {
    for (const set of list) v += set.weight * set.reps;
  }
  return v;
}

export function prsSinceDaysAgo(sessions: Session[], days: number): ExerciseProgression[] {
  const cutoff = Date.now() - days * 86400_000;
  return buildProgressions(sessions).filter((p) => {
    const last = p.points[p.points.length - 1];
    return last && last.ts >= cutoff && p.latest >= p.best && p.points.length > 1;
  });
}
