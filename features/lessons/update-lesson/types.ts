import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord } from "../../../contracts/types";

export type UpdateLessonCommand = {
  id: string;
  title?: string;
  // null limpa o corpo; undefined não toca no campo.
  body?: string | null;
  // null limpa a URL do vídeo; undefined não toca no campo.
  videoUrl?: string | null;
  // null limpa a capa; undefined não toca no campo.
  coverMediaId?: string | null;
  actorId: string;
};
export type UpdateLessonInput = Omit<UpdateLessonCommand, "actorId">;
export type UpdateLessonResult = OperationResult<LessonRecord>;
