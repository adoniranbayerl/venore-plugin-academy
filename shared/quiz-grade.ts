// Nota de 0 a 10 só para exibição — quem decide aprovação continua sendo o percentual
// (quizPassThresholdPercent em submit-quiz-attempt/service.ts), essa função não participa da
// regra de aprovação. Arredondamento explícito pra 1 casa decimal, meio-para-cima (padrão do
// Math.round para números positivos).
export function deriveQuizGrade(scorePercent: number): number {
  return Math.round(scorePercent) / 10;
}
