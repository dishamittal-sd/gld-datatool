/** Synthetic Schools view data: all 32 Manchester wards and their schools. Mock figures only. */
import { EYFS_AREAS, MANCHESTER_WARDS, TARGET, manchester, wardCohort, type EyfsScores } from "@/data/dashboardData";

export { MANCHESTER_WARDS };

export const MILESTONES = [
  { key: "toiletTrained", label: "Toilet Trained" },
  { key: "feedIndependently", label: "Feeding Independently" },
  { key: "preSchoolReady", label: "Attended an early years provision" },
] as const;
export type MilestoneKey = (typeof MILESTONES)[number]["key"];
export type Milestones = Record<MilestoneKey, number>;

/** Attendance is contextual information, not one of the assessed developmental goals. */
export const GOAL_MILESTONES = MILESTONES.filter((m) => m.key !== "preSchoolReady");

export type SchoolRecord = {
  id: string;
  name: string;
  eyfs: EyfsScores;
  kpis: Milestones;
  cohort: number;
  send: boolean;
  gld: number;
};

export type WardRecord = {
  id: string;
  name: string;
  eyfs: EyfsScores;
  eyfs2025: EyfsScores;
  kpis: Milestones;
  schools: SchoolRecord[];
};

export const DEFAULT_WARD_ID = "gorton";

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const clamp = (v: number) => Math.max(30, Math.min(95, Math.round(v)));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

const SCHOOL_PATTERNS = ["{w} Primary", "St. Mary’s RC", "{w} Community", "Holy Trinity CE", "{w} Park Academy", "Oak Tree Primary"];

function makeSchool(ward: string, name: string, eyfs: EyfsScores, kpis: Milestones): SchoolRecord {
  const r = rng(`${ward}:${name}:meta`);
  const all = [...Object.values(eyfs), ...Object.values(kpis)];
  return {
    id: slug(name), name, eyfs, kpis,
    cohort: 18 + Math.round(r() * 42),
    send: r() < 0.35,
    gld: clamp(avg(all) - 6 + r() * 6),
  };
}

function buildWard(name: string): WardRecord {
  const id = slug(name);
  const area = manchester.areas.find((a) => a.id === id);
  let schools: SchoolRecord[];
  if (area) {
    schools = area.schools.map((s) => makeSchool(name, s.name, s.eyfs, s.kpis));
    if (schools.length < 3) {
      schools.push(...generated(name, 3 - schools.length + 1).slice(0, 3 - schools.length));
    }
  } else {
    schools = generated(name, 3 + Math.floor(rng(name)() * 3));
  }
  // Alinha o somatório dos cohorts das escolas ao cohort do ward usado na Ward view.
  const target = wardCohort[name as keyof typeof wardCohort] ?? 0;
  const total = schools.reduce((n, s) => n + s.cohort, 0);
  if (target > 0 && total > 0) {
    const scaled = schools.map((s) => Math.max(10, Math.round((s.cohort / total) * target)));
    scaled[scaled.length - 1] = Math.max(10, target - scaled.slice(0, -1).reduce((a, b) => a + b, 0));
    schools.forEach((s, i) => { s.cohort = scaled[i]!; });
  }
  const eyfs: EyfsScores = area
    ? area.eyfs
    : Object.fromEntries(EYFS_AREAS.map((a) => [a, avg(schools.map((s) => s.eyfs[a]!))]));
  const r = rng(`${name}:2025`);
  const eyfs2025 = Object.fromEntries(EYFS_AREAS.map((a) => [a, clamp(eyfs[a]! - 5 + r() * 7)]));
  const kpis = Object.fromEntries(
    MILESTONES.map((m) => [m.key, avg(schools.map((s) => s.kpis[m.key]))]),
  ) as Milestones;
  return { id, name, eyfs, eyfs2025, kpis, schools };
}

function generated(ward: string, count: number): SchoolRecord[] {
  const r = rng(ward);
  const base = 58 + r() * 22;
  return SCHOOL_PATTERNS.slice(0, count).map((p) => {
    const name = p.replace("{w}", ward.split(" ")[0]!);
    const sr = rng(`${ward}:${name}`);
    const sb = base - 6 + sr() * 12;
    const eyfs = Object.fromEntries(
      EYFS_AREAS.map((a, i) => [a, clamp(sb + [0, 4, 10, -8, -4, 2, 7][i]! + sr() * 8 - 4)]),
    );
    const kpis: Milestones = {
      toiletTrained: clamp(sb + 8 + sr() * 8),
      feedIndependently: clamp(sb + 6 + sr() * 8),
      preSchoolReady: clamp(sb - 2 + sr() * 10),
    };
    return makeSchool(ward, name, eyfs, kpis);
  });
}

export const wardRecords: WardRecord[] = MANCHESTER_WARDS.map(buildWard);

/** Number of the 9 goals (7 EYFS areas + 2 milestones) at or above the benchmark target. */
export function goalsOnTarget(eyfs: EyfsScores, kpis: Milestones) {
  return [
    ...EYFS_AREAS.map((area) => eyfs[area] ?? 0),
    ...GOAL_MILESTONES.map((m) => kpis[m.key]),
  ].filter((v) => v >= TARGET).length;
}
export const TOTAL_GOALS = EYFS_AREAS.length + GOAL_MILESTONES.length;

export function topNames<T extends { name: string }>(items: T[], score: (t: T) => number, n = 3) {
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, n).map((i) => i.name);
}
