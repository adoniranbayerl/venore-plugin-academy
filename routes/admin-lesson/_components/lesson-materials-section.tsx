"use client";

import { useActionState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { MediaPickerField } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { addLessonMaterialAction, deleteLessonMaterialAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export type LessonMaterialView = { id: string; label: string; mediaUrl: string | null; mediaFilename: string | null };

function DeleteMaterialButton({ lessonId, materialId }: { lessonId: string; materialId: string }) {
  const [state, formAction, pending] = useActionState(deleteLessonMaterialAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Material removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="materialId" value={materialId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label="Remover material">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}

function AddLessonMaterialForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(addLessonMaterialAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Material adicionado." });

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Rótulo</label>
        <Input name="label" required placeholder="Ex: Slides da aula" className="mt-1" />
      </div>

      <MediaPickerField name="mediaId" label="Arquivo" />

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Adicionar material
      </Button>
    </form>
  );
}

export function LessonMaterialsSection({ lessonId, materials }: { lessonId: string; materials: LessonMaterialView[] }) {
  return (
    <div>
      {materials.length === 0 ? (
        <EmptyState
          icon={<Download className="size-8" strokeWidth={1.5} />}
          title="Nenhum material anexado"
          description="Adicione slides, apostilas ou outros arquivos baixáveis abaixo."
        />
      ) : (
        <ul className="space-y-2">
          {materials.map((material) => (
            <li key={material.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{material.label}</p>
                {material.mediaUrl ? (
                  <a
                    href={material.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {material.mediaFilename ?? "Baixar arquivo"}
                  </a>
                ) : (
                  <p className="text-xs text-destructive">Arquivo de mídia não encontrado.</p>
                )}
              </div>
              <DeleteMaterialButton lessonId={lessonId} materialId={material.id} />
            </li>
          ))}
        </ul>
      )}

      <AddLessonMaterialForm lessonId={lessonId} />
    </div>
  );
}
