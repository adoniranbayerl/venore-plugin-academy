import { findEnrollmentsByActor, findVisibleCoursesForStudents } from "./store";
import type { ListCoursesForStudentQuery, ListCoursesForStudentResult } from "./types";

// Curso não matriculado E não publiclyListed não aparece pro aluno (item 3 do pedido desta
// sessão); publiclyListed continua aparecendo mesmo sem matrícula, pra mostrar o convite de
// matrícula/acesso restrito.
export async function listCoursesForStudent(query: ListCoursesForStudentQuery): Promise<ListCoursesForStudentResult> {
  const [courses, enrollments] = await Promise.all([findVisibleCoursesForStudents(), findEnrollmentsByActor(query.actorId)]);

  const enrolledCourseIds = new Set(enrollments.map((enrollment) => enrollment.courseId));

  const visible = courses
    .filter((course) => enrolledCourseIds.has(course.id) || course.publiclyListed)
    .map((course) => ({ ...course, enrolled: enrolledCourseIds.has(course.id) }));

  return { success: true, data: visible };
}
