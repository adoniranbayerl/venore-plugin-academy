"use client";

import { useActionState } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { createLessonAction, type CreateLessonActionState } from "../actions";

const initialState: CreateLessonActionState = { error: null, lessonId: null };

// Só título — pedido desta sessão ("o form de criação de aulas parece deslocado... criar um
// botão que abre o form apenas com título, todo o restante é editado dentro da aula"). Conteúdo/
// vídeo/capa/requisitos já são editáveis depois em lessons/[id]/page.tsx (lesson-content-form.tsx,
// lesson-cover-form.tsx, lesson-requirements-form.tsx) — não precisam de um segundo lugar pra
// serem preenchidos na criação. onSuccess recebe o id da aula recém-criada (não só um callback
// vazio como em create-course-form.tsx) porque quem chama precisa navegar pra lá.
export function CreateLessonForm({ courseId, onSuccess }: { courseId: string; onSuccess?: (lessonId: string) => void }) {
  const [state, formAction, pending] = useActionState(createLessonAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Aula criada.",
    onSuccess: () => {
      if (state.lessonId) onSuccess?.(state.lessonId);
    },
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <Input name="title" placeholder="título da aula" required />
      <Button type="submit" disabled={pending} className="w-full">
        Criar aula
      </Button>
    </form>
  );
}
