"use server";

import { revalidatePath } from "next/cache";
import { enrollSelf } from "../../index";
import { isPluginActive } from "@venore/plugin-sdk";

export type EnrollSelfActionState = { error: string | null };

// Checagem de plugin ativo (Fase 6) antes de delegar: esta Server Action é invocável direto, sem
// passar pelo gate da página (get-academy-course-access.ts) que a renderiza.
export async function enrollSelfAction(
  _prevState: EnrollSelfActionState,
  formData: FormData,
): Promise<EnrollSelfActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: "O plugin Academy está desabilitado." };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await enrollSelf({ courseId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/academy/${courseSlug}`);
  revalidatePath("/academy");
  return { error: null };
}
