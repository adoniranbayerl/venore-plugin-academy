"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import { deleteCourseAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

// Mesmo padrão de DeleteMediaButton (admin/media): o botão só ABRE o AlertDialog; o form real
// (escondido) só é submetido no clique de "Remover curso" dentro do diálogo, via requestSubmit().
// Na volta sem erro, o curso não existe mais — redireciona pra lista.
export function DeleteCourseButton({
  courseId,
  courseTitle,
  lessonCount,
  enrollmentCount,
}: {
  courseId: string;
  courseTitle: string;
  lessonCount: number;
  enrollmentCount: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteCourseAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Curso removido.",
    onSuccess: () => router.push("/admin/academy"),
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const parts = [`${lessonCount} ${lessonCount === 1 ? "aula" : "aulas"}`];
  if (enrollmentCount > 0) parts.push(`${enrollmentCount} ${enrollmentCount === 1 ? "matrícula" : "matrículas"}`);

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="courseId" value={courseId} />
      </form>
      <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" /> Remover curso
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover “{courseTitle}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto apaga o curso e tudo dentro dele — {parts.join(", ")}, além de todo o progresso, tentativas de
              avaliação e entregas de atividade dos alunos. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              Remover curso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
