import { beforeEach, describe, expect, it, vi } from "vitest";

const findEnrollmentsByCourse = vi.fn();
vi.mock("./store", () => ({
  findEnrollmentsByCourse: (...args: unknown[]) => findEnrollmentsByCourse(...args),
}));

const listUsers = vi.fn();
vi.mock("@venore/plugin-sdk/auth", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
}));

describe("listEnrollmentsForCourse", () => {
  beforeEach(() => {
    findEnrollmentsByCourse.mockReset();
    listUsers.mockReset();
  });

  it("resolves enrollments with the matching user directory entry", async () => {
    findEnrollmentsByCourse.mockResolvedValue([
      { id: "enrollment-1", courseId: "course-1", actorId: "student-1", enrolledAt: new Date("2026-01-01"), enrolledBy: "self" },
    ]);
    listUsers.mockResolvedValue({
      success: true,
      data: [{ id: "student-1", name: "Aluno Um", email: "aluno@example.com", status: "active" }],
    });

    const { listEnrollmentsForCourse } = await import("./service");
    const result = await listEnrollmentsForCourse({ courseId: "course-1" });

    expect(result).toEqual({
      success: true,
      data: [
        { actorId: "student-1", name: "Aluno Um", email: "aluno@example.com", enrolledAt: new Date("2026-01-01"), enrolledBy: "self" },
      ],
    });
  });

  it("falls back to null name/email when the user directory lookup fails", async () => {
    findEnrollmentsByCourse.mockResolvedValue([
      { id: "enrollment-1", courseId: "course-1", actorId: "student-1", enrolledAt: new Date("2026-01-01"), enrolledBy: "self" },
    ]);
    listUsers.mockResolvedValue({ success: false, error: { code: "err", message: "boom" } });

    const { listEnrollmentsForCourse } = await import("./service");
    const result = await listEnrollmentsForCourse({ courseId: "course-1" });

    expect(result).toEqual({
      success: true,
      data: [{ actorId: "student-1", name: null, email: null, enrolledAt: new Date("2026-01-01"), enrolledBy: "self" }],
    });
  });
});
