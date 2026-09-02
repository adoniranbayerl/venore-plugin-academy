import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { listMessageThreads } from "./service";
import type { ListMessageThreadsInput, ListMessageThreadsResult } from "./types";

export async function listMessageThreadsHandler(input: ListMessageThreadsInput): Promise<ListMessageThreadsResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return listMessageThreads({ ...input, actorId: currentUser.data.id });
}
