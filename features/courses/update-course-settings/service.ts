import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isValidSlug, slugify } from "../../../shared/slug";
import { applyCourseSettings, findCourseById, findCourseBySlug } from "./store";
import type { UpdateCourseSettingsCommand, UpdateCourseSettingsResult } from "./types";

export async function updateCourseSettings(command: UpdateCourseSettingsCommand): Promise<UpdateCourseSettingsResult> {
  const handle = beginOperation({
    useCase: "academy.update-course-settings",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCourseById(command.id);
  if (!existing) {
    const error = { code: "academy.courses.not_found", message: `Course "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  let slug: string | undefined;
  if (command.slug !== undefined) {
    slug = slugify(command.slug);
    if (!isValidSlug(slug)) {
      const error = { code: "academy.courses.invalid_slug", message: "Slug inválido — use apenas letras, números e hífen." };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
    if (slug !== existing.slug) {
      const conflict = await findCourseBySlug(slug);
      if (conflict && conflict.id !== command.id) {
        const error = { code: "academy.courses.slug_taken", message: `O slug "${slug}" já está em uso por outro curso.` };
        endOperation(handle, { success: false, error });
        return { success: false, error };
      }
    }
  }

  if (command.coverMediaId) {
    const media = await getMediaAsset({ id: command.coverMediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "academy.courses.invalid_cover_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.coverMediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const course = await applyCourseSettings({
    id: command.id,
    slug,
    publiclyListed: command.publiclyListed,
    coverMediaId: command.coverMediaId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
