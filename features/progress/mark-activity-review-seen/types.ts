import type { OperationResult } from "@venore/plugin-sdk";

export type MarkActivityReviewSeenCommand = { activityId: string; actorId: string };
export type MarkActivityReviewSeenInput = Omit<MarkActivityReviewSeenCommand, "actorId">;
export type MarkActivityReviewSeenResult = OperationResult<{ activityId: string }>;
