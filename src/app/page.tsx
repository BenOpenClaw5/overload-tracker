"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { LogoMark } from "@/components/Logo";
import { TOTAL_WEEKLY_SETS, WEEKLY_VOLUME, WORKOUT_DAYS } from "@/lib/exercises";
import { useCustomizations, useSessions } from "@/lib/useSettings";
import { formatDateShort, formatRelative } from "@/lib/dates";
import { ChevronRight, Flame, Pencil, TrendingUp } from "lucide-react";
import {
  buildProgressions,
  computeStreak,
  sessionsInWeek,
  totalSetsInSession,
  totalVolumeInSession,
} from "@/lib/stats";
import { DAY_COLORS } from "@/lib/dayColors";
import type { DayCode } from "@/lib/types";
import { useMemo } from "react";

export default function HomePage() {
  const sessions = useSessions();
  const customizations = useCustomizations();

  const lastByDay = new Map<string, (typeof sessions)[number]>();
  for (const s of sessions) {
    const existing = lastByDay.get(s.dayId);
    if (!existing || s.startedAt > existing.startedAt) lastByDay.set(s.dayId, s);
  }

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const thisWeek = useMemo(() => sessionsInWeek(sessions), [sessions]);
  const weekSets = thisWeek.reduce((a, s) => a + totalSetsInSession(s), 0);
  const weekVolume = thisWeek.reduce((a, s) => a + totalVolumeInSession(s), 0);

  const topTrending = useMemo(() => {
    return buildProgressions(sessions)
      .filter((p) => p.points.length > 1 && p.deltaPct > 0)
      .slice(0, 3);
  }, [sessions]);

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-40">
        {/* Hero */}
        <section className="px-3 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mono-micro">
            <span>[ ROUTINE / PPL-6 · FAILURE PROTOCOL ]</span>
            <span className="text-[var(--info)]">REV 2.0</span>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-3">
            <h1 className="display-massive leading-[0.85]">
              OVER
              <br />
              LOAD
            </h1>
            <div className="flex flex-col items-end gap-2">
              <LogoMark size={64} />
              <div className="mono-micro text-right leading-relaxed">
                REST
                <br />
                <span className="text-[var(--fg)] text-[14px] font-bold">02:30</span>
                <br />
                EVERY SET
              </div>
            </div>
          </div>
          <div className="mt-3 h-1 w-16 bg-[var(--accent)]" />
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 mono-micro">
            <span>{sessions.length.toString().padStart(4, "0")} SESSIONS</span>
            <span className="inline-block w-3 h-[1px] bg-[var(--info)]" />
            <span className="text-right">{TOTAL_WEEKLY_SETS} SETS / WK</span>
          </div>
        </section>

        {/* This week */}
        <section className="px-3 pt-5">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="mono-tag text-[var(--fg)]">&gt;&gt; THIS WEEK</h2>
            <span className="mono-micro">{thisWeek.length}/6 DAYS</span>
          </div>
          <div className="grid grid-cols-3 gap-[1px] bg-[var(--border)] brutal-border">
            <HomeStat
              label="STREAK"
              value={streak.toString()}
              sub="DAYS"
              color={streak > 0 ? "var(--accent)" : "var(--muted)"}
              icon={<Flame size={12} strokeWidth={2.5} />}
            />
            <HomeStat
              label="SETS"
              value={weekSets.toString()}
              sub="LOGGED"
              color="var(--info)"
            />
            <HomeStat
              label="VOLUME"
              value={weekVolume > 9999 ? `${Math.round(weekVolume / 1000)}k` : weekVolume.toString()}
              sub="LB"
              color="var(--fg)"
            />
          </div>
        </section>

        {/* Recent progress */}
        {topTrending.length ? (
          <section className="px-3 pt-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="mono-tag text-[var(--fg)]">
                &gt;&gt; PROGRESSION{" "}
                <TrendingUp
                  size={12}
                  strokeWidth={3}
                  className="inline text-[var(--accent)]"
                />
              </h2>
              <Link href="/history" className="mono-micro text-[var(--info)] underline">
                VIEW ALL
              </Link>
            </div>
            <div className="grid-rule grid-cols-1 brutal-border">
              {topTrending.map((p) => (
                <Link
                  key={p.exerciseId}
                  href="/history"
                  className="px-3 py-3 flex items-center justify-between bg-[var(--bg)] hover:bg-[var(--panel)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-1.5 h-5"
                      style={{ background: DAY_COLORS[p.dayId] }}
                    />
                    <div className="min-w-0">
                      <div className="mono-tag text-[var(--fg)] truncate">{p.name}</div>
                      <div className="mono-micro">{p.dayTitle} · {p.sessions}×</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black tabular-nums text-[var(--accent)] text-[16px]">
                      +{p.deltaPct.toFixed(1)}%
                    </div>
                    <div className="mono-micro tabular-nums">e{p.latest.toFixed(1)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Day cards */}
        <section className="px-3 pt-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="mono-tag text-[var(--fg)]">&gt;&gt; SELECT DAY</h2>
            <span className="mono-micro">6 DAY SPLIT</span>
          </div>
          <div className="grid-rule grid-cols-1 brutal-border">
            {WORKOUT_DAYS.map((day) => {
              const last = lastByDay.get(day.id);
              const custom = customizations[day.id as DayCode];
              const liftCount = custom?.exercises?.length ?? day.exercises.length;
              return (
                <motion.div
                  key={day.id}
                  whileTap={{ scale: 0.995 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: day.index * 0.03 }}
                >
                  <Link href={`/workout/${day.id}`} className="block group relative">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4">
                      <div className="flex flex-col items-start gap-1 w-12">
                        <span className="mono-micro text-[var(--muted)]">{day.code}</span>
                        <span
                          className="inline-block w-5 h-1"
                          style={{ background: DAY_COLORS[day.id] }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="display-big leading-none truncate"
                          style={{ fontSize: "clamp(1.8rem, 7.6vw, 3.2rem)" }}
                        >
                          {day.title}
                        </div>
                        <div className="mt-2 flex items-center gap-3 mono-micro flex-wrap">
                          <span>{liftCount} LIFTS</span>
                          <span className="text-[var(--muted)]">·</span>
                          <span className="text-[var(--fg-dim)]">{day.focus}</span>
                          {custom ? (
                            <span className="inline-flex items-center gap-1 text-[var(--info)]">
                              <Pencil size={10} strokeWidth={2.5} />
                              CUSTOM
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 mono-micro text-[var(--muted)]">
                          {last
                            ? `LAST: ${formatDateShort(last.date)} · ${formatRelative(
                                last.startedAt,
                              ).toUpperCase()}`
                            : "LAST: —"}
                        </div>
                      </div>
                      <ChevronRight
                        className="text-[var(--muted)] group-hover:text-[var(--accent)]"
                        size={24}
                        strokeWidth={2.5}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Weekly volume */}
        <section className="px-3 pt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="mono-tag text-[var(--fg)]">&gt;&gt; WEEKLY VOLUME</h2>
            <span className="mono-micro">SETS / WEEK · TARGET</span>
          </div>
          <div className="brutal-border">
            <dl className="grid grid-cols-2 grid-rule">
              {WEEKLY_VOLUME.map((v) => {
                const pct = Math.min(1, v.sets / 14);
                return (
                  <div key={v.muscle} className="p-3">
                    <div className="flex items-baseline justify-between">
                      <dt className="mono-tag">{v.muscle}</dt>
                      <dd className="font-mono font-black text-[var(--fg)] text-[22px] tabular-nums">
                        {v.sets}
                      </dd>
                    </div>
                    <div className="mt-2 h-1 w-full bg-[var(--panel)] relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-[var(--info)]"
                        style={{ width: `${pct * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                        style={{ width: `${pct * 40}%`, opacity: 0.9 }}
                      />
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
          <div className="mt-3 flex items-center justify-between mono-micro">
            <span>TOTAL</span>
            <span className="text-[var(--fg)] font-bold tabular-nums">
              {TOTAL_WEEKLY_SETS} SETS
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

function HomeStat({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg)] p-3">
      <div className="flex items-center gap-1.5 mono-micro">
        {icon ? <span style={{ color }}>{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div
        className="mt-1 font-mono font-black tabular-nums leading-none"
        style={{
          fontSize: "clamp(1.6rem, 7.5vw, 2.6rem)",
          color,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div className="mono-micro mt-1">{sub}</div>
    </div>
  );
}
