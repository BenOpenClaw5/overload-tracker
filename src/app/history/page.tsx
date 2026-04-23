"use client";

import { TopBar } from "@/components/TopBar";
import { WORKOUT_DAYS, allExercises, getDayById } from "@/lib/exercises";
import { useSessions } from "@/lib/useSettings";
import { bestSetEver, epley1RM, fmt1RM } from "@/lib/pr";
import { formatDateShort } from "@/lib/dates";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/types";
import Link from "next/link";

type Tab = "sessions" | "prs";

const DAY_COLORS: Record<string, string> = {
  PUSH_A: "var(--accent)",
  PUSH_B: "var(--accent-soft)",
  PULL_A: "var(--fg)",
  PULL_B: "var(--fg-dim)",
  LEGS_A: "var(--term-green)",
  LEGS_B: "#A9F07F",
};

export default function HistoryPage() {
  const sessions = useSessions();
  const [tab, setTab] = useState<Tab>("sessions");

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-40">
        <section className="px-3 pt-5 pb-3 border-b border-[var(--border)]">
          <div className="mono-micro">[ ARCHIVE / TELEMETRY LOG ]</div>
          <h1 className="display-big mt-2">HISTORY</h1>
        </section>

        <div className="grid grid-cols-2 bg-[var(--border)] gap-[1px] sticky top-[54px] z-10">
          <button
            onClick={() => setTab("sessions")}
            className={
              "py-3 font-mono text-[12px] tracking-[0.22em] uppercase " +
              (tab === "sessions"
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "bg-[var(--bg)] text-[var(--fg-dim)]")
            }
          >
            &gt;&gt; SESSIONS
          </button>
          <button
            onClick={() => setTab("prs")}
            className={
              "py-3 font-mono text-[12px] tracking-[0.22em] uppercase " +
              (tab === "prs"
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "bg-[var(--bg)] text-[var(--fg-dim)]")
            }
          >
            &gt;&gt; ALL-TIME PRS
          </button>
        </div>

        {tab === "sessions" ? <SessionsTab sessions={sessions} /> : <PRsTab sessions={sessions} />}
      </main>
    </>
  );
}

function SessionsTab({ sessions }: { sessions: Session[] }) {
  const grouped = useMemo(() => {
    const byDate = new Map<string, Session[]>();
    const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
    for (const s of sorted) {
      const arr = byDate.get(s.date) ?? [];
      arr.push(s);
      byDate.set(s.date, arr);
    }
    return Array.from(byDate.entries());
  }, [sessions]);

  if (grouped.length === 0) {
    return (
      <div className="px-3 py-16 text-center mono-micro">
        NO SESSIONS LOGGED. <Link href="/" className="text-[var(--accent)] underline">START ONE.</Link>
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([date, list]) => (
        <section key={date} className="border-b border-[var(--border)]">
          <div className="px-3 pt-4 pb-2 mono-micro">{"//"} {formatDateShort(date)}</div>
          {list.map((s) => {
            const day = getDayById(s.dayId);
            const totalSets = Object.values(s.entries).reduce((a, l) => a + l.length, 0);
            const color = DAY_COLORS[s.dayId] ?? "var(--fg)";
            return (
              <div key={s.id} className="px-3 pb-4">
                <div
                  className="grid grid-cols-[8px_1fr] gap-3 border border-[var(--border)] bg-[var(--panel)]"
                >
                  <div style={{ background: color }} />
                  <div className="py-3 pr-3">
                    <div className="flex items-baseline justify-between">
                      <div className="font-black uppercase tracking-[-0.02em] text-[var(--fg)]" style={{ fontSize: "clamp(1.1rem, 5vw, 1.5rem)" }}>
                        {day?.title ?? s.dayId}
                      </div>
                      <div className="mono-micro">{totalSets} SETS</div>
                    </div>
                    <div className="mt-1 mono-micro">{day?.focus ?? ""}</div>
                    <ul className="mt-3 grid gap-1">
                      {day?.exercises.map((ex) => {
                        const sets = s.entries[ex.id];
                        if (!sets || !sets.length) return null;
                        const best = sets.reduce(
                          (b, c) => (epley1RM(c.weight, c.reps) > epley1RM(b.weight, b.reps) ? c : b),
                          sets[0],
                        );
                        return (
                          <li
                            key={ex.id}
                            className="grid grid-cols-[1fr_auto] gap-3 mono-tag py-1 border-t border-[var(--border)]"
                          >
                            <span className="truncate text-[var(--fg-dim)]">{ex.name}</span>
                            <span className="tabular-nums">
                              {sets.length}× · TOP {best.weight}×{best.reps}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function PRsTab({ sessions }: { sessions: Session[] }) {
  const rows = useMemo(() => {
    const all = allExercises();
    const out: Array<{
      exerciseId: string;
      name: string;
      day: string;
      dayId: string;
      weight: number;
      reps: number;
      est: number;
      ts: number;
    }> = [];
    for (const { exercise, day } of all) {
      const best = bestSetEver(sessions, exercise.id);
      if (!best) continue;
      out.push({
        exerciseId: exercise.id,
        name: exercise.name,
        day: day.title,
        dayId: day.id,
        weight: best.weight,
        reps: best.reps,
        est: epley1RM(best.weight, best.reps),
        ts: best.ts,
      });
    }
    out.sort((a, b) => b.est - a.est);
    return out;
  }, [sessions]);

  if (rows.length === 0) {
    return (
      <div className="px-3 py-16 text-center mono-micro">
        NO PRS YET. LOG A SET TO BEGIN.
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="mono-micro">
            <th className="text-left px-3 py-2 border-b border-[var(--border)]">RANK</th>
            <th className="text-left px-1 py-2 border-b border-[var(--border)]">LIFT</th>
            <th className="text-right px-1 py-2 border-b border-[var(--border)]">TOP SET</th>
            <th className="text-right px-3 py-2 border-b border-[var(--border)]">e1RM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const date = new Date(r.ts);
            const color = DAY_COLORS[r.dayId] ?? "var(--fg)";
            return (
              <tr key={r.exerciseId} className="border-b border-[var(--border)]">
                <td className="px-3 py-3 align-top mono-micro tabular-nums">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-4" style={{ background: color }} />
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </td>
                <td className="px-1 py-3 align-top">
                  <div className="font-bold uppercase text-[var(--fg)] text-[13px] leading-tight">
                    {r.name}
                  </div>
                  <div className="mono-micro mt-0.5">{r.day}</div>
                </td>
                <td className="px-1 py-3 align-top text-right font-mono tabular-nums text-[13px]">
                  {r.weight}×{r.reps}
                  <div className="mono-micro">
                    {date.toISOString().slice(0, 10).replace(/-/g, ".")}
                  </div>
                </td>
                <td className="px-3 py-3 align-top text-right font-black tabular-nums text-[var(--accent)] text-[18px]">
                  {fmt1RM(r.est)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-3 mono-micro">
        {rows.length} LIFTS TRACKED / {WORKOUT_DAYS.reduce((a, d) => a + d.exercises.length, 0)} TOTAL
      </div>
    </div>
  );
}
