import { describe, expect, it } from "vitest";
import { deriveQuizGrade } from "./quiz-grade";

describe("deriveQuizGrade", () => {
  it("derives grade 0 from a 0% score", () => {
    expect(deriveQuizGrade(0)).toBe(0);
  });

  it("derives grade 10 from a 100% score", () => {
    expect(deriveQuizGrade(100)).toBe(10);
  });

  it("rounds half up when the value lands exactly on the rounding boundary", () => {
    // 62.5% -> grade 6.25 antes de arredondar, exatamente no meio entre 6.2 e 6.3.
    expect(deriveQuizGrade(62.5)).toBe(6.3);
  });
});
