import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const deleteEntry = vi.fn();
vi.mock("@venore/plugin-sdk/cms", () => ({ deleteEntry: (...args: unknown[]) => deleteEntry(...args) }));

const findCourseById = vi.fn();
const collectSectionCmsEntryIds = vi.fn();
const deleteCourse = vi.fn();
vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  collectSectionCmsEntryIds: (...args: unknown[]) => collectSectionCmsEntryIds(...args),
  deleteCourse: (...args: unknown[]) => deleteCourse(...args),
}));

describe("deleteCourseService", () => {
  beforeEach(() => {
    findCourseById.mockReset().mockResolvedValue({ id: "course-1", title: "Curso" });
    collectSectionCmsEntryIds.mockReset().mockResolvedValue(["entry-a", "entry-b"]);
    deleteCourse.mockReset().mockResolvedValue(undefined);
    deleteEntry.mockReset().mockResolvedValue({ success: true, data: {} });
  });

  it("falha quando o curso não existe, sem apagar nada", async () => {
    findCourseById.mockResolvedValue(null);
    const { deleteCourseService } = await import("./service");
    const result = await deleteCourseService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.courses.not_found", message: expect.any(String) } });
    expect(deleteCourse).not.toHaveBeenCalled();
  });

  it("apaga o curso e limpa as entries de CMS das seções", async () => {
    const { deleteCourseService } = await import("./service");
    const result = await deleteCourseService({ id: "course-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "course-1" } });
    expect(deleteCourse).toHaveBeenCalledWith("course-1");
    expect(deleteEntry).toHaveBeenCalledWith({ id: "entry-a" });
    expect(deleteEntry).toHaveBeenCalledWith({ id: "entry-b" });
  });

  it("não deixa uma falha na limpeza de entry derrubar o delete do curso", async () => {
    deleteEntry.mockRejectedValue(new Error("cms down"));
    const { deleteCourseService } = await import("./service");
    const result = await deleteCourseService({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(deleteCourse).toHaveBeenCalledWith("course-1");
  });
});
