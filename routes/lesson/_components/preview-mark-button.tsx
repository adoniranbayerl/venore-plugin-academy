"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";

// Marcar material como lido em modo preview (professor) — simulação local, sem persistir nada
// (ele normalmente não está matriculado no próprio curso; a ação real exige matrícula como
// fronteira de segurança). A confirmação de leitura da aula em si (seção/vídeo/texto) mora em
// lesson-step-flow.tsx (ReadMarkAction "local"); este componente ficou só para as linhas de
// material complementar, que são vários itens independentes, um botão pequeno cada.
export function PreviewMarkButton({ label, doneLabel }: { label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
        <Check className="size-3.5" aria-hidden="true" /> {doneLabel}
      </span>
    );
  }

  return (
    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setDone(true)}>
      {label}
    </Button>
  );
}
