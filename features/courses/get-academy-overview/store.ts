import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import {
  courses,
  enrollments,
  lessonActivities,
  lessonActivitySubmissions,
  lessons,
  quizAttempts,
} from "../../../database/schema";
import type { CourseStatus } from "../../../contracts/types";

export type OverviewCourseRow = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  lessonCount: number;
};
export type CountByCourse = { courseId: string; value: number };
export type CompletionStatsRow = {
  courseId: string;
  doneLessonPairs: number; // (aluno, aula) concluídos
  totalLessonPairs: number; // matrículas × aulas
  completedStudents: number; // alunos que concluíram TODAS as aulas do curso
  enrolledStudents: number;
};
export type AvgByCourse = { courseId: string; avg: number | null };
export type PendingSubmissionRow = {
  submissionId: string;
  actorId: string;
  submittedAt: Date;
  activityTitle: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
};

// Cursos + nº de aulas não-draft.
export async function findCoursesWithLessonCount(): Promise<OverviewCourseRow[]> {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      status: courses.status,
      lessonCount: sql<number>`count(${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(lessons, and(eq(lessons.courseId, courses.id), ne(lessons.status, "draft")))
    .groupBy(courses.id)
    .orderBy(desc(courses.createdAt));
  return rows as OverviewCourseRow[];
}

export async function countEnrollmentsByCourse(): Promise<CountByCourse[]> {
  const rows = await db
    .select({ courseId: enrollments.courseId, value: sql<number>`count(*)::int` })
    .from(enrollments)
    .groupBy(enrollments.courseId);
  return rows as CountByCourse[];
}

// Conclusão real por curso, pela MESMA regra do lock-chain (shared/lesson-chain.ts, isComplete):
// para cada (aluno matriculado, aula não-draft), a aula está concluída se todo requisito LIGADO
// da aula foi cumprido (texto lido / vídeo assistido / quiz passado / toda atividade com entrega
// aceita). Aula sem lesson_requirements = trivialmente concluída. Uma query só, sem loop por aluno.
export async function completionStatsByCourse(): Promise<CompletionStatsRow[]> {
  const result = await db.execute(sql`
    with lesson_req as (
      select l.id as lesson_id, l.course_id,
             coalesce(r.read_text_enabled, false)   as need_text,
             coalesce(r.watch_video_enabled, false) as need_video,
             coalesce(r.quiz_enabled, false)        as need_quiz,
             coalesce(r.activity_enabled, false)    as need_activity
      from academy.lessons l
      left join academy.lesson_requirements r on r.lesson_id = l.id
      where l.status <> 'draft'
    ),
    per_pair as (
      select e.course_id, e.actor_id, lr.lesson_id,
        (
          (not lr.need_text  or exists (select 1 from academy.lesson_text_completions t  where t.lesson_id = lr.lesson_id and t.actor_id = e.actor_id))
          and (not lr.need_video or exists (select 1 from academy.lesson_video_completions v where v.lesson_id = lr.lesson_id and v.actor_id = e.actor_id))
          and (not lr.need_quiz  or exists (select 1 from academy.quiz_attempts q where q.lesson_id = lr.lesson_id and q.actor_id = e.actor_id and q.passed and q.invalidated_at is null))
          and (not lr.need_activity or not exists (
                select 1 from academy.lesson_activities a
                where a.lesson_id = lr.lesson_id
                  and not exists (
                    select 1 from academy.lesson_activity_submissions s
                    where s.activity_id = a.id and s.actor_id = e.actor_id
                      and s.review_status not in ('needs_revision','rejected')
                  )
              ))
        ) as done
      from academy.enrollments e
      join lesson_req lr on lr.course_id = e.course_id
    ),
    per_student as (
      select course_id, actor_id, bool_and(done) as course_done
      from per_pair group by course_id, actor_id
    )
    select
      p.course_id,
      count(*) filter (where p.done)::int as done_lesson_pairs,
      count(*)::int as total_lesson_pairs,
      (select count(*) filter (where s.course_done) from per_student s where s.course_id = p.course_id)::int as completed_students,
      (select count(*) from per_student s where s.course_id = p.course_id)::int as enrolled_students
    from per_pair p
    group by p.course_id
  `);
  const rows = result.rows as {
    course_id: string;
    done_lesson_pairs: number | string;
    total_lesson_pairs: number | string;
    completed_students: number | string;
    enrolled_students: number | string;
  }[];
  return rows.map((row) => ({
    courseId: row.course_id,
    doneLessonPairs: Number(row.done_lesson_pairs),
    totalLessonPairs: Number(row.total_lesson_pairs),
    completedStudents: Number(row.completed_students),
    enrolledStudents: Number(row.enrolled_students),
  }));
}

export async function avgQuizScoreByCourse(): Promise<AvgByCourse[]> {
  const rows = await db
    .select({ courseId: lessons.courseId, avg: sql<number | null>`avg(${quizAttempts.score})` })
    .from(quizAttempts)
    .innerJoin(lessons, eq(lessons.id, quizAttempts.lessonId))
    .where(and(eq(quizAttempts.passed, true), isNull(quizAttempts.invalidatedAt)))
    .groupBy(lessons.courseId);
  return rows.map((r) => ({ courseId: r.courseId, avg: r.avg === null ? null : Number(r.avg) }));
}

export async function countPendingReviewsByCourse(): Promise<CountByCourse[]> {
  const rows = await db
    .select({ courseId: lessons.courseId, value: sql<number>`count(*)::int` })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivities.id, lessonActivitySubmissions.activityId))
    .innerJoin(lessons, eq(lessons.id, lessonActivities.lessonId))
    .where(eq(lessonActivitySubmissions.reviewStatus, "pending"))
    .groupBy(lessons.courseId);
  return rows as CountByCourse[];
}

export async function countActiveStudents(): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(distinct ${enrollments.actorId})::int` })
    .from(enrollments);
  return Number(row?.value ?? 0);
}

export async function findRecentPendingSubmissions(limit: number): Promise<PendingSubmissionRow[]> {
  const rows = await db
    .select({
      submissionId: lessonActivitySubmissions.id,
      actorId: lessonActivitySubmissions.actorId,
      submittedAt: lessonActivitySubmissions.submittedAt,
      activityTitle: lessonActivities.title,
      lessonTitle: lessons.title,
      courseId: courses.id,
      courseTitle: courses.title,
    })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivities.id, lessonActivitySubmissions.activityId))
    .innerJoin(lessons, eq(lessons.id, lessonActivities.lessonId))
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessonActivitySubmissions.reviewStatus, "pending"))
    .orderBy(desc(lessonActivitySubmissions.submittedAt))
    .limit(limit);
  return rows as PendingSubmissionRow[];
}
