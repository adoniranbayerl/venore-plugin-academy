import { beforeEach, describe, expect, it, vi } from "vitest";

const findVisibleCoursesForStudents = vi.fn();
const findEnrollmentsByActor = vi.fn();

vi.mock("./store", () => ({
  findVisibleCoursesForStudents: (...args: unknown[]) => findVisibleCoursesForStudents(...args),
  findEnrollmentsByActor: (...args: unknown[]) => findEnrollmentsByActor(...args),
}));

const fixedDate = new Date("2026-01-01T00:00:00.000Z");

function course(overrides: Partial<{ id: string; publiclyListed: boolean }> = {}) {
  return {
    id: overrides.id ?? "course-1",
    title: "Intro",
    description: null,
    status: "public",
    createdBy: "actor-1",
    publiclyListed: overrides.publiclyListed ?? true,
    createdAt: fixedDate,
    updatedAt: fixedDate,
  };
}

describe("listCoursesForStudent", () => {
  beforeEach(() => {
    findVisibleCoursesForStudents.mockReset();
    findEnrollmentsByActor.mockReset();
  });

  it("marks publicly listed, non-enrolled courses as visible and not enrolled", async () => {
    findVisibleCoursesForStudents.mockResolvedValue([course()]);
    findEnrollmentsByActor.mockResolvedValue([]);

    const { listCoursesForStudent } = await import("./service");
    const result = await listCoursesForStudent({ actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [{ ...course(), enrolled: false }] });
  });

  it("marks enrolled courses as enrolled", async () => {
    findVisibleCoursesForStudents.mockResolvedValue([course()]);
    findEnrollmentsByActor.mockResolvedValue([{ courseId: "course-1" }]);

    const { listCoursesForStudent } = await import("./service");
    const result = await listCoursesForStudent({ actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [{ ...course(), enrolled: true }] });
  });

  it("hides a course that is neither enrolled nor publicly listed", async () => {
    findVisibleCoursesForStudents.mockResolvedValue([course({ publiclyListed: false })]);
    findEnrollmentsByActor.mockResolvedValue([]);

    const { listCoursesForStudent } = await import("./service");
    const result = await listCoursesForStudent({ actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [] });
  });

  it("still shows a non-publicly-listed course when the actor is enrolled in it", async () => {
    findVisibleCoursesForStudents.mockResolvedValue([course({ publiclyListed: false })]);
    findEnrollmentsByActor.mockResolvedValue([{ courseId: "course-1" }]);

    const { listCoursesForStudent } = await import("./service");
    const result = await listCoursesForStudent({ actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [{ ...course({ publiclyListed: false }), enrolled: true }] });
  });
});
