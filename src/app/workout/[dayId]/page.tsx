"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ExerciseBlock } from "@/components/ExerciseBlock";
import { EditWorkout } from "@/components/EditWorkout";
import { TopBar } from "@/components/TopBar";
import { getDayById } from "@/lib/exercises";
import { newSessionId, todayISODate } from "@/lib/dates";
import { deleteSession, upsertSession } from "@/lib/storage";
import { useCustomizations, useSessions } from "@/lib/useSettings";
import type { DayCode, Exercise, LoggedSet, Session } from "@/lib/types";
import { Check, Pencil } from "lucide-react";

export default function WorkoutPage() {
  const params = useParams<{ dayId: string }>();
  const router = useRouter();
  const day = getDayById(params.dayId);
  const sessions = useSessions();
  const customizations = useCustomizations();
  const [editing, setEditing] = useState(false);

  const effectiveExercises: Exercise[] = useMemo(() => {
    if (!day) return [];
    const custom = customizations[day.id as DayCode];
    return custom && custom.exercises.length ? custom.exercises : day.exercises;
  }, [day, customizations]);

  const persistedSession = useMemo(() => {
    if (!day) return null;
    const today = todayISODate();
    return (
      sessions.find(
        (s) => s.dayId === day.id && s.date === today && !s.finishedAt,
      ) ?? null
    );
  }, [day, sessions]);

  const [draftId] = useState(() => newSessionId());
  const [draftStartedAt] = useState(() => Date.now());

  const session: Session | null = useMemo(() => {
    if (!day) return null;
    if (persistedSession) return persistedSession;
    return {
      id: draftId,
      dayId: day.id as DayCode,
      date: todayISODate(),
      startedAt: draftStartedAt,
      entries: {},
    };
  }, [day, persistedSession, draftId, draftStartedAt]);

  const totalSetsPlanned = useMemo(
    () => effectiveExercises.reduce((a, e) => a + e.sets, 0),
    [effectiveExercises],
  );

  const totalSetsLogged = useMemo(() => {
    if (!session) return 0;
    return Object.values(session.entries).reduce((sum, list) => sum + list.length, 0);
  }, [session]);

  if (!day) return notFound();
  if (!session) return null;

  const handleSetsChange = (exerciseId: string, sets: LoggedSet[]) => {
    const prevSession = persistedSession ?? session;
    const entries = { ...prevSession.entries };
    if (sets.length === 0) delete entries[exerciseId];
    else entries[exerciseId] = sets;
    const totalSets = Object.values(entries).reduce((a, l) => a + l.length, 0);

    if (totalSets === 0) {
      // Nothing logged. Don't create a session, and clean up any persisted
      // session that's just been emptied out (e.g., user un-logged everything).
      if (persistedSession) deleteSession(persistedSession.id);
      return;
    }

    const next: Session = {
      ...prevSession,
      id: persistedSession ? prevSession.id : draftId,
      entries,
    };
    upsertSession(next);
  };

  const finish = () => {
    const current = persistedSession ?? session;
    const totalSets = Object.values(current.entries).reduce(
      (a, l) => a + l.length,
      0,
    );
    if (totalSets === 0) {
      // No sets logged — bail without persisting. Clean up any stale draft.
      if (persistedSession) deleteSession(persistedSession.id);
      router.push("/");
      return;
    }
    upsertSession({ ...current, finishedAt: Date.now() });
    router.push("/history");
  };

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-56">
        <section className="px-3 pt-5 pb-3 border-b-2 border-[var(--fg)]">
          <div className="flex items-baseline justify-between mono-micro">
            <span>
              [ {day.code} / {day.title} ]
            </span>
            <span>{todayISODate()}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-3 mt-2">
            <h1
              className="display-big"
              style={{ fontSize: "clamp(2.5rem, 11vw, 5.5rem)" }}
            >
              {day.title}
            </h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn btn-ghost !min-h-[40px] !px-3"
              aria-label="Edit workout"
            >
              <Pencil size={14} strokeWidth={2.5} /> EDIT
            </button>
          </div>
          <div className="mt-2 mono-micro">{day.focus}</div>
          <div className="mt-3 grid grid-cols-3 gap-0 border border-[var(--border)]">
            <Stat label="LIFTS" value={effectiveExercises.length} />
            <Stat label="SETS" value={`${totalSetsLogged}/${totalSetsPlanned}`} />
            <Stat label="REST" value="2:30" />
          </div>
        </section>

        <div>
          {effectiveExercises.map((ex, i) => (
            <div key={ex.id}>
              <div className="px-3 mono-micro text-[var(--muted)] pt-4 flex items-center justify-between">
                <span>
                  LIFT {String(i + 1).padStart(2, "0")} /{" "}
                  {String(effectiveExercises.length).padStart(2, "0")}
                </span>
                {ex.priority ? (
                  <span className="text-[var(--accent)]">★ PRIORITY</span>
                ) : (
                  <span className="text-[var(--info)]">●</span>
                )}
              </div>
              <ExerciseBlock
                exercise={ex}
                sessions={sessions}
                currentSessionId={session.id}
                initialSets={session.entries[ex.id]}
                onSetsChange={handleSetsChange}
              />
            </div>
          ))}
        </div>
      </main>

      <div
        className="fixed bottom-0 inset-x-0 z-20 border-t-2 border-[var(--fg)] bg-[var(--bg)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-[1fr_auto] gap-0">
          <div className="px-4 py-3 border-r border-[var(--border)]">
            <div className="mono-micro">SETS LOGGED</div>
            <div className="font-mono font-black tabular-nums text-[28px] leading-none mt-1">
              {totalSetsLogged}/{totalSetsPlanned}
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            className="px-6 font-mono font-black uppercase tracking-[0.22em] text-[14px] bg-[var(--accent)] text-black flex items-center gap-2 active:brightness-95"
          >
            <Check size={18} strokeWidth={3} /> FINISH
          </button>
        </div>
      </div>

      {editing ? (
        <EditWorkout
          dayId={day.id as DayCode}
          exercises={effectiveExercises}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-3 border-r border-[var(--border)] last:border-r-0">
      <div className="mono-micro">{label}</div>
      <div className="mt-1 font-mono font-black tabular-nums text-[22px] leading-none">
        {value}
      </div>
    </div>
  );
}
