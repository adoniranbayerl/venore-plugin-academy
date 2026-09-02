import type { OperationResult } from "@venore/plugin-sdk";
import type { AcademyCourseBundleManifest } from "../../../shared/course-bundle-manifest";

export type ExportCourseBundleCommand = { courseId: string };
export type ExportCourseBundleAssetFile = { path: string; data: Buffer };
export type ExportCourseBundleData = { manifest: AcademyCourseBundleManifest; files: ExportCourseBundleAssetFile[] };
export type ExportCourseBundleResult = OperationResult<ExportCourseBundleData>;
