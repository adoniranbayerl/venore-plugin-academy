"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { enrollSelfAction, type EnrollSelfActionState } from "../actions";

const initialState: EnrollSelfActionState = { error: null };

export function EnrollSelfButton({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const [state, formAction, pending] = useActionState(enrollSelfAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Matrícula realizada." });

  return (
    <form action={formAction}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <Button type="submit" disabled={pending}>
        Matricular-se
      </Button>
    </form>
  );
}
