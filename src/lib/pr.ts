import type { LoggedSet, Session } from "./types";

export function epley1RM(weight: number, reps: number): number {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

export function fmt1RM(value: number): string {
  if (!value) return "—";
  return value.toFixed(1);
}

export function gradeSet(
  current: { weight: number; reps: number },
  bestBefore: { weight: number; reps: number } | null,
): { label: string; delta: number; isPR: boolean } | null {
  if (!current.weight || !current.reps) return null;
  const curr = epley1RM(current.weight, current.reps);
  if (!bestBefore) return { label: "FIRST LOG", delta: 0, isPR: true };
  const prev = epley1RM(bestBefore.weight, bestBefore.reps);
  if (!prev) return { label: "FIRST LOG", delta: 0, isPR: true };
  const delta = ((curr - prev) / prev) * 100;
  if (curr > prev) {
    return { label: "★ PR", delta, isPR: true };
  }
  const sign = delta >= 0 ? "+" : "";
  return { label: `${sign}${delta.toFixed(1)}%`, delta, isPR: false };
}

export function bestSetEver(sessions: Session[], exerciseId: string): LoggedSet | null {
  let best: LoggedSet | null = null;
  let bestE1 = 0;
  for (const s of sessions) {
    const sets = s.entries[exerciseId];
    if (!sets) continue;
    for (const set of sets) {
      const e1 = epley1RM(set.weight, set.reps);
      if (e1 > bestE1) {
        bestE1 = e1;
        best = set;
      }
    }
  }
  return best;
}

export function bestSetBefore(
  sessions: Session[],
  exerciseId: string,
  currentSessionId?: string,
): LoggedSet | null {
  let best: LoggedSet | null = null;
  let bestE1 = 0;
  for (const s of sessions) {
    if (s.id === currentSessionId) continue;
    const sets = s.entries[exerciseId];
    if (!sets) continue;
    for (const set of sets) {
      const e1 = epley1RM(set.weight, set.reps);
      if (e1 > bestE1) {
        bestE1 = e1;
        best = set;
      }
    }
  }
  return best;
}

export function lastSessionTopSet(
  sessions: Session[],
  exerciseId: string,
  excludeSessionId?: string,
): { set: LoggedSet; date: string } | null {
  const prev = sessions
    .filter((s) => s.id !== excludeSessionId && s.entries[exerciseId]?.length)
    .sort((a, b) => b.startedAt - a.startedAt);
  if (!prev.length) return null;
  const latest = prev[0];
  const sets = latest.entries[exerciseId];
  let top = sets[0];
  let topE1 = epley1RM(top.weight, top.reps);
  for (const set of sets) {
    const e1 = epley1RM(set.weight, set.reps);
    if (e1 > topE1) {
      top = set;
      topE1 = e1;
    }
  }
  return { set: top, date: latest.date };
}
