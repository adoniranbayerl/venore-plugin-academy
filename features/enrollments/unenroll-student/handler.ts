import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { unenrollStudent } from "./service";
import type { UnenrollStudentInput, UnenrollStudentResult } from "./types";

export async function unenrollStudentHandler(input: UnenrollStudentInput): Promise<UnenrollStudentResult> {
  if (input.courseId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.enrollments.invalid_course_id", message: "courseId não pode ser vazio." },
    };
  }

  if (input.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.enrollments.invalid_student_actor_id", message: "studentActorId não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return unenrollStudent({ ...input, actorId: authz.actorId });
}
