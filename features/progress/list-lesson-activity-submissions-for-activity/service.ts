import { listUsers } from "@venore/plugin-sdk/auth";
import { findSubmissionsByActivity } from "./store";
import { toLessonActivitySubmissionView } from "./view";
import type {
  ListLessonActivitySubmissionsForActivityQuery,
  ListLessonActivitySubmissionsForActivityResult,
} from "./types";

// Compõe submissions (academy) com o diretório de usuários (auth) pra resolver nome/email por
// actorId — mesmo padrão de list-enrollments-for-course/service.ts (regra 10, service público de
// outro context via barrel).
export async function listLessonActivitySubmissionsForActivity(
  query: ListLessonActivitySubmissionsForActivityQuery,
): Promise<ListLessonActivitySubmissionsForActivityResult> {
  const [submissions, usersResult] = await Promise.all([findSubmissionsByActivity(query.activityId), listUsers()]);

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  return {
    success: true,
    data: submissions.map((submission) => toLessonActivitySubmissionView(submission, usersById.get(submission.actorId))),
  };
}
