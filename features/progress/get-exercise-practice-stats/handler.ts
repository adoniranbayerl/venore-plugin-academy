import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getExercisePracticeStats } from "./service";
import type { GetExercisePracticeStatsInput, GetExercisePracticeStatsResult } from "./types";

// Leitura de dado próprio, sem checagem de permissão. Chamado pelo renderer do bloco
// academy.notation.sheet para mostrar "praticado Nx · recorde X%" antes da 1ª tentativa da sessão.
// Sem sessão (preview/anônimo) devolve zeros em vez de erro — o bloco simplesmente não mostra nada.
export async function getExercisePracticeStatsHandler(
  input: GetExercisePracticeStatsInput,
): Promise<GetExercisePracticeStatsResult> {
  const exerciseKey = input.exerciseKey?.trim() ?? "";
  if (exerciseKey.length === 0) {
    return { success: true, data: { count: 0, bestScore: null } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: true, data: { count: 0, bestScore: null } };
  }

  return getExercisePracticeStats({ actorId: currentUser.data.id, exerciseKey });
}
