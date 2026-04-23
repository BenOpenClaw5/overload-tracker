"use client";

import { WORKOUT_DAYS } from "./exercises";
import type { DayCode, Exercise } from "./types";

const KEY = "overload.customizations.v1";

/**
 * Per-day exercise customization. If a day has an override, use `exercises`
 * verbatim (allowing reorder / add / remove). If none, use the defaults.
 */
export interface DayCustomization {
  dayId: DayCode;
  exercises: Exercise[];
}

export type CustomizationMap = Partial<Record<DayCode, DayCustomization>>;

let cache: CustomizationMap | null = null;

function emit() {
  cache = null;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("overload:storage"));
}

function readRaw(): CustomizationMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CustomizationMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function loadCustomizations(): CustomizationMap {
  if (cache) return cache;
  cache = readRaw();
  return cache;
}

export function saveCustomizations(map: CustomizationMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
  emit();
}

export function getEffectiveExercises(dayId: DayCode): Exercise[] {
  const map = loadCustomizations();
  const override = map[dayId];
  if (override && Array.isArray(override.exercises)) return override.exercises;
  const day = WORKOUT_DAYS.find((d) => d.id === dayId);
  return day ? day.exercises : [];
}

export function setDayExercises(dayId: DayCode, exercises: Exercise[]) {
  const map = { ...loadCustomizations() };
  map[dayId] = { dayId, exercises };
  saveCustomizations(map);
}

export function resetDayToDefault(dayId: DayCode) {
  const map = { ...loadCustomizations() };
  delete map[dayId];
  saveCustomizations(map);
}

export function hasCustomization(dayId: DayCode): boolean {
  return Boolean(loadCustomizations()[dayId]);
}

export function newCustomExerciseId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function onCustomizationsChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cache = null;
    cb();
  };
  window.addEventListener("overload:storage", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("overload:storage", handler);
    window.removeEventListener("storage", handler);
  };
}
