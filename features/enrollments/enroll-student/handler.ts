import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { enrollStudent } from "./service";
import type { EnrollStudentInput, EnrollStudentResult } from "./types";

export async function enrollStudentHandler(input: EnrollStudentInput): Promise<EnrollStudentResult> {
  if (input.courseId.trim().length === 0 || input.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.enrollments.invalid_input", message: "courseId e studentActorId não podem ser vazios." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return enrollStudent({ ...input, actorId: authz.actorId });
}
