import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageThreadWithContext } from "../../../shared/lesson-messages-store";

// lessonId ausente = inbox inteira (/academy/messages, cross-curso); presente = só as conversas
// daquela aula (pontinho de não-lida por etapa em lesson-step-flow.tsx, sem 1 ida ao banco por
// etapa).
export type ListMessageThreadsInput = { lessonId?: string };
export type ListMessageThreadsQuery = ListMessageThreadsInput & { actorId: string };
export type ListMessageThreadsResult = OperationResult<LessonMessageThreadWithContext[]>;
