"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Input } from "@venore/plugin-sdk/ui";
import { Textarea } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { FileText } from "lucide-react";
import type { LessonMessageThreadType } from "../../../index";
import { listStudentSubmissionsAction, reviewStudentSubmissionAction, type StudentSubmissionItem } from "../actions";
import { MessageThreadPanel } from "./message-thread-panel";

export type ActivityThreadInfo = {
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  threadId: string;
  type: LessonMessageThreadType;
  unreadCount: number;
};

function ReviewStatusBadge({ status }: { status: StudentSubmissionItem["reviewStatus"] }) {
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

// Mesma lógica de SubmissionRow (lessons/[id]/_components/activity-submissions-panel.tsx),
// adaptada pra reavaliar via reviewStudentSubmissionAction (revalida esta página, não a da aula).
function SubmissionRow({
  courseId,
  studentActorId,
  submission,
  onReviewed,
}: {
  courseId: string;
  studentActorId: string;
  submission: StudentSubmissionItem;
  onReviewed: (updated: StudentSubmissionItem) => void;
}) {
  const [feedback, setFeedback] = useState(submission.reviewFeedback ?? "");
  const [score, setScore] = useState(submission.reviewScore !== null ? String(submission.reviewScore) : "");
  const [pending, startTransition] = useTransition();
  const alreadyReviewed = submission.reviewStatus !== "pending";

  function review(reviewStatus: "approved" | "needs_revision" | "rejected") {
    const parsedScore = score.trim() === "" ? undefined : Number(score);
    startTransition(async () => {
      const result = await reviewStudentSubmissionAction(
        submission.id,
        reviewStatus,
        feedback || undefined,
        parsedScore,
        courseId,
        studentActorId,
      );
      if (result.error) return;
      onReviewed({ ...submission, reviewStatus, reviewFeedback: feedback || null, reviewScore: parsedScore ?? null });
    });
  }

  return (
    <li className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{submission.activityTitle}</p>
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

      <div className="w-24">
        <label className="block text-xs font-medium text-muted-foreground">Nota (0–10)</label>
        <Input type="number" min={0} max={10} step={1} value={score} onChange={(event) => setScore(event.target.value)} className="mt-1" />
      </div>

      <Textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Correções/apontamentos (opcional)"
        className="min-h-16 text-sm"
      />

      {alreadyReviewed && <p className="text-xs text-muted-foreground">Já avaliada — clique em outra opção a qualquer momento para corrigir.</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => review("approved")}>
          {alreadyReviewed ? "Aprovar (atualizar)" : "Aprovar"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => review("needs_revision")}>
          {alreadyReviewed ? "Pedir revisão (atualizar)" : "Pedir revisão"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
          onClick={() => review("rejected")}
        >
          {alreadyReviewed ? "Reprovar (atualizar)" : "Reprovar"}
        </Button>
      </div>
    </li>
  );
}

// Agrupado por aula (não por atividade) — pedido desta sessão: professor corrige "os trabalhos
// deste aluno", não navega atividade por atividade. Carrega uma vez ao montar (não é lazy sob
// clique como ActivitySubmissionsPanel: esta página já É a tela dedicada a este aluno).
// activityThreads vem do servidor (já resolvido em page.tsx via listMessageThreadsForCourse) —
// cada aula tem no máximo uma conversa de etapa "activity" (índice único do schema), por isso um
// MessageThreadPanel por grupo, não por entrega.
export function StudentSubmissionsPanel({
  courseId,
  studentActorId,
  activityThreads,
}: {
  courseId: string;
  studentActorId: string;
  activityThreads: ActivityThreadInfo[];
}) {
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[] | null>(null);

  useEffect(() => {
    listStudentSubmissionsAction(courseId, studentActorId).then(setSubmissions);
  }, [courseId, studentActorId]);

  function handleReviewed(updated: StudentSubmissionItem) {
    setSubmissions((prev) => prev?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  if (submissions === null) {
    return <p className="text-sm text-muted-foreground">Carregando entregas…</p>;
  }

  const byLesson = new Map<
    string,
    { lessonTitle: string; lessonPosition: number; items: StudentSubmissionItem[]; thread: ActivityThreadInfo | null }
  >();
  for (const submission of submissions) {
    const group = byLesson.get(submission.lessonId) ?? {
      lessonTitle: submission.lessonTitle,
      lessonPosition: submission.lessonPosition,
      items: [],
      thread: null,
    };
    group.items.push(submission);
    byLesson.set(submission.lessonId, group);
  }
  // Conversa de atividade sem nenhuma entrega ainda (professor abriu uma correção antes do aluno
  // entregar) — mantém o grupo visível mesmo com items:[] pra não esconder a conversa.
  for (const thread of activityThreads) {
    const group = byLesson.get(thread.lessonId) ?? {
      lessonTitle: thread.lessonTitle,
      lessonPosition: thread.lessonPosition,
      items: [],
      thread: null,
    };
    group.thread = thread;
    byLesson.set(thread.lessonId, group);
  }

  if (byLesson.size === 0) {
    return <EmptyState icon={<FileText className="size-8" strokeWidth={1.5} />} title="Nenhuma entrega ainda" />;
  }

  const groups = [...byLesson.entries()].sort(([, a], [, b]) => a.lessonPosition - b.lessonPosition);

  return (
    <div className="space-y-5">
      {groups.map(([lessonId, group]) => (
        <div key={lessonId} className="space-y-2">
          <h3 className="text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">
            Aula {group.lessonPosition}: {group.lessonTitle}
          </h3>
          {group.items.length > 0 && (
            <ul className="space-y-2">
              {group.items.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  courseId={courseId}
                  studentActorId={studentActorId}
                  submission={submission}
                  onReviewed={handleReviewed}
                />
              ))}
            </ul>
          )}
          {group.thread && (
            <MessageThreadPanel
              threadId={group.thread.threadId}
              lessonId={lessonId}
              stepKey="activity"
              studentActorId={studentActorId}
              courseId={courseId}
              title="Conversa sobre as atividades desta aula"
              type={group.thread.type}
              unreadCount={group.thread.unreadCount}
            />
          )}
        </div>
      ))}
    </div>
  );
}
