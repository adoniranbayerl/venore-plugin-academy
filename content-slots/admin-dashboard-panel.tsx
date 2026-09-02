import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { getPluginAdminPageData } from "@venore/plugin-sdk";
import { Badge, Progress } from "@venore/plugin-sdk/ui";
import { getAcademyOverviewHandler } from "../features/courses/get-academy-overview/handler";
import type { AcademyOverview } from "../features/courses/get-academy-overview/types";

// Painel principal de /admin — o resumo da Academy. Contribuído via contributions.adminDashboardPanel;
// o core não conhece o tipo AcademyOverview nem chama getAcademyOverview.

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  restricted: { label: "Restrito", variant: "outline" as const },
  public: { label: "Público", variant: "default" as const },
};

function StatTile({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-panel border border-border bg-card p-4 shadow-panel">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold tracking-caps uppercase">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground/56">{hint}</p>}
    </div>
  );
}

function AcademyDashboard({ overview }: { overview: AcademyOverview }) {
  const { totals, courses, pendingSubmissions } = overview;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<GraduationCap className="size-4" aria-hidden="true" />}
          label="Cursos"
          value={totals.courses}
          hint={`${totals.publishedCourses} publicado(s) · ${totals.lessons} aulas`}
        />
        <StatTile
          icon={<Users className="size-4" aria-hidden="true" />}
          label="Matrículas"
          value={totals.enrollments}
          hint={`${totals.activeStudents} aluno(s) · ${totals.completedStudents} concluíram`}
        />
        <StatTile
          icon={<ClipboardCheck className="size-4" aria-hidden="true" />}
          label="Aguardando revisão"
          value={totals.pendingReviews}
          hint="entregas de atividade"
        />
        <StatTile
          icon={<BookOpen className="size-4" aria-hidden="true" />}
          label="Conclusão média"
          value={
            courses.filter((c) => c.enrollmentCount > 0).length > 0
              ? `${Math.round(
                  courses.filter((c) => c.enrollmentCount > 0).reduce((s, c) => s + c.completionPercent, 0) /
                    courses.filter((c) => c.enrollmentCount > 0).length,
                )}%`
              : "—"
          }
          hint="requisitos das aulas cumpridos"
        />
      </div>

      <div className="rounded-panel border border-border bg-card shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Cursos</h2>
          <Link href="/admin/academy" className="text-xs font-medium text-primary hover:underline">
            Gerenciar
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nenhum curso criado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold tracking-caps text-muted-foreground/56 uppercase">
                  <th className="px-4 py-2 font-semibold">Curso</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Matrículas</th>
                  <th className="px-3 py-2 font-semibold">Conclusão</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Nota média</th>
                  <th className="px-3 py-2 font-semibold tabular-nums">Revisar</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/academy/courses/${course.id}`} className="font-medium text-foreground hover:underline">
                        {course.title}
                      </Link>
                      <span className="ml-2 align-middle">
                        <Badge variant={STATUS_BADGE[course.status].variant} className="text-[10px]">
                          {STATUS_BADGE[course.status].label}
                        </Badge>
                      </span>
                      <p className="text-xs text-muted-foreground/56">{course.lessonCount} aulas</p>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{course.enrollmentCount}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Progress value={course.completionPercent} className="w-20" />
                        <span className="text-xs text-muted-foreground tabular-nums">{course.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {course.avgQuizGrade === null ? "—" : course.avgQuizGrade.toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {course.pendingReviews > 0 ? (
                        <Link href={`/admin/academy/courses/${course.id}/enrolled`} className="font-medium text-warning hover:underline">
                          {course.pendingReviews}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground/56">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-panel border border-border bg-card shadow-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Entregas aguardando revisão</h2>
          <Link href="/admin/academy/messages" className="text-xs font-medium text-primary hover:underline">
            Mensagens
          </Link>
        </div>
        {pendingSubmissions.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma entrega pendente. Tudo em dia.</p>
        ) : (
          <ul className="divide-y divide-border">
            {pendingSubmissions.map((submission) => (
              <li key={submission.submissionId}>
                <Link
                  href={`/admin/academy/courses/${submission.courseId}/enrolled`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {submission.studentName} — {submission.activityTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground/56">
                      {submission.courseTitle} · {submission.lessonTitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground/56 tabular-nums">
                    {dateFormatter.format(submission.submittedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export async function renderAcademyAdminDashboardPanel(): Promise<ReactNode> {
  const gate = await getPluginAdminPageData("academy");
  if (!gate.granted) {
    return null;
  }
  const overviewResult = await getAcademyOverviewHandler();
  if (!overviewResult.success) {
    return null;
  }
  return <AcademyDashboard overview={overviewResult.data} />;
}
