import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getAcademyOverview } from "./service";
import type { GetAcademyOverviewResult } from "./types";

// Painel do admin (/admin) — leitura agregada de todos os cursos. Mesma permission da seção
// /admin/academy.
export async function getAcademyOverviewHandler(): Promise<GetAcademyOverviewResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return getAcademyOverview();
}
