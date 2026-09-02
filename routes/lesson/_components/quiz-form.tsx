"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { NotationPlayButton } from "../../../components/notation-play-button";
import { submitQuizAction, type QuizActionState } from "../actions";
import type { StudentQuizQuestionRecord } from "../../../index";

const initialState: QuizActionState = { error: null, result: null };

type QuizResult = NonNullable<QuizActionState["result"]>;

function ResultCard({ result }: { result: QuizResult }) {
  return (
    <div
      className={`space-y-0.5 rounded-md border px-3.5 py-3 text-sm ${
        result.passed ? "border-success-border bg-success-soft" : "border-warning-border bg-warning-soft"
      }`}
    >
      <p className="text-base font-semibold tabular-nums">Nota: {result.grade.toFixed(1)}</p>
      <p className="text-xs text-muted-foreground/56 tabular-nums">{result.score}% de acerto</p>
      <p className={result.passed ? "text-success" : "text-warning"}>
        {result.passed ? "Você passou!" : `Você não passou. Tentativas restantes: ${result.attemptsRemaining}.`}
      </p>
    </div>
  );
}

// Uma pergunta por vez, com Anterior/Próxima (pedido desta sessão: "uma lista com todas as
// perguntas fica visualmente ruim e quebra a navegação") — reescrita completa, mas o contrato com
// o servidor não mudou: submitQuizAction ainda espera N inputs hidden "questionId" + um
// "answer-<questionId>" por pergunta respondida (actions.ts, formData.getAll/get). Em vez de
// radios nativos com `name` (que exigiriam TODAS as perguntas montadas ao mesmo tempo pra compor o
// FormData), o estado de resposta vive em `answers` (client) e vira inputs hidden só na hora do
// submit — os radios visíveis desta tela são só a UI, controlados por esse mesmo estado.
function QuizAttempt({
  courseSlug,
  lessonId,
  questions,
  attemptsExhausted,
  courseHref,
  onRetry,
}: {
  courseSlug: string;
  lessonId: string;
  questions: StudentQuizQuestionRecord[];
  attemptsExhausted: boolean;
  courseHref: string;
  onRetry: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitQuizAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: state.result ? (state.result.passed ? "Você passou na avaliação!" : "Respostas enviadas.") : null,
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const exhaustedNow = attemptsExhausted || (state.result !== null && !state.result.passed && state.result.attemptsRemaining <= 0);

  if (exhaustedNow) {
    return (
      <div className="rounded-panel border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Você esgotou suas tentativas para esta avaliação.</p>
      </div>
    );
  }

  // Reprovou mas ainda tem tentativa — pedido desta sessão: "já deve ter um botão para tentar de
  // novo e outro para tentar de novo mais tarde". "Tentar novamente" remonta QuizAttempt inteira
  // (via key em QuizForm, abaixo) pra zerar índice/respostas/estado da action; "Tentar mais tarde"
  // só volta pro curso, sem forçar nada agora.
  if (state.result && !state.result.passed) {
    return (
      <div className="space-y-4">
        <ResultCard result={state.result} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onRetry}>
            Tentar novamente
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={courseHref}>Tentar mais tarde</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state.result && state.result.passed) {
    return <ResultCard result={state.result} />;
  }

  const question = questions[questionIndex];
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === questions.length - 1;
  const selected = answers[question.id];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />
      {questions.map((item) =>
        item.id in answers ? <input key={item.id} type="hidden" name="questionId" value={item.id} /> : null,
      )}
      {questions.map((item) =>
        item.id in answers ? <input key={item.id} type="hidden" name={`answer-${item.id}`} value={answers[item.id]} /> : null,
      )}

      <fieldset className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground tabular-nums">
          Pergunta {questionIndex + 1} de {questions.length}
        </p>
        <legend className="text-sm font-medium text-foreground">{question.text}</legend>
        {question.promptNotation && (
          <div className="flex items-center gap-2">
            <NotationPlayButton abc={question.promptNotation} label="Ouvir a pergunta" />
          </div>
        )}
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const optionNotation = question.optionNotations?.[index] ?? null;
            return (
              <div key={index} className="flex items-center gap-2">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm ui-motion-base has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring hover:border-ring">
                  <input
                    type="radio"
                    checked={selected === index}
                    onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "size-4 shrink-0 rounded-full border border-border",
                      selected === index && "border-primary bg-primary",
                    )}
                  />
                  <span className="flex-1">{option}</span>
                </label>
                {optionNotation && <NotationPlayButton abc={optionNotation} label="Ouvir" size="xs" />}
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" disabled={isFirst} onClick={() => setQuestionIndex((value) => value - 1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>

        <span className="text-xs text-muted-foreground tabular-nums">
          {questionIndex + 1}/{questions.length}
        </span>

        {isLast ? (
          <Button type="submit" disabled={pending || selected === undefined}>
            Enviar avaliação
          </Button>
        ) : (
          <Button type="button" disabled={selected === undefined} onClick={() => setQuestionIndex((value) => value + 1)}>
            Próxima
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}

export function QuizForm({
  courseSlug,
  lessonId,
  questions,
  attemptsExhausted,
  courseHref,
}: {
  courseSlug: string;
  lessonId: string;
  questions: StudentQuizQuestionRecord[];
  attemptsExhausted: boolean;
  courseHref: string;
}) {
  // attemptKey força remontagem completa de QuizAttempt em "Tentar novamente" — zera useActionState
  // (resultado da tentativa anterior) junto com questionIndex/answers, sem precisar de um segundo
  // mecanismo de reset pra cada um desses estados.
  const [attemptKey, setAttemptKey] = useState(0);

  return (
    <QuizAttempt
      key={attemptKey}
      courseSlug={courseSlug}
      lessonId={lessonId}
      questions={questions}
      attemptsExhausted={attemptsExhausted}
      courseHref={courseHref}
      onRetry={() => setAttemptKey((value) => value + 1)}
    />
  );
}
