import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnseenReviewedSubmissionsByStudent = vi.fn();

vi.mock("../../../shared/activity-review-store", () => ({
  findUnseenReviewedSubmissionsByStudent: (...args: unknown[]) => findUnseenReviewedSubmissionsByStudent(...args),
}));

import { getActivityReviewAlert } from "./service";

describe("getActivityReviewAlert", () => {
  beforeEach(() => {
    findUnseenReviewedSubmissionsByStudent.mockReset();
  });

  it("retorna null pro professor, sem nem consultar o banco", async () => {
    const result = await getActivityReviewAlert({ actorId: "teacher-1", isTeacher: true });

    expect(result).toEqual({ success: true, data: null });
    expect(findUnseenReviewedSubmissionsByStudent).not.toHaveBeenCalled();
  });

  it("retorna null quando o aluno não tem nenhuma revisão não-vista", async () => {
    findUnseenReviewedSubmissionsByStudent.mockResolvedValue([]);

    const result = await getActivityReviewAlert({ actorId: "student-1", isTeacher: false });

    expect(result).toEqual({ success: true, data: null });
  });

  it("aponta pra etapa de atividade da aula mais recentemente revisada, no singular", async () => {
    findUnseenReviewedSubmissionsByStudent.mockResolvedValue([
      { activityId: "a1", activityTitle: "Escala", lessonId: "lesson-1", lessonTitle: "Aula 1", courseSlug: "piano", reviewStatus: "approved", reviewedAt: new Date() },
    ]);

    const result = await getActivityReviewAlert({ actorId: "student-1", isTeacher: false });

    expect(result).toEqual({
      success: true,
      data: { count: 1, href: "/academy/piano/lesson-1?openThread=activity", label: "Atividade avaliada" },
    });
  });

  it("soma o total quando há mais de uma revisão não-vista, no plural", async () => {
    findUnseenReviewedSubmissionsByStudent.mockResolvedValue([
      { activityId: "a1", activityTitle: "Escala", lessonId: "lesson-2", lessonTitle: "Aula 2", courseSlug: "piano", reviewStatus: "needs_revision", reviewedAt: new Date() },
      { activityId: "a2", activityTitle: "Acorde", lessonId: "lesson-1", lessonTitle: "Aula 1", courseSlug: "piano", reviewStatus: "approved", reviewedAt: new Date() },
    ]);

    const result = await getActivityReviewAlert({ actorId: "student-1", isTeacher: false });

    expect(result).toEqual({
      success: true,
      data: { count: 2, href: "/academy/piano/lesson-2?openThread=activity", label: "2 atividades avaliadas" },
    });
  });
});
