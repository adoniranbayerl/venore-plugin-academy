import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { recordExercisePractice } from "./service";
import type { RecordExercisePracticeInput, RecordExercisePracticeResult } from "./types";

// Roda pra qualquer aluno autenticado — é dado próprio (as repetições dele), sem checagem de
// permissão. Mesmo padrão de get-practice-streak/handler.ts.
export async function recordExercisePracticeHandler(input: RecordExercisePracticeInput): Promise<RecordExercisePracticeResult> {
  const exerciseKey = input.exerciseKey?.trim() ?? "";
  if (exerciseKey.length === 0 || exerciseKey.length > 200) {
    return { success: false, error: { code: "academy.exercise_practice.invalid_key", message: "Exercício inválido." } };
  }

  let score: number | null = null;
  if (input.score !== null && input.score !== undefined) {
    if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
      return { success: false, error: { code: "academy.exercise_practice.invalid_score", message: "Nota fora do intervalo 0–100." } };
    }
    score = Math.round(input.score);
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return recordExercisePractice({ actorId: currentUser.data.id, exerciseKey, score });
}
