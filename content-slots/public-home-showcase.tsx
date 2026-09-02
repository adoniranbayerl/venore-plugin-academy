import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { CourseCover } from "../components/course-cover";
import { listPublicCoursesHandler } from "../features/courses/list-public-courses/handler";

// Vitrine de cursos no meio da home "/" (quando não há entry "home" no CMS). Contribuída via
// contributions.publicHomeShowcase; `null` = sem curso publicado -> o core mostra o EmptyState dele.
export async function renderAcademyPublicHomeShowcase(): Promise<ReactNode> {
  const coursesResult = await listPublicCoursesHandler();
  const courses = coursesResult.success ? coursesResult.data : [];
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5">
      {courses.map((course) => (
        <Link key={course.id} href={`/academy/${course.slug}`} className="group block">
          <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-card ui-motion-base group-hover:shadow-float">
            <CourseCover
              coverMediaId={course.coverMediaId}
              className="w-full rounded-none object-cover ui-motion-emphasis group-hover:scale-105"
            />
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
                {course.lessonCount} {course.lessonCount === 1 ? "aula" : "aulas"}
              </p>
              <h2 className="text-base font-semibold text-foreground">{course.title}</h2>
              <p className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                Abrir <ArrowRight className="size-3.5" aria-hidden="true" />
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
