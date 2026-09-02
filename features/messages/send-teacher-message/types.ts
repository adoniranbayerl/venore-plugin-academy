import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageRecord, LessonMessageThreadType } from "../../../contracts/types";

// type opcional — só é lido quando a conversa ainda não existe (professor abrindo uma correção
// sem pergunta prévia do aluno); se já existe, o type da conversa existente prevalece.
export type SendTeacherMessageInput = {
  lessonId: string;
  stepKey: string;
  studentActorId: string;
  type?: LessonMessageThreadType;
  body: string;
};
export type SendTeacherMessageCommand = SendTeacherMessageInput & { actorId: string };
export type SendTeacherMessageResult = OperationResult<{ threadId: string; message: LessonMessageRecord }>;
