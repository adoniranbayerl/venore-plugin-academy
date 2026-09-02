import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Video } from "lucide-react";
import { getMediaAsset } from "@venore/plugin-sdk/media";
import {
  getCachedCourse,
  listActivitySubmissionMediaForCourse,
  listEnrollmentsForCourse,
  listLessonsByCourse,
} from "../../index";
import { getPluginAdminPageData } from "@venore/plugin-sdk";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { Badge } from "@venore/plugin-sdk/ui";
import { Button } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";
import { ClearActivityMediaButton } from "./_components/clear-activity-media-button";
import { CourseSettingsForm } from "./_components/course-settings-form";
import { DeleteCourseButton } from "./_components/delete-course-button";
import { CourseStatusForm } from "./_components/course-status-form";
import { CreateLessonDialog } from "./_components/create-lesson-dialog";
import { EnrollStudentForm } from "./_components/enroll-student-form";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const [courseResult, lessonsResult, enrollmentsResult, activityMediaResult] = await Promise.all([
    getCachedCourse(id),
    listLessonsByCourse({ courseId: id }),
    listEnrollmentsForCourse({ courseId: id }),
    listActivitySubmissionMediaForCourse({ courseId: id }),
  ]);

  if (!courseResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar curso: {courseResult.error.message}</p>;
  }
  if (!lessonsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aulas: {lessonsResult.error.message}</p>;
  }
  if (!enrollmentsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar matrículas: {enrollmentsResult.error.message}</p>;
  }
  if (!activityMediaResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar mídia das atividades: {activityMediaResult.error.message}</p>;
  }

  const course = courseResult.data;
  if (!course) {
    notFound();
  }

  const coverMediaResult = course.coverMediaId ? await getMediaAsset({ id: course.coverMediaId }) : null;
  const coverMedia =
    coverMediaResult?.success && coverMediaResult.data
      ? {
          id: coverMediaResult.data.id,
          filename: coverMediaResult.data.filename,
          url: coverMediaResult.data.url,
          contentType: coverMediaResult.data.contentType,
        }
      : null;

  const lessons = lessonsResult.data;
  const enrollments = enrollmentsResult.data;
  const activityMediaCount = activityMediaResult.data.length;

  const STATUS_LABEL: Record<typeof course.status, string> = {
    draft: "Rascunho",
    restricted: "Restrito",
    public: "Público",
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/academy"
          className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Academy
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{course.title}</h1>
        <p className="mt-2 text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
          {STATUS_LABEL[course.status]} · {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
        </p>
        {course.description && <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <CourseStatusForm courseId={course.id} status={course.status} />
          {course.status !== "draft" && (
            <Button asChild variant="outline">
              <Link href={`/academy/${course.slug}`} target="_blank">
                Ver como aluno ↗
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <a href={`/api/academy/courses/${course.id}/export`} download>
              Exportar curso
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Aulas</CardTitle>
          <div className="flex items-center gap-3">
            {lessons.length > 0 && <span className="text-xs text-muted-foreground/56">{lessons.length}</span>}
            <CreateLessonDialog courseId={course.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-8" strokeWidth={1.5} />}
              title="Nenhuma aula cadastrada"
              description="Use o botão acima para criar a primeira aula."
            />
          ) : (
            <div className="overflow-hidden rounded-panel border border-border">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/admin/academy/lessons/${lesson.id}`}
                  className="group flex items-center gap-3.5 border-b border-border px-4 py-3.5 outline-none ui-motion-base last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground tabular-nums">
                    {lesson.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={
                          lesson.status === "draft"
                            ? undefined
                            : lesson.status === "restricted"
                              ? "border-warning-border bg-warning-soft text-warning"
                              : "border-success-border bg-success-soft text-success"
                        }
                      >
                        {lesson.status === "draft" ? "rascunho" : lesson.status === "restricted" ? "restrito" : "público"}
                      </Badge>
                      {lesson.videoUrl && (
                        <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                          <Video className="size-3" aria-hidden="true" /> vídeo
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/56 ui-motion-base group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Matrícula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CourseSettingsForm
            courseId={course.id}
            slug={course.slug}
            publiclyListed={course.publiclyListed}
            coverMedia={coverMedia}
          />

          <div>
            <p className="text-sm text-muted-foreground">
              {enrollments.length} {enrollments.length === 1 ? "aluno matriculado" : "alunos matriculados"}
              {enrollments.length > 0 && (
                <>
                  {" — "}
                  <Link
                    href={`/admin/academy/courses/${course.id}/enrolled`}
                    className="font-medium text-primary outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Ver todos →
                  </Link>
                </>
              )}
            </p>
            <EnrollStudentForm courseId={course.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Mídia das atividades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {activityMediaCount === 0
              ? "Nenhum arquivo enviado pelos alunos nas atividades práticas desta disciplina."
              : `${activityMediaCount} arquivo(s) enviados pelos alunos nas atividades práticas desta disciplina. Ao encerrar a turma, use o botão abaixo para liberar espaço — a nota e o feedback de cada entrega continuam preservados.`}
          </p>
          <ClearActivityMediaButton courseId={course.id} mediaCount={activityMediaCount} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Remover o curso apaga todas as aulas, matrículas e o progresso dos alunos. Use para recomeçar do zero —
            por exemplo, reimportar um pacote corrigido.
          </p>
          <DeleteCourseButton
            courseId={course.id}
            courseTitle={course.title}
            lessonCount={lessons.length}
            enrollmentCount={enrollments.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
