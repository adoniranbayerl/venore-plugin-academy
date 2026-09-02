"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@venore/plugin-sdk/ui";
import type { PickableMedia } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { updateCourseSettingsAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function CourseSettingsForm({
  courseId,
  slug,
  publiclyListed,
  coverMedia,
}: {
  courseId: string;
  slug: string;
  publiclyListed: boolean;
  coverMedia: PickableMedia | null;
}) {
  const [state, formAction, pending] = useActionState(updateCourseSettingsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Configurações de matrícula salvas." });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={courseId} />

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Endereço da página do curso
        <Input name="slug" defaultValue={slug} required />
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="publiclyListed"
          defaultChecked={publiclyListed}
          className="rounded-sm outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        />
        Listar publicamente
      </label>

      <MediaPickerField name="coverMediaId" label="Capa do curso (opcional)" initialMedia={coverMedia} />

      <Button type="submit" variant="outline" disabled={pending}>
        Salvar configurações de matrícula
      </Button>
    </form>
  );
}
