import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export type ReviewLessonActivitySubmissionCommand = {
  id: string;
  reviewStatus: "approved" | "needs_revision" | "rejected";
  reviewFeedback?: string;
  // Nota de 0 a 10 (pedido desta sessão) — opcional, independente de reviewStatus.
  reviewScore?: number;
  actorId: string;
};
export type ReviewLessonActivitySubmissionInput = Omit<ReviewLessonActivitySubmissionCommand, "actorId">;
export type ReviewLessonActivitySubmissionResult = OperationResult<LessonActivitySubmissionRecord>;
