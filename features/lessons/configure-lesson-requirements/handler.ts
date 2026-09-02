import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { configureLessonRequirements } from "./service";
import type { ConfigureLessonRequirementsInput, ConfigureLessonRequirementsResult } from "./types";

export async function configureLessonRequirementsHandler(
  input: ConfigureLessonRequirementsInput,
): Promise<ConfigureLessonRequirementsResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.quizEnabled) {
    if (
      input.quizPassThresholdPercent === undefined ||
      input.quizPassThresholdPercent < 1 ||
      input.quizPassThresholdPercent > 100
    ) {
      return {
        success: false,
        error: {
          code: "academy.lessons.invalid_quiz_pass_threshold",
          message: "quizPassThresholdPercent precisa estar entre 1 e 100 quando quizEnabled é true.",
        },
      };
    }

    if (input.quizMaxAttempts === undefined || input.quizMaxAttempts < 1) {
      return {
        success: false,
        error: {
          code: "academy.lessons.invalid_quiz_max_attempts",
          message: "quizMaxAttempts precisa ser >= 1 quando quizEnabled é true.",
        },
      };
    }
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return configureLessonRequirements({ ...input, actorId: authz.actorId });
}
