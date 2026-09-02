import { parseExportZip } from "@venore/plugin-sdk/import-export";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS } from "../../../shared/course-bundle-manifest";
import { importCourseBundle } from "./service";
import type { ImportCourseBundleResult } from "./types";

export type ImportCourseBundleHandlerInput = { zipData: Buffer };

// Mesmo gate AND de export-course-bundle (ver comentário lá) — importar grava em academy + cms
// (seções de texto) + media, então exige as mesmas permissions de escrita completas.
export async function importCourseBundleHandler(input: ImportCourseBundleHandlerInput): Promise<ImportCourseBundleResult> {
  let actorId = "";
  for (const permission of ACADEMY_COURSE_BUNDLE_REQUIRED_PERMISSIONS) {
    const authz = await authorizeActor(permission);
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    actorId = authz.actorId;
  }

  let parsedZip: ReturnType<typeof parseExportZip>;
  try {
    parsedZip = parseExportZip(input.zipData);
  } catch (error) {
    return {
      success: false,
      error: {
        code: "academy.import-course-bundle.invalid_zip",
        message: error instanceof Error ? error.message : "Não foi possível ler o arquivo .zip enviado.",
      },
    };
  }

  return importCourseBundle({ manifest: parsedZip.manifest, files: parsedZip.files, actorId });
}
