import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { getExercisePracticeStats, insertExercisePractice } from "../../../shared/exercise-practice-store";
import { recordPracticeDay } from "../../../shared/practice-streak-store";
import type { RecordExercisePracticeCommand, RecordExercisePracticeResult } from "./types";

// Data (YYYY-MM-DD) do servidor — mesma aproximação de shared/progress-hooks.ts: a ofensiva conta
// dias de calendário, não precisa de fuso exato.
function serverDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordExercisePractice(command: RecordExercisePracticeCommand): Promise<RecordExercisePracticeResult> {
  const handle = beginOperation({
    useCase: "academy.record-exercise-practice",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await insertExercisePractice(command.actorId, command.exerciseKey, command.score);

  // Praticar um exercício também conta como dia de prática (ofensiva). Cosmético — nunca falha o
  // registro do exercício.
  try {
    await recordPracticeDay(command.actorId, serverDay());
  } catch {
    // segue
  }

  const stats = await getExercisePracticeStats(command.actorId, command.exerciseKey);
  endOperation(handle, { success: true });
  return { success: true, data: stats };
}
