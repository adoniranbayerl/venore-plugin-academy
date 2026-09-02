"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { createCourseAction, type AcademyActionState } from "../actions";

const initialState: AcademyActionState = { error: null };

export function CreateCourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Curso criado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <Input name="title" placeholder="título do curso" required />
      <Input name="description" placeholder="descrição (opcional)" />
      <Input name="slug" placeholder="slug (opcional — gerado do título se vazio)" />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="publiclyListed" defaultChecked />
        Listar publicamente
      </label>
      <MediaPickerField name="coverMediaId" label="Capa do curso (opcional)" />
      <Button type="submit" disabled={pending} className="w-full">
        Criar curso
      </Button>
    </form>
  );
}
