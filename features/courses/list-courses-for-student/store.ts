import { desc, ne } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export { findEnrollmentsByActor } from "../../../shared/enrollment-store";

// "draft" nunca aparece pro aluno — restricted/public são as duas variantes visíveis (a
// diferença entre elas é só se dá pra se matricular sozinho, ver enroll-self/service.ts).
export async function findVisibleCoursesForStudents(): Promise<CourseRecord[]> {
  const rows = await db.select().from(courses).where(ne(courses.status, "draft")).orderBy(desc(courses.createdAt));
  return rows as CourseRecord[];
}
