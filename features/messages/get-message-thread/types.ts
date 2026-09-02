import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageRecord, LessonMessageThreadRecord } from "../../../contracts/types";

export type GetMessageThreadInput = { lessonId: string; stepKey: string };
export type GetMessageThreadQuery = GetMessageThreadInput & { actorId: string };

// thread null = conversa ainda não começou (nenhum dos dois lados mandou nada nesta etapa ainda)
// — não é erro, é o estado normal antes do primeiro "tirar dúvida"/"viu algo errado".
export type MessageThreadWithMessages = { thread: LessonMessageThreadRecord | null; messages: LessonMessageRecord[] };
export type GetMessageThreadResult = OperationResult<MessageThreadWithMessages>;
