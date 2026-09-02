import type { LessonRecord, LessonRequirementsRecord, QuizAttemptRecord } from "../../../contracts/types";
import { deriveQuizGrade } from "../../../shared/quiz-grade";
import type { LessonProgressView } from "./types";

export function toLessonProgressView(input: {
  lesson: LessonRecord;
  locked: boolean;
  completed: boolean;
  requirements: LessonRequirementsRecord | null;
  textRead: boolean;
  videoWatched: boolean;
  quizAttempts: QuizAttemptRecord[];
  activityIds: string[];
  submittedActivityIds: Set<string>;
}): LessonProgressView {
  const { lesson, locked, completed, requirements, textRead, videoWatched, quizAttempts, activityIds, submittedActivityIds } = input;
  const bestScore = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.score)) : null;
  const bestGrade = bestScore !== null ? deriveQuizGrade(bestScore) : null;
  const activitiesSubmittedCount = activityIds.filter((id) => submittedActivityIds.has(id)).length;

  return {
    lessonId: lesson.id,
    position: lesson.position,
    title: lesson.title,
    body: lesson.body,
    videoUrl: lesson.videoUrl,
    locked,
    completed,
    requirements: {
      readTextEnabled: requirements?.readTextEnabled ?? false,
      textRead,
      watchVideoEnabled: requirements?.watchVideoEnabled ?? false,
      videoWatched,
      quizEnabled: requirements?.quizEnabled ?? false,
      quizPassed: quizAttempts.some((a) => a.passed),
      quizAttemptsUsed: quizAttempts.length,
      quizMaxAttempts: requirements?.quizMaxAttempts ?? null,
      quizBestScore: bestScore,
      quizBestGrade: bestGrade,
      activityEnabled: requirements?.activityEnabled ?? false,
      activitiesTotal: activityIds.length,
      activitiesSubmittedCount,
      activitiesSubmitted: activitiesSubmittedCount === activityIds.length,
    },
  };
}
