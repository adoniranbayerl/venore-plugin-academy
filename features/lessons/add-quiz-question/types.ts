import type { OperationResult } from "@venore/plugin-sdk";
import type { QuizQuestionKind, QuizQuestionRecord } from "../../../contracts/types";

export type AddQuizQuestionCommand = {
  lessonId: string;
  text: string;
  options: string[];
  // Array paralelo a options (mesmo comprimento) quando presente — notação ABC tocável por opção,
  // null pra opção só-texto. Ausente/null = opções sem áudio.
  optionNotations?: (string | null)[] | null;
  correctOptionIndex: number;
  // Ausente = "text".
  questionKind?: QuizQuestionKind;
  promptNotation?: string | null;
  actorId: string;
};
export type AddQuizQuestionInput = Omit<AddQuizQuestionCommand, "actorId">;
export type AddQuizQuestionResult = OperationResult<QuizQuestionRecord>;
