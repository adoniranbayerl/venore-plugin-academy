import { describe, expect, it } from "vitest";
import { computeLessonChain, type LessonChainFacts } from "./lesson-chain";

function facts(overrides: Partial<LessonChainFacts> & { lessonId: string }): LessonChainFacts {
  return {
    readTextEnabled: false,
    textRead: false,
    watchVideoEnabled: false,
    videoWatched: false,
    quizEnabled: false,
    quizPassed: false,
    activityEnabled: false,
    activitiesSubmitted: false,
    ...overrides,
  };
}

describe("computeLessonChain", () => {
  it("is complete when a lesson has no requirements enabled", () => {
    const [state] = computeLessonChain([facts({ lessonId: "lesson-1" })]);
    expect(state).toEqual({ lessonId: "lesson-1", completed: true, locked: false });
  });

  it("is incomplete when an enabled requirement is unmet", () => {
    const [state] = computeLessonChain([facts({ lessonId: "lesson-1", readTextEnabled: true, textRead: false })]);
    expect(state.completed).toBe(false);
  });

  it("the first lesson is always accessible, regardless of its own completion", () => {
    const [state] = computeLessonChain([facts({ lessonId: "lesson-1", readTextEnabled: true, textRead: false })]);
    expect(state.locked).toBe(false);
  });

  it("blocks the next lesson when the previous one is incomplete", () => {
    const chain = computeLessonChain([
      facts({ lessonId: "lesson-1", readTextEnabled: true, textRead: false }),
      facts({ lessonId: "lesson-2" }),
    ]);
    expect(chain[1]).toMatchObject({ lessonId: "lesson-2", locked: true });
  });

  it("unlocks the next lesson once the previous one is complete", () => {
    const chain = computeLessonChain([
      facts({ lessonId: "lesson-1", readTextEnabled: true, textRead: true }),
      facts({ lessonId: "lesson-2" }),
    ]);
    expect(chain[1]).toMatchObject({ lessonId: "lesson-2", locked: false });
  });

  // Caso do bug de transitividade: lesson-2 não tem lesson_requirements configurado, então é
  // trivialmente "completed" — mas ela própria está locked porque lesson-1 está incompleta.
  // lesson-3 precisa continuar bloqueada, não pode enxergar só o completed de lesson-2.
  it("keeps a lesson blocked through a trivially-complete-but-itself-locked predecessor (transitivity)", () => {
    const chain = computeLessonChain([
      facts({ lessonId: "lesson-1", readTextEnabled: true, textRead: false }),
      facts({ lessonId: "lesson-2" }),
      facts({ lessonId: "lesson-3" }),
    ]);

    expect(chain[0]).toMatchObject({ lessonId: "lesson-1", completed: false, locked: false });
    expect(chain[1]).toMatchObject({ lessonId: "lesson-2", completed: true, locked: true });
    expect(chain[2]).toMatchObject({ lessonId: "lesson-3", locked: true });
  });

  it("is incomplete when the practical activity is enabled but not submitted", () => {
    const [state] = computeLessonChain([facts({ lessonId: "lesson-1", activityEnabled: true, activitiesSubmitted: false })]);
    expect(state.completed).toBe(false);
  });

  it("is complete once the practical activity has been submitted", () => {
    const [state] = computeLessonChain([facts({ lessonId: "lesson-1", activityEnabled: true, activitiesSubmitted: true })]);
    expect(state.completed).toBe(true);
  });

  it("a lesson without any requirements enabled counts as complete", () => {
    const chain = computeLessonChain([
      facts({ lessonId: "lesson-1" }),
      facts({ lessonId: "lesson-2", readTextEnabled: true, textRead: true, watchVideoEnabled: true, videoWatched: true }),
    ]);

    expect(chain[0].completed).toBe(true);
    expect(chain[1]).toMatchObject({ completed: true, locked: false });
  });
});
