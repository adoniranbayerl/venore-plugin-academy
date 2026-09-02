import { listUsers } from "@venore/plugin-sdk/auth";
import { findEnrollmentsByCourse } from "../../../shared/enrollment";
import { findLessonRequirements } from "../../../shared/lesson-progress";
import { countActiveAttempts } from "../../../shared/quiz-attempts";
import { findLessonsByCourse } from "./store";
import { toQuizProgressEntryView } from "./view";
import type { ListQuizProgressForCourseQuery, ListQuizProgressForCourseResult } from "./types";

// Só existe porque getCourseProgress (self-service) sempre resolve o ator via getCurrentUser() —
// não dá pro professor consultar o progresso de OUTRO aluno por ali (plano da sessão de reset de
// tentativas de quiz, item 4 do pedido original: "quantas tentativas o aluno já usou por lesson").
export async function listQuizProgressForCourse(query: ListQuizProgressForCourseQuery): Promise<ListQuizProgressForCourseResult> {
  const [lessons, enrollments, usersResult] = await Promise.all([
    findLessonsByCourse(query.courseId),
    findEnrollmentsByCourse(query.courseId),
    listUsers(),
  ]);

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  const quizLessons = (
    await Promise.all(
      lessons.map(async (lesson) => ({ lesson, requirements: await findLessonRequirements(lesson.id) })),
    )
  ).filter((entry) => entry.requirements?.quizEnabled);

  const entries = await Promise.all(
    quizLessons.flatMap(({ lesson, requirements }) =>
      enrollments.map(async (enrollment) =>
        toQuizProgressEntryView({
          lesson,
          requirements: requirements!,
          enrollment,
          student: usersById.get(enrollment.actorId),
          attemptsUsed: await countActiveAttempts(lesson.id, enrollment.actorId),
        }),
      ),
    ),
  );

  return { success: true, data: entries };
}
