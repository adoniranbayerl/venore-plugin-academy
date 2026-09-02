import type { OperationResult } from "@venore/plugin-sdk";
import type { StudentQuizQuestionRecord } from "../../../contracts/types";

export type ListQuizQuestionsForStudentQuery = { lessonId: string };
export type ListQuizQuestionsForStudentCommand = ListQuizQuestionsForStudentQuery & { actorId: string };
export type ListQuizQuestionsForStudentResult = OperationResult<StudentQuizQuestionRecord[]>;
