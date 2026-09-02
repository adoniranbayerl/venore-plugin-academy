"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { academyEnrollAction, type AcademyEnrollActionState } from "./actions";

const initialState: AcademyEnrollActionState = { error: null };

export function AcademyEnrollButton({ courseId, slug, label }: { courseId: string; slug: string; label: string }) {
  const [state, formAction, pending] = useActionState(academyEnrollAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Matrícula realizada." });

  return (
    <form action={formAction}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <Button type="submit" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
