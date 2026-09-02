import { eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function findCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function applyCourseSettings(input: {
  id: string;
  slug?: string;
  publiclyListed: boolean;
  coverMediaId?: string | null;
}): Promise<CourseRecord> {
  const [row] = await db
    .update(courses)
    .set({
      publiclyListed: input.publiclyListed,
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.coverMediaId !== undefined && { coverMediaId: input.coverMediaId }),
      updatedAt: sql`now()`,
    })
    .where(eq(courses.id, input.id))
    .returning();

  return row as CourseRecord;
}
