import { isEnrolled } from "../../../shared/enrollment";
import { loadLessonChain } from "../../../shared/lesson-progress";
import { findCourseById } from "./store";
import { toLessonProgressView } from "./view";
import type { GetCourseProgressQuery, GetCourseProgressResult, LessonProgressView } from "./types";

// "Progresso" só faz sentido pra quem está matriculado — visualização de professor (sem
// matrícula) usa listLessonsByCourse/getLesson (barrel admin) em vez desta função (plano da
// sessão de matrícula, item 4).
export async function getCourseProgress(query: GetCourseProgressQuery): Promise<GetCourseProgressResult> {
  const course = await findCourseById(query.courseId);
  if (!course) {
    return { success: false, error: { code: "academy.courses.not_found", message: `Course "${query.courseId}" não encontrado.` } };
  }

  const enrolled = await isEnrolled(query.courseId, query.actorId);
  if (!enrolled) {
    return {
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." },
    };
  }

  // Mesma função (e mesmo carregador em lote) usada pela fronteira de autorização em
  // shared/lesson-progress.ts::isLessonAccessible — locked/completed não podem divergir entre a
  // tela e o servidor (ver docs/venore-docks.md, plano da sessão que unificou a regra).
  const {
    lessons,
    requirementsByLessonId,
    textCompletedLessonIds,
    videoCompletedLessonIds,
    attemptsByLessonId,
    activityIdsByLessonId,
    submittedActivityIds,
    chain,
    trailFreed,
  } = await loadLessonChain(query.courseId, query.actorId);

  const chainByLessonId = new Map(chain.map((state) => [state.lessonId, state]));

  const lessonViews: LessonProgressView[] = lessons.map((lesson) => {
    const state = chainByLessonId.get(lesson.id)!;

    return toLessonProgressView({
      lesson,
      locked: state.locked,
      completed: state.completed,
      requirements: requirementsByLessonId.get(lesson.id) ?? null,
      textRead: textCompletedLessonIds.has(lesson.id),
      videoWatched: videoCompletedLessonIds.has(lesson.id),
      quizAttempts: attemptsByLessonId.get(lesson.id) ?? [],
      activityIds: activityIdsByLessonId.get(lesson.id) ?? [],
      submittedActivityIds,
    });
  });

  const completedLessons = lessonViews.filter((l) => l.completed).length;

  return {
    success: true,
    data: {
      courseId: query.courseId,
      lessons: lessonViews,
      completedLessons,
      totalLessons: lessonViews.length,
      courseCompleted: lessonViews.length > 0 && completedLessons === lessonViews.length,
      trailFreed,
    },
  };
}
