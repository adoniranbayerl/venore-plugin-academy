import type { OperationResult } from "@venore/plugin-sdk";

export type ActivityReviewAlert = { count: number; href: string; label: string };
export type GetActivityReviewAlertInput = { actorId: string; isTeacher: boolean };
export type GetActivityReviewAlertResult = OperationResult<ActivityReviewAlert | null>;
