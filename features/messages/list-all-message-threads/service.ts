import { findAllThreads } from "../../../shared/lesson-messages-store";
import type { ListAllMessageThreadsResult } from "./types";

export async function listAllMessageThreads(): Promise<ListAllMessageThreadsResult> {
  const threads = await findAllThreads();
  return { success: true, data: threads };
}
