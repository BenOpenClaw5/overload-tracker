export type MuscleTag =
  | "chest"
  | "shoulders"
  | "triceps"
  | "back"
  | "biceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "core";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repRangeLow: number;
  repRangeHigh: number;
  priority?: boolean;
  muscles: MuscleTag[];
}

export type DayCode = "PUSH_A" | "PULL_A" | "LEGS_A" | "PUSH_B" | "PULL_B" | "LEGS_B";

export interface WorkoutDay {
  id: DayCode;
  index: number;
  code: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface LoggedSet {
  weight: number;
  reps: number;
  ts: number;
}

export interface Session {
  id: string;
  dayId: DayCode;
  date: string;
  startedAt: number;
  finishedAt?: number;
  entries: Record<string, LoggedSet[]>;
}

export interface AppSettings {
  restSeconds: number;
  soundOn: boolean;
  vibrationOn: boolean;
  notificationsOn: boolean;
}

export interface PRRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  est1RM: number;
  date: string;
}
