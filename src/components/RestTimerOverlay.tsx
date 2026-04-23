"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, RotateCcw, X } from "lucide-react";
import { useEffect } from "react";
import { useTimer } from "./TimerProvider";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatMMSS(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad(m)}:${pad(s)}`;
}

export function RestTimerOverlay() {
  const { state, remainingMs, skip, addSeconds, reset, dismiss } = useTimer();

  useEffect(() => {
    if (state.status !== "running") return;
    document.documentElement.dataset.resting = "1";
    return () => {
      delete document.documentElement.dataset.resting;
    };
  }, [state.status]);

  if (state.status === "idle") return null;

  const running = state.status === "running";
  const done = state.status === "done";
  const totalSec = state.total;
  const progress = running ? Math.max(0, Math.min(1, remainingMs / (totalSec * 1000))) : 0;
  const label = state.label;

  return (
    <AnimatePresence>
      <motion.div
        key={done ? "done" : "run"}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
      >
        <div
          className={
            "pointer-events-auto border-t-2 bg-[var(--bg)] " +
            (done
              ? "overload-done-flash border-[var(--accent)]"
              : "border-[var(--info)]")
          }
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-[1fr_auto] items-center px-4 pt-3 pb-1 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={
                  "inline-block w-2 h-2 overload-pulse " +
                  (done ? "bg-[var(--accent)]" : "bg-[var(--info)]")
                }
                aria-hidden
              />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--muted)] truncate">
                {done ? "[ REST COMPLETE ]" : "[ REST / LIVE ]"}
                {label ? ` · ${label}` : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="font-mono text-[11px] tracking-widest uppercase text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1 border border-[var(--border)]"
              aria-label="Dismiss timer"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-[1fr] items-baseline px-4">
            <div
              className="font-mono font-black tabular-nums leading-none select-none"
              style={{
                fontSize: "clamp(5rem, 22vw, 10rem)",
                letterSpacing: "-0.04em",
                color: done ? "var(--accent)" : "var(--fg)",
              }}
            >
              {done ? "00:00" : formatMMSS(remainingMs)}
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="h-1.5 w-full bg-[var(--panel)] relative overflow-hidden">
              <motion.div
                className={
                  "absolute inset-y-0 left-0 " +
                  (done ? "bg-[var(--accent)]" : "bg-[var(--info)]")
                }
                initial={false}
                animate={{ width: done ? "0%" : `${progress * 100}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[2px] bg-[var(--border)] mt-3 mx-0 border-t border-[var(--border)]">
            {running ? (
              <>
                <button
                  type="button"
                  onClick={() => addSeconds(30)}
                  className="bg-[var(--bg)] hover:bg-[var(--panel)] active:bg-[var(--panel)] py-4 font-mono text-[12px] tracking-[0.18em] uppercase flex items-center justify-center gap-2"
                >
                  <Plus size={14} strokeWidth={3} /> 30S
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="bg-[var(--bg)] hover:bg-[var(--panel)] active:bg-[var(--panel)] py-4 font-mono text-[12px] tracking-[0.18em] uppercase flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} strokeWidth={3} /> RESET
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-black py-4 font-mono font-bold text-[12px] tracking-[0.22em] uppercase"
                >
                  SKIP →
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="col-span-3 bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-black py-5 font-mono font-black text-[14px] tracking-[0.28em] uppercase"
              >
                GO — NEXT SET
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
