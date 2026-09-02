import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseStatus } from "../../../contracts/types";

export type AcademyOverviewCourse = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  lessonCount: number;
  enrollmentCount: number;
  // 0–100: (aluno, aula) concluídos pela mesma regra do lock-chain / (matrículas × aulas).
  completionPercent: number;
  // Alunos que concluíram TODAS as aulas do curso.
  completedStudents: number;
  avgQuizGrade: number | null; // 0–10
  pendingReviews: number;
};

export type AcademyOverviewSubmission = {
  submissionId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  activityTitle: string;
  submittedAt: Date;
};

export type AcademyOverview = {
  totals: {
    courses: number;
    publishedCourses: number;
    lessons: number;
    enrollments: number;
    activeStudents: number;
    completedStudents: number;
    pendingReviews: number;
  };
  courses: AcademyOverviewCourse[];
  pendingSubmissions: AcademyOverviewSubmission[];
};

export type GetAcademyOverviewResult = OperationResult<AcademyOverview>;
