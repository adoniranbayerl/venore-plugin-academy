"use client";

import { useState, useTransition } from "react";
import { Button } from "@venore/plugin-sdk/ui";
import { Badge } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { listActivitySubmissionsAction, reviewSubmissionAction, type SubmissionPanelItem } from "../actions";

function ReviewStatusBadge({ status }: { status: SubmissionPanelItem["reviewStatus"] }) {
  if (status === "approved") {
    return (
      <Badge variant="outline" className="border-success-border bg-success-soft text-success">
        Aprovada
      </Badge>
    );
  }
  if (status === "needs_revision") {
    return (
      <Badge variant="outline" className="border-warning-border bg-warning-soft text-warning">
        Revisão pedida
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
        Reprovada
      </Badge>
    );
  }
  return <Badge variant="outline">Pendente</Badge>;
}

// "none": nada a revisar (auto-aprovado no envio, pedido desta sessão — ver
// submit-lesson-activity/service.ts) — mostra só quem concluiu, sem nota nem botões de ação.
function CompletionRow({ submission }: { submission: SubmissionPanelItem }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{submission.actorName ?? submission.actorEmail ?? "Aluno"}</p>
        {submission.actorEmail && submission.actorName && (
          <p className="truncate text-xs text-muted-foreground/56">{submission.actorEmail}</p>
        )}
      </div>
      <Badge variant="outline" className="border-success-border bg-success-soft text-success">
        Concluída
      </Badge>
    </li>
  );
}

function SubmissionRow({
  lessonId,
  submission,
  onReviewed,
}: {
  lessonId: string;
  submission: SubmissionPanelItem;
  onReviewed: (updated: SubmissionPanelItem) => void;
}) {
  const [feedback, setFeedback] = useState(submission.reviewFeedback ?? "");
  const [score, setScore] = useState(submission.reviewScore !== null ? String(submission.reviewScore) : "");
  const [pending, startTransition] = useTransition();
  const alreadyReviewed = submission.reviewStatus !== "pending";

  function review(reviewStatus: "approved" | "needs_revision" | "rejected") {
    const parsedScore = score.trim() === "" ? undefined : Number(score);
    startTransition(async () => {
      const result = await reviewSubmissionAction(submission.id, reviewStatus, feedback || undefined, parsedScore, lessonId);
      if (result.error) return;
      onReviewed({ ...submission, reviewStatus, reviewFeedback: feedback || null, reviewScore: parsedScore ?? null });
    });
  }

  return (
    <li className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{submission.actorName ?? submission.actorEmail ?? "Aluno"}</p>
          {submission.actorEmail && submission.actorName && (
            <p className="truncate text-xs text-muted-foreground/56">{submission.actorEmail}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {submission.reviewScore !== null && <Badge variant="outline">Nota: {submission.reviewScore}</Badge>}
          <ReviewStatusBadge status={submission.reviewStatus} />
        </div>
      </div>

      {submission.contentText && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submission.contentText}</p>}
      {submission.mediaUrl && (
        <a
          href={submission.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-sm text-sm text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {submission.mediaFilename ?? "Abrir arquivo enviado"}
        </a>
      )}

      <div className="flex items-end gap-2">
        <div className="w-24">
          <label className="block text-xs font-medium text-muted-foreground">Nota (0–10)</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={1}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Correções/apontamentos (obrigatório ao pedir revisão ou reprovar)"
        className="min-h-16 text-sm"
      />

      {/* Nem o service nem a UI nunca bloquearam reavaliar uma entrega já revisada — o "bug"
          reportado nesta sessão ("aprovei sem querer, não consigo alterar") era falta de clareza
          visual, não uma trava real. Esta nota + os botões sempre ativos deixam explícito que
          clicar de novo em qualquer opção substitui a avaliação anterior (nota/status/feedback). */}
      {alreadyReviewed && <p className="text-xs text-muted-foreground">Já avaliada — clique em outra opção a qualquer momento para corrigir.</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => review("approved")}>
          {alreadyReviewed ? "Aprovar (atualizar)" : "Aprovar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || feedback.trim().length === 0}
          onClick={() => review("needs_revision")}
        >
          {alreadyReviewed ? "Pedir revisão (atualizar)" : "Pedir revisão"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending || feedback.trim().length === 0}
          onClick={() => review("rejected")}
        >
          {alreadyReviewed ? "Reprovar (atualizar)" : "Reprovar"}
        </Button>
      </div>
    </li>
  );
}

export function ActivitySubmissionsPanel({
  lessonId,
  activityId,
  deliverableFormat,
}: {
  lessonId: string;
  activityId: string;
  deliverableFormat: "text" | "audio" | "image" | "pdf" | "none";
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionPanelItem[]>([]);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      startTransition(async () => {
        const data = await listActivitySubmissionsAction(activityId);
        setSubmissions(data);
        setLoaded(true);
      });
    }
  }

  function handleReviewed(updated: SubmissionPanelItem) {
    setSubmissions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? "Ocultar entregas" : "Ver entregas"}
      </button>

      {open && (
        <div className="mt-2">
          {isPending && !loaded ? (
            <p className="text-xs text-muted-foreground">Carregando entregas…</p>
          ) : submissions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma entrega ainda.</p>
          ) : (
            <ul className="space-y-2">
              {submissions.map((submission) =>
                deliverableFormat === "none" ? (
                  <CompletionRow key={submission.id} submission={submission} />
                ) : (
                  <SubmissionRow key={submission.id} lessonId={lessonId} submission={submission} onReviewed={handleReviewed} />
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
