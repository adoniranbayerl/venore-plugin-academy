import { findThreadsByStudent } from "../../../shared/lesson-messages-store";
import type { ListMessageThreadsQuery, ListMessageThreadsResult } from "./types";

export async function listMessageThreads(query: ListMessageThreadsQuery): Promise<ListMessageThreadsResult> {
  const threads = await findThreadsByStudent(query.actorId, { lessonId: query.lessonId });
  return { success: true, data: threads };
}
