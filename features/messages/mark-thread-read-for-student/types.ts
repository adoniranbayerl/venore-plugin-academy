import type { OperationResult } from "@venore/plugin-sdk";

export type MarkThreadReadForStudentInput = { threadId: string };
export type MarkThreadReadForStudentResult = OperationResult<{ threadId: string }>;
