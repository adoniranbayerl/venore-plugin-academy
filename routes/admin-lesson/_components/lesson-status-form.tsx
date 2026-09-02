"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { setLessonStatusAction, type CourseActionState } from "../../admin-course/actions";
import type { LessonStatus } from "../../../index";

const initialState: CourseActionState = { error: null };

const STATUS_LABEL: Record<LessonStatus, string> = {
  draft: "Rascunho — fora da trilha do aluno",
  restricted: "Restrito — normal, exige matrícula no curso",
  public: "Público — amostra grátis, sem exigir matrícula",
};

export function LessonStatusForm({
  lessonId,
  courseId,
  status,
}: {
  lessonId: string;
  courseId: string;
  status: LessonStatus;
}) {
  const [state, formAction, pending] = useActionState(setLessonStatusAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Status da aula atualizado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={lessonId} />
      <input type="hidden" name="courseId" value={courseId} />
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Status da aula
        <select
          name="status"
          defaultValue={status}
          className="rounded-control border border-input bg-transparent px-2 py-1.5 text-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(Object.keys(STATUS_LABEL) as LessonStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline" disabled={pending}>
        Salvar status
      </Button>
    </form>
  );
}
