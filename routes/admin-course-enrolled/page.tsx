import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import { getCachedCourse, listEnrollmentsForCourse } from "../../index";
import { getPluginAdminPageData } from "@venore/plugin-sdk";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { Badge } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { EmptyState } from "@venore/plugin-sdk/ui";

// Lista simples de matriculados (dado que já existia, listEnrollmentsForCourse) — a parte nova é
// linkar cada aluno pra própria página (progresso, correção, mensagens), que substitui o que
// antes era uma sublista inline dentro do card "Matrícula" de courses/[id]/page.tsx.
export default async function CourseEnrolledPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await getPluginAdminPageData("academy");

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para gerenciar a Academy." />;
  }

  const [courseResult, enrollmentsResult] = await Promise.all([getCachedCourse(id), listEnrollmentsForCourse({ courseId: id })]);

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

  const enrollments = enrollmentsResult.data;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/academy/courses/${course.id}`}
          className="rounded-sm text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← {course.title}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Matriculados</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {enrollments.length} {enrollments.length === 1 ? "aluno" : "alunos"} — clique em um deles para ver progresso,
          corrigir entregas e conversar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <EmptyState
              icon={<Users className="size-8" strokeWidth={1.5} />}
              title="Nenhum aluno matriculado ainda"
              description="Matricule um aluno pelo email na página do curso."
            />
          ) : (
            <div className="overflow-hidden rounded-panel border border-border">
              {enrollments.map((enrollment) => {
                const studentLabel = enrollment.name ?? enrollment.email ?? enrollment.actorId;
                return (
                  <Link
                    key={enrollment.actorId}
                    href={`/admin/academy/courses/${course.id}/enrolled/${enrollment.actorId}`}
                    className="group flex items-center gap-3.5 border-b border-border px-4 py-3.5 outline-none ui-motion-base last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{studentLabel}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {enrollment.email && enrollment.name && (
                          <span className="text-xs text-muted-foreground">{enrollment.email}</span>
                        )}
                        <Badge variant="secondary">
                          {enrollment.enrolledBy === "self" ? "auto-matrícula" : "matriculado manualmente"}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground/56 ui-motion-base group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
