"use client";

import { useActionState, useContext, useEffect } from "react";
import { Check, Clock, RotateCcw, X } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { useActionToast } from "@venore/plugin-sdk/ui";
import {
  markActivityReviewSeenAction,
  submitLessonActivityAction,
  submitLessonActivityFileAction,
  type SubmitActivityActionState,
} from "../actions";
import { ActivityGateContext } from "./lesson-step-flow";

const initialState: SubmitActivityActionState = { error: null, submission: null };

// Reporta ao LessonStepFlow (via ActivityGateContext) sempre que a entrega desta atividade aparece
// ou some — é o que libera/trava o botão "Avançar" na etapa de atividades (pedido desta sessão).
// report é null fora dessa etapa (preview de professor, que nem usa ActivitiesList), vira no-op.
function useReportActivityGate(activityId: string, complete: boolean) {
  const report = useContext(ActivityGateContext);
  useEffect(() => {
    report?.(activityId, complete);
  }, [report, activityId, complete]);
}

// Dispara assim que a etapa mostra uma entrega já revisada pelo professor — silencia o alerta do
// header pra essa atividade (pedido desta sessão: "aluno recebe atualização de nota e comentário,
// precisa receber notificação"; este é o lado inverso, marcar como visto depois que ele já viu).
// Usa o reviewStatus vindo do servidor (submission inicial da página), não o `current` sobrescrito
// por uma ação recém-disparada — reenvio já reseta pra "pending" no próprio banco, então nunca
// diverge. reviewStatus muda a cada nova revisão do professor (reviewSeenAt reabre pra null), o
// que reexecuta o effect; chamar de novo numa entrega já vista é um no-op silencioso no server.
function useMarkActivityReviewSeen(activityId: string, reviewStatus: string | undefined) {
  useEffect(() => {
    if (!reviewStatus || reviewStatus === "pending") return;
    void markActivityReviewSeenAction(activityId);
  }, [activityId, reviewStatus]);
}

export type ActivityStepItem = {
  id: string;
  title: string;
  instructionsText: string;
  deliverableFormat: "text" | "audio" | "image" | "pdf" | "none";
  submission: {
    reviewStatus: "pending" | "approved" | "needs_revision" | "rejected";
    reviewFeedback: string | null;
    reviewScore: number | null;
    contentText: string | null;
    mediaUrl: string | null;
    mediaFilename: string | null;
  } | null;
};

const ACCEPTED_MIME_TYPES: Record<"audio" | "image" | "pdf", string> = {
  audio: "audio/mpeg,audio/wav,audio/ogg",
  image: "image/png,image/jpeg,image/webp,image/gif",
  pdf: "application/pdf",
};

const FORMAT_LABEL: Record<"audio" | "image" | "pdf", string> = { audio: "áudio", image: "imagem", pdf: "PDF" };

// Espelha os limites reais de contexts/media/contracts/types.ts (MEDIA_ALLOWED_TYPES) — client
// component não pode importar o barrel de media (puxaria `db` pro bundle do navegador), então o
// limite é só exibido aqui como texto; a validação de verdade acontece no server (ticket de
// upload + handler), este componente nunca é a fonte da verdade do limite.
const MAX_SIZE_LABEL: Record<"audio" | "image" | "pdf", string> = { audio: "20 MB", image: "8 MB", pdf: "20 MB" };

function ReviewStatusNote({
  status,
  feedback,
  score,
}: {
  status: "pending" | "approved" | "needs_revision" | "rejected";
  feedback: string | null;
  score: number | null;
}) {
  if (status === "approved") {
    return (
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-sm text-success">
          <Check className="size-4" aria-hidden="true" /> Atividade aprovada.
          {score !== null && <span className="text-muted-foreground">Nota: {score}</span>}
        </p>
        {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
      </div>
    );
  }
  if (status === "needs_revision") {
    return (
      <div className="space-y-1 rounded-md border border-warning-border bg-warning-soft p-2.5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-warning">
          <RotateCcw className="size-4" aria-hidden="true" /> O professor pediu revisão.
        </p>
        {feedback && <p className="text-xs text-warning">{feedback}</p>}
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-2.5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <X className="size-4" aria-hidden="true" /> O professor reprovou esta entrega. Você pode reenviar.
        </p>
        {feedback && <p className="text-xs text-destructive">{feedback}</p>}
      </div>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="size-4" aria-hidden="true" /> Entregue, aguardando revisão.
    </p>
  );
}

function TextSubmissionForm({
  courseSlug,
  lessonId,
  activity,
  submission,
  isLocked,
}: {
  courseSlug: string;
  lessonId: string;
  activity: ActivityStepItem;
  submission: ActivityStepItem["submission"];
  isLocked: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitLessonActivityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: state.submission ? "Atividade enviada." : null });
  const current = state.submission ?? submission;
  useReportActivityGate(activity.id, current !== null);

  return (
    <>
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="activityId" value={activity.id} />
        <Textarea
          name="contentText"
          required
          disabled={isLocked}
          defaultValue={current?.contentText ?? ""}
          className="min-h-24 text-sm"
        />
        <Button type="submit" size="sm" disabled={pending || isLocked}>
          {current ? "Reenviar" : "Enviar"}
        </Button>
      </form>
      {current && <ReviewStatusNote status={current.reviewStatus} feedback={current.reviewFeedback} score={current.reviewScore} />}
    </>
  );
}

function NoneSubmissionForm({
  courseSlug,
  lessonId,
  activity,
  submission,
}: {
  courseSlug: string;
  lessonId: string;
  activity: ActivityStepItem;
  submission: ActivityStepItem["submission"];
}) {
  const [state, formAction, pending] = useActionState(submitLessonActivityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: state.submission ? "Atividade marcada como concluída." : null });
  const current = state.submission ?? submission;
  useReportActivityGate(activity.id, current !== null);

  return (
    <form action={formAction}>
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="activityId" value={activity.id} />
      <Button type="submit" size="sm" disabled={pending || !!current}>
        {current ? (
          <>
            <Check className="size-4" aria-hidden="true" /> Marcada como concluída
          </>
        ) : (
          "Marcar como concluída"
        )}
      </Button>
    </form>
  );
}

function FileSubmissionForm({
  courseSlug,
  lessonId,
  activity,
  submission,
  isLocked,
  format,
}: {
  courseSlug: string;
  lessonId: string;
  activity: ActivityStepItem;
  submission: ActivityStepItem["submission"];
  isLocked: boolean;
  format: "audio" | "image" | "pdf";
}) {
  const [state, formAction, pending] = useActionState(submitLessonActivityFileAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: state.submission ? "Arquivo enviado." : null });
  const current = state.submission ?? submission;
  useReportActivityGate(activity.id, current !== null);

  return (
    <>
      {!isLocked && (
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="courseSlug" value={courseSlug} />
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="activityId" value={activity.id} />
          <input
            type="file"
            name="file"
            accept={ACCEPTED_MIME_TYPES[format]}
            required
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Tamanho máximo: {MAX_SIZE_LABEL[format]}. Arquivos enviados podem ser removidos pelo professor após o fim da
            disciplina — guarde uma cópia sua.
          </p>
          <Button type="submit" size="sm" disabled={pending}>
            {current ? "Reenviar" : "Enviar"}
          </Button>
        </form>
      )}
      {current?.mediaUrl && (
        <a
          href={current.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-sm text-sm text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {current.mediaFilename ?? `Arquivo enviado (${FORMAT_LABEL[format]})`}
        </a>
      )}
      {current && <ReviewStatusNote status={current.reviewStatus} feedback={current.reviewFeedback} score={current.reviewScore} />}
    </>
  );
}

function SingleActivityCard({
  courseSlug,
  lessonId,
  activity,
}: {
  courseSlug: string;
  lessonId: string;
  activity: ActivityStepItem;
}) {
  // Depois de aprovada não tem mais o que fazer — reenviar apagaria a nota/comentário (upsert
  // reseta review na entrega nova, ver submit-lesson-activity). "none" nasce aprovada no primeiro
  // clique e trava sozinha (ver NoneSubmissionForm) — pedido desta sessão: "botões não deveriam
  // estar mais habilitados uma vez que foi entregue".
  const isLocked = activity.submission?.reviewStatus === "approved";
  useMarkActivityReviewSeen(activity.id, activity.submission?.reviewStatus);

  return (
    <div className="space-y-3 rounded-md border border-border px-3.5 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{activity.title}</p>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{activity.instructionsText}</p>
      </div>

      {activity.deliverableFormat === "text" ? (
        <TextSubmissionForm
          courseSlug={courseSlug}
          lessonId={lessonId}
          activity={activity}
          submission={activity.submission}
          isLocked={isLocked}
        />
      ) : activity.deliverableFormat === "none" ? (
        <NoneSubmissionForm courseSlug={courseSlug} lessonId={lessonId} activity={activity} submission={activity.submission} />
      ) : (
        <FileSubmissionForm
          courseSlug={courseSlug}
          lessonId={lessonId}
          activity={activity}
          submission={activity.submission}
          isLocked={isLocked}
          format={activity.deliverableFormat}
        />
      )}
    </div>
  );
}

export function ActivitiesList({
  courseSlug,
  lessonId,
  activities,
}: {
  courseSlug: string;
  lessonId: string;
  activities: ActivityStepItem[];
}) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <SingleActivityCard key={activity.id} courseSlug={courseSlug} lessonId={lessonId} activity={activity} />
      ))}
    </div>
  );
}
