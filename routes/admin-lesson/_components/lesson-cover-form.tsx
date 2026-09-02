"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@venore/plugin-sdk/ui";
import type { PickableMedia } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { updateLessonCoverAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function LessonCoverForm({ lessonId, coverMedia }: { lessonId: string; coverMedia: PickableMedia | null }) {
  const [state, formAction, pending] = useActionState(updateLessonCoverAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Capa da aula salva." });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      <MediaPickerField name="coverMediaId" label="Capa da aula (opcional)" initialMedia={coverMedia} />
      <Button type="submit" variant="outline" disabled={pending}>
        Salvar capa
      </Button>
    </form>
  );
}
