import { describe, expect, it } from "vitest";
import { breakdown } from "@/data/dashboardData";
import { MANCHESTER_WARDS } from "@/data/schoolsData";
import {
  DEFAULT_CHARACTERISTICS_WARD,
  characteristicsByWard,
  getCharacteristicsBreakdown,
} from "@/data/characteristicsData";

describe("Characteristics ward selection", () => {
  it("defaults to Gorton and preserves its existing sample figures", () => {
    expect(DEFAULT_CHARACTERISTICS_WARD).toBe("Gorton");
    expect(getCharacteristicsBreakdown(DEFAULT_CHARACTERISTICS_WARD)).toEqual(breakdown);
  });

  it("provides characteristic rows for all 32 Manchester wards", () => {
    expect(Object.keys(characteristicsByWard)).toHaveLength(32);
    expect(Object.keys(characteristicsByWard)).toEqual(MANCHESTER_WARDS);
    for (const ward of MANCHESTER_WARDS) {
      expect(getCharacteristicsBreakdown(ward).map((row) => row.group)).toEqual([
        "Boy", "Girl", "EAL", "SEND", "FSM", "National",
      ]);
    }
  });

  it("switches to ward-specific figures while retaining the Manchester comparison", () => {
    const gorton = getCharacteristicsBreakdown("Gorton");
    const levenshulme = getCharacteristicsBreakdown("Levenshulme");
    expect(levenshulme.find((row) => row.group === "Boy")).not.toEqual(
      gorton.find((row) => row.group === "Boy"),
    );
    expect(levenshulme.find((row) => row.group === "National")).toEqual(
      gorton.find((row) => row.group === "National"),
    );
  });
});