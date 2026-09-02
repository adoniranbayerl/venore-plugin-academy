import { findCourseCompletion, insertCourseCompletionIfMissing } from "./course-completion-store";
import { loadLessonChain } from "./lesson-progress";
import { recordPracticeDay } from "./practice-streak-store";

// Data (YYYY-MM-DD) do servidor. A ofensiva conta dias de calendário; usar o dia do servidor
// (UTC) é aproximado pra quem está longe do fuso, mas suficiente pra uma ofensiva de prática —
// nada aqui depende de precisão de fuso.
function serverDay(): string {
  return new Date().toISOString().slice(0, 10);
}

// Chamado no fim de TODA mutação de progresso do aluno (marcar leitura/seção, quiz, atividade).
// Dois efeitos "de fundo" que nunca podem quebrar a operação principal:
//  1. registra o dia de prática (ofensiva — get-practice-streak calcula o número depois);
//  2. se a cadeia inteira do curso ficou completa e ainda não há marco, grava "trilha concluída".
//     A partir daí loadLessonChain destrava todas as aulas ("material livre"), de forma sticky.
export async function onProgressAdvanced(actorId: string, courseId: string): Promise<void> {
  try {
    await recordPracticeDay(actorId, serverDay());
  } catch {
    // ofensiva é cosmética — nunca falha a marcação de progresso
  }

  try {
    if (await findCourseCompletion(courseId, actorId)) return;
    const { chain } = await loadLessonChain(courseId, actorId);
    if (chain.length > 0 && chain.every((state) => state.completed && !state.locked)) {
      await insertCourseCompletionIfMissing(courseId, actorId);
    }
  } catch {
    // idem — o marco é gravado na próxima ação se algo falhar aqui
  }
}
