"use client";

import { useActionState, useState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { configureLessonRequirementsAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function LessonRequirementsForm({
  lessonId,
  hasVideoUrl,
  hasLessonActivity,
  requirements,
}: {
  lessonId: string;
  hasVideoUrl: boolean;
  hasLessonActivity: boolean;
  requirements: {
    readTextEnabled: boolean;
    watchVideoEnabled: boolean;
    quizEnabled: boolean;
    quizPassThresholdPercent: number | null;
    quizMaxAttempts: number | null;
    activityEnabled: boolean;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(configureLessonRequirementsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Requisitos salvos." });
  const [quizEnabled, setQuizEnabled] = useState(requirements?.quizEnabled ?? false);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="readTextEnabled" defaultChecked={requirements?.readTextEnabled ?? false} />
        Exigir leitura do texto
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="watchVideoEnabled"
          defaultChecked={requirements?.watchVideoEnabled ?? false}
          disabled={!hasVideoUrl}
        />
        Exigir assistir o vídeo
        {!hasVideoUrl && <span className="text-xs text-muted-foreground/56">(a aula não tem videoUrl)</span>}
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="quizEnabled"
          checked={quizEnabled}
          onChange={(event) => setQuizEnabled(event.target.checked)}
        />
        Exigir avaliação
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="activityEnabled"
          defaultChecked={requirements?.activityEnabled ?? false}
          disabled={!hasLessonActivity}
        />
        Exigir atividade prática
        {!hasLessonActivity && <span className="text-xs text-muted-foreground/56">(a aula não tem atividade cadastrada)</span>}
      </label>

      {quizEnabled && (
        <div className="ml-6 space-y-3 border-l border-border pl-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Nota mínima para aprovação (%)</label>
            <input
              type="number"
              name="quizPassThresholdPercent"
              min={1}
              max={100}
              defaultValue={requirements?.quizPassThresholdPercent ?? 70}
              className="mt-1 w-full rounded border border-border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Tentativas máximas</label>
            <input
              type="number"
              name="quizMaxAttempts"
              min={1}
              defaultValue={requirements?.quizMaxAttempts ?? 3}
              className="mt-1 w-full rounded border border-border px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={pending}>
        Salvar requisitos
      </Button>
    </form>
  );
}
