"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { resetQuizAttemptsAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function ResetQuizAttemptsButton({
  courseId,
  lessonId,
  studentActorId,
  studentLabel,
}: {
  courseId: string;
  lessonId: string;
  studentActorId: string;
  studentLabel: string;
}) {
  const [state, formAction, pending] = useActionState(resetQuizAttemptsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `Tentativas de ${studentLabel} resetadas.` });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Resetar tentativas de avaliação de ${studentLabel} nesta aula?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="studentActorId" value={studentActorId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Resetar tentativas
      </Button>
    </form>
  );
}
