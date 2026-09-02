"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { markLessonMaterialReadAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function MarkMaterialReadButton({
  courseSlug,
  lessonId,
  materialId,
  completed,
}: {
  courseSlug: string;
  lessonId: string;
  materialId: string;
  completed: boolean;
}) {
  const [state, formAction, pending] = useActionState(markLessonMaterialReadAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Material marcado como lido." });

  if (completed) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
        <Check className="size-3.5" aria-hidden="true" /> Lido
      </span>
    );
  }

  return (
    <form action={formAction} className="shrink-0">
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="materialId" value={materialId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Marcar como lido
      </Button>
    </form>
  );
}
