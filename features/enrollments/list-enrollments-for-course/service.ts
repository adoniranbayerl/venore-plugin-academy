import { listUsers } from "@venore/plugin-sdk/auth";
import { findEnrollmentsByCourse } from "./store";
import { toEnrollmentView } from "./view";
import type { ListEnrollmentsForCourseQuery, ListEnrollmentsForCourseResult } from "./types";

// Compõe enrollments (academy) com o diretório de usuários (auth) pra resolver nome/email por
// actorId — regra 10 (service pode chamar service público de outro context via barrel).
export async function listEnrollmentsForCourse(query: ListEnrollmentsForCourseQuery): Promise<ListEnrollmentsForCourseResult> {
  const [enrollments, usersResult] = await Promise.all([findEnrollmentsByCourse(query.courseId), listUsers()]);

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  return {
    success: true,
    data: enrollments.map((enrollment) => toEnrollmentView(enrollment, usersById.get(enrollment.actorId))),
  };
}
