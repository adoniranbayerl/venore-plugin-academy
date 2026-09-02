import type { ImportReportOutcome } from "@venore/plugin-sdk/import-export";
import type { OperationResult } from "@venore/plugin-sdk";

export type AcademyImportReportLineKind = "course" | "lesson" | "media-asset";

export type AcademyImportReportLine = {
  kind: AcademyImportReportLineKind;
  ref: string;
  outcome: ImportReportOutcome;
  message?: string;
};

export type AcademyImportReport = {
  lines: AcademyImportReportLine[];
  createdCount: number;
  reusedCount: number;
  skippedCount: number;
  failedCount: number;
};

export type ImportCourseBundleCommand = { manifest: unknown; files: Map<string, Buffer>; actorId: string };
export type ImportCourseBundleInput = Omit<ImportCourseBundleCommand, "actorId">;
export type ImportCourseBundleResult = OperationResult<AcademyImportReport>;
