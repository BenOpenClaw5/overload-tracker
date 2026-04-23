"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { bestSetBefore, epley1RM, fmt1RM, gradeSet, lastSessionTopSet } from "@/lib/pr";
import type { Exercise, LoggedSet, Session } from "@/lib/types";
import { useTimer } from "./TimerProvider";

interface Draft {
  weightStr: string;
  repsStr: string;
  logged: boolean;
  ts?: number;
}

function blankDraft(): Draft {
  return { weightStr: "", repsStr: "", logged: false };
}

function parseNum(v: string): number {
  if (!v) return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return n;
}

export function ExerciseBlock({
  exercise,
  sessions,
  currentSessionId,
  initialSets,
  onSetsChange,
}: {
  exercise: Exercise;
  sessions: Session[];
  currentSessionId: string;
  initialSets: LoggedSet[] | undefined;
  onSetsChange: (exerciseId: string, sets: LoggedSet[]) => void;
}) {
  const { start } = useTimer();

  const [drafts, setDrafts] = useState<Draft[]>(() => {
    const base: Draft[] = [];
    const count = Math.max(exercise.sets, initialSets?.length ?? 0);
    for (let i = 0; i < count; i++) {
      const existing = initialSets?.[i];
      if (existing) {
        base.push({
          weightStr: String(existing.weight),
          repsStr: String(existing.reps),
          logged: true,
          ts: existing.ts,
        });
      } else {
        base.push(blankDraft());
      }
    }
    return base;
  });

  const lastTop = useMemo(
    () => lastSessionTopSet(sessions, exercise.id, currentSessionId),
    [sessions, exercise.id, currentSessionId],
  );
  const bestEver = useMemo(
    () => bestSetBefore(sessions, exercise.id, currentSessionId),
    [sessions, exercise.id, currentSessionId],
  );

  useEffect(() => {
    const logged: LoggedSet[] = [];
    for (const d of drafts) {
      if (d.logged) {
        logged.push({
          weight: parseNum(d.weightStr),
          reps: parseNum(d.repsStr),
          ts: d.ts ?? Date.now(),
        });
      }
    }
    onSetsChange(exercise.id, logged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

  const update = (i: number, patch: Partial<Draft>) =>
    setDrafts((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], ...patch };
      return next;
    });

  const logSet = (i: number) => {
    const d = drafts[i];
    const w = parseNum(d.weightStr);
    const r = parseNum(d.repsStr);
    if (!w || !r) return;
    // eslint-disable-next-line react-hooks/purity -- event handler, not render
    update(i, { logged: true, ts: Date.now() });
    start(undefined, `${exercise.name} · SET ${i + 1} DONE`);
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(25);
      } catch {
        // no-op
      }
    }
  };

  const unlogSet = (i: number) => update(i, { logged: false });

  const addSet = () => setDrafts((prev) => [...prev, blankDraft()]);
  const removeSet = (i: number) =>
    setDrafts((prev) => prev.filter((_, idx) => idx !== i));

  const completedCount = drafts.filter((d) => d.logged).length;
  const progress = Math.min(1, completedCount / exercise.sets);

  return (
    <section className="border-b border-[var(--border)]">
      <header className="px-3 pt-5 pb-3 grid grid-cols-[auto_1fr_auto] gap-3 items-baseline">
        <div className="mono-micro text-[var(--muted)] tabular-nums">
          {String(exercise.sets).padStart(2, "0")}×{exercise.repRangeLow}-
          {exercise.repRangeHigh}
        </div>
        <h3
          className="font-black uppercase leading-[0.95] text-[var(--fg)] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.25rem, 5.5vw, 1.9rem)" }}
        >
          {exercise.priority ? (
            <span className="inline-flex items-center gap-1 mr-2 align-middle text-[var(--accent)]">
              <Flame size={16} strokeWidth={3} />
            </span>
          ) : null}
          {exercise.name}
        </h3>
        <div className="mono-micro tabular-nums">
          {completedCount}/{drafts.length}
        </div>
      </header>

      <div className="px-3 pb-2 grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="h-0.5 bg-[var(--panel)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mono-micro">
          {completedCount > 0 ? (
            <span className="text-[var(--info)]">{completedCount} LOGGED</span>
          ) : (
            <span>READY</span>
          )}
        </div>
      </div>

      {lastTop ? (
        <div className="mx-3 my-2 grid grid-cols-[1fr_auto] gap-3 border border-[var(--border)] bg-[var(--panel)]">
          <div className="p-3 border-r border-[var(--border)]">
            <div className="mono-micro">&gt;&gt; BEAT THIS</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="font-black text-[var(--fg)] tabular-nums"
                style={{ fontSize: "clamp(1.4rem, 6vw, 2rem)", letterSpacing: "-0.02em" }}
              >
                {lastTop.set.weight}
                <span className="text-[var(--muted)] mx-1">×</span>
                {lastTop.set.reps}
              </span>
              <span className="mono-micro text-[var(--info)] tabular-nums">
                e{fmt1RM(epley1RM(lastTop.set.weight, lastTop.set.reps))}
              </span>
            </div>
            <div className="mono-micro mt-0.5">LAST · {lastTop.date.replaceAll("-", ".")}</div>
          </div>
          <div className="p-3 flex flex-col justify-center items-end">
            <div className="mono-micro text-[var(--accent)]">TARGET</div>
            <div className="mono-tag text-[var(--accent)] text-right leading-tight mt-1">
              +1 REP
              <br />
              OR +{Math.max(2.5, Math.round(lastTop.set.weight * 0.025 * 2) / 2)} LB
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-3 my-2 px-3 py-3 border border-[var(--border)] bg-[var(--panel)]">
          <div className="mono-micro text-[var(--info)]">&gt;&gt; FIRST LOG</div>
          <div className="mono-micro mt-1 text-[var(--fg-dim)]">
            PICK A WEIGHT THAT HITS FAILURE NEAR THE TOP OF YOUR REP RANGE. EVERY SET
            AFTER THIS IS PROGRESSIVE OVERLOAD.
          </div>
        </div>
      )}

      <ul className="px-0">
        {drafts.map((d, i) => (
          <SetRow
            key={i}
            index={i}
            draft={d}
            bestBefore={bestEver}
            onChange={(patch) => update(i, patch)}
            onLog={() => logSet(i)}
            onUnlog={() => unlogSet(i)}
            onRemove={drafts.length > exercise.sets ? () => removeSet(i) : undefined}
          />
        ))}
      </ul>

      <div className="px-3 py-3 flex justify-end">
        <button
          type="button"
          onClick={addSet}
          className="btn btn-ghost"
          aria-label="Add set"
        >
          <Plus size={14} strokeWidth={3} /> ADD SET
        </button>
      </div>
    </section>
  );
}

function SetRow({
  index,
  draft,
  bestBefore,
  onChange,
  onLog,
  onUnlog,
  onRemove,
}: {
  index: number;
  draft: Draft;
  bestBefore: LoggedSet | null;
  onChange: (patch: Partial<Draft>) => void;
  onLog: () => void;
  onUnlog: () => void;
  onRemove?: () => void;
}) {
  const w = parseNum(draft.weightStr);
  const r = parseNum(draft.repsStr);
  const grade = w && r ? gradeSet({ weight: w, reps: r }, bestBefore) : null;
  const [flash, setFlash] = useState(false);
  const lastGrade = useRef<string | null>(null);

  useEffect(() => {
    if (!draft.logged) {
      lastGrade.current = null;
      return;
    }
    if (grade?.isPR && lastGrade.current !== "pr") {
      setFlash(true);
      lastGrade.current = "pr";
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
    if (!grade?.isPR) lastGrade.current = "ok";
  }, [draft.logged, grade?.isPR]);

  return (
    <li
      className={
        "rowline grid grid-cols-[40px_1fr_1fr_auto_auto] items-center gap-2 px-3 py-2 " +
        (flash ? "pr-flash" : "")
      }
    >
      <div className="mono-micro tabular-nums">S{String(index + 1).padStart(2, "0")}</div>

      <label className="relative block">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          placeholder="WEIGHT"
          value={draft.weightStr}
          onChange={(e) => onChange({ weightStr: e.target.value })}
          disabled={draft.logged}
          className="w-full"
          aria-label={`Set ${index + 1} weight`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 mono-micro pointer-events-none">
          LB
        </span>
      </label>

      <label className="relative block">
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder="REPS"
          value={draft.repsStr}
          onChange={(e) => onChange({ repsStr: e.target.value })}
          disabled={draft.logged}
          className="w-full"
          aria-label={`Set ${index + 1} reps`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 mono-micro pointer-events-none">
          ×
        </span>
      </label>

      <div className="mono-micro min-w-[74px] text-right">
        <AnimatePresence mode="wait">
          {grade ? (
            <motion.span
              key={grade.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={
                grade.isPR
                  ? "text-[var(--accent)] font-bold tracking-[0.12em]"
                  : grade.delta >= 0
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)]"
              }
            >
              {grade.label}
            </motion.span>
          ) : (
            <motion.span
              key="e1rm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[var(--muted)]"
            >
              e1RM —
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1">
        {draft.logged ? (
          <button
            type="button"
            onClick={onUnlog}
            className="btn btn-ghost !min-h-[44px] !px-3"
            aria-label="Unlog set"
          >
            EDIT
          </button>
        ) : (
          <button
            type="button"
            onClick={onLog}
            disabled={!w || !r}
            className={
              (w && r
                ? "btn btn-accent"
                : "btn !border-[var(--border)] !bg-[var(--panel)] !text-[var(--muted)]") +
              " !min-h-[44px] !px-3"
            }
            aria-label={`Log set ${index + 1}`}
          >
            <Check size={14} strokeWidth={3} /> DONE
          </button>
        )}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)]"
            aria-label="Remove set"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>
    </li>
  );
}
