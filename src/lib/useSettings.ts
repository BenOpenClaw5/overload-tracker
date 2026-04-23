"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, loadSessions, loadSettings, onStorageChange } from "./storage";
import type { AppSettings, Session } from "./types";

const EMPTY_SESSIONS: Session[] = [];

function subscribe(cb: () => void): () => void {
  return onStorageChange(cb);
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(
    subscribe,
    () => loadSettings(),
    () => DEFAULT_SETTINGS,
  );
}

export function useSessions(): Session[] {
  return useSyncExternalStore(
    subscribe,
    () => loadSessions(),
    () => EMPTY_SESSIONS,
  );
}
