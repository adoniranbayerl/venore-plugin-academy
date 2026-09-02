import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findCourseById, findEnrollment, insertEnrollment } from "./store";
import type { EnrollSelfCommand, EnrollSelfResult } from "./types";

export async function enrollSelf(command: EnrollSelfCommand): Promise<EnrollSelfResult> {
  const handle = beginOperation({
    useCase: "academy.enroll-self",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const course = await findCourseById(command.courseId);
  if (!course || course.status === "draft") {
    const error = {
      code: "academy.enrollments.course_not_found",
      message: `Course "${command.courseId}" não encontrado.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (course.status !== "public") {
    const error = {
      code: "academy.enrollments.self_enrollment_disabled",
      message: "Este curso não permite matrícula automática. Fale com um administrador.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const existing = await findEnrollment(command.courseId, command.actorId);
  if (existing) {
    const error = { code: "academy.enrollments.already_enrolled", message: "Você já está matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrollment = await insertEnrollment({ courseId: command.courseId, actorId: command.actorId, enrolledBy: "self" });

  endOperation(handle, { success: true });
  return { success: true, data: enrollment };
}
