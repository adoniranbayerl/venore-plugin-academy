import { findCoursesByCoverMediaId, findLessonsByCoverMediaId, findLessonsByMaterialMediaId } from "./store";
import type { FindAcademyMediaUsageResult } from "./types";

export async function findAcademyMediaUsage(mediaId: string): Promise<FindAcademyMediaUsageResult> {
  const [coursesFound, lessonsFound, materialsFound] = await Promise.all([
    findCoursesByCoverMediaId(mediaId),
    findLessonsByCoverMediaId(mediaId),
    findLessonsByMaterialMediaId(mediaId),
  ]);

  return [
    ...coursesFound.map((course) => ({
      consumerKey: "academy",
      consumerLabel: "Academy",
      label: `Curso: ${course.title}`,
      href: `/admin/academy/courses/${course.id}`,
    })),
    ...lessonsFound.map((lesson) => ({
      consumerKey: "academy",
      consumerLabel: "Academy",
      label: `Aula ${lesson.position} de "${lesson.courseTitle}"`,
      href: `/admin/academy/lessons/${lesson.id}`,
    })),
    ...materialsFound.map((lesson) => ({
      consumerKey: "academy",
      consumerLabel: "Academy",
      label: `Material "${lesson.materialLabel}" da aula ${lesson.position} de "${lesson.courseTitle}"`,
      href: `/admin/academy/lessons/${lesson.id}`,
    })),
  ];
}
