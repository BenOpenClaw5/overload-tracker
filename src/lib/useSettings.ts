"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, loadSessions, loadSettings, onStorageChange } from "./storage";
import { loadCustomizations } from "./customizations";
import type { CustomizationMap } from "./customizations";
import type { AppSettings, Session } from "./types";

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_CUSTOM: CustomizationMap = {};

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

export function useCustomizations(): CustomizationMap {
  return useSyncExternalStore(
    subscribe,
    () => loadCustomizations(),
    () => EMPTY_CUSTOM,
  );
}
