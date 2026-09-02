"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { setCourseStatusAction, type CourseActionState } from "../actions";
import type { CourseStatus } from "../../../index";

const initialState: CourseActionState = { error: null };

const STATUS_LABEL: Record<CourseStatus, string> = {
  draft: "Rascunho — só autor, editores, moderadores e admin veem",
  restricted: "Restrito — matrícula só por admin/moderador",
  public: "Público — qualquer aluno pode se matricular",
};

export function CourseStatusForm({ courseId, status }: { courseId: string; status: CourseStatus }) {
  const [state, formAction, pending] = useActionState(setCourseStatusAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Status do curso atualizado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={courseId} />
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Status do curso
        <select
          name="status"
          defaultValue={status}
          className="rounded-control border border-input bg-transparent px-2 py-1.5 text-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(Object.keys(STATUS_LABEL) as CourseStatus[]).map((value) => (
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
