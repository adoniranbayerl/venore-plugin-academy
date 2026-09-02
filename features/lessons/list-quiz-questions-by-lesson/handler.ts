import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listQuizQuestionsByLesson } from "./service";
import type { ListQuizQuestionsByLessonQuery, ListQuizQuestionsByLessonResult } from "./types";

export async function listQuizQuestionsByLessonHandler(
  query: ListQuizQuestionsByLessonQuery,
): Promise<ListQuizQuestionsByLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listQuizQuestionsByLesson(query);
}
