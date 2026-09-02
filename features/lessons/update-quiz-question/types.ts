import type { OperationResult } from "@venore/plugin-sdk";
import type { QuizQuestionKind, QuizQuestionRecord } from "../../../contracts/types";

export type UpdateQuizQuestionCommand = {
  id: string;
  text?: string;
  options?: string[];
  // undefined = não mexe; null = limpa o áudio das opções; array = substitui (precisa casar com o
  // comprimento final de options).
  optionNotations?: (string | null)[] | null;
  correctOptionIndex?: number;
  questionKind?: QuizQuestionKind;
  // undefined = não mexe; null = limpa; string = novo enunciado tocável.
  promptNotation?: string | null;
  actorId: string;
};
export type UpdateQuizQuestionInput = Omit<UpdateQuizQuestionCommand, "actorId">;
export type UpdateQuizQuestionResult = OperationResult<QuizQuestionRecord>;
