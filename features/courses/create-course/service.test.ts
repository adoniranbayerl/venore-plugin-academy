import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMedia = vi.fn();

vi.mock("@venore/plugin-sdk/media", () => ({
  getMedia: (...args: unknown[]) => getMedia(...args),
}));

const insertCourse = vi.fn();
const findCourseBySlug = vi.fn();

vi.mock("./store", () => ({
  insertCourse: (...args: unknown[]) => insertCourse(...args),
  findCourseBySlug: (...args: unknown[]) => findCourseBySlug(...args),
}));

describe("createCourse", () => {
  beforeEach(() => {
    insertCourse.mockReset();
    findCourseBySlug.mockReset();
    findCourseBySlug.mockResolvedValue(null);
  });

  it("creates the course recording the actor as createdBy and a slug from the title", async () => {
    insertCourse.mockResolvedValue({
      id: "course-1",
      title: "Intro",
      description: null,
      slug: "intro",
      createdBy: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createCourse } = await import("./service");
    const result = await createCourse({ title: "Intro", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(insertCourse).toHaveBeenCalledWith({
      title: "Intro",
      description: undefined,
      slug: "intro",
      publiclyListed: undefined,
      createdBy: "actor-1",
    });
  });

  it("appends a numeric suffix when the generated slug already exists", async () => {
    findCourseBySlug.mockImplementation(async (slug: string) => (slug === "intro" ? { id: "other" } : null));
    insertCourse.mockResolvedValue({ id: "course-2", title: "Intro", slug: "intro-2" });

    const { createCourse } = await import("./service");
    await createCourse({ title: "Intro", actorId: "actor-1" });

    expect(insertCourse).toHaveBeenCalledWith(expect.objectContaining({ slug: "intro-2" }));
  });
});
