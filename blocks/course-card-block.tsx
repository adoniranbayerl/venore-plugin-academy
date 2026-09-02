import Link from "next/link";
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

export async function AcademyCourseCardBlock({ block }: BlockRendererProps) {
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
  const enrolled = enrolledResult.success && enrolledResult.data;

  let percent: number | null = null;
  if (enrolled) {
    const progress = await getCourseProgress({ courseId: course.id });
    if (progress.success && progress.data.totalLessons > 0) {
      percent = calculateProgressPercent(progress.data.completedLessons, progress.data.totalLessons);
    }
  }

  return (
    <Link
      href={`/academy/${course.slug}`}
      className="block rounded-panel border border-border bg-card p-4 transition-colors hover:border-ring"
    >
      <h3 className="font-semibold text-foreground">{course.title}</h3>
      {course.description && <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>}
      {percent !== null && (
        <div className="mt-3 space-y-1">
          <Progress value={percent} />
          <p className="text-xs text-muted-foreground/56">{percent}% concluído</p>
        </div>
      )}
    </Link>
  );
}
