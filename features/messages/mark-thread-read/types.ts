import type { OperationResult } from "@venore/plugin-sdk";

export type MarkThreadReadInput = { threadId: string };
export type MarkThreadReadCommand = MarkThreadReadInput & { actorId: string };
export type MarkThreadReadResult = OperationResult<{ threadId: string }>;
