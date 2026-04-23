export const DAY_COLORS: Record<string, string> = {
  PUSH_A: "#FF6A00",
  PUSH_B: "#FFA066",
  PULL_A: "#2E7BFF",
  PULL_B: "#6DA3FF",
  LEGS_A: "#F2F2F2",
  LEGS_B: "#9AA0B0",
};

export const DAY_LABELS: Record<string, string> = {
  PUSH_A: "PUSH A",
  PUSH_B: "PUSH B",
  PULL_A: "PULL A",
  PULL_B: "PULL B",
  LEGS_A: "LEGS A",
  LEGS_B: "LEGS B",
};

export function dayColor(dayId: string): string {
  return DAY_COLORS[dayId] ?? "#F2F2F2";
}
