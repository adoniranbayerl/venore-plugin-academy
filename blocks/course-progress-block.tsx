import type { Block } from "@venore/plugin-sdk/cms";
import { getCourseForStudentHandler as getCourseForStudent } from "../features/courses/get-course-for-student/handler";
import { getCourseProgressHandler as getCourseProgress } from "../features/progress/get-course-progress/handler";
import { isEnrolledHandler as isEnrolled } from "../features/enrollments/is-enrolled/handler";
import { calculateProgressPercent } from "../shared/progress-percent";
import { Progress } from "@venore/plugin-sdk/ui";
import type { BlockRendererProps } from "@venore/plugin-sdk";

function readSlug(data: Block["data"]): string {
  const value = data.slug;
  return typeof value === "string" ? value.trim() : "";
}

// Mesmo dado de progresso do curso que AcademyCourseCardBlock já busca, só que como bloco
// dedicado (sem o restante do card) — pra quem quer só a barra de progresso em algum lugar da
// página. Auto-service: getCourseProgress resolve o ator via getCurrentUser(), não aceita
// courseId de terceiros.
export async function AcademyCourseProgressBlock({ block }: BlockRendererProps) {
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
  if (!progressResult.success || progressResult.data.totalLessons === 0) {
    return null;
  }

  const { completedLessons, totalLessons } = progressResult.data;
  const percent = calculateProgressPercent(completedLessons, totalLessons);

  return (
    <div className="space-y-1.5 rounded-panel border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{course.title}</span>
        <span className="text-muted-foreground/56">{percent}%</span>
      </div>
      <Progress value={percent} />
      <p className="text-xs text-muted-foreground">
        {completedLessons} de {totalLessons} lições concluídas
      </p>
    </div>
  );
}
