import type { Block } from "@venore/plugin-sdk/cms";
import { getCourseForStudentHandler as getCourseForStudent } from "../features/courses/get-course-for-student/handler";
import { getCourseProgressHandler as getCourseProgress } from "../features/progress/get-course-progress/handler";
import { isEnrolledHandler as isEnrolled } from "../features/enrollments/is-enrolled/handler";
import { CourseDashboardChart, type CourseDashboardChartDatum } from "./course-dashboard-chart-client";
import type { BlockRendererProps } from "@venore/plugin-sdk";

function readSlug(data: Block["data"]): string {
  const value = data.slug;
  return typeof value === "string" ? value.trim() : "";
}

// Só getCourseProgress (self-service, via getCurrentUser()) — nunca listQuizProgressForCourse,
// que é consulta cross-aluno pra professor e vazaria progresso de outros alunos numa página
// pública.
export async function AcademyCourseDashboardChartBlock({ block }: BlockRendererProps) {
  const slug = readSlug(block.data);
  if (!slug) {
    return null;
  }

  const courseResult = await getCourseForStudent({ slug });
  if (!courseResult.success || !courseResult.data) {
    return null;
  }
  const course = courseResult.data;

  const enrolledResult = await isEnrolled({ courseId: course.id });
  if (!enrolledResult.success || !enrolledResult.data) {
    return null;
  }

  const progressResult = await getCourseProgress({ courseId: course.id });
  if (!progressResult.success || progressResult.data.lessons.length === 0) {
    return null;
  }

  const data: CourseDashboardChartDatum[] = progressResult.data.lessons
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((lesson) => ({
      position: lesson.position,
      label: `Aula ${lesson.position}`,
      value: lesson.completed ? 100 : lesson.locked ? 0 : 50,
      state: lesson.completed ? "completed" : lesson.locked ? "locked" : "available",
    }));

  return (
    <div className="space-y-2 rounded-panel border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">{course.title} — progresso por lição</h3>
      <CourseDashboardChart data={data} />
    </div>
  );
}
