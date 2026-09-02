"use server";

import { revalidatePath } from "next/cache";
import { enrollSelfHandler as enrollSelf } from "../features/enrollments/enroll-self/handler";
import { recordExercisePracticeHandler } from "../features/progress/record-exercise-practice/handler";
import type { RecordExercisePracticeResult } from "../features/progress/record-exercise-practice/types";

export type AcademyEnrollActionState = { error: string | null };

export async function academyEnrollAction(
  _prevState: AcademyEnrollActionState,
  formData: FormData,
): Promise<AcademyEnrollActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const result = await enrollSelf({ courseId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/academy/${slug}`);
  return { error: null };
}

// Registra uma tentativa concluída de "Cantar junto" e devolve a contagem/recorde atualizados
// (gamificação — contador de repetições por exercício). Chamado pelo SingAlongPractice ao fim de
// cada tentativa.
export async function recordExercisePracticeAction(input: {
  exerciseKey: string;
  score: number | null;
}): Promise<RecordExercisePracticeResult> {
  return recordExercisePracticeHandler(input);
}
