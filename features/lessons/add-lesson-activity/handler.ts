import { authorizeActor } from "@venore/plugin-sdk/rbac";
import type { DeliverableFormat } from "../../../contracts/types";
import { addLessonActivity } from "./service";
import type { AddLessonActivityInput, AddLessonActivityResult } from "./types";

const DELIVERABLE_FORMATS: DeliverableFormat[] = ["text", "audio", "image", "pdf", "none"];

export async function addLessonActivityHandler(input: AddLessonActivityInput): Promise<AddLessonActivityResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_title", message: "O título não pode ser vazio." } };
  }

  if (input.instructionsText.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_activities.invalid_instructions", message: "instructionsText não pode ser vazio." },
    };
  }

  if (!DELIVERABLE_FORMATS.includes(input.deliverableFormat)) {
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

  return addLessonActivity({ ...input, actorId: authz.actorId });
}
