import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { onProgressAdvanced } from "../../../shared/progress-hooks";
import { countActiveAttempts } from "../../../shared/quiz-attempts";
import { deriveQuizGrade } from "../../../shared/quiz-grade";
import { findLessonById, findQuestionsByLesson, insertAttempt } from "./store";
import type { SubmitQuizAttemptCommand, SubmitQuizAttemptResult } from "./types";

export async function submitQuizAttempt(command: SubmitQuizAttemptCommand): Promise<SubmitQuizAttemptResult> {
  const handle = beginOperation({
    useCase: "academy.submit-quiz-attempt",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    const error = { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    const error = { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const requirements = await findLessonRequirements(command.lessonId);
  if (!requirements?.quizEnabled) {
    const error = { code: "academy.quiz.not_enabled", message: "Esta lesson não tem quiz habilitado." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const questions = await findQuestionsByLesson(command.lessonId);
  if (questions.length === 0) {
    const error = { code: "academy.quiz.no_questions", message: "Esta lesson não tem perguntas de quiz cadastradas." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const questionIds = new Set(questions.map((q) => q.id));
  const answeredIds = new Set(command.answers.map((a) => a.questionId));
  const coversAllQuestions = questionIds.size === answeredIds.size && [...questionIds].every((id) => answeredIds.has(id));
  if (!coversAllQuestions) {
    const error = {
      code: "academy.quiz.incomplete_answers",
      message: "As respostas precisam cobrir exatamente as perguntas desta lesson.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const attemptsUsed = await countActiveAttempts(command.lessonId, command.actorId);
  const attemptNumber = attemptsUsed + 1;
  const quizMaxAttempts = requirements.quizMaxAttempts!;
  if (attemptNumber > quizMaxAttempts) {
    const error = {
      code: "academy.quiz.attempts_exhausted",
      message: `Número máximo de tentativas (${quizMaxAttempts}) já foi atingido para esta lesson.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const answerByQuestionId = new Map(command.answers.map((a) => [a.questionId, a.selectedOptionIndex]));
  const correctCount = questions.filter((q) => answerByQuestionId.get(q.id) === q.correctOptionIndex).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= requirements.quizPassThresholdPercent!;

  await insertAttempt({
    lessonId: command.lessonId,
    actorId: command.actorId,
    attemptNumber,
    score,
    passed,
    answers: command.answers,
  });
  await onProgressAdvanced(command.actorId, lesson.courseId);

  endOperation(handle, { success: true });
  return {
    success: true,
    data: { attemptNumber, score, grade: deriveQuizGrade(score), passed, attemptsRemaining: quizMaxAttempts - attemptNumber },
  };
}
