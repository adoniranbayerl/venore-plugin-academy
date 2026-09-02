import type { OperationResult } from "@venore/plugin-sdk";
import type { QuizQuestionRecord } from "../../../contracts/types";

export type ListQuizQuestionsByLessonQuery = { lessonId: string };
export type ListQuizQuestionsByLessonResult = OperationResult<QuizQuestionRecord[]>;
