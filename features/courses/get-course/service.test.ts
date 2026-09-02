import { beforeEach, describe, expect, it, vi } from "vitest";

const findCourseById = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
}));

describe("getCourse", () => {
  beforeEach(() => {
    findCourseById.mockReset();
  });

  it("returns the course when it exists", async () => {
    const course = { id: "course-1", title: "Intro", description: null, createdBy: "actor-1", createdAt: new Date(), updatedAt: new Date() };
    findCourseById.mockResolvedValue(course);

    const { getCourse } = await import("./service");
    const result = await getCourse({ id: "course-1" });

    expect(result).toEqual({ success: true, data: course });
  });

  it("returns null data when the course doesn't exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { getCourse } = await import("./service");
    const result = await getCourse({ id: "missing" });

    expect(result).toEqual({ success: true, data: null });
  });
});
