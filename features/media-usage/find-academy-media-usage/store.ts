import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessonMaterials, lessons } from "../../../database/schema";

export async function findCoursesByCoverMediaId(mediaId: string): Promise<{ id: string; title: string }[]> {
  return db.select({ id: courses.id, title: courses.title }).from(courses).where(eq(courses.coverMediaId, mediaId));
}

export async function findLessonsByCoverMediaId(
  mediaId: string,
): Promise<{ id: string; position: number; courseId: string; courseTitle: string }[]> {
  return db
    .select({ id: lessons.id, position: lessons.position, courseId: lessons.courseId, courseTitle: courses.title })
    .from(lessons)
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessons.coverMediaId, mediaId));
}

export async function findLessonsByMaterialMediaId(
  mediaId: string,
): Promise<{ id: string; position: number; courseId: string; courseTitle: string; materialLabel: string }[]> {
  return db
    .select({
      id: lessons.id,
      position: lessons.position,
      courseId: lessons.courseId,
      courseTitle: courses.title,
      materialLabel: lessonMaterials.label,
    })
    .from(lessonMaterials)
    .innerJoin(lessons, eq(lessons.id, lessonMaterials.lessonId))
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessonMaterials.mediaId, mediaId));
}
