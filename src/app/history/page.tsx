"use client";

import { TopBar } from "@/components/TopBar";
import { WORKOUT_DAYS, getDayById } from "@/lib/exercises";
import { useSessions } from "@/lib/useSettings";
import { bestSetEver, epley1RM, fmt1RM } from "@/lib/pr";
import { formatDateShort } from "@/lib/dates";
import {
  buildCalendar,
  buildProgressions,
  computeStreak,
  isoDate,
  sessionsInMonth,
  totalSetsInSession,
  totalVolumeInSession,
} from "@/lib/stats";
import { DAY_COLORS, DAY_LABELS } from "@/lib/dayColors";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/types";
import { Sparkline } from "@/components/Sparkline";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, TrendingUp } from "lucide-react";

type Tab = "calendar" | "sessions" | "progression" | "prs";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "calendar", label: "CALENDAR" },
  { id: "sessions", label: "SESSIONS" },
  { id: "progression", label: "PROGRESSION" },
  { id: "prs", label: "PRS" },
];

export default function HistoryPage() {
  const sessions = useSessions();
  const [tab, setTab] = useState<Tab>("calendar");

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-40">
        <section className="px-3 pt-5 pb-3 border-b border-[var(--border)]">
          <div className="mono-micro">[ ARCHIVE / TELEMETRY LOG ]</div>
          <h1 className="display-big mt-2">HISTORY</h1>
        </section>

        <div className="grid grid-cols-4 bg-[var(--border)] gap-[1px] sticky top-[54px] z-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "py-3 font-mono text-[10.5px] tracking-[0.18em] uppercase " +
                (tab === t.id
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "bg-[var(--bg)] text-[var(--fg-dim)]")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "calendar" && <CalendarTab sessions={sessions} />}
        {tab === "sessions" && <SessionsTab sessions={sessions} />}
        {tab === "progression" && <ProgressionTab sessions={sessions} />}
        {tab === "prs" && <PRsTab sessions={sessions} />}
      </main>
    </>
  );
}

function CalendarTab({ sessions }: { sessions: Session[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedIso, setSelectedIso] = useState<string>(isoDate(today));

  const { cells } = useMemo(
    () => buildCalendar(cursor.year, cursor.month, sessions),
    [cursor, sessions],
  );

  const monthSessions = useMemo(
    () => sessionsInMonth(sessions, cursor.year, cursor.month),
    [sessions, cursor],
  );

  const monthSets = monthSessions.reduce((a, s) => a + totalSetsInSession(s), 0);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const uniqueDays = new Set(monthSessions.map((s) => s.date)).size;

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleString("en-US", {
    month: "long",
  });

  const selected = cells.find((c) => c.iso === selectedIso);
  const selectedSessions = selected?.sessions ?? [];

  const goto = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <div>
      <section className="px-3 pt-4">
        <div className="grid grid-cols-3 gap-[1px] bg-[var(--border)] brutal-border">
          <StatBox
            label="STREAK"
            value={`${streak}D`}
            accent={streak > 0 ? "var(--accent)" : "var(--muted)"}
            icon={<Flame size={14} strokeWidth={2.5} />}
          />
          <StatBox label="DAYS / MONTH" value={String(uniqueDays)} accent="var(--info)" />
          <StatBox label="SETS / MONTH" value={String(monthSets)} accent="var(--fg)" />
        </div>
      </section>

      <section className="px-3 pt-5">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => goto(-1)}
            className="p-2 border border-[var(--border)] text-[var(--fg-dim)]"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <div className="mono-tag text-[var(--fg)]">
            {monthLabel.toUpperCase()} · {cursor.year}
          </div>
          <button
            type="button"
            onClick={() => goto(1)}
            className="p-2 border border-[var(--border)] text-[var(--fg-dim)]"
            aria-label="Next month"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-[1px] bg-[var(--border)] brutal-border">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="bg-[var(--bg)] text-center mono-micro py-2 text-[var(--muted)]"
            >
              {d}
            </div>
          ))}
          {cells.map((c) => (
            <button
              key={c.iso}
              type="button"
              onClick={() => setSelectedIso(c.iso)}
              className={
                "bg-[var(--bg)] aspect-square relative flex flex-col items-center justify-center focus:z-10 " +
                (!c.inMonth ? "opacity-35 " : "") +
                (c.iso === selectedIso ? "outline outline-2 outline-[var(--accent)] z-10 " : "") +
                (c.isToday && c.iso !== selectedIso
                  ? "outline outline-1 outline-[var(--info)] z-[5] "
                  : "")
              }
              aria-label={c.iso}
            >
              <span
                className={
                  "font-mono text-[13px] tabular-nums " +
                  (c.isToday ? "text-[var(--info)] font-bold" : "text-[var(--fg-dim)]")
                }
              >
                {c.day}
              </span>
              {c.dayTypes.length ? (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-[2px]">
                  {c.dayTypes.slice(0, 3).map((dt) => (
                    <span
                      key={dt}
                      className="inline-block w-1.5 h-1.5"
                      style={{ background: DAY_COLORS[dt] }}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {WORKOUT_DAYS.map((d) => (
            <div key={d.id} className="flex items-center gap-1.5 mono-micro">
              <span
                className="inline-block w-2 h-2"
                style={{ background: DAY_COLORS[d.id] }}
              />
              <span className="truncate">{DAY_LABELS[d.id]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-3 pt-6 pb-2">
        <div className="mono-tag mb-2">
          &gt;&gt; {selected ? formatDateShort(selected.iso) : "—"}
        </div>
        {selectedSessions.length ? (
          selectedSessions.map((s) => <SessionCard key={s.id} session={s} />)
        ) : (
          <div className="brutal-border bg-[var(--panel)] p-4 mono-micro">
            NO SESSION ON THIS DAY.
          </div>
        )}
      </section>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg)] p-3">
      <div className="flex items-center gap-1.5 mono-micro">
        {icon ? <span style={{ color: accent }}>{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div
        className="mt-1 font-mono font-black tabular-nums"
        style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", color: accent, letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
    </div>
  );
}

function SessionCard({ session: s }: { session: Session }) {
  const day = getDayById(s.dayId);
  const setCount = totalSetsInSession(s);
  const volume = totalVolumeInSession(s);
  const color = DAY_COLORS[s.dayId] ?? "var(--fg)";
  return (
    <div className="mb-3 grid grid-cols-[8px_1fr] border border-[var(--border)] bg-[var(--panel)]">
      <div style={{ background: color }} />
      <div className="py-3 pr-3">
        <div className="flex items-baseline justify-between">
          <div
            className="font-black uppercase tracking-[-0.02em] text-[var(--fg)]"
            style={{ fontSize: "clamp(1.05rem, 5vw, 1.4rem)" }}
          >
            {day?.title ?? s.dayId}
          </div>
          <div className="mono-micro tabular-nums">{setCount} SETS</div>
        </div>
        <div className="mt-1 mono-micro flex items-center gap-3">
          <span>{day?.focus ?? ""}</span>
          {volume ? (
            <span className="text-[var(--info)]">
              VOL {Math.round(volume).toLocaleString()} LB
            </span>
          ) : null}
        </div>
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
        NO SESSIONS LOGGED.{" "}
        <Link href="/" className="text-[var(--accent)] underline">
          START ONE.
        </Link>
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([date, list]) => (
        <section key={date} className="border-b border-[var(--border)]">
          <div className="px-3 pt-4 pb-2 mono-micro">
            {"//"} {formatDateShort(date)}
          </div>
          <div className="px-3 pb-4">
            {list.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProgressionTab({ sessions }: { sessions: Session[] }) {
  const progressions = useMemo(() => buildProgressions(sessions), [sessions]);

  if (!progressions.length) {
    return (
      <div className="px-3 py-16 text-center mono-micro">
        LOG AT LEAST ONE SET TO SEE PROGRESSION.
      </div>
    );
  }

  const trending = progressions.filter((p) => p.points.length > 1);
  const onePoint = progressions.filter((p) => p.points.length === 1);

  return (
    <div>
      <div className="px-3 pt-4 pb-2 mono-micro">
        &gt;&gt; E1RM TRAJECTORY · SORTED BY % GAIN
      </div>

      {trending.length ? (
        <ul className="grid-rule grid-cols-1">
          {trending.map((p) => (
            <ProgressionRow key={p.exerciseId} p={p} />
          ))}
        </ul>
      ) : null}

      {onePoint.length ? (
        <>
          <div className="px-3 pt-6 pb-2 mono-micro">
            &gt;&gt; AWAITING SECOND LOG
          </div>
          <ul className="grid-rule grid-cols-1 border-t border-[var(--border)]">
            {onePoint.map((p) => (
              <li key={p.exerciseId} className="px-3 py-3 grid grid-cols-[1fr_auto] items-center">
                <div className="min-w-0">
                  <div className="mono-tag text-[var(--fg)] truncate">{p.name}</div>
                  <div className="mono-micro">{p.dayTitle} · 1 SESSION</div>
                </div>
                <div className="mono-micro tabular-nums text-right text-[var(--fg-dim)]">
                  {p.points[0].weight}×{p.points[0].reps} · e{fmt1RM(p.latest)}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function ProgressionRow({ p }: { p: import("@/lib/stats").ExerciseProgression }) {
  const values = p.points.map((pt) => pt.e1rm);
  const up = p.deltaPct > 0;
  const flat = Math.abs(p.deltaPct) < 0.5;
  return (
    <li className="px-3 py-3">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
        <div className="min-w-0">
          <div className="mono-tag text-[var(--fg)] truncate">{p.name}</div>
          <div className="mono-micro flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5"
              style={{ background: DAY_COLORS[p.dayId] }}
            />
            {p.dayTitle} · {p.sessions}×
          </div>
        </div>
        <Sparkline
          values={values}
          width={90}
          height={30}
          stroke={up ? "var(--accent)" : flat ? "var(--fg-dim)" : "var(--info)"}
          fill={
            up
              ? "color-mix(in srgb, var(--accent) 20%, transparent)"
              : "color-mix(in srgb, var(--info) 18%, transparent)"
          }
          pointStroke={up ? "var(--accent)" : "var(--info)"}
        />
        <div className="text-right">
          <div
            className={
              "font-mono font-black tabular-nums " +
              (up
                ? "text-[var(--accent)]"
                : flat
                  ? "text-[var(--fg-dim)]"
                  : "text-[var(--info)]")
            }
            style={{ fontSize: "15px" }}
          >
            {up ? "+" : ""}
            {p.deltaPct.toFixed(1)}%
          </div>
          <div className="mono-micro tabular-nums">e{fmt1RM(p.latest)}</div>
        </div>
      </div>
    </li>
  );
}

function PRsTab({ sessions }: { sessions: Session[] }) {
  const rows = useMemo(() => {
    // Build from persisted sessions; allow custom exercises too
    const bestByEx = new Map<
      string,
      {
        name: string;
        dayId: string;
        dayTitle: string;
        weight: number;
        reps: number;
        est: number;
        ts: number;
      }
    >();
    const exToMeta = new Map<string, { name: string; dayId: string; dayTitle: string }>();
    for (const s of sessions) {
      const day = getDayById(s.dayId);
      for (const ex of day?.exercises ?? []) {
        exToMeta.set(ex.id, { name: ex.name, dayId: s.dayId, dayTitle: day?.title ?? s.dayId });
      }
      // custom exercises: use the id as a fallback name — we don't have name metadata persisted yet
      for (const exId of Object.keys(s.entries)) {
        if (!exToMeta.has(exId) && exId.startsWith("custom_")) {
          exToMeta.set(exId, { name: "CUSTOM LIFT", dayId: s.dayId, dayTitle: day?.title ?? s.dayId });
        }
      }
    }
    for (const exId of exToMeta.keys()) {
      const best = bestSetEver(sessions, exId);
      if (!best) continue;
      const m = exToMeta.get(exId)!;
      bestByEx.set(exId, {
        name: m.name,
        dayId: m.dayId,
        dayTitle: m.dayTitle,
        weight: best.weight,
        reps: best.reps,
        est: epley1RM(best.weight, best.reps),
        ts: best.ts,
      });
    }
    const out = Array.from(bestByEx.entries()).map(([exerciseId, v]) => ({ exerciseId, ...v }));
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
                    <span
                      className="inline-block w-1.5 h-4"
                      style={{ background: color }}
                    />
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </td>
                <td className="px-1 py-3 align-top">
                  <div className="font-bold uppercase text-[var(--fg)] text-[13px] leading-tight">
                    {r.name}
                  </div>
                  <div className="mono-micro mt-0.5">{r.dayTitle}</div>
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
      <div className="px-3 py-3 mono-micro flex items-center gap-2">
        <TrendingUp size={12} strokeWidth={2.5} className="text-[var(--accent)]" />
        {rows.length} LIFTS TRACKED
      </div>
    </div>
  );
}
