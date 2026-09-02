import type { OperationResult } from "@venore/plugin-sdk";

export type ListActivitySubmissionMediaForCourseQuery = { courseId: string };

export type ActivitySubmissionMediaItem = {
  mediaId: string;
  submissionId: string;
  lessonId: string;
  lessonPosition: number;
  lessonTitle: string;
};

export type ListActivitySubmissionMediaForCourseResult = OperationResult<ActivitySubmissionMediaItem[]>;
