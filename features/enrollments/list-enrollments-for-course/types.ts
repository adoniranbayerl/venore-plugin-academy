import type { OperationResult } from "@venore/plugin-sdk";

export type ListEnrollmentsForCourseQuery = { courseId: string };

export type EnrollmentView = {
  actorId: string;
  name: string | null;
  email: string | null;
  enrolledAt: Date;
  enrolledBy: string;
};

export type ListEnrollmentsForCourseResult = OperationResult<EnrollmentView[]>;
