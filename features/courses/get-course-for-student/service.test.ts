import { beforeEach, describe, expect, it, vi } from "vitest";

const findVisibleCourseById = vi.fn();
const findVisibleCourseBySlug = vi.fn();

vi.mock("./store", () => ({
  findVisibleCourseById: (...args: unknown[]) => findVisibleCourseById(...args),
  findVisibleCourseBySlug: (...args: unknown[]) => findVisibleCourseBySlug(...args),
}));

describe("getCourseForStudent", () => {
  beforeEach(() => {
    findVisibleCourseById.mockReset();
    findVisibleCourseBySlug.mockReset();
  });

  it("returns the course when it exists and is not a draft", async () => {
    const course = {
      id: "course-1",
      title: "Intro",
      description: null,
      status: "restricted",
      createdBy: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findVisibleCourseById.mockResolvedValue(course);

    const { getCourseForStudent } = await import("./service");
    const result = await getCourseForStudent({ id: "course-1" });

    expect(result).toEqual({ success: true, data: course });
  });

  it("returns null data for a draft or missing course, never leaking it", async () => {
    findVisibleCourseById.mockResolvedValue(null);

    const { getCourseForStudent } = await import("./service");
    const result = await getCourseForStudent({ id: "draft-course" });

    expect(result).toEqual({ success: true, data: null });
  });

  it("resolves by slug when the query carries a slug", async () => {
    const course = { id: "course-1", slug: "intro", status: "public" };
    findVisibleCourseBySlug.mockResolvedValue(course);

    const { getCourseForStudent } = await import("./service");
    const result = await getCourseForStudent({ slug: "intro" });

    expect(result).toEqual({ success: true, data: course });
    expect(findVisibleCourseBySlug).toHaveBeenCalledWith("intro");
    expect(findVisibleCourseById).not.toHaveBeenCalled();
  });
});
