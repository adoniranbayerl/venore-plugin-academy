"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@venore/plugin-sdk/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@venore/plugin-sdk/ui";
import type { AcademyImportReport, ImportReportOutcome } from "../../../index";

const OUTCOME_LABEL: Record<ImportReportOutcome, string> = {
  created: "Criado",
  reused: "Reaproveitado",
  skipped: "Pulado",
  failed: "Falhou",
};

function badgeVariantForOutcome(outcome: ImportReportOutcome): "secondary" | "outline" | "destructive" {
  if (outcome === "failed") return "destructive";
  if (outcome === "created" || outcome === "reused") return "secondary";
  return "outline";
}

// Mesma lógica de fetch/relatório de import-export-panel.tsx (contexts/import-export), só que num
// Dialog em vez de seção de página inteira — pedido desta sessão era manter export/import direto
// nas páginas existentes de Academy, sem página administrativa nova.
export function ImportCourseDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [report, setReport] = useState<AcademyImportReport | null>(null);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
    if (!file) {
      toast.error("Selecione um arquivo .zip para importar.");
      return;
    }

    setPending(true);
    setReport(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/academy/courses/import", { method: "POST", body: formData });
      const body = (await response.json()) as { report?: AcademyImportReport; error?: string };

      if (!response.ok || !body.report) {
        toast.error(body.error ?? "Falha ao importar o curso.");
        return;
      }

      setReport(body.report);
      toast.success(
        `Importação concluída: ${body.report.createdCount} criado(s), ${body.report.reusedCount} reaproveitado(s), ${body.report.skippedCount} pulado(s), ${body.report.failedCount} falhou(aram).`,
      );
      form.reset();
    } catch {
      toast.error("Falha inesperada ao importar o curso.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setReport(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          Importar curso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar curso</DialogTitle>
          <DialogDescription>
            Envie um .zip gerado pela exportação de um curso. Se já existir um curso com o mesmo slug neste destino, o
            import inteiro é pulado — nada é sobrescrito.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleImport} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            name="file"
            accept=".zip"
            required
            disabled={pending}
            className="rounded-sm text-sm text-muted-foreground outline-none ui-motion-base file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Importando..." : "Importar"}
          </Button>
        </form>

        {report && (
          <div className="max-h-80 overflow-y-auto rounded-panel border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Detalhe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.lines.map((line, index) => (
                    <TableRow key={`${line.kind}-${line.ref}-${index}`}>
                      <TableCell className="text-xs text-muted-foreground">{line.kind}</TableCell>
                      <TableCell className="max-w-40 truncate text-xs" title={line.ref}>
                        {line.ref}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariantForOutcome(line.outcome)}>{OUTCOME_LABEL[line.outcome]}</Badge>
                      </TableCell>
                      <TableCell className="max-w-72 text-xs text-wrap text-muted-foreground">{line.message ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
