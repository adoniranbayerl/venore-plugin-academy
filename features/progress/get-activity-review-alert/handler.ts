import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getActivityReviewAlert } from "./service";
import type { GetActivityReviewAlertResult } from "./types";

// Mesmo raciocínio de get-message-alert/handler.ts: roda pra qualquer ator autenticado, nunca
// retorna erro de permissão — vira o badge do header (platform/notifications/notification-registry.ts).
export async function getActivityReviewAlertHandler(): Promise<GetActivityReviewAlertResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: true, data: null };
  }

  const authz = await authorizeActor("academy.courses.manage");
  return getActivityReviewAlert({ actorId: currentUser.data.id, isTeacher: authz.authorized });
}
