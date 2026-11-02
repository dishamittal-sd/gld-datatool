import { describe, expect, it } from "vitest";
import { canAdd, combinationResult } from "@/data/combinationData";
import { getCharacteristicsBreakdown } from "@/data/characteristicsData";

const rows = getCharacteristicsBreakdown("Gorton");

describe("Interconnecting Characteristics Explorer", () => {
  it("allows at most 3 characteristics", () => {
    expect(canAdd(["Boy", "FSM", "EAL"], "SEND")).toBe(false);
    expect(canAdd(["Boy", "FSM"], "SEND")).toBe(true);
  });
  it("overlapping barriers lower attainment", () => {
    const one = combinationResult("Gorton", rows, ["Boy"]).overall;
    const two = combinationResult("Gorton", rows, ["Boy", "FSM"]).overall;
    const three = combinationResult("Gorton", rows, ["Boy", "FSM", "SEND"]).overall;
    expect(two).toBeLessThan(one);
    expect(three).toBeLessThan(two);
  });
});
