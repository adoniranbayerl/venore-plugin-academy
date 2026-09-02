import type { OperationResult } from "@venore/plugin-sdk";
import type { QuizAnswer } from "../../../contracts/types";

export type SubmitQuizAttemptCommand = { lessonId: string; answers: QuizAnswer[]; actorId: string };
export type SubmitQuizAttemptInput = Omit<SubmitQuizAttemptCommand, "actorId">;
export type SubmitQuizAttemptResult = OperationResult<{
  attemptNumber: number;
  score: number;
  // Nota de 0 a 10 derivada de score só para exibição (deriveQuizGrade em ../../../shared/quiz-grade) —
  // aprovação continua decidida pelo percentual (score vs quizPassThresholdPercent).
  grade: number;
  passed: boolean;
  attemptsRemaining: number;
}>;
