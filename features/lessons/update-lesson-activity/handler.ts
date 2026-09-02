import { authorizeActor } from "@venore/plugin-sdk/rbac";
import type { DeliverableFormat } from "../../../contracts/types";
import { updateLessonActivityService } from "./service";
import type { UpdateLessonActivityInput, UpdateLessonActivityResult } from "./types";

const DELIVERABLE_FORMATS: DeliverableFormat[] = ["text", "audio", "image", "pdf", "none"];

export async function updateLessonActivityHandler(input: UpdateLessonActivityInput): Promise<UpdateLessonActivityResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_id", message: "id não pode ser vazio." } };
  }

  if (input.title !== undefined && input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_title", message: "O título não pode ser vazio." } };
  }

  if (input.instructionsText !== undefined && input.instructionsText.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_activities.invalid_instructions", message: "instructionsText não pode ser vazio." },
    };
  }

  if (input.deliverableFormat !== undefined && !DELIVERABLE_FORMATS.includes(input.deliverableFormat)) {
    return {
      success: false,
      error: {
        code: "academy.lesson_activities.invalid_deliverable_format",
        message: `deliverableFormat precisa ser um de: ${DELIVERABLE_FORMATS.join(", ")}.`,
      },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateLessonActivityService({ ...input, actorId: authz.actorId });
}
