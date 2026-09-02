import { beforeEach, describe, expect, it, vi } from "vitest";

const findPublicListedCourses = vi.fn();
vi.mock("./store", () => ({
  findPublicListedCourses: (...args: unknown[]) => findPublicListedCourses(...args),
}));

describe("listPublicCourses", () => {
  beforeEach(() => {
    findPublicListedCourses.mockReset();
  });

  it("returns the public listed courses found", async () => {
    const courses = [{ id: "course-1", title: "Curso 1", status: "public", publiclyListed: true }];
    findPublicListedCourses.mockResolvedValue(courses);

    const { listPublicCourses } = await import("./service");
    const result = await listPublicCourses();

    expect(result).toEqual({ success: true, data: courses });
  });

  it("returns an empty list when no course is public and listed", async () => {
    findPublicListedCourses.mockResolvedValue([]);

    const { listPublicCourses } = await import("./service");
    const result = await listPublicCourses();

    expect(result).toEqual({ success: true, data: [] });
  });
});
