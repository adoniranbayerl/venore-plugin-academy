import type { UserRef } from "@venore/plugin-sdk/auth";
import type { LessonRecord, LessonRequirementsRecord } from "../../../contracts/types";
import type { EnrollmentRecord } from "../../../contracts/types";
import type { QuizProgressEntryView } from "./types";

export function toQuizProgressEntryView(input: {
  lesson: LessonRecord;
  requirements: LessonRequirementsRecord;
  enrollment: EnrollmentRecord;
  student: UserRef | undefined;
  attemptsUsed: number;
}): QuizProgressEntryView {
  const { lesson, requirements, enrollment, student, attemptsUsed } = input;
  const quizMaxAttempts = requirements.quizMaxAttempts ?? 0;

  return {
    studentActorId: enrollment.actorId,
    studentName: student?.name ?? null,
    studentEmail: student?.email ?? null,
    lessonId: lesson.id,
    lessonPosition: lesson.position,
    quizMaxAttempts,
    attemptsUsed,
    exhausted: attemptsUsed >= quizMaxAttempts,
  };
}
