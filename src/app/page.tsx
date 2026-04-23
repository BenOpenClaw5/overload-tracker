"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { TOTAL_WEEKLY_SETS, WEEKLY_VOLUME, WORKOUT_DAYS } from "@/lib/exercises";
import { useSessions } from "@/lib/useSettings";
import { formatDateShort, formatRelative } from "@/lib/dates";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
  const sessions = useSessions();

  const lastByDay = new Map<string, (typeof sessions)[number]>();
  for (const s of sessions) {
    const existing = lastByDay.get(s.dayId);
    if (!existing || s.startedAt > existing.startedAt) lastByDay.set(s.dayId, s);
  }

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-40">
        <section className="px-3 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="mono-micro">[ ROUTINE / PPL-6 · FAILURE PROTOCOL ]</div>
          <div className="mt-2 flex items-end gap-3">
            <h1 className="display-massive flex-1">
              OVER<span className="text-[var(--accent)]">/</span>
              <br />
              LOAD
            </h1>
            <div className="mono-micro text-right leading-relaxed">
              REST
              <br />
              <span className="text-[var(--fg)] text-[14px] font-bold">02:30</span>
              <br />
              EVERY SET
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 mono-micro">
            <span>{sessions.length.toString().padStart(4, "0")} SESSIONS LOGGED</span>
            <span className="brutal-hr block" />
            <span>TOTAL SETS / WK {TOTAL_WEEKLY_SETS}</span>
          </div>
        </section>

        <section className="px-3 pt-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="mono-tag text-[var(--fg)]">&gt;&gt; SELECT DAY</h2>
            <span className="mono-micro">6 DAY SPLIT</span>
          </div>
          <div className="grid-rule grid-cols-1">
            {WORKOUT_DAYS.map((day) => {
              const last = lastByDay.get(day.id);
              return (
                <motion.div
                  key={day.id}
                  whileTap={{ scale: 0.995 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: day.index * 0.03 }}
                >
                  <Link href={`/workout/${day.id}`} className="block group relative">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-5">
                      <div className="mono-micro text-[var(--muted)] w-12">
                        {day.code}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="display-big leading-none truncate"
                          style={{ fontSize: "clamp(2rem, 8.2vw, 3.4rem)" }}
                        >
                          {day.title}
                        </div>
                        <div className="mt-2 flex items-center gap-3 mono-micro">
                          <span>{day.exercises.length} LIFTS</span>
                          <span className="text-[var(--muted)]">·</span>
                          <span>{day.focus}</span>
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

        <section className="px-3 pt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="mono-tag text-[var(--fg)]">&gt;&gt; WEEKLY VOLUME</h2>
            <span className="mono-micro">SETS / WEEK</span>
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
                        className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                        style={{ width: `${pct * 100}%` }}
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
