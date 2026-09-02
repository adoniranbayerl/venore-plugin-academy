"use client";

import { useActionState } from "react";
import { ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { Badge } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { addLessonActivityAction, deleteLessonActivityAction, type LessonActionState } from "../actions";
import { ActivitySubmissionsPanel } from "./activity-submissions-panel";

const initialState: LessonActionState = { error: null };

export type LessonActivityView = {
  id: string;
  title: string;
  instructionsText: string;
  deliverableFormat: "text" | "audio" | "image" | "pdf" | "none";
};

const DELIVERABLE_LABELS: Record<LessonActivityView["deliverableFormat"], string> = {
  text: "Texto",
  audio: "Áudio",
  image: "Imagem",
  pdf: "PDF",
  none: "Sem entrega (só marcar como concluída)",
};

function DeleteActivityButton({ lessonId, activityId }: { lessonId: string; activityId: string }) {
  const [state, formAction, pending] = useActionState(deleteLessonActivityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atividade removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="activityId" value={activityId} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label="Remover atividade">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}

function AddLessonActivityForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(addLessonActivityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atividade adicionada." });

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Título</label>
        <Input name="title" required placeholder="Ex: Grave um trecho cantado" className="mt-1" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Enunciado</label>
        <Textarea name="instructionsText" required className="mt-1 min-h-20" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Formato de entrega</label>
        <select
          name="deliverableFormat"
          defaultValue="text"
          className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="text">Texto</option>
          <option value="audio">Áudio</option>
          <option value="image">Imagem</option>
          <option value="pdf">PDF</option>
          <option value="none">Sem entrega (só marcar como concluída)</option>
        </select>
      </div>

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Adicionar atividade
      </Button>
    </form>
  );
}

export function LessonActivitiesSection({ lessonId, activities }: { lessonId: string; activities: LessonActivityView[] }) {
  return (
    <div>
      {activities.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-8" strokeWidth={1.5} />}
          title="Nenhuma atividade cadastrada"
          description="Adicione a primeira atividade prática abaixo."
        />
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-wrap">{activity.instructionsText}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant="outline">{DELIVERABLE_LABELS[activity.deliverableFormat]}</Badge>
                  <DeleteActivityButton lessonId={lessonId} activityId={activity.id} />
                </div>
              </div>
              <ActivitySubmissionsPanel
                lessonId={lessonId}
                activityId={activity.id}
                deliverableFormat={activity.deliverableFormat}
              />
            </li>
          ))}
        </ul>
      )}

      <AddLessonActivityForm lessonId={lessonId} />
    </div>
  );
}
