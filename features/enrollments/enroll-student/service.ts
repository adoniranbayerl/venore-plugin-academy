import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findCourseById, findEnrollment, insertEnrollment } from "./store";
import type { EnrollStudentCommand, EnrollStudentResult } from "./types";

// Matrícula manual (professor/admin) — funciona independente de course.status (inclusive
// restricted, cujo único jeito de matricular é este), diferente de enroll-self (docs/venore-
// docks.md, item 2 do pedido desta sessão).
export async function enrollStudent(command: EnrollStudentCommand): Promise<EnrollStudentResult> {
  const handle = beginOperation({
    useCase: "academy.enroll-student",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const course = await findCourseById(command.courseId);
  if (!course) {
    const error = {
      code: "academy.enrollments.course_not_found",
      message: `Course "${command.courseId}" não encontrado.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const existing = await findEnrollment(command.courseId, command.studentActorId);
  if (existing) {
    const error = { code: "academy.enrollments.already_enrolled", message: "Este aluno já está matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrollment = await insertEnrollment({
    courseId: command.courseId,
    actorId: command.studentActorId,
    enrolledBy: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: enrollment };
}
