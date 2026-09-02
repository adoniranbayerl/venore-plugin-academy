import type { Block } from "@venore/plugin-sdk/cms";
import { getCourseForStudentHandler as getCourseForStudent } from "../features/courses/get-course-for-student/handler";
import { getCourseProgressHandler as getCourseProgress } from "../features/progress/get-course-progress/handler";
import { isEnrolledHandler as isEnrolled } from "../features/enrollments/is-enrolled/handler";
import { LessonTrail, type LessonTrailItem } from "../components/lesson-trail";
import type { BlockRendererProps } from "@venore/plugin-sdk";

function readSlug(data: Block["data"]): string {
  const value = data.slug;
  return typeof value === "string" ? value.trim() : "";
}

// Mesma lógica de estado de @sidebarContextual/academy/[courseSlug]/[lessonId]/page.tsx, sem o
// estado "current" (não existe lição "atual" fora de uma página de lição específica).
export async function AcademyLessonTrailBlock({ block }: BlockRendererProps) {
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
  if (!progressResult.success) {
    return null;
  }

  const items: LessonTrailItem[] = progressResult.data.lessons.map((lesson) => {
    const state: LessonTrailItem["state"] = lesson.locked ? "locked" : lesson.completed ? "completed" : "unlocked";
    return { id: lesson.lessonId, position: lesson.position, title: lesson.title, state };
  });

  return <LessonTrail courseSlug={course.slug} items={items} />;
}
