import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteEnrollmentById, findEnrollment } from "./store";
import type { UnenrollStudentCommand, UnenrollStudentResult } from "./types";

export async function unenrollStudent(command: UnenrollStudentCommand): Promise<UnenrollStudentResult> {
  const handle = beginOperation({
    useCase: "academy.unenroll-student",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const enrollment = await findEnrollment(command.courseId, command.studentActorId);
  if (!enrollment) {
    const error = {
      code: "academy.enrollments.not_found",
      message: "Este aluno não está matriculado neste curso.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteEnrollmentById(enrollment.id);

  endOperation(handle, { success: true });
  return { success: true, data: enrollment };
}
