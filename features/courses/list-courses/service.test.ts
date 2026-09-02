import { beforeEach, describe, expect, it, vi } from "vitest";

const findAllCourses = vi.fn();

vi.mock("./store", () => ({
  findAllCourses: (...args: unknown[]) => findAllCourses(...args),
}));

describe("listCourses", () => {
  beforeEach(() => {
    findAllCourses.mockReset();
  });

  it("returns all courses from the store", async () => {
    const courses = [
      { id: "course-1", title: "Intro", description: null, createdBy: "actor-1", createdAt: new Date(), updatedAt: new Date() },
    ];
    findAllCourses.mockResolvedValue(courses);

    const { listCourses } = await import("./service");
    const result = await listCourses();

    expect(result).toEqual({ success: true, data: courses });
  });
});
