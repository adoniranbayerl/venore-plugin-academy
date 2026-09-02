import { and, eq, ne } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

// "draft" nunca resolve aqui — restricted/public são as duas variantes visíveis pro aluno.
export async function findVisibleCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), ne(courses.status, "draft")))
    .limit(1);
  return (row as CourseRecord) ?? null;
}

export async function findVisibleCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), ne(courses.status, "draft")))
    .limit(1);
  return (row as CourseRecord) ?? null;
}
