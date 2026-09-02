import type { SubmissionWithLessonActivityRow } from "./store";
import type { StudentCourseActivitySubmissionView } from "./types";

export function toStudentCourseActivitySubmissionView(row: SubmissionWithLessonActivityRow): StudentCourseActivitySubmissionView {
  return {
    ...row.submission,
    lessonId: row.lessonId,
    lessonTitle: row.lessonTitle,
    lessonPosition: row.lessonPosition,
    activityTitle: row.activityTitle,
    activityPosition: row.activityPosition,
  };
}
