"use server";

import { revalidatePath } from "next/cache";
import { createCourse } from "../../index";
import { isPluginActive } from "@venore/plugin-sdk";

export type AcademyActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md). Checagem de plugin
// ativo (Fase 6) repetida em cada Server Action porque ela é invocável direto, sem passar pela
// página/gate que a lista — authorizeActor sozinho não sabe que o plugin foi desabilitado.
export async function createCourseAction(_prevState: AcademyActionState, formData: FormData): Promise<AcademyActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: "O plugin Academy está desabilitado." };
  }

  const result = await createCourse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    slug: String(formData.get("slug") ?? "") || undefined,
    publiclyListed: formData.get("publiclyListed") === "on",
    coverMediaId: String(formData.get("coverMediaId") ?? "").trim() || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  return { error: null };
}
