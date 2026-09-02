import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { enrollments } from "../../../database/schema";
import type { EnrollmentRecord } from "../../../contracts/types";

export async function findEnrollment(courseId: string, actorId: string): Promise<EnrollmentRecord | null> {
  const [row] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.actorId, actorId)))
    .limit(1);
  return (row as EnrollmentRecord) ?? null;
}

// Não cascateia progresso: lessonTextCompletions/lessonVideoCompletions/quizAttempts são
// chaveadas por (lessonId, actorId), sem FK pra enrollments — histórico do aluno é preservado.
export async function deleteEnrollmentById(id: string): Promise<void> {
  await db.delete(enrollments).where(eq(enrollments.id, id));
}
