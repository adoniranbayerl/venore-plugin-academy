"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, type buttonVariants } from "@venore/plugin-sdk/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@venore/plugin-sdk/ui";
import type { VariantProps } from "class-variance-authority";
import { CreateCourseForm } from "./create-course-form";

export function CreateCourseDialog({
  variant = "default",
  label = "Novo curso",
}: {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Plus className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo curso</DialogTitle>
          <DialogDescription>Cria em rascunho — publique quando o conteúdo estiver pronto.</DialogDescription>
        </DialogHeader>
        <CreateCourseForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
