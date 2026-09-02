import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS } from "../../../shared/course-bundle-manifest";
import { exportCourseBundle } from "./service";
import type { ExportCourseBundleCommand, ExportCourseBundleResult } from "./types";

// authorizeActor só sabe OR entre uma lista de permissions — exportar o pacote (aulas + mídia)
// exige TODAS as permissions envolvidas, uma checagem por vez (ver comentário de
// ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS), mesmo padrão de export-site-bundle/handler.ts em
// contexts/import-export.
export async function exportCourseBundleHandler(command: ExportCourseBundleCommand): Promise<ExportCourseBundleResult> {
  for (const permission of ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS) {
    const authz = await authorizeActor(permission);
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
  }

  return exportCourseBundle(command);
}
