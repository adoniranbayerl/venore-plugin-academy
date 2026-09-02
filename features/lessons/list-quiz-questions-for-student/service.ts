import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, findQuizQuestionsByLesson } from "./store";
import type { ListQuizQuestionsForStudentCommand, ListQuizQuestionsForStudentResult } from "./types";

// Nunca devolve correctOptionIndex — esta é a leitura que a tela de aluno usa pra montar o quiz
// antes de responder (ver comentário em lessons/list-quiz-questions-by-lesson/service.ts, que é a
// versão de professor e não pode ser reaproveitada aqui).
export async function listQuizQuestionsForStudent(
  command: ListQuizQuestionsForStudentCommand,
): Promise<ListQuizQuestionsForStudentResult> {
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
  if (!requirements?.quizEnabled) {
    return {
      success: false,
      error: { code: "academy.quiz.not_enabled", message: "Esta lesson não tem quiz habilitado." },
    };
  }

  const questions = await findQuizQuestionsByLesson(command.lessonId);
  // Mantém optionNotations/promptNotation/questionKind (o aluno precisa deles pra TOCAR o áudio) e
  // omite só correctOptionIndex — nenhum dos campos de notação revela a resposta.
  const studentQuestions = questions.map((question) => ({
    id: question.id,
    lessonId: question.lessonId,
    text: question.text,
    options: question.options,
    optionNotations: question.optionNotations,
    questionKind: question.questionKind,
    promptNotation: question.promptNotation,
    createdAt: question.createdAt,
  }));

  return { success: true, data: studentQuestions };
}
