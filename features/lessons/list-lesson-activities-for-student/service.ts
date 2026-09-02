import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonActivitiesByLesson, findLessonById, findSubmissionsByActorForActivities } from "./store";
import type { ListLessonActivitiesForStudentCommand, ListLessonActivitiesForStudentResult } from "./types";

// Mesma fronteira de list-quiz-questions-for-student: matrícula + cadeia de bloqueio + o
// requirement específico habilitado (activityEnabled) — sem isso, a atividade não faz parte da
// trilha desta aula e não deveria aparecer pro aluno.
export async function listLessonActivitiesForStudent(
  command: ListLessonActivitiesForStudentCommand,
): Promise<ListLessonActivitiesForStudentResult> {
  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    return { success: false, error: { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` } };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    return {
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." },
    };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    return {
      success: false,
      error: { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." },
    };
  }

  const requirements = await findLessonRequirements(command.lessonId);
  if (!requirements?.activityEnabled) {
    return {
      success: false,
      error: { code: "academy.lesson_activities.not_enabled", message: "Esta lesson não tem atividade prática habilitada." },
    };
  }

  const activities = await findLessonActivitiesByLesson(command.lessonId);
  const submissions = await findSubmissionsByActorForActivities(
    activities.map((activity) => activity.id),
    command.actorId,
  );
  const submissionByActivityId = new Map(submissions.map((submission) => [submission.activityId, submission]));

  return {
    success: true,
    data: activities.map((activity) => ({ ...activity, submission: submissionByActivityId.get(activity.id) ?? null })),
  };
}
