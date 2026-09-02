import Link from "next/link";
import { Badge } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { Progress } from "@venore/plugin-sdk/ui";
import { CourseCover } from "./course-cover";
import type { CourseForStudentView } from "../index";

export function StudentCourseCard({
  course,
  lessonCount,
  progressPercent,
}: {
  course: CourseForStudentView;
  lessonCount: number;
  // enrolled decide o acesso de verdade (checado de novo no servidor ao abrir o curso); esta
  // barra é só indicação — nunca a única barreira (docs/venore-docks.md). null = sem progresso
  // pra mostrar (curso ainda não matriculado).
  progressPercent: number | null;
}) {
  const badge = course.enrolled
    ? { label: "Matriculado", variant: "default" as const }
    : course.status === "public"
      ? { label: "Matrícula disponível", variant: "secondary" as const }
      : { label: "Acesso restrito", variant: "outline" as const };

  return (
    <Link href={`/academy/${course.slug}`} className="group block">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-float">
        <CourseCover coverMediaId={course.coverMediaId} className="rounded-b-none" />
        <CardHeader className="gap-2 pt-4">
          <Badge variant={badge.variant} className="w-fit">
            {badge.label}
          </Badge>
          <CardTitle className="text-base">{course.title}</CardTitle>
          <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
            {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          {course.description && <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>}
          {progressPercent !== null && (
            <div className="space-y-1">
              <Progress value={progressPercent} />
              <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
                {progressPercent}% concluído
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
