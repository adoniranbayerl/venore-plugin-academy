"use client";

import { useActionState, useState } from "react";
import { Music, Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { MediaPickerField } from "@venore/plugin-sdk/ui";
import { InteractiveNotation } from "../../../shared/music";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { addLessonExampleAction, deleteLessonExampleAction, type LessonActionState } from "../actions";
import { NotationEditor } from "../../../components/notation-editor";

const initialState: LessonActionState = { error: null };

export type LessonExampleView = {
  id: string;
  title: string;
  captionText: string;
  audioUrl: string | null;
  sheetUrl: string | null;
  sheetFilename: string | null;
  notationData: string | null;
};

function DeleteExampleButton({ lessonId, exampleId }: { lessonId: string; exampleId: string }) {
  const [state, formAction, pending] = useActionState(deleteLessonExampleAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Exemplo removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="exampleId" value={exampleId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label="Remover exemplo">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}

function AddLessonExampleForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(addLessonExampleAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Exemplo adicionado." });
  const [mode, setMode] = useState<"upload" | "notation">("notation");

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Título</label>
        <Input name="title" required placeholder="Ex: Escala de dó maior" className="mt-1" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Descrição textual (acessibilidade)</label>
        <Textarea
          name="captionText"
          required
          placeholder="Ex: sequência C4, D4, E4 em semínimas"
          className="mt-1 min-h-16"
        />
      </div>

      <div className="flex gap-1 rounded-lg border border-border p-1 text-xs">
        <button
          type="button"
          onClick={() => setMode("notation")}
          className={
            mode === "notation"
              ? "flex-1 rounded-md bg-primary px-2 py-1.5 font-medium text-primary-foreground"
              : "flex-1 rounded-md px-2 py-1.5 font-medium text-muted-foreground"
          }
        >
          Partitura interativa
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={
            mode === "upload"
              ? "flex-1 rounded-md bg-primary px-2 py-1.5 font-medium text-primary-foreground"
              : "flex-1 rounded-md px-2 py-1.5 font-medium text-muted-foreground"
          }
        >
          Áudio/imagem (upload)
        </button>
      </div>

      {mode === "notation" ? (
        <NotationEditor name="notationData" />
      ) : (
        <>
          <MediaPickerField name="audioMediaId" label="Áudio (opcional)" />
          <MediaPickerField name="sheetMediaId" label="Partitura (opcional)" />
          <p className="text-xs text-muted-foreground/56">Pelo menos um dos dois é obrigatório.</p>
        </>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Adicionar exemplo
      </Button>
    </form>
  );
}

export function LessonExamplesSection({ lessonId, examples }: { lessonId: string; examples: LessonExampleView[] }) {
  return (
    <div>
      {examples.length === 0 ? (
        <EmptyState
          icon={<Music className="size-8" strokeWidth={1.5} />}
          title="Nenhum exemplo cadastrado"
          description="Adicione um exemplo sonoro ou de partitura abaixo."
        />
      ) : (
        <ul className="space-y-2">
          {examples.map((example) => (
            <li key={example.id} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{example.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{example.captionText}</p>
                </div>
                <DeleteExampleButton lessonId={lessonId} exampleId={example.id} />
              </div>
              <div className="mt-2 space-y-2">
                {example.notationData && (
                  <InteractiveNotation abc={example.notationData} className="overflow-x-auto rounded-md bg-card p-2" />
                )}
                {example.audioUrl && <audio controls src={example.audioUrl} className="h-8 w-full" />}
                {example.sheetUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={example.sheetUrl} alt={example.sheetFilename ?? example.title} className="max-h-40 rounded-md border border-border" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddLessonExampleForm lessonId={lessonId} />
    </div>
  );
}
