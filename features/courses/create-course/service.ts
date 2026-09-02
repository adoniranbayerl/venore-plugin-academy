import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { slugify } from "../../../shared/slug";
import { findCourseBySlug, insertCourse } from "./store";
import type { CreateCourseCommand, CreateCourseResult } from "./types";

// Slug parte do título (ou do slug sugerido pelo form) e ganha sufixo numérico só se colidir —
// curso normal nunca leva sufixo, só o raro caso de dois títulos gerando o mesmo slug base.
async function generateUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "curso";
  let candidate = root;
  let attempt = 1;
  while (await findCourseBySlug(candidate)) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createCourse(command: CreateCourseCommand): Promise<CreateCourseResult> {
  const handle = beginOperation({
    useCase: "academy.create-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

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

  const slug = await generateUniqueSlug(command.slug?.trim() || command.title);

  const course = await insertCourse({
    title: command.title,
    description: command.description,
    slug,
    publiclyListed: command.publiclyListed,
    coverMediaId: command.coverMediaId,
    createdBy: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
