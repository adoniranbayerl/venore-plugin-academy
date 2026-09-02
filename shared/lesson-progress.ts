import { computeLessonChain, type LessonChainFacts, type LessonChainState } from "./lesson-chain";
import { loadLessonChainRawData, type LessonChainRawData } from "./lesson-chain-store";
import { findCourseCompletion } from "./course-completion-store";
import type { LessonRecord } from "../contracts/types";

export {
  findLessonRequirements,
  findCompletedSectionIds,
  insertSectionCompletionIfMissing,
  findCompletedMaterialIds,
  insertMaterialCompletionIfMissing,
} from "./lesson-progress-store";

// `trailFreed`: o aluno já concluiu a trilha inteira uma vez (marco sticky em course_completions),
// então TODAS as aulas ficam destravadas — "material livre" (pedido do dono: trilha primeiro,
// livre depois). Continua completo/destravado mesmo que uma aula volte a ficar incompleta depois.
export type LessonChain = LessonChainRawData & { chain: LessonChainState[]; trailFreed: boolean };

// Carrega os fatos da cadeia inteira do curso em lote e aplica a regra pura (lesson-chain.ts).
// Usado tanto por isLessonAccessible (fronteira de autorização) quanto por get-course-progress
// (tela) — mesma função, mesmos dados, sem chance de divergir.
export async function loadLessonChain(courseId: string, actorId: string): Promise<LessonChain> {
  const raw = await loadLessonChainRawData(courseId, actorId);

  if (raw.lessons.length > 0 && (await findCourseCompletion(courseId, actorId))) {
    return {
      ...raw,
      trailFreed: true,
      chain: raw.lessons.map((lesson) => ({ lessonId: lesson.id, completed: true, locked: false })),
    };
  }

  const facts: LessonChainFacts[] = raw.lessons.map((lesson) => {
    const requirements = raw.requirementsByLessonId.get(lesson.id) ?? null;
    const attempts = raw.attemptsByLessonId.get(lesson.id) ?? [];
    const activityIds = raw.activityIdsByLessonId.get(lesson.id) ?? [];

    return {
      lessonId: lesson.id,
      readTextEnabled: requirements?.readTextEnabled ?? false,
      textRead: raw.textCompletedLessonIds.has(lesson.id),
      watchVideoEnabled: requirements?.watchVideoEnabled ?? false,
      videoWatched: raw.videoCompletedLessonIds.has(lesson.id),
      quizEnabled: requirements?.quizEnabled ?? false,
      quizPassed: attempts.some((attempt) => attempt.passed),
      activityEnabled: requirements?.activityEnabled ?? false,
      activitiesSubmitted: activityIds.every((id) => raw.submittedActivityIds.has(id)),
    };
  });

  return { ...raw, trailFreed: false, chain: computeLessonChain(facts) };
}

// FRONTEIRA DE SEGURANÇA — autoriza mark-text-read, mark-video-watched, submit-quiz-attempt e
// list-quiz-questions-for-student. Assinatura preservada de propósito: os quatro call sites não
// precisam saber que por baixo isso agora carrega a cadeia inteira em lote em vez de andar
// aula a aula.
export async function isLessonAccessible(lesson: LessonRecord, actorId: string): Promise<boolean> {
  const { chain } = await loadLessonChain(lesson.courseId, actorId);
  const state = chain.find((s) => s.lessonId === lesson.id);
  // Não deveria acontecer (lesson.courseId sempre bate com a própria lesson), mas se acontecer,
  // negar acesso é o lado seguro.
  return state ? !state.locked : false;
}
