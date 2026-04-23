"use client";

import type { AppSettings, Session } from "./types";

const SESSIONS_KEY = "overload.sessions.v1";
const SETTINGS_KEY = "overload.settings.v1";
const INSTALL_HINT_KEY = "overload.installHint.dismissed.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  restSeconds: 150,
  soundOn: true,
  vibrationOn: true,
  notificationsOn: true,
};

const EVENT = "overload:storage";

let sessionsCache: Session[] | null = null;
let settingsCache: AppSettings | null = null;

function emit() {
  sessionsCache = null;
  settingsCache = null;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onStorageChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    sessionsCache = null;
    settingsCache = null;
    cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function readSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Session[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function loadSessions(): Session[] {
  if (sessionsCache) return sessionsCache;
  sessionsCache = readSessions();
  return sessionsCache;
}

export function saveSessions(sessions: Session[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  emit();
}

export function upsertSession(session: Session) {
  const all = loadSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  const next = all.slice();
  if (idx >= 0) next[idx] = session;
  else next.push(session);
  saveSessions(next);
}

export function deleteSession(id: string) {
  saveSessions(loadSessions().filter((s) => s.id !== id));
}

function readSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function loadSettings(): AppSettings {
  if (settingsCache) return settingsCache;
  settingsCache = readSettings();
  return settingsCache;
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  emit();
}

export function installHintDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(INSTALL_HINT_KEY) === "1";
}

export function dismissInstallHint() {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSTALL_HINT_KEY, "1");
  emit();
}

export function exportAll(): string {
  const payload = {
    app: "overload-tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions: loadSessions(),
    settings: loadSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAll(json: string): { sessions: number } {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid payload.");
  if (!Array.isArray(parsed.sessions)) throw new Error("Missing sessions array.");
  saveSessions(parsed.sessions as Session[]);
  if (parsed.settings) saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
  return { sessions: (parsed.sessions as Session[]).length };
}

export function nukeAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  emit();
}
