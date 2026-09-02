import { beforeEach, describe, expect, it, vi } from "vitest";

const store = {
  findCoursesWithLessonCount: vi.fn(),
  countEnrollmentsByCourse: vi.fn(),
  completionStatsByCourse: vi.fn(),
  avgQuizScoreByCourse: vi.fn(),
  countPendingReviewsByCourse: vi.fn(),
  countActiveStudents: vi.fn(),
  findRecentPendingSubmissions: vi.fn(),
};
vi.mock("./store", () => store);

const listUsers = vi.fn();
vi.mock("@venore/plugin-sdk/auth", () => ({ listUsers: (...a: unknown[]) => listUsers(...a) }));

describe("getAcademyOverview", () => {
  beforeEach(() => {
    Object.values(store).forEach((fn) => fn.mockReset());
    listUsers.mockReset();
    store.findCoursesWithLessonCount.mockResolvedValue([
      { id: "c1", title: "Teoria", slug: "teoria", status: "public", lessonCount: 4 },
      { id: "c2", title: "Rascunho", slug: "rasc", status: "draft", lessonCount: 0 },
    ]);
    store.countEnrollmentsByCourse.mockResolvedValue([{ courseId: "c1", value: 5 }]);
    store.completionStatsByCourse.mockResolvedValue([
      { courseId: "c1", doneLessonPairs: 10, totalLessonPairs: 20, completedStudents: 2, enrolledStudents: 5 },
    ]);
    store.avgQuizScoreByCourse.mockResolvedValue([{ courseId: "c1", avg: 82 }]);
    store.countPendingReviewsByCourse.mockResolvedValue([{ courseId: "c1", value: 3 }]);
    store.countActiveStudents.mockResolvedValue(5);
    store.findRecentPendingSubmissions.mockResolvedValue([
      { submissionId: "s1", actorId: "u1", submittedAt: new Date(), activityTitle: "Cantar", lessonTitle: "Aula 1", courseId: "c1", courseTitle: "Teoria" },
    ]);
    listUsers.mockResolvedValue({ success: true, data: [{ id: "u1", name: "Ana", email: "ana@x.com" }] });
  });

  it("agrega totais e por curso, com conclusão e nota", async () => {
    const { getAcademyOverview } = await import("./service");
    const result = await getAcademyOverview();
    if (!result.success) throw new Error("esperava sucesso");

    expect(result.data.totals).toEqual({
      courses: 2,
      publishedCourses: 1,
      lessons: 4,
      enrollments: 5,
      activeStudents: 5,
      completedStudents: 2,
      pendingReviews: 3,
    });
    const c1 = result.data.courses.find((c) => c.id === "c1")!;
    expect(c1.completionPercent).toBe(50); // 10 / 20
    expect(c1.completedStudents).toBe(2);
    expect(c1.avgQuizGrade).toBe(8.2); // 82 / 10
    expect(c1.pendingReviews).toBe(3);
    // curso rascunho sem matrícula/aula: conclusão 0, sem divisão por zero
    const c2 = result.data.courses.find((c) => c.id === "c2")!;
    expect(c2.completionPercent).toBe(0);
    expect(c2.completedStudents).toBe(0);
    expect(c2.avgQuizGrade).toBeNull();
  });

  it("resolve o nome do aluno na lista de entregas pendentes", async () => {
    const { getAcademyOverview } = await import("./service");
    const result = await getAcademyOverview();
    if (!result.success) throw new Error("esperava sucesso");
    expect(result.data.pendingSubmissions[0].studentName).toBe("Ana");
  });
});
