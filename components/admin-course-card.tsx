import Link from "next/link";
import { Badge } from "@venore/plugin-sdk/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@venore/plugin-sdk/ui";
import { CourseCover } from "./course-cover";
import type { CourseRecord } from "../index";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_BADGE = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  restricted: { label: "Restrito", variant: "outline" as const },
  public: { label: "Público", variant: "default" as const },
};

export function AdminCourseCard({ course, lessonCount }: { course: CourseRecord; lessonCount: number }) {
  const badge = STATUS_BADGE[course.status];

  return (
    <Link href={`/admin/academy/courses/${course.id}`} className="group block">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-float">
        <CourseCover coverMediaId={course.coverMediaId} className="rounded-b-none" />
        <CardHeader className="gap-2 pt-4">
          <Badge variant={badge.variant} className="w-fit">
            {badge.label}
          </Badge>
          <CardTitle className="text-base">{course.title}</CardTitle>
          <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
            {lessonCount} {lessonCount === 1 ? "aula" : "aulas"} · criado em {dateFormatter.format(course.createdAt)}
          </p>
        </CardHeader>
        {course.description && (
          <CardContent className="pb-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
