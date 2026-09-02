"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChevronDown, ChevronUp, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import {
  createLessonTextSectionAction,
  deleteLessonSectionAction,
  reorderLessonSectionsAction,
  type LessonActionState,
} from "../actions";

const initialState: LessonActionState = { error: null };

export type LessonSectionView = { id: string; title: string; cmsEntryId: string | null };

function MoveSectionButton({
  lessonId,
  sectionIds,
  direction,
}: {
  lessonId: string;
  sectionIds: string[];
  direction: "up" | "down";
}) {
  const [state, formAction, pending] = useActionState(reorderLessonSectionsAction, initialState);
  useActionToast({ pending, error: state.error });

  return (
    <form action={formAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="sectionIds" value={JSON.stringify(sectionIds)} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={pending}
        aria-label={direction === "up" ? "Mover seção para cima" : "Mover seção para baixo"}
      >
        {direction === "up" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </Button>
    </form>
  );
}

function DeleteSectionButton({ lessonId, sectionId }: { lessonId: string; sectionId: string }) {
  const [state, formAction, pending] = useActionState(deleteLessonSectionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Seção removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="sectionId" value={sectionId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label="Remover seção">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}

function AddLessonTextSectionForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(createLessonTextSectionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Seção criada — edite o conteúdo abaixo." });

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-background p-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <div className="min-w-0 flex-1">
        <label className="block text-xs font-medium text-muted-foreground">Título da seção</label>
        <Input name="title" required placeholder="Ex: Introdução" className="mt-1" />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Nova seção de texto
      </Button>
    </form>
  );
}

// Texto da aula é composto por seções, cada uma uma entry oculta do CMS editada no page builder
// (pedido desta sessão) — este componente só gerencia a lista (criar/reordenar/apagar); o
// conteúdo em si (blocos) é editado em /admin/cms/entries/{cmsEntryId}/builder, link "Editar
// conteúdo" abaixo, sem duplicar a UI do builder aqui.
export function LessonSectionsManager({ lessonId, sections }: { lessonId: string; sections: LessonSectionView[] }) {
  return (
    <div>
      {sections.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8" strokeWidth={1.5} />}
          title="Nenhuma seção de texto"
          description="Adicione uma seção abaixo e escreva o conteúdo no editor de blocos que abre em seguida."
        />
      ) : (
        <ul className="space-y-2">
          {sections.map((section, index) => {
            const upOrder =
              index > 0
                ? [...sections.slice(0, index - 1), sections[index], sections[index - 1], ...sections.slice(index + 1)].map((s) => s.id)
                : null;
            const downOrder =
              index < sections.length - 1
                ? [...sections.slice(0, index), sections[index + 1], sections[index], ...sections.slice(index + 2)].map((s) => s.id)
                : null;

            return (
              <li key={section.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                <span className="min-w-0 truncate font-medium text-foreground">{section.title}</span>
                <div className="flex shrink-0 items-center gap-1">
                  {upOrder && <MoveSectionButton lessonId={lessonId} sectionIds={upOrder} direction="up" />}
                  {downOrder && <MoveSectionButton lessonId={lessonId} sectionIds={downOrder} direction="down" />}
                  {section.cmsEntryId && (
                    <Link
                      href={`/admin/cms/entries/${section.cmsEntryId}/builder`}
                      className="inline-flex items-center gap-1 rounded-sm px-2 text-xs text-muted-foreground outline-none ui-motion-base hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pencil className="size-3" /> Editar conteúdo
                    </Link>
                  )}
                  <DeleteSectionButton lessonId={lessonId} sectionId={section.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddLessonTextSectionForm lessonId={lessonId} />
    </div>
  );
}
