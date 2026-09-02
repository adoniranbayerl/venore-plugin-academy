import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessons, lessonSections } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

// Ids das entries ocultas do CMS que as seções de texto deste curso referenciam — o DELETE do
// curso cascateia tudo dentro do schema `academy`, mas essas entries vivem no schema `cms` e
// ficariam órfãs. O service apaga uma a uma (best-effort) depois de remover o curso.
export async function collectSectionCmsEntryIds(courseId: string): Promise<string[]> {
  const rows = await db
    .select({ cmsEntryId: lessonSections.cmsEntryId })
    .from(lessonSections)
    .innerJoin(lessons, eq(lessonSections.lessonId, lessons.id))
    .where(eq(lessons.courseId, courseId));
  return rows.map((row) => row.cmsEntryId).filter((id): id is string => typeof id === "string" && id.length > 0);
}

// courses.id é referenciado com onDelete: "cascade" por lessons, enrollments e course_completions;
// lessons.id idem por todas as tabelas-filhas de aula. Então um único DELETE limpa a árvore inteira.
export async function deleteCourse(id: string): Promise<void> {
  await db.delete(courses).where(eq(courses.id, id));
}
