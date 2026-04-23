"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { newCustomExerciseId, resetDayToDefault, setDayExercises } from "@/lib/customizations";
import type { DayCode, Exercise, MuscleTag } from "@/lib/types";

const MUSCLES: MuscleTag[] = [
  "chest",
  "shoulders",
  "triceps",
  "back",
  "biceps",
  "quads",
  "hamstrings",
  "glutes",
  "core",
];

export function EditWorkout({
  dayId,
  exercises,
  onClose,
}: {
  dayId: DayCode;
  exercises: Exercise[];
  onClose: () => void;
}) {
  const [list, setList] = useState<Exercise[]>(exercises);
  const [adding, setAdding] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };
  const remove = (i: number) => setList(list.filter((_, idx) => idx !== i));
  const togglePriority = (i: number) => {
    const next = list.slice();
    next[i] = { ...next[i], priority: !next[i].priority };
    setList(next);
  };

  const save = () => {
    setDayExercises(dayId, list);
    onClose();
  };

  const reset = () => {
    if (
      !window.confirm(
        "RESET THIS DAY TO DEFAULTS? CUSTOM EXERCISES ON THIS DAY WILL BE REMOVED.",
      )
    )
      return;
    resetDayToDefault(dayId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-[var(--bg-deep)]/95 overflow-auto safe-top"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="sticky top-0 bar-top z-10 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={onClose}
          className="p-2 border border-[var(--border)] text-[var(--fg-dim)]"
          aria-label="Close edit"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <div className="mono-micro text-center">[ EDIT / {dayId.replace("_", "-")} ]</div>
        <button
          type="button"
          onClick={save}
          className="btn btn-accent !min-h-[40px] !px-3"
        >
          SAVE
        </button>
      </div>

      <div className="px-3 pt-3 pb-1 mono-micro text-[var(--fg-dim)]">
        REORDER · EDIT · REMOVE · ADD NEW LIFTS. CHANGES SAVE PER-DAY.
      </div>

      <ul className="grid-rule grid-cols-1">
        {list.map((ex, i) => (
          <EditRow
            key={ex.id}
            exercise={ex}
            onChange={(patch) => {
              const next = list.slice();
              next[i] = { ...ex, ...patch };
              setList(next);
            }}
            onMoveUp={i > 0 ? () => move(i, -1) : undefined}
            onMoveDown={i < list.length - 1 ? () => move(i, 1) : undefined}
            onRemove={() => remove(i)}
            onTogglePriority={() => togglePriority(i)}
            index={i}
          />
        ))}
      </ul>

      {adding ? (
        <AddExerciseForm onCancel={() => setAdding(false)} onAdd={(ex) => {
          setList([...list, ex]);
          setAdding(false);
        }} />
      ) : (
        <div className="px-3 py-4">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn w-full !border-[var(--info)] !text-[var(--info)] hover:!bg-[var(--info)] hover:!text-white"
          >
            <Plus size={16} strokeWidth={3} /> ADD NEW EXERCISE
          </button>
        </div>
      )}

      <div className="px-3 pb-8">
        <button
          type="button"
          onClick={reset}
          className="btn btn-ghost w-full !text-[var(--accent)] !border-[var(--accent)] hover:!bg-[var(--accent)] hover:!text-black"
        >
          <RotateCcw size={14} strokeWidth={2.5} /> RESET DAY TO DEFAULTS
        </button>
      </div>
    </div>
  );
}

function EditRow({
  exercise,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  onTogglePriority,
  index,
}: {
  exercise: Exercise;
  onChange: (patch: Partial<Exercise>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  onTogglePriority: () => void;
  index: number;
}) {
  return (
    <li className="p-3">
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="p-2 border border-[var(--border)] disabled:opacity-30 text-[var(--fg-dim)]"
            aria-label="Move up"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="p-2 border border-[var(--border)] disabled:opacity-30 text-[var(--fg-dim)]"
            aria-label="Move down"
          >
            <ArrowDown size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 mono-micro">
            <span>LIFT {String(index + 1).padStart(2, "0")}</span>
            {exercise.priority ? (
              <span className="text-[var(--accent)]">★ PRIORITY</span>
            ) : null}
          </div>
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full mt-1"
            aria-label="Exercise name"
          />
          <div className="grid grid-cols-3 gap-2 mt-2">
            <label className="block">
              <span className="mono-micro">SETS</span>
              <input
                type="number"
                min={1}
                max={10}
                value={exercise.sets}
                onChange={(e) => onChange({ sets: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full"
                aria-label="Sets"
              />
            </label>
            <label className="block">
              <span className="mono-micro">REP LOW</span>
              <input
                type="number"
                min={1}
                max={30}
                value={exercise.repRangeLow}
                onChange={(e) => onChange({ repRangeLow: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full"
                aria-label="Rep range low"
              />
            </label>
            <label className="block">
              <span className="mono-micro">REP HIGH</span>
              <input
                type="number"
                min={1}
                max={30}
                value={exercise.repRangeHigh}
                onChange={(e) => onChange({ repRangeHigh: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full"
                aria-label="Rep range high"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={onTogglePriority}
            className={
              "mt-2 btn !min-h-[36px] !px-3 " +
              (exercise.priority
                ? "!bg-[var(--accent)] !border-[var(--accent)] !text-black"
                : "!border-[var(--border)] !text-[var(--fg-dim)]")
            }
          >
            ★ PRIORITY
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-3 border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
          aria-label="Remove exercise"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
    </li>
  );
}

function AddExerciseForm({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (ex: Exercise) => void;
}) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [low, setLow] = useState(8);
  const [high, setHigh] = useState(12);
  const [muscles, setMuscles] = useState<MuscleTag[]>([]);
  const [priority, setPriority] = useState(false);

  const toggleMuscle = (m: MuscleTag) =>
    setMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );

  const add = () => {
    if (!name.trim()) return;
    onAdd({
      id: newCustomExerciseId(),
      name: name.trim(),
      sets,
      repRangeLow: Math.min(low, high),
      repRangeHigh: Math.max(low, high),
      muscles,
      priority,
    });
  };

  return (
    <div className="mx-3 my-4 brutal-border bg-[var(--panel)] p-3">
      <div className="mono-tag text-[var(--info)] mb-2">&gt;&gt; NEW EXERCISE</div>
      <label className="block mb-2">
        <span className="mono-micro">NAME</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          placeholder="e.g., Seated Cable Row"
          aria-label="Name"
        />
      </label>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <label>
          <span className="mono-micro">SETS</span>
          <input
            type="number"
            min={1}
            value={sets}
            onChange={(e) => setSets(Math.max(1, Number(e.target.value) || 1))}
            className="w-full"
          />
        </label>
        <label>
          <span className="mono-micro">REP LOW</span>
          <input
            type="number"
            min={1}
            value={low}
            onChange={(e) => setLow(Math.max(1, Number(e.target.value) || 1))}
            className="w-full"
          />
        </label>
        <label>
          <span className="mono-micro">REP HIGH</span>
          <input
            type="number"
            min={1}
            value={high}
            onChange={(e) => setHigh(Math.max(1, Number(e.target.value) || 1))}
            className="w-full"
          />
        </label>
      </div>
      <div className="mono-micro mb-1">MUSCLES</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {MUSCLES.map((m) => {
          const on = muscles.includes(m);
          return (
            <button
              type="button"
              key={m}
              onClick={() => toggleMuscle(m)}
              className={
                "px-2 py-1 mono-micro border " +
                (on
                  ? "bg-[var(--info)] text-white border-[var(--info)]"
                  : "border-[var(--border)] text-[var(--fg-dim)]")
              }
            >
              {m.toUpperCase()}
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={priority}
          onChange={(e) => setPriority(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="mono-micro text-[var(--fg-dim)]">PRIORITY (STAR WEAK POINTS)</span>
      </label>
      <div className="grid grid-cols-2 gap-[1px] bg-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          className="bg-[var(--bg)] py-3 mono-tag"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={add}
          className="bg-[var(--info)] text-white py-3 mono-tag font-bold"
        >
          ADD LIFT
        </button>
      </div>
    </div>
  );
}
