"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@venore/plugin-sdk/ui";
import { CreateLessonForm } from "./create-lesson-form";

// Mesmo padrão de create-course-dialog.tsx. Ao criar, navega direto pra página da aula
// (precedente: DeleteMediaButton em admin/media/_components/delete-media-button.tsx usa
// useRouter().push depois de uma Server Action) — é lá que o professor preenche o resto
// (conteúdo, vídeo, capa, requisitos, seções, quiz).
export function CreateLessonDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Nova aula
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova aula</DialogTitle>
          <DialogDescription>Cria só com o título — o resto é preenchido na página da aula.</DialogDescription>
        </DialogHeader>
        <CreateLessonForm
          courseId={courseId}
          onSuccess={(lessonId) => {
            setOpen(false);
            router.push(`/admin/academy/lessons/${lessonId}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
