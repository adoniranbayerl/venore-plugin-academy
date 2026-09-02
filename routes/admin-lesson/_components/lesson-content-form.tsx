"use client";

import { useActionState } from "react";
import { Input } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { updateLessonContentAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

// Texto da aula saiu daqui (pedido desta sessão): agora é autorado como seções via o page
// builder do CMS (ver lesson-sections-manager.tsx), não texto solto — este form só cobre o que
// continua simples/flat (título, vídeo único da aula).
export function LessonContentForm({
  lessonId,
  title,
  videoUrl,
}: {
  lessonId: string;
  title: string;
  videoUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateLessonContentAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Conteúdo da aula salvo." });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Título</label>
        <Input name="title" defaultValue={title} required className="mt-1" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">URL do vídeo</label>
        <Input
          name="videoUrl"
          type="url"
          defaultValue={videoUrl ?? ""}
          placeholder="https://..."
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground/56">Deixe em branco pra remover o vídeo da aula.</p>
      </div>

      <Button type="submit" disabled={pending}>
        Salvar conteúdo
      </Button>
    </form>
  );
}
