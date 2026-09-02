import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessons } from "../../../database/schema";
import type { PublicCourseView } from "./types";

// status "public" + publiclyListed (não só "restricted", que exige matrícula manual pelo admin —
// não faz sentido anunciar pra visitante anônimo um curso que ele não consegue entrar sozinho).
// lessonCount conta só aulas não-draft (as que o aluno vê).
export async function findPublicListedCourses(): Promise<PublicCourseView[]> {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      slug: courses.slug,
      status: courses.status,
      createdBy: courses.createdBy,
      publiclyListed: courses.publiclyListed,
      coverMediaId: courses.coverMediaId,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      lessonCount: sql<number>`count(${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(lessons, and(eq(lessons.courseId, courses.id), ne(lessons.status, "draft")))
    .where(and(eq(courses.status, "public"), eq(courses.publiclyListed, true)))
    .groupBy(courses.id)
    .orderBy(desc(courses.createdAt));

  return rows as PublicCourseView[];
}
