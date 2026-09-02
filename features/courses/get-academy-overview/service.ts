import { listUsers } from "@venore/plugin-sdk/auth";
import {
  avgQuizScoreByCourse,
  completionStatsByCourse,
  countActiveStudents,
  countEnrollmentsByCourse,
  countPendingReviewsByCourse,
  findCoursesWithLessonCount,
  findRecentPendingSubmissions,
} from "./store";
import type { AcademyOverview, AcademyOverviewCourse, GetAcademyOverviewResult } from "./types";

const RECENT_SUBMISSIONS_LIMIT = 8;

function toMap(rows: { courseId: string; value: number }[]): Map<string, number> {
  return new Map(rows.map((row) => [row.courseId, row.value]));
}

export async function getAcademyOverview(): Promise<GetAcademyOverviewResult> {
  const [courses, enrollmentCounts, completion, avgScores, pendingCounts, activeStudents, recent, usersResult] =
    await Promise.all([
      findCoursesWithLessonCount(),
      countEnrollmentsByCourse(),
      completionStatsByCourse(),
      avgQuizScoreByCourse(),
      countPendingReviewsByCourse(),
      countActiveStudents(),
      findRecentPendingSubmissions(RECENT_SUBMISSIONS_LIMIT),
      listUsers(),
    ]);

  const enrollmentByCourse = toMap(enrollmentCounts);
  const pendingByCourse = toMap(pendingCounts);
  const avgByCourse = new Map(avgScores.map((row) => [row.courseId, row.avg]));
  const completionByCourse = new Map(completion.map((row) => [row.courseId, row]));

  const courseViews: AcademyOverviewCourse[] = courses.map((course) => {
    const stats = completionByCourse.get(course.id);
    const avgScore = avgByCourse.get(course.id) ?? null;
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      lessonCount: course.lessonCount,
      enrollmentCount: enrollmentByCourse.get(course.id) ?? 0,
      completionPercent:
        stats && stats.totalLessonPairs > 0 ? Math.round((stats.doneLessonPairs / stats.totalLessonPairs) * 100) : 0,
      completedStudents: stats?.completedStudents ?? 0,
      avgQuizGrade: avgScore === null ? null : Math.round((avgScore / 10) * 10) / 10,
      pendingReviews: pendingByCourse.get(course.id) ?? 0,
    };
  });

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  const overview: AcademyOverview = {
    totals: {
      courses: courses.length,
      publishedCourses: courses.filter((course) => course.status !== "draft").length,
      lessons: courses.reduce((sum, course) => sum + course.lessonCount, 0),
      enrollments: courseViews.reduce((sum, course) => sum + course.enrollmentCount, 0),
      activeStudents,
      completedStudents: courseViews.reduce((sum, course) => sum + course.completedStudents, 0),
      pendingReviews: courseViews.reduce((sum, course) => sum + course.pendingReviews, 0),
    },
    courses: courseViews,
    pendingSubmissions: recent.map((row) => {
      const user = usersById.get(row.actorId);
      return {
        submissionId: row.submissionId,
        studentName: user?.name || user?.email || "Aluno",
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        lessonTitle: row.lessonTitle,
        activityTitle: row.activityTitle,
        submittedAt: row.submittedAt,
      };
    }),
  };

  return { success: true, data: overview };
}
