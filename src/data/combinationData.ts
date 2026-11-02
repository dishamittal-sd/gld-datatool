/** Synthetic Interconnecting Characteristics Explorer figures; not real results. */
import type { BreakdownRow } from "@/data/dashboardData";

export const MAX_COMBINATION = 3;

export const COMBO_CHARACTERISTICS = [
  "Boy", "Girl", "FSM", "Non-FSM", "EAL", "Non-EAL", "SEND", "Non-SEND",
] as const;
export type ComboCharacteristic = (typeof COMBO_CHARACTERISTICS)[number];

/** Characteristics that cannot be combined with each other. */
export const OPPOSITE: Record<ComboCharacteristic, ComboCharacteristic> = {
  Boy: "Girl", Girl: "Boy", FSM: "Non-FSM", "Non-FSM": "FSM",
  EAL: "Non-EAL", "Non-EAL": "EAL", SEND: "Non-SEND", "Non-SEND": "SEND",
};

export const BARRIERS: ComboCharacteristic[] = ["Boy", "FSM", "EAL", "SEND"];

export const GOAL_KEYS = ["LA", "S", "SR", "MS", "BR", "GM", "FM"] as const;
export type GoalKey = (typeof GOAL_KEYS)[number];
export const GOAL_LABELS: Record<GoalKey, string> = {
  LA: "Listening & Attention", S: "Speaking", SR: "Self-Regulation", MS: "Managing Self",
  BR: "Building Relationships", GM: "Gross Motor", FM: "Fine Motor",
};

/** Point shift per goal for each characteristic (CLL goals first). */
const EFFECT: Record<ComboCharacteristic, number[]> = {
  Boy: [-4, -4, -4, -3, -3, 2, -4],
  Girl: [4, 4, 4, 3, 3, -2, 4],
  FSM: [-7, -8, -6, -6, -5, -4, -6],
  "Non-FSM": [3, 3, 2, 2, 2, 1, 2],
  EAL: [-8, -10, -3, -3, -4, -2, -3],
  "Non-EAL": [3, 4, 1, 1, 1, 1, 1],
  SEND: [-20, -22, -18, -19, -17, -12, -18],
  "Non-SEND": [3, 3, 3, 3, 3, 2, 3],
};

/** Share of the ward cohort with each characteristic. */
const SHARE: Record<ComboCharacteristic, number> = {
  Boy: 0.51, Girl: 0.49, FSM: 0.38, "Non-FSM": 0.62,
  EAL: 0.45, "Non-EAL": 0.55, SEND: 0.14, "Non-SEND": 0.86,
};

export function rowGoals(row: BreakdownRow): Record<GoalKey, number> {
  return { LA: row.cll.LA, S: row.cll.S, SR: row.pse.SR, MS: row.pse.MS, BR: row.pse.BR, GM: row.pd.GM, FM: row.pd.FM };
}

export function wardAverageGoals(rows: BreakdownRow[]): Record<GoalKey, number> {
  const boy = rows.find((r) => r.group === "Boy")!;
  const girl = rows.find((r) => r.group === "Girl")!;
  const b = rowGoals(boy), g = rowGoals(girl);
  return Object.fromEntries(GOAL_KEYS.map((k) => [k, Math.round(b[k] * 0.51 + g[k] * 0.49)])) as Record<GoalKey, number>;
}

export function wardCohortSize(ward: string) {
  const seed = [...ward].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7);
  return 360 + (seed % 140);
}

export function canAdd(selected: ComboCharacteristic[], c: ComboCharacteristic) {
  return !selected.includes(c) && selected.length < MAX_COMBINATION && !selected.includes(OPPOSITE[c]);
}

export function combinationResult(ward: string, rows: BreakdownRow[], selected: ComboCharacteristic[]) {
  const base = wardAverageGoals(rows);
  const barriers = selected.filter((c) => BARRIERS.includes(c)).length;
  // Each additional overlapping barrier deepens the gap beyond the sum of single effects.
  const compound = barriers > 1 ? (barriers - 1) * 3 : 0;
  const goals = Object.fromEntries(GOAL_KEYS.map((k, i) => {
    const shift = selected.reduce((s, c) => s + (EFFECT[c][i] ?? 0), 0);
    return [k, Math.max(5, Math.min(98, Math.round(base[k] + shift - compound)))];
  })) as Record<GoalKey, number>;
  const overlap = barriers > 1 ? 1 + 0.25 * (barriers - 1) : 1;
  const cohort = Math.max(3, Math.round(selected.reduce((n, c) => n * SHARE[c], wardCohortSize(ward)) * overlap));
  const overall = Math.round(GOAL_KEYS.reduce((s, k) => s + goals[k], 0) / GOAL_KEYS.length);
  return { goals, cohort, overall };
}
