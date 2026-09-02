import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { enrollments } from "../database/schema";
import type { EnrollmentRecord } from "../contracts/types";

export async function findEnrollment(courseId: string, actorId: string): Promise<EnrollmentRecord | null> {
  const [row] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.actorId, actorId)))
    .limit(1);
  return (row as EnrollmentRecord) ?? null;
}

export async function findEnrollmentsByActor(actorId: string): Promise<EnrollmentRecord[]> {
  const rows = await db.select().from(enrollments).where(eq(enrollments.actorId, actorId));
  return rows as EnrollmentRecord[];
}

export async function findEnrollmentsByCourse(courseId: string): Promise<EnrollmentRecord[]> {
  const rows = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  return rows as EnrollmentRecord[];
}

export async function insertEnrollment(input: {
  courseId: string;
  actorId: string;
  enrolledBy: string;
}): Promise<EnrollmentRecord> {
  const [row] = await db
    .insert(enrollments)
    .values({ courseId: input.courseId, actorId: input.actorId, enrolledBy: input.enrolledBy })
    .returning();
  return row as EnrollmentRecord;
}
