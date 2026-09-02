import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getPracticeStreak } from "./service";
import type { GetPracticeStreakResult } from "./types";

// Roda pra qualquer aluno autenticado — é dado próprio (a ofensiva dele), sem checagem de
// permissão. Mesmo padrão de get-course-progress/handler.ts.
export async function getPracticeStreakHandler(): Promise<GetPracticeStreakResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return getPracticeStreak({ actorId: currentUser.data.id });
}
