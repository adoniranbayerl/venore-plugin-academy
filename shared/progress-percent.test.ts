import { describe, expect, it } from "vitest";
import { calculateProgressPercent } from "./progress-percent";

describe("calculateProgressPercent", () => {
  it("returns 0 when there are no lessons (division by zero)", () => {
    expect(calculateProgressPercent(0, 0)).toBe(0);
  });

  it("returns 0 when nothing was completed yet", () => {
    expect(calculateProgressPercent(0, 5)).toBe(0);
  });

  it("returns 100 when every lesson is completed", () => {
    expect(calculateProgressPercent(5, 5)).toBe(100);
  });

  it("rounds to the nearest integer", () => {
    expect(calculateProgressPercent(1, 3)).toBe(33);
    expect(calculateProgressPercent(2, 3)).toBe(67);
  });
});
