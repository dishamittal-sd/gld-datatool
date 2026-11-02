/** Synthetic Characteristics view figures only; not real ward results. */
import { PRIMARY_WARD, breakdown, type BreakdownRow } from "@/data/dashboardData";
import { MANCHESTER_WARDS } from "@/data/schoolsData";

export const DEFAULT_CHARACTERISTICS_WARD = PRIMARY_WARD;

function wardRows(ward: string): BreakdownRow[] {
  // Preserve the existing Gorton sample and the shared Manchester comparison.
  if (ward === DEFAULT_CHARACTERISTICS_WARD) return breakdown;
  const seed = [...ward].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7);
  const shift = (seed % 14) - 6;
  const score = (value: number, column: number) =>
    Math.max(0, Math.min(100, value + shift + ((seed >>> column) % 5) - 2));

  return breakdown.map((row) => row.group === "National" ? row : {
    group: row.group,
    cll: { LA: score(row.cll.LA, 0), S: score(row.cll.S, 1) },
    pse: { SR: score(row.pse.SR, 2), MS: score(row.pse.MS, 3), BR: score(row.pse.BR, 4) },
    pd: { GM: score(row.pd.GM, 5), FM: score(row.pd.FM, 6) },
  });
}

export const characteristicsByWard: Record<string, BreakdownRow[]> = Object.fromEntries(
  MANCHESTER_WARDS.map((ward) => [ward, wardRows(ward)]),
);

export function getCharacteristicsBreakdown(ward: string): BreakdownRow[] {
  return characteristicsByWard[ward] ?? breakdown;
}