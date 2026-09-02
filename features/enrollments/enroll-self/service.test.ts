import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const findEnrollment = vi.fn();
const insertEnrollment = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  insertEnrollment: (...args: unknown[]) => insertEnrollment(...args),
}));

const publicCourse = { id: "course-1", status: "public" };

describe("enrollSelf", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    findEnrollment.mockReset();
    insertEnrollment.mockReset();
  });

  it("enrolls the actor when the course exists and is public", async () => {
    findCourseById.mockResolvedValue(publicCourse);
    findEnrollment.mockResolvedValue(null);
    insertEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "actor-1", enrolledBy: "self" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: true,
      data: { id: "enrollment-1", courseId: "course-1", actorId: "actor-1", enrolledBy: "self" },
    });
    expect(insertEnrollment).toHaveBeenCalledWith({ courseId: "course-1", actorId: "actor-1", enrolledBy: "self" });
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.course_not_found", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the course is a draft", async () => {
    findCourseById.mockResolvedValue({ ...publicCourse, status: "draft" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.course_not_found", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the course is restricted (self-enrollment disabled)", async () => {
    findCourseById.mockResolvedValue({ ...publicCourse, status: "restricted" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.self_enrollment_disabled", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the actor is already enrolled", async () => {
    findCourseById.mockResolvedValue(publicCourse);
    findEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "actor-1" });

    const { enrollSelf } = await import("./service");
    const result = await enrollSelf({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.already_enrolled", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });
});
