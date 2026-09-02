"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { clearActivitySubmissionMediaAction, type ClearActivityMediaActionState } from "../actions";

const initialState: ClearActivityMediaActionState = { error: null, clearedCount: null };

export function ClearActivityMediaButton({ courseId, mediaCount }: { courseId: string; mediaCount: number }) {
  const [state, formAction, pending] = useActionState(clearActivitySubmissionMediaAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: state.clearedCount !== null ? `${state.clearedCount} arquivo(s) movido(s) para a lixeira.` : null,
  });

  if (mediaCount === 0) return null;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Isso vai mover ${mediaCount} arquivo(s) enviados nas atividades desta disciplina para a lixeira de mídia (/admin/media/trash). Os alunos perdem acesso ao que enviaram; a avaliação/nota permanece intacta. Confirma?`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="size-4" aria-hidden="true" />
        Limpar mídia das atividades ({mediaCount})
      </Button>
    </form>
  );
}
