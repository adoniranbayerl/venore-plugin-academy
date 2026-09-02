"use client";

import { useState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { NotationPlayButton } from "../../../components/notation-play-button";
import type { QuizQuestionRecord } from "../../../index";

type PreviewResult = { score: number; grade: number; passed: boolean };

// Cópia local de shared/quiz-grade.ts (deriveQuizGrade): esta é uma "use client" component, e
// importar QUALQUER value export de @/plugins/academy (mesmo um só) puxa o barrel inteiro pro
// bundle do browser — o barrel reexporta handlers com acesso a banco (pg), que quebra o build
// (Module not found: 'tls'/'util/types', node builtins). Fórmula é uma linha de aritmética pura,
// sem risco real de duplicação divergir.
function deriveQuizGrade(scorePercent: number): number {
  return Math.round(scorePercent) / 10;
}

// Mesma fórmula de submit-quiz-attempt/service.ts (score = % de acerto arredondado, passed =
// score >= threshold), só que calculada no client e nunca enviada ao servidor — pedido desta
// sessão: preview de professor precisa de um quiz de verdade interativo, sem gravar
// quiz_attempts pro professor (ele normalmente não está matriculado no próprio curso).
export function PreviewQuizForm({
  questions,
  quizPassThresholdPercent,
}: {
  questions: QuizQuestionRecord[];
  quizPassThresholdPercent: number;
}) {
  const [result, setResult] = useState<PreviewResult | null>(null);

  function handleSubmit(formData: FormData) {
    const correctCount = questions.filter(
      (question) => Number(formData.get(`answer-${question.id}`)) === question.correctOptionIndex,
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);
    setResult({ score, grade: deriveQuizGrade(score), passed: score >= quizPassThresholdPercent });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <fieldset key={question.id} className="space-y-2.5">
          <legend className="text-sm font-medium text-foreground">{question.text}</legend>
          {question.promptNotation && <NotationPlayButton abc={question.promptNotation} label="Ouvir a pergunta" />}
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const optionNotation = question.optionNotations?.[index] ?? null;
              return (
                <div key={index} className="flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm ui-motion-base has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring hover:border-ring">
                    <input type="radio" name={`answer-${question.id}`} value={index} required className="peer sr-only" />
                    <span className="size-4 shrink-0 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary" />
                    <span className="flex-1">{option}</span>
                  </label>
                  {optionNotation && <NotationPlayButton abc={optionNotation} label="Ouvir" size="xs" />}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <Button type="submit">Enviar respostas (simulação)</Button>

      {result && (
        <div
          className={`space-y-0.5 rounded-md border px-3.5 py-3 text-sm ${
            result.passed ? "border-success-border bg-success-soft" : "border-warning-border bg-warning-soft"
          }`}
        >
          <p className="text-base font-semibold tabular-nums">Nota: {result.grade.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground/56 tabular-nums">{result.score}% de acerto</p>
          <p className={result.passed ? "text-success" : "text-warning"}>{result.passed ? "Você passou!" : "Você não passou."}</p>
          <p className="text-xs text-muted-foreground/56">Simulação — nenhuma tentativa foi salva para sua conta.</p>
        </div>
      )}
    </form>
  );
}
