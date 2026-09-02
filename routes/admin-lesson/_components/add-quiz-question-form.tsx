"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { NotationEditor } from "../../../components/notation-editor";
import { compositionToAbc, type NotationComposition } from "../../../components/notation-abc";
import { addQuizQuestionAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

const EMPTY_COMPOSITION: NotationComposition = {
  tokens: [],
  key: "C",
  timeSignature: "4/4",
  bpm: 90,
  showNoteNames: false,
};

// "text" = múltipla escolha comum. "audio" = treino de ouvido: o professor monta no NotationEditor
// o que o aluno vai OUVIR (sem ver), e as opções continuam sendo texto ("3ª maior", "4ª justa").
// Áudio por opção existe no back-end mas ainda não é editável por aqui (ver
// docs/academy-recursos-musicais.md #2).
export function AddQuizQuestionForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(addQuizQuestionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Pergunta adicionada." });
  const [optionCount, setOptionCount] = useState(2);
  const [kind, setKind] = useState<"text" | "audio">("text");
  const [prompt, setPrompt] = useState<NotationComposition>(EMPTY_COMPOSITION);

  const promptAbc = useMemo(() => (prompt.tokens.length > 0 ? compositionToAbc(prompt) : ""), [prompt]);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="questionKind" value={kind} />
      {kind === "audio" && <input type="hidden" name="promptNotation" value={promptAbc} />}

      <div className="flex items-center gap-1" role="group" aria-label="Tipo de pergunta">
        {(["text", "audio"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            aria-pressed={kind === value}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              kind === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
            )}
          >
            {value === "text" ? "Texto" : "Ouvido (áudio)"}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">
          {kind === "audio" ? "Enunciado (texto que acompanha o áudio)" : "Pergunta"}
        </label>
        <Input name="text" required className="mt-1" />
      </div>

      {kind === "audio" && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted-foreground">
            O que o aluno ouve — monte a melodia ou o acorde da pergunta
          </label>
          <NotationEditor value={prompt} onChange={setPrompt} />
          <p className="text-xs text-muted-foreground/56">O aluno ouve isto sem ver a partitura.</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Opções (marque a correta)</label>
        {Array.from({ length: optionCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correctOptionIndex"
              value={index}
              required
              className="outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Input name="options" required placeholder={`opção ${index + 1}`} className="flex-1" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOptionCount((count) => count + 1)}
          className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          + adicionar opção
        </button>
      </div>

      <Button type="submit" disabled={pending}>
        Adicionar pergunta
      </Button>
    </form>
  );
}
