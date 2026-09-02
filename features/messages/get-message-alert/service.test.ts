import { beforeEach, describe, expect, it, vi } from "vitest";

const findAllThreads = vi.fn();
const findThreadsByStudent = vi.fn();

vi.mock("../../../shared/lesson-messages-store", () => ({
  findAllThreads: (...args: unknown[]) => findAllThreads(...args),
  findThreadsByStudent: (...args: unknown[]) => findThreadsByStudent(...args),
}));

import { getMessageAlert } from "./service";

describe("getMessageAlert", () => {
  beforeEach(() => {
    findAllThreads.mockReset();
    findThreadsByStudent.mockReset();
  });

  it("retorna null quando professor não tem nenhuma thread não-lida", async () => {
    findAllThreads.mockResolvedValue([{ unreadCount: 0 }]);

    const result = await getMessageAlert({ actorId: "teacher-1", isTeacher: true });

    expect(result).toEqual({ success: true, data: null });
  });

  it("soma o não-lido de todos os cursos e aponta pra página administrativa quando é professor", async () => {
    findAllThreads.mockResolvedValue([{ unreadCount: 2 }, { unreadCount: 1 }]);

    const result = await getMessageAlert({ actorId: "teacher-1", isTeacher: true });

    expect(result).toEqual({ success: true, data: { count: 3, href: "/admin/academy/messages", label: "3 novas mensagens" } });
  });

  it("retorna null quando aluno não tem nenhuma thread não-lida", async () => {
    findThreadsByStudent.mockResolvedValue([{ unreadCount: 0, courseSlug: "piano", lessonId: "l1", stepKey: "quiz", type: "question" }]);

    const result = await getMessageAlert({ actorId: "student-1", isTeacher: false });

    expect(result).toEqual({ success: true, data: null });
  });

  it("aponta pra etapa da thread não-lida mais recente do aluno, somando o total não-lido", async () => {
    findThreadsByStudent.mockResolvedValue([
      { unreadCount: 1, courseSlug: "piano", lessonId: "lesson-2", stepKey: "quiz", type: "correction" },
      { unreadCount: 2, courseSlug: "piano", lessonId: "lesson-1", stepKey: "activity", type: "question" },
    ]);

    const result = await getMessageAlert({ actorId: "student-1", isTeacher: false });

    expect(result).toEqual({
      success: true,
      data: { count: 3, href: "/academy/piano/lesson-2?openThread=quiz&openThreadType=correction", label: "3 novas mensagens" },
    });
  });
});
