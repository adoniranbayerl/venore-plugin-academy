import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type UpdateCourseSettingsCommand = {
  id: string;
  slug?: string;
  publiclyListed: boolean;
  // null limpa a capa; undefined não toca no campo (form de configurações sempre reenvia os dois
  // outros campos boolean, então coverMediaId também é sempre resubmetido — null quando o usuário
  // removeu a mídia selecionada no picker).
  coverMediaId?: string | null;
  actorId: string;
};
export type UpdateCourseSettingsInput = Omit<UpdateCourseSettingsCommand, "actorId">;
export type UpdateCourseSettingsResult = OperationResult<CourseRecord>;
