import Link from "next/link";
import { getCourseProgressHandler as getCourseProgress } from "../features/progress/get-course-progress/handler";
import { listCoursesForStudentHandler as listCoursesForStudent } from "../features/courses/list-courses-for-student/handler";
import type { CourseForStudentView } from "../features/courses/list-courses-for-student/types";
import { calculateProgressPercent } from "../shared/progress-percent";
import { Progress } from "@venore/plugin-sdk/ui";
import type { BlockRendererProps } from "@venore/plugin-sdk";

// Progresso por curso não existe como view agregada no plugin (só get-course-progress, por
// curso+aluno) — reaproveitar o handler público N vezes é a forma permitida de compor isso aqui
// sem query nova nem acesso a schema (restrição desta sessão).
async function withProgress(course: CourseForStudentView): Promise<{ course: CourseForStudentView; percent: number | null }> {
  if (!course.enrolled) {
    return { course, percent: null };
  }
  const progress = await getCourseProgress({ courseId: course.id });
  if (!progress.success || progress.data.totalLessons === 0) {
    return { course, percent: null };
  }
  return { course, percent: calculateProgressPercent(progress.data.completedLessons, progress.data.totalLessons) };
}

export async function AcademyCourseListBlock({ block }: BlockRendererProps) {
  const limitRaw = block.data.limit;
  const limit = typeof limitRaw === "number" && limitRaw > 0 ? limitRaw : undefined;

  const result = await listCoursesForStudent();
  // Visitante anônimo (sem sessão) recebe erro do handler — bloco some em vez de quebrar a
  // página, mesmo espírito do fallback de block key desconhecida em block-renderer.tsx.
  if (!result.success) {
    return null;
  }

  const courses = limit ? result.data.slice(0, limit) : result.data;
  if (courses.length === 0) {
    return null;
  }

  const withProgressList = await Promise.all(courses.map(withProgress));

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
      {withProgressList.map(({ course, percent }) => (
        <Link
          key={course.id}
          href={`/academy/${course.slug}`}
          className="block rounded-panel border border-border bg-card p-4 transition-colors hover:border-ring"
        >
          <h3 className="font-semibold text-foreground">{course.title}</h3>
          {course.description && <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>}
          {percent !== null ? (
            <div className="mt-3 space-y-1">
              <Progress value={percent} />
              <p className="text-xs text-muted-foreground/56">{percent}% concluído</p>
            </div>
          ) : (
            !course.enrolled && <p className="mt-3 text-xs text-primary">Matricule-se para começar</p>
          )}
        </Link>
      ))}
    </div>
  );
}
