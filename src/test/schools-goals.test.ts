import { describe, expect, it } from "vitest";

import { EYFS_AREAS } from "@/data/dashboardData";
import { GOAL_MILESTONES, TOTAL_GOALS, goalsOnTarget } from "@/data/schoolsData";

const scoresAt = (value: number) => Object.fromEntries(EYFS_AREAS.map((area) => [area, value]));

describe("Schools view assessed goals", () => {
  it("has nine assessed goals and never counts attendance as a tenth goal", () => {
    expect(TOTAL_GOALS).toBe(9);
    expect(goalsOnTarget(scoresAt(100), {
      toiletTrained: 100,
      feedIndependently: 100,
      preSchoolReady: 100,
    })).toBe(9);
  });

  it("excludes pre-school attendance from assessed milestones and the goal count", () => {
    expect(GOAL_MILESTONES.map((milestone) => milestone.key)).toEqual([
      "toiletTrained", "feedIndependently",
    ]);
    const belowTarget = { toiletTrained: 68, feedIndependently: 68, preSchoolReady: 100 };
    expect(goalsOnTarget(scoresAt(68), belowTarget)).toBe(0);
    expect(goalsOnTarget(scoresAt(68), { ...belowTarget, preSchoolReady: 0 })).toBe(0);
  });

  it("continues assessing goals at the agreed inclusive 69 percent threshold", () => {
    const scores = { ...scoresAt(68), Speaking: 69, "Self-Regulation": 70 };
    expect(goalsOnTarget(scores, {
      toiletTrained: 69,
      feedIndependently: 70,
      preSchoolReady: 100,
    })).toBe(4);
  });
});