"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { enrollStudentAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function EnrollStudentForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(enrollStudentAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aluno matriculado." });

  return (
    <form action={formAction} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="flex-1">
        <label className="block text-xs font-medium text-muted-foreground">Email do aluno</label>
        <Input name="email" type="email" required placeholder="aluno@example.com" className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        Matricular
      </Button>
    </form>
  );
}
