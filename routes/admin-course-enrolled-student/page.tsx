import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import {
  getCachedCourse,
  getCourseProgressForStudent,
  listEnrollmentsForCourse,
  listMessageThreadsForCourse,
} from "../../index";
import { getPluginAdminPageData } from "@venore/plugin-sdk";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { Badge } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { ResetQuizAttemptsButton } from "../admin-course/_components/reset-quiz-attempts-button";
import { MessageThreadPanel } from "./_components/message-thread-panel";
import { StudentSubmissionsPanel } from "./_components/student-submissions-panel";

// Página por aluno (pedido desta sessão: "subrota para cada aluno para o professor analisar o
// desenvolvimento do aluno, corrigir trabalhos, dar notas") — progresso completo (reaproveitando
// getCourseProgress via um handler admin-only, getCourseProgressForStudent) + entregas de
// atividade agrupadas por aula, com correção inline (StudentSubmissionsPanel) + conversas por
// etapa (listMessageThreadsForCourse): a de stepKey "activity" entra dentro do card de entregas
// (é lá que "corrigir trabalhos... enviar mensagens dentro dos trabalhos" acontece), as demais
// (vídeo/leitura/material/exemplo/quiz) num card à parte.
export default async function CourseEnrolledStudentPage({
  params,
}: {
  params: Promise<{ id: string; studentActorId: string }>;
}) {
  const { id, studentActorId } = await params;
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const [courseResult, enrollmentsResult, progressResult, messageThreadsResult] = await Promise.all([
    getCachedCourse(id),
    listEnrollmentsForCourse({ courseId: id }),
    getCourseProgressForStudent({ courseId: id, studentActorId }),
    listMessageThreadsForCourse({ courseId: id, studentActorId }),
  ]);

  if (!courseResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar curso: {courseResult.error.message}</p>;
  }
  if (!enrollmentsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar matrículas: {enrollmentsResult.error.message}</p>;
  }

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

  const enrollment = enrollmentsResult.data.find((item) => item.actorId === studentActorId);
  if (!enrollment) {
    notFound();
  }

  if (!progressResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar progresso: {progressResult.error.message}</p>;
  }
  if (!messageThreadsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mensagens: {messageThreadsResult.error.message}</p>;
  }

  const studentLabel = enrollment.name ?? enrollment.email ?? enrollment.actorId;
  const progress = progressResult.data;
  const activityThreads = messageThreadsResult.data
    .filter((thread) => thread.stepKey === "activity")
    .map((thread) => ({
      lessonId: thread.lessonId,
      lessonTitle: thread.lessonTitle,
      lessonPosition: thread.lessonPosition,
      threadId: thread.id,
      type: thread.type,
      unreadCount: thread.unreadCount,
    }));
  const otherThreads = messageThreadsResult.data.filter((thread) => thread.stepKey !== "activity");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/academy/courses/${course.id}/enrolled`}
          className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Matriculados
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{studentLabel}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {enrollment.email && enrollment.name ? `${enrollment.email} · ` : ""}
          {course.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.totalLessons === 0 ? (
            <p className="text-sm text-muted-foreground">Este curso ainda não tem aulas.</p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso do curso</span>
                <span className="font-medium text-foreground tabular-nums">
                  {progress.completedLessons}/{progress.totalLessons} concluídas
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((progress.completedLessons / progress.totalLessons) * 100)}%` }}
                />
              </div>

              <div className="mt-4 overflow-hidden rounded-panel border border-border">
                {progress.lessons.map((lesson) => {
                  const quizExhausted =
                    lesson.requirements.quizEnabled &&
                    lesson.requirements.quizMaxAttempts !== null &&
                    !lesson.requirements.quizPassed &&
                    lesson.requirements.quizAttemptsUsed >= lesson.requirements.quizMaxAttempts;

                  return (
                    <div key={lesson.lessonId} className="border-b border-border px-4 py-3 last:border-b-0">
                      <div className="flex items-center gap-2">
                        {lesson.locked && <Lock className="size-3.5 shrink-0 text-muted-foreground/56" aria-hidden="true" />}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          Aula {lesson.position}: {lesson.title}
                        </span>
                        {lesson.completed ? (
                          <Badge variant="outline" className="border-success-border bg-success-soft text-success">
                            Concluída
                          </Badge>
                        ) : lesson.locked ? (
                          <Badge variant="secondary">Bloqueada</Badge>
                        ) : (
                          <Badge variant="outline">Em andamento</Badge>
                        )}
                      </div>
                      {lesson.requirements.quizEnabled && (
                        <div className="mt-1.5 flex items-center gap-2 pl-5 text-xs text-muted-foreground/56">
                          <span>
                            Avaliação: {lesson.requirements.quizAttemptsUsed}/{lesson.requirements.quizMaxAttempts ?? "∞"} tentativas
                            {lesson.requirements.quizBestScore !== null && ` · ${lesson.requirements.quizBestScore}% de acerto`}
                            {quizExhausted && " · esgotado"}
                          </span>
                          {quizExhausted && (
                            <ResetQuizAttemptsButton
                              courseId={course.id}
                              lessonId={lesson.lessonId}
                              studentActorId={studentActorId}
                              studentLabel={studentLabel}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atividades entregues</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentSubmissionsPanel courseId={course.id} studentActorId={studentActorId} activityThreads={activityThreads} />
        </CardContent>
      </Card>

      {otherThreads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Outras mensagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {otherThreads.map((thread) => (
              <MessageThreadPanel
                key={thread.id}
                threadId={thread.id}
                lessonId={thread.lessonId}
                stepKey={thread.stepKey}
                studentActorId={studentActorId}
                courseId={course.id}
                title={`Aula ${thread.lessonPosition}: ${thread.lessonTitle} — ${thread.stepLabel}`}
                type={thread.type}
                unreadCount={thread.unreadCount}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
