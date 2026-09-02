import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

// "draft" não passa por aqui — voltar a rascunho é unpublish-course (sem validação de conteúdo).
export type PublishCourseTargetStatus = "restricted" | "public";

export type PublishCourseCommand = { id: string; status: PublishCourseTargetStatus; actorId: string };
export type PublishCourseInput = Omit<PublishCourseCommand, "actorId">;
export type PublishCourseResult = OperationResult<CourseRecord>;
