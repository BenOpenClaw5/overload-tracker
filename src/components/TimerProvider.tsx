"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadSettings } from "@/lib/storage";

type TimerState =
  | { status: "idle" }
  | { status: "running"; endsAt: number; total: number; label?: string }
  | { status: "done"; total: number; label?: string };

interface TimerApi {
  state: TimerState;
  remainingMs: number;
  start: (seconds?: number, label?: string) => void;
  skip: () => void;
  addSeconds: (delta: number) => void;
  reset: () => void;
  dismiss: () => void;
}

const TimerContext = createContext<TimerApi | null>(null);

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}

let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const AC =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

function beep(frequency: number, durationMs: number, volume = 0.2) {
  const ctx = getAudio();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // no-op
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // no-op
  }
}

function postDoneNotification(label?: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("REST COMPLETE", {
      body: label ? `NEXT: ${label}` : "GO.",
      tag: "overload-rest",
      silent: false,
    });
  } catch {
    // no-op
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>({ status: "idle" });
  const [now, setNow] = useState<number>(() => Date.now());
  const tickRef = useRef<number | null>(null);
  const firedFinalCountdownRef = useRef<number>(-1);
  const firedDoneRef = useRef<boolean>(false);
  const doneTimeoutRef = useRef<number | null>(null);

  const clearTick = () => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const clearDoneTimer = () => {
    if (doneTimeoutRef.current !== null) {
      window.clearTimeout(doneTimeoutRef.current);
      doneTimeoutRef.current = null;
    }
  };

  const triggerDone = useCallback(
    (total: number, label?: string) => {
      if (firedDoneRef.current) return;
      firedDoneRef.current = true;
      const settings = loadSettings();
      if (settings.soundOn) {
        beep(880, 180, 0.25);
        window.setTimeout(() => beep(660, 180, 0.25), 220);
        window.setTimeout(() => beep(1040, 320, 0.28), 460);
      }
      if (settings.vibrationOn) vibrate([180, 80, 180, 80, 400]);
      if (settings.notificationsOn) postDoneNotification(label);
      setState({ status: "done", total, label });
    },
    [],
  );

  useEffect(() => {
    if (state.status !== "running") {
      clearTick();
      clearDoneTimer();
      return;
    }
    const target = state.endsAt;
    const total = state.total;
    const label = state.label;

    tickRef.current = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      const remainMs = target - t;
      const remainS = Math.ceil(remainMs / 1000);
      const settings = loadSettings();
      if (settings.soundOn && remainS > 0 && remainS <= 10) {
        if (firedFinalCountdownRef.current !== remainS) {
          firedFinalCountdownRef.current = remainS;
          beep(remainS <= 3 ? 900 : 600, 60, 0.12);
        }
      }
      if (remainMs <= 0) {
        clearTick();
        triggerDone(total, label);
      }
    }, 200);

    clearDoneTimer();
    const delay = Math.max(0, target - Date.now());
    doneTimeoutRef.current = window.setTimeout(() => {
      triggerDone(total, label);
    }, delay + 20);

    return () => {
      clearTick();
      clearDoneTimer();
    };
  }, [state, triggerDone]);

  const start = useCallback((seconds?: number, label?: string) => {
    const settings = loadSettings();
    const dur = seconds ?? settings.restSeconds;
    if (settings.notificationsOn) {
      ensureNotificationPermission();
    }
    getAudio();
    firedFinalCountdownRef.current = -1;
    firedDoneRef.current = false;
    const total = dur;
    const started = Date.now();
    setNow(started);
    setState({ status: "running", endsAt: started + dur * 1000, total, label });
  }, []);

  const skip = useCallback(() => {
    firedFinalCountdownRef.current = -1;
    firedDoneRef.current = false;
    setState({ status: "idle" });
  }, []);

  const dismiss = useCallback(() => {
    firedFinalCountdownRef.current = -1;
    firedDoneRef.current = false;
    setState({ status: "idle" });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "running") return prev;
      firedFinalCountdownRef.current = -1;
      firedDoneRef.current = false;
      return { ...prev, endsAt: Date.now() + prev.total * 1000 };
    });
  }, []);

  const addSeconds = useCallback((delta: number) => {
    setState((prev) => {
      if (prev.status !== "running") return prev;
      firedDoneRef.current = false;
      return { ...prev, endsAt: prev.endsAt + delta * 1000, total: prev.total + delta };
    });
  }, []);

  const remainingMs = useMemo(() => {
    if (state.status === "running") return Math.max(0, state.endsAt - now);
    if (state.status === "done") return 0;
    return 0;
  }, [state, now]);

  const value = useMemo(
    () => ({ state, remainingMs, start, skip, addSeconds, reset, dismiss }),
    [state, remainingMs, start, skip, addSeconds, reset, dismiss],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
